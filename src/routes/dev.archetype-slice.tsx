import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { buildArchetypeSliceFixture } from "@/lib/fixtures/archetype-slice";

type SliceArchetype = "nonprofit_documentary" | "food_popup_editorial";

export const Route = createFileRoute("/dev/archetype-slice")({
  validateSearch: (search: Record<string, unknown>) => {
    const a = search.archetype;
    const archetype: SliceArchetype =
      a === "food_popup_editorial" ? "food_popup_editorial" : "nonprofit_documentary";
    return { archetype };
  },
  component: ArchetypeSliceDev,
});

function ArchetypeSliceDev() {
  const { archetype } = Route.useSearch();
  const data = buildArchetypeSliceFixture(archetype);
  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-card/95 px-6 py-3 text-sm backdrop-blur">
        <span className="font-medium">Slice test (hardkodet fixture):</span>
        <Link
          to="/dev/archetype-slice"
          search={{ archetype: "nonprofit_documentary" }}
          className={`rounded-full px-3 py-1 ${
            archetype === "nonprofit_documentary"
              ? "bg-primary text-primary-foreground"
              : "border border-border"
          }`}
        >
          Nonprofit
        </Link>
        <Link
          to="/dev/archetype-slice"
          search={{ archetype: "food_popup_editorial" }}
          className={`rounded-full px-3 py-1 ${
            archetype === "food_popup_editorial"
              ? "bg-primary text-primary-foreground"
              : "border border-border"
          }`}
        >
          Food
        </Link>
        <span className="ml-auto text-xs text-muted-foreground">
          Samme tekst — ulik regissering via renderer-resolver
        </span>
      </div>
      <SiteShell data={data} />
    </div>
  );
}
