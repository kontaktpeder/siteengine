import type {
  ActivityItem,
  AudienceItem,
  ClientBrain,
  FaqItem,
  PageSection,
  PartnerItem,
  ServiceItem,
  SiteData,
  TrustPoint,
} from "@/lib/site-types";

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function sectionAnchor(section: PageSection): string | undefined {
  const settings = (section.settings ?? {}) as { anchor?: string };
  return settings.anchor;
}

interface ModuleProps {
  section: PageSection;
  brain: ClientBrain | null;
  site: SiteData;
}

function Container({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary-foreground">
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

/* ---------- Modules ---------- */

function HeroModule({ section, brain }: ModuleProps) {
  const title = section.title ?? brain?.short_description ?? "Velkommen";
  const subtitle = section.subtitle ?? brain?.long_description ?? "";
  const ctaLabel = brain?.cta_primary_label;
  const ctaHref = brain?.cta_primary_href;
  const cta2Label = brain?.cta_secondary_label;
  const cta2Href = brain?.cta_secondary_href;

  return (
    <Container className="pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="max-w-3xl">
        <Eyebrow>Foreningen</Eyebrow>
        <h1 className="mt-6 text-5xl leading-[1.05] md:text-7xl">{title}</h1>
        {subtitle ? (
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">{subtitle}</p>
        ) : null}
        {(ctaLabel || cta2Label) && (
          <div className="mt-10 flex flex-wrap gap-3">
            {ctaLabel && ctaHref ? <PrimaryButton href={ctaHref}>{ctaLabel}</PrimaryButton> : null}
            {cta2Label && cta2Href ? <GhostButton href={cta2Href}>{cta2Label}</GhostButton> : null}
          </div>
        )}
      </div>
    </Container>
  );
}

function TrustStripModule({ brain }: ModuleProps) {
  const items = asArray<TrustPoint>(brain?.trust_points);
  if (!items.length) return null;
  return (
    <Container className="py-10">
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

function MissionModule({ section, brain }: ModuleProps) {
  return (
    <Container id="om" className="py-20">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <Eyebrow>{section.title ?? "Vårt oppdrag"}</Eyebrow>
          <h2 className="mt-4 text-4xl md:text-5xl">{brain?.mission ?? "Vi skaper trygge arenaer."}</h2>
        </div>
        <div className="space-y-6 text-lg text-muted-foreground">
          {brain?.problem_statement ? <p>{brain.problem_statement}</p> : null}
          {brain?.solution_statement ? <p>{brain.solution_statement}</p> : null}
          {brain?.vision ? (
            <p className="text-foreground">
              <span className="font-medium">Visjon:</span> {brain.vision}
            </p>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

function ServicesGridModule({ section, brain }: ModuleProps) {
  const items = asArray<ServiceItem>(brain?.services);
  if (!items.length) return null;
  return (
    <Container id={sectionAnchor(section) ?? "tjenester"} className="py-20">
      <div className="max-w-2xl">
        {section.title ? <h2 className="text-4xl md:text-5xl">{section.title}</h2> : null}
        {section.subtitle ? (
          <p className="mt-4 text-lg text-muted-foreground">{section.subtitle}</p>
        ) : null}
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s, i) => (
          <div key={i} className="rounded-3xl border border-border bg-card p-7 transition hover:shadow-sm">
            <h3 className="text-xl">{s.title}</h3>
            {s.description ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </Container>
  );
}

function ActivitiesModule({ section }: ModuleProps) {
  const content = (section.content ?? {}) as { items?: ActivityItem[] };
  const items = content.items ?? [];
  if (!items.length) return null;
  return (
    <Container className="py-20">
      <div className="rounded-3xl bg-secondary p-10 md:p-16">
        <div className="max-w-2xl">
          {section.title ? <h2 className="text-4xl md:text-5xl">{section.title}</h2> : null}
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

function PartnersModule({ section, brain }: ModuleProps) {
  const items = asArray<PartnerItem>(brain?.partners);
  if (!items.length) return null;
  return (
    <Container id={sectionAnchor(section) ?? "samarbeid"} className="py-20">
      <div className="max-w-2xl">
        {section.title ? <h2 className="text-4xl md:text-5xl">{section.title}</h2> : null}
        {section.subtitle ? (
          <p className="mt-4 text-lg text-muted-foreground">{section.subtitle}</p>
        ) : null}
      </div>
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
    </Container>
  );
}

function ProofModule({ section, brain }: ModuleProps) {
  const items = asArray<AudienceItem>(brain?.audience);
  if (!items.length && !brain?.long_description) return null;
  return (
    <Container className="py-20">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Eyebrow>{section.title ?? "Hvorfor"}</Eyebrow>
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

function FaqModule({ section, brain }: ModuleProps) {
  const items = asArray<FaqItem>(brain?.faq);
  if (!items.length) return null;
  return (
    <Container className="py-20">
      <div className="max-w-2xl">
        {section.title ? <h2 className="text-4xl md:text-5xl">{section.title}</h2> : null}
      </div>
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
    </Container>
  );
}

function ContactCtaModule({ section, brain }: ModuleProps) {
  return (
    <Container id={sectionAnchor(section) ?? "kontakt"} className="py-24">
      <div className="rounded-3xl bg-primary p-10 text-primary-foreground md:p-16">
        <div className="max-w-2xl">
          {section.title ? (
            <h2 className="text-4xl md:text-5xl text-primary-foreground">{section.title}</h2>
          ) : null}
          {section.subtitle ? (
            <p className="mt-4 text-lg text-primary-foreground/80">{section.subtitle}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {brain?.cta_primary_label && brain?.cta_primary_href ? (
              <a
                href={brain.cta_primary_href}
                className="inline-flex items-center rounded-full bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:bg-cream"
              >
                {brain.cta_primary_label}
              </a>
            ) : null}
            {brain?.cta_secondary_label && brain?.cta_secondary_href ? (
              <a
                href={brain.cta_secondary_href}
                className="inline-flex items-center rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-foreground/10"
              >
                {brain.cta_secondary_label}
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
