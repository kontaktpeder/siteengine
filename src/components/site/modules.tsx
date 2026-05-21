import type {
  ActivityItem,
  AudienceItem,
  BackgroundStyle,
  ClientBrain,
  FaqItem,
  LayoutStyle,
  PageSection,
  PartnerItem,
  ServiceItem,
  SiteData,
  TrustPoint,
} from "@/lib/site-types";
import {
  getContentDepth,
  getStorytellingMode,
  proseDepthClass,
  sectionVerticalPadding,
  shouldFullBleedMedia,
  type StorytellingMode,
} from "@/lib/render-contract";
import { getSectionLayoutClasses } from "@/lib/section-layout";
import { getArchetypeFromSite } from "@/lib/archetype-config";
import { resolveRenderer, type ResolvedRenderer } from "@/lib/renderer-resolver";
import type { ThemeTokens } from "@/lib/site-types";

function useResolved(section: PageSection, site: SiteData): ResolvedRenderer {
  const archetype = getArchetypeFromSite(
    site.recipe as unknown as Record<string, unknown> | null,
    site.brain as unknown as Record<string, unknown> | null,
  );
  return resolveRenderer(section, archetype, (site.client.theme ?? {}) as ThemeTokens);
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pickText(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function normalizeAudience(source: unknown): AudienceItem[] {
  return asArray<unknown>(source)
    .map((item) => {
      if (typeof item === "string") return { label: item };
      const obj = asObject(item);
      if (!obj) return null;
      const label = pickText(obj, ["label", "title", "name"]);
      if (!label) return null;
      const description = pickText(obj, ["description", "body", "text"]);
      return description ? { label, description } : { label };
    })
    .filter((item): item is AudienceItem => Boolean(item));
}

function normalizeTrustPoints(source: unknown): TrustPoint[] {
  return asArray<unknown>(source)
    .map((item) => {
      if (typeof item === "string") return { label: item };
      const obj = asObject(item);
      if (!obj) return null;
      const label = pickText(obj, ["label", "title", "name"]);
      if (!label) return null;
      const description = pickText(obj, ["description", "body", "text"]);
      return description ? { label, description } : { label };
    })
    .filter((item): item is TrustPoint => Boolean(item));
}

function normalizeServices(source: unknown): ServiceItem[] {
  return asArray<unknown>(source)
    .map((item) => {
      if (typeof item === "string") return { title: item };
      const obj = asObject(item);
      if (!obj) return null;
      const title = pickText(obj, ["title", "label", "name"]);
      if (!title) return null;
      const description = pickText(obj, ["description", "body", "text"]);
      const icon = pickText(obj, ["icon"]);
      return { title, ...(description ? { description } : {}), ...(icon ? { icon } : {}) };
    })
    .filter((item): item is ServiceItem => Boolean(item));
}

function normalizePartners(source: unknown): PartnerItem[] {
  return asArray<unknown>(source)
    .map((item) => {
      if (typeof item === "string") return { name: item };
      const obj = asObject(item);
      if (!obj) return null;
      const name = pickText(obj, ["name", "label", "title"]);
      if (!name) return null;
      const url = pickText(obj, ["url", "href"]);
      return url ? { name, url } : { name };
    })
    .filter((item): item is PartnerItem => Boolean(item));
}

function normalizeFaq(source: unknown): FaqItem[] {
  return asArray<unknown>(source)
    .map((item) => {
      if (typeof item === "string") return { question: item, answer: "" };
      const obj = asObject(item);
      if (!obj) return null;
      const question = pickText(obj, ["question", "q", "title"]);
      if (!question) return null;
      const answer = pickText(obj, ["answer", "a", "body", "description", "text"]) ?? "";
      return { question, answer };
    })
    .filter((item): item is FaqItem => Boolean(item));
}

function sectionAnchor(section: PageSection): string | undefined {
  if (section.anchor_id) return section.anchor_id;
  const settings = (section.settings ?? {}) as { anchor?: string };
  return settings.anchor;
}

function bgClasses(style: BackgroundStyle | string | null | undefined): string {
  switch (style) {
    case "muted":
      return "bg-muted";
    case "mint":
      return "bg-secondary";
    case "dark":
      return "bg-foreground text-background";
    case "image":
      return "bg-cover bg-center";
    default:
      return "";
  }
}

function isDarkBg(style: BackgroundStyle | string | null | undefined) {
  return style === "dark";
}

function sectionImageUrl(section: PageSection): string | null {
  const content = (section.content ?? {}) as { image_url?: string };
  return content.image_url || section.image_url || null;
}

function paddingFor(section: PageSection, site: SiteData, _base = "py-20"): string {
  // Token-driven: sectionDensity from settings (with fallback from content_depth + module_type).
  return getSectionLayoutClasses({ section, recipe: site.recipe }).root;
}

function layoutFor(section: PageSection, site: SiteData) {
  return getSectionLayoutClasses({ section, recipe: site.recipe });
}

interface ModuleProps {
  section: PageSection;
  brain: ClientBrain | null;
  site: SiteData;
}

function Container({
  children,
  id,
  className = "",
  bg,
  surface,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  bg?: string | null;
  surface?: string;
}) {
  const wrapper = bgClasses(bg);
  return (
    <section id={id} className={`w-full ${wrapper} ${surface ?? ""}`}>
      <div className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>
        {children}
      </div>
    </section>
  );
}

function Eyebrow({
  children,
  dark,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  if (className) return <span className={className}>{children}</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${
        dark
          ? "bg-background/10 text-background"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
    >
      {children}
    </a>
  );
}

function GhostButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
    >
      {children}
    </a>
  );
}

/** Resolve CTA: section-level overrides brain primary CTA */
function resolveCta(section: PageSection, brain: ClientBrain | null) {
  const label = section.cta_label ?? brain?.cta_primary_label ?? null;
  const href = section.cta_href ?? brain?.cta_primary_href ?? null;
  return label && href ? { label, href } : null;
}

/* ---------- HERO ---------- */

function HeroModule({ section, brain, site }: ModuleProps) {
  const resolved = useResolved(section, site);
  const bg = resolved.effectiveBackgroundStyle;
  const dark = isDarkBg(bg);
  const title = section.title ?? brain?.short_description ?? "Velkommen";
  const subtitle = section.subtitle ?? brain?.long_description ?? "";
  const eyebrow = section.eyebrow ?? null;
  const primary = resolveCta(section, brain);
  const secondary =
    brain?.cta_secondary_label && brain?.cta_secondary_href
      ? { label: brain.cta_secondary_label, href: brain.cta_secondary_href }
      : null;
  const settings = (section.settings ?? {}) as { image_alt?: string };
  const imageUrl = sectionImageUrl(section);
  const isFood = resolved.presentation === "food_hero_drop";
  const isProductFirst =
    resolved.settings.heroMode === "product_first" && !!imageUrl;
  const isSplit = resolved.heroLayout === "split-portrait";
  const isCentered = resolved.heroLayout === "centered";
  const isStacked = resolved.heroLayout === "stacked-full";
  const primaryClass = resolved.primaryButtonClass;

  // ===== Food product-first hero: image dominates first viewport, text overlays bottom
  if (isProductFirst) {
    const alt = settings.image_alt ?? section.title ?? "";
    return (
      <section
        id={sectionAnchor(section)}
        className="relative w-full overflow-hidden bg-foreground"
      >
        <img
          src={imageUrl!}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="relative mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col justify-end px-6 py-12 md:min-h-[72vh] md:px-10 md:py-16">
          {eyebrow ? (
            <Eyebrow className={resolved.eyebrowClass}>{eyebrow}</Eyebrow>
          ) : null}
          <h1 className={`${resolved.headlineClass} max-w-3xl text-background`}>
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-xl text-base text-background/85 md:text-lg">
              {subtitle}
            </p>
          ) : null}
          {primary ? (
            <div className="mt-8">
              <a href={primary.href} className={primaryClass}>
                {primary.label}
              </a>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <Container
      id={sectionAnchor(section)}
      bg={bg}
      className={resolved.sectionClass}
    >
      <div
        className={
          isFood
            ? "max-w-3xl"
            : isSplit
              ? "grid items-center gap-12 md:grid-cols-2"
              : isCentered
                ? "mx-auto max-w-3xl text-center"
                : "max-w-4xl"
        }
      >
        <div>
          {eyebrow ? (
            <Eyebrow dark={dark} className={isFood ? resolved.eyebrowClass : undefined}>
              {eyebrow}
            </Eyebrow>
          ) : null}
          <h1 className={resolved.headlineClass}>{title}</h1>
          {subtitle ? (
            <p
              className={`${resolved.introClass} ${isCentered ? "mx-auto" : ""} ${
                dark ? "text-background/80" : ""
              }`}
            >
              {subtitle}
            </p>
          ) : null}
          {(primary || (secondary && !isFood)) && (
            <div
              className={`mt-10 flex flex-wrap gap-3 ${isCentered ? "justify-center" : ""}`}
            >
              {primary ? (
                <a href={primary.href} className={primaryClass}>
                  {primary.label}
                </a>
              ) : null}
              {secondary && !isFood ? (
                <GhostButton href={secondary.href}>{secondary.label}</GhostButton>
              ) : null}
            </div>
          )}
        </div>
        {isSplit ? (
          imageUrl ? (
            <img
              src={imageUrl}
              alt={settings.image_alt ?? section.title ?? ""}
              className={resolved.mediaClass}
            />
          ) : (
            <div className={`${resolved.imageAspect} w-full rounded-3xl bg-secondary/60`} />
          )
        ) : null}
        {isStacked && imageUrl ? (
          <img
            src={imageUrl}
            alt={settings.image_alt ?? section.title ?? ""}
            className={`mt-12 ${resolved.mediaClass}`}
          />
        ) : null}
      </div>
    </Container>
  );
}

/* ---------- TRUST STRIP ---------- */

function TrustStripModule({ section, brain, site }: ModuleProps) {
  const items = normalizeTrustPoints(brain?.trust_points);
  if (!items.length) return null;
  const resolved = useResolved(section, site);
  if (resolved.presentation === "food_offer_strip") {
    return (
      <Container
        id={sectionAnchor(section)}
        bg={section.background_style}
        className={resolved.sectionClass}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-border py-6 text-sm">
          {items.map((it, i) => (
            <span key={i} className="font-medium text-foreground">
              <span className="text-primary">•</span> {it.label}
              {it.description ? (
                <span className="ml-1 text-muted-foreground">— {it.description}</span>
              ) : null}
            </span>
          ))}
        </div>
      </Container>
    );
  }
  return (
    <Container id={sectionAnchor(section)} bg={section.background_style} className={layoutFor(section, site).root}>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-4">
        {items.map((it, i) => (
          <div key={i}>
            <div className="text-sm font-semibold text-primary">{it.label}</div>
            {it.description ? (
              <div className="mt-1 text-sm text-muted-foreground">{it.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </Container>
  );
}

/* ---------- MISSION ---------- */

function MissionModule({ section, brain, site }: ModuleProps) {
  const resolved = useResolved(section, site);
  const variant = section.variant || "simple";
  const eyebrow = section.eyebrow ?? section.title ?? null;
  const cta = resolveCta(section, brain);
  const dark = isDarkBg(section.background_style);
  const depth = getContentDepth(section);
  const storytelling = getStorytellingMode(site.recipe);
  const settings = (section.settings ?? {}) as { image_alt?: string };
  const imageUrl = sectionImageUrl(section);
  const showSideImage =
    !!imageUrl && (section.layout_style === "split" || storytelling === "documentary");
  const pad = paddingFor(section, site);

  if (resolved.presentation === "food_story_snippet") {
    const storyText =
      section.subtitle?.trim() ||
      (brain?.flagship_story && brain.flagship_story.length < 320
        ? brain.flagship_story
        : null);
    // storyWeight=hidden → don't render if nothing concrete
    if (!storyText && resolved.settings.storyWeight !== "manifest") return null;
    return (
      <Container
        id={sectionAnchor(section) ?? "om"}
        bg={resolved.effectiveBackgroundStyle}
        className={resolved.sectionClass}
      >
        <div className="max-w-2xl">
          {eyebrow ? (
            <Eyebrow className={resolved.eyebrowClass}>{eyebrow}</Eyebrow>
          ) : null}
          {storyText ? (
            <p className="mt-4 max-w-xl text-base text-foreground/85 md:text-lg">
              {storyText}
            </p>
          ) : null}
          {cta ? (
            <div className="mt-8">
              <a href={cta.href} className={resolved.primaryButtonClass}>
                {cta.label}
              </a>
            </div>
          ) : null}
        </div>
      </Container>
    );
  }

  const fallbackEyebrow = eyebrow ?? "Vårt oppdrag";



  if (variant === "cards") {
    return (
      <Container id={sectionAnchor(section) ?? "om"} bg={section.background_style} className={pad}>
        <div className={proseDepthClass(depth)}>
          <Eyebrow dark={dark}>{fallbackEyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl md:text-5xl">{brain?.mission ?? section.title ?? ""}</h2>
          {section.subtitle ? (
            <p
              className={`mt-4 whitespace-pre-line text-lg ${dark ? "text-background/85" : "text-muted-foreground"}`}
            >
              {section.subtitle}
            </p>
          ) : null}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            brain?.problem_statement && { label: "Problem", body: brain.problem_statement },
            brain?.solution_statement && { label: "Løsning", body: brain.solution_statement },
            brain?.vision && { label: "Visjon", body: brain.vision },
          ].filter(Boolean).map((c, i) => {
            const card = c as { label: string; body: string };
            return (
              <div key={i} className="rounded-3xl border border-border bg-card p-7">
                <div className="text-sm font-semibold text-primary">{card.label}</div>
                <p className="mt-3 text-foreground">{card.body}</p>
              </div>
            );
          })}
        </div>
        {cta ? (
          <div className="mt-8">
            <PrimaryButton href={cta.href}>{cta.label}</PrimaryButton>
          </div>
        ) : null}
      </Container>
    );
  }

  // simple / editorial
  return (
    <Container id={sectionAnchor(section) ?? "om"} bg={section.background_style} className={pad}>
      <div className={`grid gap-12 ${showSideImage ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
        <div>
          <Eyebrow dark={dark}>{fallbackEyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl md:text-5xl">{brain?.mission ?? section.title ?? ""}</h2>
          {section.subtitle ? (
            <p
              className={`mt-4 whitespace-pre-line text-lg ${dark ? "text-background/85" : "text-muted-foreground"} ${proseDepthClass(depth)}`}
            >
              {section.subtitle}
            </p>
          ) : null}
          {cta ? (
            <div className="mt-8">
              <PrimaryButton href={cta.href}>{cta.label}</PrimaryButton>
            </div>
          ) : null}
        </div>
        {showSideImage ? (
          <img
            src={imageUrl!}
            alt={settings.image_alt ?? section.title ?? ""}
            className="aspect-[4/5] w-full rounded-3xl object-cover"
          />
        ) : (
          <div className={`space-y-6 ${proseDepthClass(depth)} ${dark ? "text-background/80" : "text-muted-foreground"}`}>
            {brain?.problem_statement ? <p>{brain.problem_statement}</p> : null}
            {brain?.solution_statement ? <p>{brain.solution_statement}</p> : null}
            {brain?.vision ? (
              <p className={dark ? "text-background" : "text-foreground"}>
                <span className="font-medium">Visjon:</span> {brain.vision}
              </p>
            ) : null}
          </div>
        )}
      </div>
      {showSideImage ? (
        <div className={`mt-10 grid gap-6 md:grid-cols-2 ${proseDepthClass(depth)} ${dark ? "text-background/80" : "text-muted-foreground"}`}>
          {brain?.problem_statement ? <p>{brain.problem_statement}</p> : null}
          {brain?.solution_statement ? <p>{brain.solution_statement}</p> : null}
          {brain?.vision ? (
            <p className={`md:col-span-2 ${dark ? "text-background" : "text-foreground"}`}>
              <span className="font-medium">Visjon:</span> {brain.vision}
            </p>
          ) : null}
        </div>
      ) : null}
    </Container>
  );
}

/* ---------- SERVICES GRID ---------- */

function ServicesGridModule({ section, brain, site }: ModuleProps) {
  const items = normalizeServices(brain?.services);
  if (!items.length) return null;
  const resolved = useResolved(section, site);
  const bg = resolved.effectiveBackgroundStyle;
  const dark = isDarkBg(bg);
  const settings = (section.settings ?? {}) as { image_alt?: string };
  const imageUrl = sectionImageUrl(section);
  const storytelling = getStorytellingMode(site.recipe);
  const showImage =
    !!imageUrl && (section.layout_style === "split" || storytelling === "documentary");
  const isSignatureDishes = resolved.settings.menuStyle === "signature_dishes";
  const gridShowsCardImage =
    isSignatureDishes ||
    (resolved.gridDensity === "compact" && resolved.settings.imageScale === "large");
  return (
    <Container
      id={sectionAnchor(section) ?? "tjenester"}
      bg={bg}
      className={resolved.sectionClass}
    >
      <div className="max-w-2xl">
        {section.eyebrow ? (
          <Eyebrow
            dark={dark}
            className={
              resolved.presentation === "food_menu_grid" ? resolved.eyebrowClass : undefined
            }
          >
            {section.eyebrow}
          </Eyebrow>
        ) : null}
        {section.title ? <h2 className={resolved.headlineClass}>{section.title}</h2> : null}
        {section.subtitle ? (
          <p className={`${resolved.introClass} ${dark ? "text-background/80" : ""}`}>
            {section.subtitle}
          </p>
        ) : null}
      </div>
      {showImage ? (
        <img
          src={imageUrl!}
          alt={settings.image_alt ?? section.title ?? ""}
          className={`mt-10 ${resolved.mediaClass}`}
        />
      ) : null}
      {isSignatureDishes ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <div key={i} className={resolved.cardClass}>
              <div className="aspect-[4/3] w-full bg-muted" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                  {i === items.length - 1 ? (
                    <span className="inline-flex shrink-0 items-center rounded-sm bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                      Begrenset
                    </span>
                  ) : null}
                </div>
                {s.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={resolved.containerClass}>
          {items.map((s, i) => (
            <div key={i} className={`${resolved.cardClass} transition hover:shadow-sm`}>
              {gridShowsCardImage ? (
                <div className="mb-4 aspect-[4/3] w-full rounded-xl bg-secondary/60" />
              ) : null}
              <h3 className={resolved.gridDensity === "compact" ? "text-lg" : "text-xl"}>
                {s.title}
              </h3>
              {s.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

/* ---------- ACTIVITIES ---------- */

function ActivitiesModule({ section, site }: ModuleProps) {
  const content = (section.content ?? {}) as { items?: ActivityItem[] };
  const items = content.items ?? [];
  if (!items.length) return null;
  return (
    <Container id={sectionAnchor(section)} bg={section.background_style} className={layoutFor(section, site).root}>
      <div className="rounded-3xl bg-secondary p-10 md:p-16">
        <div className="max-w-2xl">
          {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
          {section.title ? <h2 className="mt-3 text-4xl md:text-5xl">{section.title}</h2> : null}
          {section.subtitle ? (
            <p className="mt-4 text-lg text-secondary-foreground/80">{section.subtitle}</p>
          ) : null}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((a, i) => (
            <div key={i} className="rounded-2xl bg-card p-6">
              <h3 className="text-lg">{a.title}</h3>
              {a.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

/* ---------- PARTNERS ---------- */

function PartnersModule({ section, brain, site }: ModuleProps) {
  const items = normalizePartners(brain?.partners);
  if (!items.length) return null;
  const variant = section.variant || "text_list";
  const dark = isDarkBg(section.background_style);
  const pad = paddingFor(section, site);
  const imageUrl = sectionImageUrl(section);
  const settings = (section.settings ?? {}) as { image_alt?: string };
  return (
    <Container
      id={sectionAnchor(section) ?? "samarbeid"}
      bg={section.background_style}
      className={pad}
    >
      <div className="max-w-2xl">
        {section.eyebrow ? <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow> : null}
        {section.title ? <h2 className="mt-3 text-4xl md:text-5xl">{section.title}</h2> : null}
        {section.subtitle ? (
          <p className={`mt-4 text-lg ${dark ? "text-background/80" : "text-muted-foreground"}`}>
            {section.subtitle}
          </p>
        ) : null}
      </div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={settings.image_alt ?? section.title ?? ""}
          className="mt-10 aspect-[21/9] w-full rounded-3xl object-cover"
        />
      ) : null}
      {variant === "logo_grid" ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {items.map((p, i) => (
            <div
              key={i}
              className="flex h-24 items-center justify-center rounded-2xl border border-border bg-card text-sm font-medium text-foreground"
            >
              {p.name}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-wrap gap-3">
          {items.map((p, i) => (
            <span
              key={i}
              className="rounded-full border border-border bg-card px-5 py-3 text-sm text-foreground"
            >
              {p.name}
            </span>
          ))}
        </div>
      )}
    </Container>
  );
}

/* ---------- PROOF ---------- */

function ProofModule({ section, brain, site }: ModuleProps) {
  const items = normalizeAudience(brain?.audience);
  if (!items.length && !brain?.long_description) return null;
  const resolved = useResolved(section, site);
  const dark = isDarkBg(section.background_style);
  const pad = paddingFor(section, site);
  const imageUrl = sectionImageUrl(section);
  const settings = (section.settings ?? {}) as { image_alt?: string };

  if (resolved.presentation === "food_audience_insider") {
    return (
      <Container
        id={sectionAnchor(section)}
        bg={section.background_style}
        surface={resolved.sectionSurfaceClass}
        className={resolved.sectionClass}
      >
        <div className="max-w-2xl">
          <Eyebrow className={resolved.eyebrowClass}>
            {section.eyebrow ?? "For deg som"}
          </Eyebrow>
          <h2 className={`${resolved.headlineClass} text-background`}>
            {section.title ?? "Smaker som finner sitt publikum."}
          </h2>
          {section.subtitle ? (
            <p className="mt-4 max-w-xl text-base text-background/80">{section.subtitle}</p>
          ) : null}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {items.map((a, i) => (
            <span
              key={i}
              className="rounded-md bg-background/10 px-3 py-1.5 text-sm text-background"
            >
              {a.label}
            </span>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container id={sectionAnchor(section)} bg={section.background_style} className={pad}>
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Eyebrow dark={dark}>{section.eyebrow ?? section.title ?? "Hvorfor"}</Eyebrow>
          <h2 className="mt-4 text-4xl md:text-5xl">For dem det er bygget for.</h2>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={settings.image_alt ?? section.title ?? ""}
              className="mt-8 aspect-[4/5] w-full rounded-3xl object-cover"
            />
          ) : null}
        </div>
        <div className="space-y-4">
          {items.map((a, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <div className="font-medium text-foreground">{a.label}</div>
              {a.description ? (
                <div className="mt-1 text-sm text-muted-foreground">{a.description}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

/* ---------- FAQ ---------- */

function FaqModule({ section, brain, site }: ModuleProps) {
  const items = normalizeFaq(brain?.faq);
  if (!items.length) return null;
  const variant = section.variant || "accordion";
  const dark = isDarkBg(section.background_style);
  return (
    <Container id={sectionAnchor(section)} bg={section.background_style} className={layoutFor(section, site).root}>
      <div className="max-w-2xl">
        {section.eyebrow ? <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow> : null}
        {section.title ? <h2 className="mt-3 text-4xl md:text-5xl">{section.title}</h2> : null}
      </div>
      {variant === "simple" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((q, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-lg font-medium">{q.question}</div>
              <p className="mt-2 text-muted-foreground">{q.answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 divide-y divide-border rounded-3xl border border-border bg-card">
          {items.map((q, i) => (
            <details key={i} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-6 text-left text-lg font-medium">
                {q.question}
                <span className="text-2xl text-muted-foreground transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{q.answer}</p>
            </details>
          ))}
        </div>
      )}
    </Container>
  );
}

/* ---------- CONTACT CTA ---------- */

function ContactCtaModule({ section, brain, site }: ModuleProps) {
  const resolved = useResolved(section, site);
  const variant =
    resolved.ctaVariant === "strong-band"
      ? "strong"
      : resolved.ctaVariant === "soft-card"
        ? "soft"
        : resolved.ctaVariant === "food_drop_cta"
          ? "food_drop"
          : section.variant || "strong";
  const primary = resolveCta(section, brain);
  const secondary =
    brain?.cta_secondary_label && brain?.cta_secondary_href
      ? { label: brain.cta_secondary_label, href: brain.cta_secondary_href }
      : null;
  const pad = resolved.sectionClass;

  if (variant === "food_drop") {
    return (
      <Container
        id={sectionAnchor(section) ?? "kontakt"}
        bg={section.background_style}
        surface={resolved.sectionSurfaceClass}
        className={pad}
      >
        <div className="max-w-2xl">
          {section.eyebrow ? (
            <Eyebrow className={resolved.eyebrowClass}>{section.eyebrow}</Eyebrow>
          ) : null}
          {section.title ? (
            <h2 className={`${resolved.headlineClass} text-background`}>{section.title}</h2>
          ) : null}
          {section.subtitle ? (
            <p className="mt-4 max-w-xl text-base text-background/80">{section.subtitle}</p>
          ) : null}
          {primary ? (
            <div className="mt-8">
              <a href={primary.href} className={resolved.primaryButtonClass}>
                {primary.label}
              </a>
            </div>
          ) : null}
        </div>
      </Container>
    );
  }


  if (variant === "soft") {
    return (
      <Container
        id={sectionAnchor(section) ?? "kontakt"}
        bg={section.background_style}
        className={pad}
      >
        <div className="rounded-3xl border border-border bg-card p-10 md:p-14">
          <div className="max-w-2xl">
            {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
            {section.title ? <h2 className="mt-3 text-4xl md:text-5xl">{section.title}</h2> : null}
            {section.subtitle ? (
              <p className="mt-4 text-lg text-muted-foreground">{section.subtitle}</p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              {primary ? <PrimaryButton href={primary.href}>{primary.label}</PrimaryButton> : null}
              {secondary ? <GhostButton href={secondary.href}>{secondary.label}</GhostButton> : null}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // strong (default)
  return (
    <Container
      id={sectionAnchor(section) ?? "kontakt"}
      bg={section.background_style}
      className={pad}
    >
      <div className="rounded-3xl bg-primary p-10 text-primary-foreground md:p-16">
        <div className="max-w-2xl">
          {section.eyebrow ? (
            <span className="inline-flex items-center rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-foreground">
              {section.eyebrow}
            </span>
          ) : null}
          {section.title ? (
            <h2 className="mt-3 text-4xl md:text-5xl text-primary-foreground">{section.title}</h2>
          ) : null}
          {section.subtitle ? (
            <p className="mt-4 text-lg text-primary-foreground/80">{section.subtitle}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {primary ? (
              <a
                href={primary.href}
                className="inline-flex items-center rounded-full bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:bg-cream"
              >
                {primary.label}
              </a>
            ) : null}
            {secondary ? (
              <a
                href={secondary.href}
                className="inline-flex items-center rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-foreground/10"
              >
                {secondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}

const REGISTRY: Record<string, (p: ModuleProps) => React.ReactNode> = {
  hero: HeroModule,
  trust_strip: TrustStripModule,
  mission: MissionModule,
  services_grid: ServicesGridModule,
  activities: ActivitiesModule,
  partners: PartnersModule,
  proof: ProofModule,
  faq: FaqModule,
  contact_cta: ContactCtaModule,
};

export function renderModule(props: ModuleProps) {
  const Comp = REGISTRY[props.section.module_type];
  if (!Comp) return null;
  return Comp(props);
}
