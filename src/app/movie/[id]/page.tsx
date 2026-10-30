import { redirect } from "next/navigation";

export default async function LegacyMovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/detail/movie/${id}`);
}
