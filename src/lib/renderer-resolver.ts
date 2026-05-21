import type { PageSection, ThemeTokens } from "@/lib/site-types";
import type { SiteArchetype } from "@/lib/archetype-config";

export type Pacing = "tight" | "balanced" | "spacious";
export type ImageScaleR = "small" | "medium" | "large" | "full";
export type CtaIntensity = "soft" | "normal" | "strong";
export type HeroMode = "copy_first" | "product_first";
export type MediaProminence = "background" | "inline" | "hero_dominant";
export type StoryWeight = "hidden" | "snippet" | "manifest";
export type MenuStyle = "info_cards" | "signature_dishes";
export type FaqWeight = "normal" | "compact_footer";

export interface SectionRendererSettings {
  pacing?: Pacing;
  imageScale?: ImageScaleR;
  ctaIntensity?: CtaIntensity;
  heroMode?: HeroMode;
  mediaProminence?: MediaProminence;
  storyWeight?: StoryWeight;
  menuStyle?: MenuStyle;
  faqWeight?: FaqWeight;
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
  effectiveBackgroundStyle: string | null;
}

function mergeSettings(
  raw: unknown,
  archetype: SiteArchetype,
  moduleType: string,
): Required<SectionRendererSettings> {
  const r = (raw ?? {}) as SectionRendererSettings;
  const defaultsByArchetype: Record<SiteArchetype, Required<SectionRendererSettings>> = {
    neutral: {
      pacing: "balanced",
      imageScale: "medium",
      ctaIntensity: "normal",
      heroMode: "copy_first",
      mediaProminence: "inline",
      storyWeight: "manifest",
      menuStyle: "info_cards",
      faqWeight: "normal",
    },
    nonprofit_documentary: {
      pacing: "spacious",
      imageScale: "large",
      ctaIntensity: "soft",
      heroMode: "copy_first",
      mediaProminence: "inline",
      storyWeight: "manifest",
      menuStyle: "info_cards",
      faqWeight: "normal",
    },
    food_popup_editorial: {
      pacing: "tight",
      imageScale: "full",
      ctaIntensity: "strong",
      heroMode: moduleType === "hero" ? "product_first" : "copy_first",
      mediaProminence: moduleType === "hero" ? "hero_dominant" : "inline",
      storyWeight: "snippet",
      menuStyle: "signature_dishes",
      faqWeight: "compact_footer",
    },
  };
  const d = defaultsByArchetype[archetype];
  return {
    pacing: r.pacing ?? d.pacing,
    imageScale: r.imageScale ?? d.imageScale,
    ctaIntensity: r.ctaIntensity ?? d.ctaIntensity,
    heroMode: r.heroMode ?? d.heroMode,
    mediaProminence: r.mediaProminence ?? d.mediaProminence,
    storyWeight: r.storyWeight ?? d.storyWeight,
    menuStyle: r.menuStyle ?? d.menuStyle,
    faqWeight: r.faqWeight ?? d.faqWeight,
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

function headlineFor(
  archetype: SiteArchetype,
  moduleType: string,
  presentation: ModulePresentation,
): string {
  if (presentation === "food_hero_drop") {
    return "mt-6 text-4xl md:text-6xl font-sans font-semibold leading-[1.05] tracking-tight";
  }
  if (presentation === "food_menu_grid" || presentation === "food_story_snippet") {
    return "mt-3 text-3xl md:text-4xl font-sans font-semibold tracking-tight";
  }
  if (presentation === "food_drop_cta") {
    return "mt-3 text-3xl md:text-5xl font-sans font-semibold tracking-tight";
  }
  if (presentation === "food_offer_strip" || presentation === "food_audience_insider") {
    return "mt-3 text-2xl md:text-3xl font-sans font-semibold tracking-tight";
  }
  if (moduleType === "hero") {
    if (archetype === "nonprofit_documentary")
      return "mt-6 text-5xl md:text-8xl leading-[1.05]";
    return "mt-6 text-5xl md:text-7xl leading-[1.05]";
  }
  return "mt-3 text-3xl md:text-5xl";
}

function introFor(archetype: SiteArchetype, presentation: ModulePresentation): string {
  if (presentation === "food_hero_drop")
    return "mt-5 max-w-xl text-base md:text-lg text-muted-foreground";
  if (
    presentation === "food_menu_grid" ||
    presentation === "food_story_snippet" ||
    presentation === "food_drop_cta"
  )
    return "mt-4 max-w-2xl text-base md:text-lg text-muted-foreground";
  if (archetype === "nonprofit_documentary")
    return "mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground";
  return "mt-6 max-w-2xl text-lg text-muted-foreground";
}

export function presentationFor(
  moduleType: string,
  archetype: SiteArchetype,
): ModulePresentation {
  if (archetype !== "food_popup_editorial") return "nonprofit_default";
  switch (moduleType) {
    case "hero":
      return "food_hero_drop";
    case "services_grid":
      return "food_menu_grid";
    case "mission":
      return "food_story_snippet";
    case "trust_strip":
      return "food_offer_strip";
    case "proof":
      return "food_audience_insider";
    case "contact_cta":
      return "food_drop_cta";
    default:
      return "nonprofit_default";
  }
}

function eyebrowClassFor(presentation: ModulePresentation): string {
  if (
    presentation === "food_hero_drop" ||
    presentation === "food_menu_grid" ||
    presentation === "food_story_snippet" ||
    presentation === "food_offer_strip" ||
    presentation === "food_drop_cta"
  ) {
    return "inline-flex items-center rounded-sm bg-foreground px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-background";
  }
  if (presentation === "food_audience_insider") {
    return "inline-flex items-center rounded-sm bg-background/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-background";
  }
  return "inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary-foreground";
}

function primaryButtonClassFor(presentation: ModulePresentation, intensity: CtaIntensity): string {
  if (
    presentation === "food_hero_drop" ||
    presentation === "food_drop_cta" ||
    presentation === "food_menu_grid"
  ) {
    return "inline-flex items-center justify-center rounded-sm bg-primary px-7 py-4 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:opacity-90";
  }
  if (intensity === "strong") {
    return "inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-md transition hover:opacity-90";
  }
  if (intensity === "soft") {
    return "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90";
  }
  return "inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90";
}

function sectionSurfaceClassFor(presentation: ModulePresentation): string {
  if (presentation === "food_audience_insider" || presentation === "food_drop_cta") {
    return "bg-foreground text-background";
  }
  return "";
}

export function resolveRenderer(
  section: PageSection,
  archetype: SiteArchetype,
  theme: ThemeTokens,
): ResolvedRenderer {
  const raw = (section.settings as Record<string, unknown> | null)?.renderer;
  const settings = mergeSettings(raw, archetype, section.module_type);
  const presentation = presentationFor(section.module_type, archetype);
  const heroLayout: HeroLayout =
    presentation === "food_hero_drop" ? "stacked-full" : heroLayoutFor(archetype, section);
  const ctaVariant: CtaVariant =
    presentation === "food_drop_cta" ? "food_drop_cta" : ctaVariantFor(archetype);
  const gridDensity = gridDensityFor(archetype);
  const imageAspect = imageAspectFor(archetype, section.module_type, settings.imageScale);
  const typographyMode: TypographyMode =
    archetype === "food_popup_editorial" ? "brand_sans" : "editorial_serif";
  const surfaceTone: SurfaceTone =
    archetype === "food_popup_editorial"
      ? "warm_cream"
      : archetype === "nonprofit_documentary"
        ? "calm_cream"
        : "calm_cream";
  const accentStyle: AccentStyle =
    archetype === "food_popup_editorial"
      ? "tomato"
      : archetype === "nonprofit_documentary"
        ? "mint"
        : "neutral";

  // Food forbids mint surface tokens — coerce to default
  const rawBg = section.background_style ?? null;
  const effectiveBackgroundStyle: string | null =
    archetype === "food_popup_editorial" && rawBg === "mint" ? null : rawBg;

  return {
    archetype,
    settings,
    sectionClass: pacingPadding(settings.pacing),
    containerClass: gridContainerFor(gridDensity),
    heroLayout,
    ctaVariant,
    gridDensity,
    imageAspect,
    cardClass:
      presentation === "food_menu_grid"
        ? "rounded-xl border-0 bg-card shadow-md overflow-hidden"
        : cardClassFor(gridDensity),
    mediaClass: `${imageAspect} w-full ${
      presentation === "food_hero_drop" || presentation === "food_menu_grid"
        ? "rounded-md"
        : "rounded-3xl"
    } object-cover`,
    headlineClass: headlineFor(archetype, section.module_type, presentation),
    introClass: introFor(archetype, presentation),
    theme,
    presentation,
    typographyMode,
    surfaceTone,
    accentStyle,
    eyebrowClass: eyebrowClassFor(presentation),
    primaryButtonClass: primaryButtonClassFor(presentation, settings.ctaIntensity),
    sectionSurfaceClass: sectionSurfaceClassFor(presentation),
    effectiveBackgroundStyle,
  };
}
