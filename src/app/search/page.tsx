import { redirect } from "next/navigation";

type SearchPageProps = {
  searchParams?: { q?: string };
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q?.trim();
  if (query) {
    redirect(`/explore?q=${encodeURIComponent(query)}`);
  }
  redirect("/explore");
}
