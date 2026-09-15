import CategoryPage from '../../[category]/page';

interface Props {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

export const revalidate = 60;

export default async function CategorySubPage({ params, searchParams }: Props) {
  return CategoryPage({
    params: { category: params.slug },
    searchParams,
  });
}
