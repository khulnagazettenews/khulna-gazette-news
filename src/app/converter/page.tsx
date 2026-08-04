import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import ConverterClient from '@/components/converter-client';

export default function ConverterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicHeader />
      <main className="flex-grow">
        <ConverterClient />
      </main>
      <PublicFooter />
    </div>
  );
}
