import type { PageSection, ThemeTokens } from "@/lib/site-types";
import type { SiteArchetype } from "@/lib/archetype-config";

export type Pacing = "tight" | "balanced" | "spacious";
export type ImageScaleR = "small" | "medium" | "large" | "full";
export type CtaIntensity = "soft" | "normal" | "strong";

export interface SectionRendererSettings {
  pacing?: Pacing;
  imageScale?: ImageScaleR;
  ctaIntensity?: CtaIntensity;
}

export type HeroLayout = "split-portrait" | "stacked-full" | "centered";
export type CtaVariant = "soft-card" | "strong-band" | "balanced-card" | "food_drop_cta";
export type GridDensity = "airy" | "balanced" | "compact";

export type ModulePresentation =
  | "nonprofit_default"
  | "food_hero_drop"
  | "food_menu_grid"
  | "food_story_snippet"
  | "food_offer_strip"
  | "food_audience_insider"
  | "food_drop_cta";

export type TypographyMode = "editorial_serif" | "brand_sans";
export type SurfaceTone = "calm_cream" | "warm_cream" | "dark_espresso";
export type AccentStyle = "mint" | "tomato" | "neutral";

export interface ResolvedRenderer {
  archetype: SiteArchetype;
  settings: Required<SectionRendererSettings>;
  sectionClass: string;
  containerClass: string;
  heroLayout: HeroLayout;
  ctaVariant: CtaVariant;
  gridDensity: GridDensity;
  imageAspect: string;
  cardClass: string;
  mediaClass: string;
  headlineClass: string;
  introClass: string;
  theme: ThemeTokens;
  presentation: ModulePresentation;
  typographyMode: TypographyMode;
  surfaceTone: SurfaceTone;
  accentStyle: AccentStyle;
  eyebrowClass: string;
  primaryButtonClass: string;
  sectionSurfaceClass: string;
}

function mergeSettings(
  raw: unknown,
  archetype: SiteArchetype,
): Required<SectionRendererSettings> {
  const r = (raw ?? {}) as SectionRendererSettings;
  const defaultsByArchetype: Record<SiteArchetype, Required<SectionRendererSettings>> = {
    neutral: { pacing: "balanced", imageScale: "medium", ctaIntensity: "normal" },
    nonprofit_documentary: {
      pacing: "spacious",
      imageScale: "large",
      ctaIntensity: "soft",
    },
    food_popup_editorial: {
      pacing: "tight",
      imageScale: "full",
      ctaIntensity: "strong",
    },
  };
  const d = defaultsByArchetype[archetype];
  return {
    pacing: r.pacing ?? d.pacing,
    imageScale: r.imageScale ?? d.imageScale,
    ctaIntensity: r.ctaIntensity ?? d.ctaIntensity,
  };
}

function pacingPadding(p: Pacing): string {
  switch (p) {
    case "tight":
      return "py-12 md:py-16";
    case "spacious":
      return "py-28 md:py-36";
    default:
      return "py-20 md:py-24";
  }
}

function heroLayoutFor(archetype: SiteArchetype, section: PageSection): HeroLayout {
  const variant = section.variant;
  if (archetype === "food_popup_editorial") return "stacked-full";
  if (archetype === "nonprofit_documentary") return "split-portrait";
  if (variant === "split") return "split-portrait";
  if (variant === "centered") return "centered";
  return "split-portrait";
}

function ctaVariantFor(archetype: SiteArchetype): CtaVariant {
  if (archetype === "food_popup_editorial") return "strong-band";
  if (archetype === "nonprofit_documentary") return "soft-card";
  return "balanced-card";
}

function gridDensityFor(archetype: SiteArchetype): GridDensity {
  if (archetype === "food_popup_editorial") return "compact";
  if (archetype === "nonprofit_documentary") return "airy";
  return "balanced";
}

function imageAspectFor(
  archetype: SiteArchetype,
  moduleType: string,
  scale: ImageScaleR,
): string {
  if (moduleType === "hero") {
    if (archetype === "food_popup_editorial") return scale === "full" ? "aspect-[21/9]" : "aspect-[16/9]";
    return "aspect-[4/5]";
  }
  switch (scale) {
    case "full":
      return "aspect-[21/9]";
    case "large":
      return "aspect-[4/5]";
    case "small":
      return "aspect-[4/3]";
    default:
      return "aspect-[16/9]";
  }
}

function cardClassFor(density: GridDensity): string {
  switch (density) {
    case "airy":
      return "rounded-3xl border border-border bg-card p-8";
    case "compact":
      return "rounded-2xl border border-border bg-card p-5";
    default:
      return "rounded-3xl border border-border bg-card p-7";
  }
}

function gridContainerFor(density: GridDensity): string {
  switch (density) {
    case "airy":
      return "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3";
    case "compact":
      return "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4";
    default:
      return "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3";
  }
}

function headlineFor(archetype: SiteArchetype, moduleType: string): string {
  if (moduleType === "hero") {
    if (archetype === "food_popup_editorial")
      return "mt-6 text-5xl md:text-7xl font-serif leading-[1.02] tracking-tight";
    if (archetype === "nonprofit_documentary")
      return "mt-6 text-5xl md:text-8xl leading-[1.05]";
    return "mt-6 text-5xl md:text-7xl leading-[1.05]";
  }
  return "mt-3 text-3xl md:text-5xl";
}

function introFor(archetype: SiteArchetype): string {
  if (archetype === "food_popup_editorial")
    return "mt-5 max-w-xl text-lg md:text-xl text-muted-foreground";
  if (archetype === "nonprofit_documentary")
    return "mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground";
  return "mt-6 max-w-2xl text-lg text-muted-foreground";
}

export function resolveRenderer(
  section: PageSection,
  archetype: SiteArchetype,
  theme: ThemeTokens,
): ResolvedRenderer {
  const raw = (section.settings as Record<string, unknown> | null)?.renderer;
  const settings = mergeSettings(raw, archetype);
  const heroLayout = heroLayoutFor(archetype, section);
  const ctaVariant = ctaVariantFor(archetype);
  const gridDensity = gridDensityFor(archetype);
  const imageAspect = imageAspectFor(archetype, section.module_type, settings.imageScale);

  return {
    archetype,
    settings,
    sectionClass: pacingPadding(settings.pacing),
    containerClass: gridContainerFor(gridDensity),
    heroLayout,
    ctaVariant,
    gridDensity,
    imageAspect,
    cardClass: cardClassFor(gridDensity),
    mediaClass: `${imageAspect} w-full rounded-3xl object-cover`,
    headlineClass: headlineFor(archetype, section.module_type),
    introClass: introFor(archetype),
    theme,
  };
}
