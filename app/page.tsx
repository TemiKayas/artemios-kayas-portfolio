import Stars from '@/components/Stars';
import CloudNav from '@/components/CloudNav';
import FloatingIsland from '@/components/FloatingIsland';
import AsciiHeader from '@/components/AsciiHeader';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Stars />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto">
        <CloudNav />

        <AsciiHeader />

        <FloatingIsland />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Welcome to my digital kingdom</p>
        </div>
      </main>
    </div>
  );
}
