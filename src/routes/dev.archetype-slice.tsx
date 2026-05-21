import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { buildArchetypeSliceFixture } from "@/lib/fixtures/archetype-slice";

type SliceArchetype =
  | "nonprofit_documentary"
  | "food_popup_editorial"
  | "food_popup_minimal";

export const Route = createFileRoute("/dev/archetype-slice")({
  validateSearch: (search: Record<string, unknown>) => {
    const a = search.archetype;
    const archetype: SliceArchetype =
      a === "food_popup_editorial"
        ? "food_popup_editorial"
        : a === "food_popup_minimal"
          ? "food_popup_minimal"
          : "nonprofit_documentary";
    return { archetype };
  },
  component: ArchetypeSliceDev,
});

function ArchetypeSliceDev() {
  const { archetype } = Route.useSearch();
  const data = buildArchetypeSliceFixture(archetype);
  const tab = (a: SliceArchetype, label: string) => (
    <Link
      to="/dev/archetype-slice"
      search={{ archetype: a }}
      className={`rounded-full px-3 py-1 ${
        archetype === a ? "bg-primary text-primary-foreground" : "border border-border"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-card/95 px-6 py-3 text-sm backdrop-blur">
        <span className="font-medium">Slice test:</span>
        {tab("nonprofit_documentary", "Nonprofit")}
        {tab("food_popup_editorial", "Food editorial")}
        {tab("food_popup_minimal", "Food popup (minimal)")}
        <span className="ml-auto text-xs text-muted-foreground">
          Ulik regissering via archetype + renderer-resolver
        </span>
      </div>
      <SiteShell data={data} />
    </div>
  );
}
