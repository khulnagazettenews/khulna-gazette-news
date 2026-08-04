import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import JobApplicationClient from '@/components/job-application-client';

export default function JobsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-grow">
        <JobApplicationClient />
      </main>
      <PublicFooter />
    </div>
  );
}
