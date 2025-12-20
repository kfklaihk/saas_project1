import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { config } from '@/lib/config';

export async function POST(req: Request) {
  const { userId, title, transcript } = await req.json();

  // Validate text length (max 5000 UTF-8 characters)
  if (!transcript || typeof transcript !== 'string') {
    return NextResponse.json({ error: 'Invalid transcript' }, { status: 400 });
  }

  const textLength = new TextEncoder().encode(transcript).length;
  if (textLength > config.MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text exceeds ${config.MAX_TEXT_LENGTH} UTF-8 character limit. Please reduce your input.` },
      { status: 413 }
    );
  }

  // Check plan & quota limits
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('status')
    .eq('id', userId)
    .single();

  const isActive = profile?.status === 'active';

  // For free users: enforce 5 calls per 24 hours (reset at 00:00 +8 GMT)
  if (!isActive) {
    // Calculate today's date in +8 GMT timezone
    const now = new Date();
    const gmtPlus8 = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const todayInGMT8 = gmtPlus8.toISOString().split('T')[0];

    // Get or create usage record for today
    const { data: usage, error: fetchErr } = await supabaseAdmin
      .from('api_usage')
      .select('call_count')
      .eq('user_id', userId)
      .eq('usage_date', todayInGMT8)
      .single();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected for new users
      console.error('Error fetching usage:', fetchErr);
      return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
    }

    const currentCount = usage?.call_count ?? 0;

    if (currentCount >= config.FREE_TIER_DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Free tier quota exceeded. You have ${config.FREE_TIER_DAILY_LIMIT} calls per 24 hours. Quota resets at 00:00 GMT+8 daily.` },
        { status: 429 }
      );
    }

    // Increment call count
    if (usage) {
      // Update existing record
      await supabaseAdmin
        .from('api_usage')
        .update({ call_count: currentCount + 1, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('usage_date', todayInGMT8);
    } else {
      // Create new record
      await supabaseAdmin
        .from('api_usage')
        .insert({
          user_id: userId,
          usage_date: todayInGMT8,
          call_count: 1
        });
    }
  }

  // Build messages per DeepSeek chat-completions format
  const messages = [
    {
      role: 'system',
      content:
        'You convert transcripts into structured summary. Return JSON giving insight of who, what , when , where, how and why in the summary.',
    },
    { role: 'user', content: transcript },
  ];

  const resp = await fetch(
    `${process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',   // or 'deepseek-reasoner' for thinking mode
        messages,
        temperature: 0.2,
        // If you want enforced JSON, DeepSeek follows OpenAI's response_format contract:
        response_format: { type: 'json_object' },
        stream: false,
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: `DeepSeek error: ${errText}` }, { status: resp.status });
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? '';

  let output;
  try { output = JSON.parse(content); } catch { output = { summary: content }; }

  const { data: doc } = await supabaseAdmin.from('documents').insert({
    user_id: userId, title, input: { transcript }, output
  }).select().single();

  return NextResponse.json({ doc });
}