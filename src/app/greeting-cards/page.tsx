import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import GreetingCardsClient from '@/components/greeting-cards-client';

export default function GreetingCardsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-grow">
        <GreetingCardsClient />
      </main>
      <PublicFooter />
    </div>
  );
}
