import NewsForm from '@/components/news-form';

export default function CreateNews() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Add New Post</h2>
        <p className="text-sm text-gray-500">Write and publish a new article with images and details for your readers.</p>
      </div>

      <NewsForm />
    </div>
  );
}
