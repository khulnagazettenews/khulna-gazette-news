import NewsForm from '@/components/news-form';

export default function CreateNews() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">নতুন খবর প্রকাশ করুন</h2>
        <p className="text-sm text-gray-500">আপনার পাঠকদের জন্য নতুন সংবাদ লিখুন এবং ছবিসহ প্রকাশ করুন।</p>
      </div>

      <NewsForm />
    </div>
  );
}
