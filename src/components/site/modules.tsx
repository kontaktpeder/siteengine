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
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  bg?: string | null;
}) {
  const wrapper = bgClasses(bg);
  return (
    <section id={id} className={`w-full ${wrapper}`}>
      <div className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>
        {children}
      </div>
    </section>
  );
}

function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
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

function HeroModule({ section, brain }: ModuleProps) {
  const variant = section.variant || "centered";
  const layout = (section.layout_style as LayoutStyle) || null;
  const dark = isDarkBg(section.background_style);
  const title = section.title ?? brain?.short_description ?? "Velkommen";
  const subtitle = section.subtitle ?? brain?.long_description ?? "";
  const eyebrow = section.eyebrow ?? "Foreningen";
  const primary = resolveCta(section, brain);
  const secondary =
    brain?.cta_secondary_label && brain?.cta_secondary_href
      ? { label: brain.cta_secondary_label, href: brain.cta_secondary_href }
      : null;

  const isSplit = variant === "split" || layout === "split";
  const isCentered = variant === "centered" || layout === "centered";

  return (
    <Container
      id={sectionAnchor(section)}
      bg={section.background_style}
      className="pt-24 pb-20 md:pt-32 md:pb-28"
    >
      <div
        className={
          isSplit
            ? "grid items-center gap-12 md:grid-cols-2"
            : isCentered
              ? "mx-auto max-w-3xl text-center"
              : "max-w-3xl"
        }
      >
        <div>
          <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-5xl leading-[1.05] md:text-7xl">{title}</h1>
          {subtitle ? (
            <p
              className={`mt-6 max-w-2xl text-lg md:text-xl ${
                isCentered ? "mx-auto" : ""
              } ${dark ? "text-background/80" : "text-muted-foreground"}`}
            >
              {subtitle}
            </p>
          ) : null}
          {(primary || secondary) && (
            <div
              className={`mt-10 flex flex-wrap gap-3 ${isCentered ? "justify-center" : ""}`}
            >
              {primary ? <PrimaryButton href={primary.href}>{primary.label}</PrimaryButton> : null}
              {secondary ? <GhostButton href={secondary.href}>{secondary.label}</GhostButton> : null}
            </div>
          )}
        </div>
        {isSplit ? (() => {
          const content = (section.content ?? {}) as { image_url?: string };
          const settings = (section.settings ?? {}) as { image_alt?: string };
          const imageUrl = content.image_url || section.image_url || null;
          return imageUrl ? (
            <img
              src={imageUrl}
              alt={settings.image_alt ?? section.title ?? ""}
              className="aspect-[4/5] w-full rounded-3xl object-cover"
            />
          ) : (
            <div className="aspect-[4/5] w-full rounded-3xl bg-secondary/60" />
          );
        })() : null}
      </div>
    </Container>
  );
}

/* ---------- TRUST STRIP ---------- */

function TrustStripModule({ section, brain }: ModuleProps) {
  const items = normalizeTrustPoints(brain?.trust_points);
  if (!items.length) return null;
  return (
    <Container id={sectionAnchor(section)} bg={section.background_style} className="py-10">
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

function MissionModule({ section, brain }: ModuleProps) {
  const variant = section.variant || "simple";
  const eyebrow = section.eyebrow ?? section.title ?? "Vårt oppdrag";
  const cta = resolveCta(section, brain);
  const dark = isDarkBg(section.background_style);

  if (variant === "cards") {
    const cards = [
      brain?.problem_statement && { label: "Problem", body: brain.problem_statement },
      brain?.solution_statement && { label: "Løsning", body: brain.solution_statement },
      brain?.vision && { label: "Visjon", body: brain.vision },
    ].filter(Boolean) as { label: string; body: string }[];
    return (
      <Container id={sectionAnchor(section) ?? "om"} bg={section.background_style} className="py-20">
        <div className="max-w-2xl">
          <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl md:text-5xl">{brain?.mission ?? "Vi skaper trygge arenaer."}</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card p-7">
              <div className="text-sm font-semibold text-primary">{c.label}</div>
              <p className="mt-3 text-foreground">{c.body}</p>
            </div>
          ))}
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
    <Container id={sectionAnchor(section) ?? "om"} bg={section.background_style} className="py-20">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl md:text-5xl">{brain?.mission ?? "Vi skaper trygge arenaer."}</h2>
          {cta ? (
            <div className="mt-8">
              <PrimaryButton href={cta.href}>{cta.label}</PrimaryButton>
            </div>
          ) : null}
        </div>
        <div className={`space-y-6 text-lg ${dark ? "text-background/80" : "text-muted-foreground"}`}>
          {brain?.problem_statement ? <p>{brain.problem_statement}</p> : null}
          {brain?.solution_statement ? <p>{brain.solution_statement}</p> : null}
          {brain?.vision ? (
            <p className={dark ? "text-background" : "text-foreground"}>
              <span className="font-medium">Visjon:</span> {brain.vision}
            </p>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

/* ---------- SERVICES GRID ---------- */

function ServicesGridModule({ section, brain }: ModuleProps) {
  const items = normalizeServices(brain?.services);
  if (!items.length) return null;
  const compact = section.variant === "compact";
  const dark = isDarkBg(section.background_style);
  return (
    <Container
      id={sectionAnchor(section) ?? "tjenester"}
      bg={section.background_style}
      className="py-20"
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
      <div
        className={`mt-12 grid gap-5 ${
          compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {items.map((s, i) => (
          <div
            key={i}
            className={`rounded-3xl border border-border bg-card transition hover:shadow-sm ${
              compact ? "p-5" : "p-7"
            }`}
          >
            <h3 className={compact ? "text-lg" : "text-xl"}>{s.title}</h3>
            {s.description ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </Container>
  );
}

/* ---------- ACTIVITIES ---------- */

function ActivitiesModule({ section }: ModuleProps) {
  const content = (section.content ?? {}) as { items?: ActivityItem[] };
  const items = content.items ?? [];
  if (!items.length) return null;
  return (
    <Container id={sectionAnchor(section)} bg={section.background_style} className="py-20">
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

function PartnersModule({ section, brain }: ModuleProps) {
  const items = normalizePartners(brain?.partners);
  if (!items.length) return null;
  const variant = section.variant || "text_list";
  const dark = isDarkBg(section.background_style);
  return (
    <Container
      id={sectionAnchor(section) ?? "samarbeid"}
      bg={section.background_style}
      className="py-20"
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

function ProofModule({ section, brain }: ModuleProps) {
  const items = normalizeAudience(brain?.audience);
  if (!items.length && !brain?.long_description) return null;
  const dark = isDarkBg(section.background_style);
  return (
    <Container id={sectionAnchor(section)} bg={section.background_style} className="py-20">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Eyebrow dark={dark}>{section.eyebrow ?? section.title ?? "Hvorfor"}</Eyebrow>
          <h2 className="mt-4 text-4xl md:text-5xl">For dem det er bygget for.</h2>
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

function FaqModule({ section, brain }: ModuleProps) {
  const items = normalizeFaq(brain?.faq);
  if (!items.length) return null;
  const variant = section.variant || "accordion";
  const dark = isDarkBg(section.background_style);
  return (
    <Container id={sectionAnchor(section)} bg={section.background_style} className="py-20">
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

function ContactCtaModule({ section, brain }: ModuleProps) {
  const variant = section.variant || "strong";
  const primary = resolveCta(section, brain);
  const secondary =
    brain?.cta_secondary_label && brain?.cta_secondary_href
      ? { label: brain.cta_secondary_label, href: brain.cta_secondary_href }
      : null;

  if (variant === "soft") {
    return (
      <Container
        id={sectionAnchor(section) ?? "kontakt"}
        bg={section.background_style}
        className="py-20"
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
      className="py-24"
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
