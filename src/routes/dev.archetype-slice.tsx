import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { buildArchetypeSliceFixture } from "@/lib/fixtures/archetype-slice";

const searchSchema = z.object({
  archetype: fallback(
    z.enum(["nonprofit_documentary", "food_popup_editorial"]),
    "nonprofit_documentary",
  ).default("nonprofit_documentary"),
});

export const Route = createFileRoute("/dev/archetype-slice")({
  validateSearch: zodValidator(searchSchema),
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
