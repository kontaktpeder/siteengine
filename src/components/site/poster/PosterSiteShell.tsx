import type { PageSection, SiteData } from "@/lib/site-types";
import type { ClientContextPacket } from "@/lib/client-context-packet";
import { themeToCssVars } from "../theme-vars";

interface Props {
  data: SiteData;
  packet: ClientContextPacket;
}

function getString(content: unknown, key: string): string | undefined {
  if (!content || typeof content !== "object") return undefined;
  const v = (content as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}
function getArray(content: unknown, key: string): unknown[] {
  if (!content || typeof content !== "object") return [];
  const v = (content as Record<string, unknown>)[key];
  return Array.isArray(v) ? v : [];
}

function PopupHero({
  section,
  packet,
}: {
  section: PageSection;
  packet: ClientContextPacket;
}) {
  const img =
    section.image_url ??
    getString(section.content, "image_url") ??
    packet.identity.representative_scene;
  const cta = section.cta_label ?? packet.identity.cta_primary_label;
  const href = section.cta_href ?? packet.identity.cta_primary_href ?? "#";
  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden">
      {img ? (
        <img
          src={img}
          alt={section.title ?? "Hero"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-secondary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[85vh] w-full max-w-6xl flex-col justify-end px-6 py-12 text-white md:px-10 md:py-16">
        {section.eyebrow ? (
          <span className="inline-flex w-fit items-center rounded-sm bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
            {section.eyebrow}
          </span>
        ) : null}
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          {section.title}
        </h1>
        {section.subtitle ? (
          <p className="mt-4 max-w-xl text-base text-white/90 md:text-lg">{section.subtitle}</p>
        ) : null}
        {cta ? (
          <a
            href={href}
            className="mt-7 inline-flex w-fit items-center justify-center rounded-sm bg-primary px-7 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90"
          >
            {cta}
          </a>
        ) : null}
      </div>
    </section>
  );
}

function MenuPreview({ section }: { section: PageSection }) {
  const items = getArray(section.content, "items").slice(0, 3);
  return (
    <section className="bg-background py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        {section.eyebrow ? (
          <span className="inline-flex items-center rounded-sm bg-foreground px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-background">
            {section.eyebrow}
          </span>
        ) : null}
        {section.title ? (
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {section.title}
          </h2>
        ) : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const item = it as Record<string, unknown>;
            const title = typeof item.title === "string" ? item.title : "";
            const desc = typeof item.description === "string" ? item.description : "";
            const image = typeof item.image_url === "string" ? item.image_url : undefined;
            const limited = item.limited === true;
            return (
              <article
                key={i}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                {image ? (
                  <img src={image} alt={title} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/3] w-full bg-secondary" />
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {limited ? (
                      <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Begrenset
                      </span>
                    ) : null}
                  </div>
                  {desc ? (
                    <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StorySnippet({ section }: { section: PageSection }) {
  const text = (section.subtitle ?? section.body ?? "").slice(0, 280);
  if (!text) return null;
  return (
    <section className="bg-card py-14 md:py-20">
      <div className="mx-auto w-full max-w-3xl px-6 text-center md:px-10">
        {section.eyebrow ? (
          <span className="inline-flex items-center rounded-sm bg-foreground px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-background">
            {section.eyebrow}
          </span>
        ) : null}
        <p className="mt-5 text-xl leading-relaxed text-foreground md:text-2xl">{text}</p>
      </div>
    </section>
  );
}

function FoodGallery({ section }: { section: PageSection }) {
  const images = getArray(section.content, "images");
  if (!images.length) return null;
  return (
    <section className="bg-background py-10">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {images.slice(0, 8).map((img, i) => {
            const url = typeof img === "string" ? img : (img as { url?: string })?.url;
            if (!url) return null;
            return (
              <img
                key={i}
                src={url}
                alt=""
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqCompact({ section }: { section: PageSection }) {
  const items = getArray(section.content, "items").slice(0, 4);
  if (!items.length) return null;
  return (
    <section className="bg-background py-12">
      <div className="mx-auto w-full max-w-3xl px-6 md:px-10">
        {section.title ? (
          <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
        ) : null}
        <dl className="mt-4 divide-y divide-border border-y border-border">
          {items.map((it, i) => {
            const item = it as Record<string, unknown>;
            const q = typeof item.question === "string" ? item.question : "";
            const a = typeof item.answer === "string" ? item.answer : "";
            return (
              <div key={i} className="py-3">
                <dt className="text-sm font-semibold">{q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{a}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

function DropCta({
  section,
  packet,
}: {
  section: PageSection;
  packet: ClientContextPacket;
}) {
  const cta = section.cta_label ?? packet.identity.cta_primary_label ?? "Følg neste drop";
  const href = section.cta_href ?? packet.identity.cta_primary_href ?? "#";
  return (
    <section className="bg-foreground py-16 text-background md:py-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center md:px-10">
        {section.eyebrow ? (
          <span className="inline-flex items-center rounded-sm bg-background/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
            {section.eyebrow}
          </span>
        ) : null}
        {section.title ? (
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">{section.title}</h2>
        ) : null}
        {section.subtitle ? (
          <p className="max-w-xl text-base text-background/80 md:text-lg">{section.subtitle}</p>
        ) : null}
        <a
          href={href}
          className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90"
        >
          {cta}
        </a>
      </div>
    </section>
  );
}

function renderPoster(section: PageSection, packet: ClientContextPacket) {
  switch (section.module_type) {
    case "popup_hero":
      return <PopupHero section={section} packet={packet} />;
    case "menu_preview":
      return <MenuPreview section={section} />;
    case "food_gallery":
      return <FoodGallery section={section} />;
    case "story_snippet":
      return <StorySnippet section={section} />;
    case "faq":
      return <FaqCompact section={section} />;
    case "drop_cta":
      return <DropCta section={section} packet={packet} />;
    default:
      return null;
  }
}

export function PosterSiteShell({ data, packet }: Props) {
  const style = themeToCssVars(packet.theme);
  const cta = packet.identity.cta_primary_label;
  const href = packet.identity.cta_primary_href ?? "#";
  const sections = data.sections;

  return (
    <div
      style={style}
      className="min-h-screen bg-background font-sans text-foreground [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans"
    >
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <a href="/" className="font-display text-lg tracking-tight">
            {data.client.name}
          </a>
          {cta ? (
            <a
              href={href}
              className="hidden rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground md:inline-flex"
            >
              {cta}
            </a>
          ) : null}
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        {sections.map((s) => (
          <div key={s.id}>{renderPoster(s, packet)}</div>
        ))}
      </main>

      {cta ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
          <a
            href={href}
            className="block w-full rounded-sm bg-primary py-3 text-center text-sm font-semibold uppercase tracking-wider text-primary-foreground"
          >
            {cta}
          </a>
        </div>
      ) : null}

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground md:px-10">
          <div className="font-display text-base text-foreground">{data.client.name}</div>
          <div>© {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
}
