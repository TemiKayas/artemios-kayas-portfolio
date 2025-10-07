import Stars from '@/components/Stars';
import CloudNav from '@/components/CloudNav';

export default function About() {
  return (
    <div className="relative min-h-screen p-4">
      <Stars />

      <main className="relative z-10 max-w-6xl mx-auto py-12">
        <CloudNav />

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
            About
          </h1>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </main>
    </div>
  );
}
