// /app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import InputForm from '@/components/InputForm';

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      if (!session) return;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(prof);
    })();
  }, [session]);

  if (!session) {
    return (
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Sign in to Dashboard</h2>
        <p className="text-gray-600 mb-6">Please sign in to access your dashboard and create summaries.</p>
      </main>
    );
  }

  const isActive = profile?.status === 'active';

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-3">
          {!isActive && (
            <Link href="/#pricing">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                Upgrade
              </button>
            </Link>
          )}
          <button 
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      </div>

      <InputForm />
    </main>
  );
}