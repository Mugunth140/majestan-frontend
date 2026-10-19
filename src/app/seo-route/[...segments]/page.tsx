import SlugPage, { generateMetadata as slugMetadata } from "../../[slug]/page";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props) {
  const { segments } = await params;
  return slugMetadata({
    params: Promise.resolve({ slug: segments.join("/") }),
    searchParams: Promise.resolve({}),
  });
}
export default async function SeoRoute({ params, searchParams }: Props) {
  const { segments } = await params;
  return (
    <SlugPage
      params={Promise.resolve({ slug: segments.join("/") })}
      searchParams={searchParams}
    />
  );
}
