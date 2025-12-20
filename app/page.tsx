// /app/page.tsx (Landing)
import Link from 'next/link';
import Pricing from '@/components/Pricing';

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-4xl font-bold">AI Short Text Analyzer</h1>
      <p className="mt-3 text-gray-600">Upload your original text → Get AI-generated analysis and insights.</p>
      <p className="mt-4 text-sm text-gray-600">Free 5 summaries. Quota reset daily. Original text limit 5000 characters</p>
      <div className="mt-6 flex gap-4">
        <Link href="/dashboard" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Try
        </Link>
      </div>
      <section id="pricing" className="mt-12"><Pricing /></section>
    </main>
  );
}