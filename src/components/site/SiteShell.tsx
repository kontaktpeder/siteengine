import type { SiteData, ThemeTokens } from "@/lib/site-types";
import { renderModule } from "./modules";
import {
  getArchetypeConfig,
  getArchetypeFromSite,
  mergeArchetypeTheme,
} from "@/lib/archetype-config";

interface NavItem {
  label: string;
  href: string;
}

function buildFallbackSections(data: SiteData) {
  const recipe = data.recipe;
  const enabledModules = Array.isArray(recipe?.enabled_modules)
    ? recipe.enabled_modules.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  const moduleOrder = enabledModules.length
    ? enabledModules
    : ["hero", "trust_strip", "mission", "services_grid", "proof", "faq", "contact_cta"];

  const titles: Record<string, string> = {
    hero: data.client.name,
    trust_strip: "Hvorfor velge oss",
    mission: "Om oss",
    services_grid: "Tilbud",
    proof: "Hvem vi hjelper",
    faq: "Vanlige spørsmål",
    contact_cta: "Ta kontakt",
  };

  const subtitles: Record<string, string> = {
    hero:
      data.brain?.short_description ?? data.client.description ?? "",
    services_grid:
      data.brain?.solution_statement ?? "Praktisk og tydelig opplæring tilpasset behovet ditt.",
    proof:
      data.brain?.long_description ?? "",
    contact_cta:
      data.brain?.primary_goal ?? data.brain?.short_description ?? "",
  };

  const eyebrows: Record<string, string> = {
    hero: data.client.name,
    mission: "Om oss",
    services_grid: "Tilbud",
    proof: "Målgruppe",
    faq: "FAQ",
    contact_cta: "Kontakt",
  };

  const anchors: Record<string, string> = {
    hero: "top",
    mission: "om",
    services_grid: "tilbud",
    proof: "om",
    faq: "faq",
    contact_cta: "kontakt",
  };

  return moduleOrder.map((moduleType, index) => ({
    id: `fallback-${moduleType}-${index}`,
    page_id: data.page?.id ?? "fallback-page",
    module_type: moduleType,
    variant: moduleType === "faq" ? "accordion" : "default",
    sort_order: index,
    title: titles[moduleType] ?? null,
    subtitle: subtitles[moduleType] ?? null,
    body: null,
    image_url: null,
    content: {},
    settings: { content_depth: "standard" },
    is_visible: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    anchor_id: anchors[moduleType] ?? null,
    eyebrow: eyebrows[moduleType] ?? null,
    cta_label: moduleType === "contact_cta" ? data.brain?.cta_primary_label ?? null : null,
    cta_href: moduleType === "contact_cta" ? data.brain?.cta_primary_href ?? null : null,
    background_style: moduleType === "trust_strip" ? "muted" : null,
    layout_style: moduleType === "hero" ? "centered" : null,
  }));
}

function themeToCssVars(theme: ThemeTokens | undefined | null): React.CSSProperties {
  if (!theme) return {};
  const vars: Record<string, string> = {};
  if (theme.primaryColor) vars["--primary"] = theme.primaryColor;
  if (theme.primaryForegroundColor) vars["--primary-foreground"] = theme.primaryForegroundColor;
  if (theme.secondaryColor) vars["--secondary"] = theme.secondaryColor;
  if (theme.secondaryForegroundColor) vars["--secondary-foreground"] = theme.secondaryForegroundColor;
  if (theme.accentColor) vars["--accent"] = theme.accentColor;
  if (theme.backgroundColor) vars["--background"] = theme.backgroundColor;
  if (theme.surfaceColor) vars["--card"] = theme.surfaceColor;
  if (theme.textColor) vars["--foreground"] = theme.textColor;
  if (theme.mutedColor) vars["--muted-foreground"] = theme.mutedColor;
  if (theme.borderColor) vars["--border"] = theme.borderColor;
  if (theme.radius) vars["--radius"] = theme.radius;
  return vars as React.CSSProperties;
}

export function SiteShell({ data }: { data: SiteData }) {
  const recipe = data.recipe;
  const nav = (Array.isArray(recipe?.navigation) ? recipe?.navigation : []) as unknown as NavItem[];
  const footer = (recipe?.footer ?? {}) as unknown as { tagline?: string; email?: string };
  const brain = data.brain;
  const archetype = getArchetypeFromSite(
    recipe as unknown as Record<string, unknown> | null,
    brain as unknown as Record<string, unknown> | null,
  );
  const archetypeCfg = getArchetypeConfig(archetype);
  const theme = mergeArchetypeTheme(
    archetypeCfg.default_theme,
    (data.client.theme ?? {}) as ThemeTokens,
  );
  const style = themeToCssVars(theme);
  const sections = data.sections.length ? data.sections : buildFallbackSections(data);
  const fontClass =
    theme.fontStyle === "sans"
      ? "[&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_h4]:font-sans"
      : "";

  return (
    <div
      style={style}
      className={`min-h-screen bg-background text-foreground ${fontClass}`}
    >
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <a href="/" className="font-display text-xl tracking-tight">
            {data.client.name}
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((n, i) => (
              <a
                key={i}
                href={n.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
            {brain?.cta_primary_label && brain?.cta_primary_href ? (
              <a
                href={brain.cta_primary_href}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {brain.cta_primary_label}
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      <main data-renderer-v2={import.meta.env.VITE_RENDERER_V2 === "1" ? "1" : undefined}>
        {sections.map((s) => (
          <div key={s.id}>{renderModule({ section: s, brain, site: data })}</div>
        ))}
      </main>

      <footer className="mt-10 border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-10">
          <div>
            <div className="font-display text-2xl">{data.client.name}</div>
            {footer.tagline ? (
              <div className="mt-1 text-sm text-muted-foreground">{footer.tagline}</div>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            {footer.email ? (
              <a className="hover:text-foreground" href={`mailto:${footer.email}`}>
                {footer.email}
              </a>
            ) : null}
            <div className="mt-1">© {new Date().getFullYear()} {data.client.name}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function EmptySiteState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          ✦
        </div>
        <h1 className="mt-6 text-4xl">Nettstedet er klart for innhold.</h1>
        <p className="mt-4 text-muted-foreground">
          Det er ingen publisert klient eller side ennå. Gå til{" "}
          <a href="/studio" className="underline underline-offset-4">
            /studio
          </a>{" "}
          for å opprette en klient eller seede første utkast.
        </p>
      </div>
    </div>
  );
}
