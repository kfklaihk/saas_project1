// /components/Pricing.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null);

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    setLoadingPlan(plan);
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        alert('Please sign in first');
        setLoadingPlan(null);
        return;
      }

      const userId = session.user.id;
      const email = session.user.email;

      const res = await fetch('/api/stripe/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan === 'monthly' ? 'monthly' : 'annual',
          userId,
          email,
        }),
      });

      const json = await res.json();
      if (json.error) {
        alert(json.error);
      } else if (json.url) {
        window.location.href = json.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to initiate upgrade. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="border-2 border-gray-200 rounded-lg p-8 bg-white hover:border-blue-300 transition">
        <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
        <p className="mt-3 text-4xl font-extrabold text-gray-900">HKD 10<span className="text-lg text-gray-600 font-normal">/mo</span></p>
        <ul className="mt-4 space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">✓</span>
            <span>Unlimited summaries</span>
          </li>
        </ul>
        <button
          onClick={() => handleUpgrade('monthly')}
          disabled={loadingPlan !== null}
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
        >
          {loadingPlan === 'monthly' ? 'Processing...' : 'Upgrade Monthly'}
        </button>
      </div>

      <div className="border-2 border-blue-600 rounded-lg p-8 bg-blue-50 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
        <p className="mt-3 text-4xl font-extrabold text-gray-900">HKD 100<span className="text-lg text-gray-600 font-normal">/mo</span></p>
        <ul className="mt-4 space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">✓</span>
            <span>Unlimited summaries</span>
          </li>
        </ul>
        <button
          onClick={() => handleUpgrade('annual')}
          disabled={loadingPlan !== null}
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
        >
          {loadingPlan === 'annual' ? 'Processing...' : 'Upgrade Annually'}
        </button>
      </div>
    </div>
  );
}