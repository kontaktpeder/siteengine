import { createFileRoute } from "@tanstack/react-router";
import { PosterSiteShell } from "@/components/site/poster/PosterSiteShell";
import { buildClientContextPacket } from "@/lib/client-context-packet";
import { buildGoldOfSicilyFixture } from "@/lib/fixtures/gold-of-sicily-poster";

export const Route = createFileRoute("/dev/poster")({
  component: PosterDev,
});

function PosterDev() {
  const data = buildGoldOfSicilyFixture();
  const packet = buildClientContextPacket({
    client: data.client,
    brain: data.brain,
    recipe: data.recipe,
    sections: data.sections,
  });
  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-card/95 px-6 py-2 text-xs backdrop-blur">
        <span className="font-semibold">/dev/poster</span>
        <span className="text-muted-foreground">
          template={packet.page_template} · tone={packet.visual_tone} · ceiling=
          {packet.template_config.section_ceiling}
        </span>
      </div>
      <PosterSiteShell data={data} packet={packet} />
    </div>
  );
}
