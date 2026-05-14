import type { PageSection, SiteRecipe } from "@/lib/site-types";
import {
  getContentDepth,
  getStorytellingMode,
  type ContentDepth,
  type StorytellingMode,
} from "@/lib/render-contract";

export type SectionDensity = "compact" | "normal" | "featured";
export type VisualWeight = "quiet" | "standard" | "hero";
export type ImageScale = "small" | "medium" | "large";
export type Alignment = "left" | "center" | "split";

export const VALID_SECTION_DENSITY: ReadonlySet<SectionDensity> = new Set([
  "compact",
  "normal",
  "featured",
]);
export const VALID_VISUAL_WEIGHT: ReadonlySet<VisualWeight> = new Set([
  "quiet",
  "standard",
  "hero",
]);
export const VALID_IMAGE_SCALE: ReadonlySet<ImageScale> = new Set([
  "small",
  "medium",
  "large",
]);
export const VALID_ALIGNMENT: ReadonlySet<Alignment> = new Set([
  "left",
  "center",
  "split",
]);

export interface SectionLayoutTokens {
  sectionDensity: SectionDensity;
  visualWeight: VisualWeight;
  imageScale: ImageScale;
  alignment: Alignment;
}

export interface SectionLayoutClasses {
  /** Outer <section> wrapper — controls vertical rhythm only */
  root: string;
  /** Inner container — single max-width / horizontal padding strategy */
  inner: string;
  /** Prose / text column width + size */
  prose: string;
  /** Media wrapper (img/aspect) classes */
  media: string;
  /** Card/grid layout for items inside the section */
  grid: string;
}

const COMPACT_MODULES = new Set([
  "trust_strip",
  "faq",
  "contact_cta",
  "partners",
]);

/**
 * Resolve section layout tokens with safe fallbacks from existing
 * `settings.content_depth` + module_type + recipe storytelling.
 */
export function resolveLayoutTokens(
  section: PageSection,
  recipe: SiteRecipe | null,
): SectionLayoutTokens {
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  const depth: ContentDepth = getContentDepth(section);
  const storytelling: StorytellingMode = getStorytellingMode(recipe);
  const moduleType = section.module_type;
  const isHero = moduleType === "hero";

  // sectionDensity
  let density: SectionDensity =
    isHero || depth === "deep"
      ? "featured"
      : depth === "shallow" || COMPACT_MODULES.has(moduleType)
        ? "compact"
        : "normal";
  const sd = settings.sectionDensity;
  if (typeof sd === "string" && VALID_SECTION_DENSITY.has(sd as SectionDensity)) {
    density = sd as SectionDensity;
  }

  // visualWeight (hero reserved for hero module)
  let weight: VisualWeight = isHero
    ? "hero"
    : COMPACT_MODULES.has(moduleType) || depth === "shallow"
      ? "quiet"
      : "standard";
  const vw = settings.visualWeight;
  if (typeof vw === "string" && VALID_VISUAL_WEIGHT.has(vw as VisualWeight)) {
    const next = vw as VisualWeight;
    weight = next === "hero" && !isHero ? "standard" : next;
  }

  // imageScale
  let scale: ImageScale = isHero
    ? "large"
    : storytelling === "documentary" && (moduleType === "mission" || moduleType === "proof")
      ? "large"
      : COMPACT_MODULES.has(moduleType)
        ? "small"
        : "medium";
  const is = settings.imageScale;
  if (typeof is === "string" && VALID_IMAGE_SCALE.has(is as ImageScale)) {
    scale = is as ImageScale;
  }

  // alignment
  const layoutStyle = section.layout_style ?? null;
  let alignment: Alignment =
    layoutStyle === "split"
      ? "split"
      : layoutStyle === "centered" || isHero
        ? "center"
        : "left";
  const al = settings.alignment;
  if (typeof al === "string" && VALID_ALIGNMENT.has(al as Alignment)) {
    alignment = al as Alignment;
  }

  return { sectionDensity: density, visualWeight: weight, imageScale: scale, alignment };
}

function densityRootPadding(density: SectionDensity): string {
  switch (density) {
    case "compact":
      return "py-12 md:py-16";
    case "featured":
      return "py-28 md:py-36";
    default:
      return "py-20 md:py-24";
  }
}

function densityGap(density: SectionDensity): string {
  switch (density) {
    case "compact":
      return "gap-4";
    case "featured":
      return "gap-8";
    default:
      return "gap-6";
  }
}

function proseFromWeight(weight: VisualWeight): string {
  switch (weight) {
    case "quiet":
      return "max-w-xl text-base";
    case "hero":
      return "max-w-3xl text-lg leading-relaxed";
    default:
      return "max-w-2xl text-lg";
  }
}

function mediaFromScale(scale: ImageScale): string {
  switch (scale) {
    case "small":
      return "aspect-[4/3] w-full rounded-2xl object-cover";
    case "large":
      return "aspect-[4/5] w-full rounded-3xl object-cover";
    default:
      return "aspect-[16/9] w-full rounded-3xl object-cover";
  }
}

function gridForAlignment(alignment: Alignment, density: SectionDensity): string {
  const gap = densityGap(density);
  if (alignment === "split") return `grid ${gap} md:grid-cols-2 items-start`;
  return `grid ${gap}`;
}

/**
 * Single source of truth for section-level Tailwind classes.
 * Modules MUST consume this rather than improvising spacing/heights.
 */
export function getSectionLayoutClasses(args: {
  section: PageSection;
  recipe: SiteRecipe | null;
}): SectionLayoutClasses & { tokens: SectionLayoutTokens } {
  const tokens = resolveLayoutTokens(args.section, args.recipe);
  const root = densityRootPadding(tokens.sectionDensity);
  const inner = "mx-auto w-full max-w-6xl px-6 md:px-10";
  const prose = proseFromWeight(tokens.visualWeight);
  const media = mediaFromScale(tokens.imageScale);
  const grid = gridForAlignment(tokens.alignment, tokens.sectionDensity);
  return { root, inner, prose, media, grid, tokens };
}
