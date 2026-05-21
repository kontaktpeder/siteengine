import { createFileRoute } from "@tanstack/react-router";
import { getSiteData } from "@/lib/site.functions";
import { EmptySiteState, SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    client: typeof search.client === "string" ? search.client : undefined,
  }),
  loaderDeps: ({ search }) => ({ slug: search.client }),
  loader: ({ deps }) => getSiteData({ data: { slug: deps.slug } }),
  head: ({ loaderData }) => {
    const title = loaderData?.page?.meta_title ?? loaderData?.client?.name ?? "Studio P. A. Halvorsen";
    const description =
      loaderData?.page?.meta_description ??
      loaderData?.brain?.short_description ??
      "Modulbasert nettsidemotor av Studio P. A. Halvorsen.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Index,
});

function Index() {
  const data = Route.useLoaderData();
  if (!data) return <EmptySiteState />;
  return <SiteShell data={data} />;
}
