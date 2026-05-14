import type { PageSection, SiteRecipe } from "@/lib/site-types";

export type StorytellingMode = "default" | "documentary" | "editorial";
export type ContentDepth = "shallow" | "standard" | "deep";

export function getStorytellingMode(recipe: SiteRecipe | null): StorytellingMode {
  // Primary: module_strategy.storytelling_mode (per v2 contract)
  const strat = (recipe?.module_strategy as Record<string, unknown> | null) ?? null;
  const fromStrat = strat?.storytelling_mode;
  if (fromStrat === "documentary" || fromStrat === "editorial" || fromStrat === "default") {
    return fromStrat;
  }
  // Fallback: top-level recipe.storytelling_mode (v3 column, if used)
  const topLevel = (recipe as unknown as { storytelling_mode?: string } | null)?.storytelling_mode;
  if (topLevel === "documentary" || topLevel === "editorial") return topLevel;
  if (topLevel === "minimal") return "default";
  return "default";
}

export function getContentDepth(section: PageSection): ContentDepth {
  const s = (section.settings ?? {}) as Record<string, unknown>;
  const v = s.content_depth;
  if (v === "shallow" || v === "deep" || v === "standard") return v;
  return "standard";
}

/** Vertical rhythm: documentary = more breathing room and "chapter" feel */
export function sectionVerticalPadding(args: {
  storytelling: StorytellingMode;
  depth: ContentDepth;
  base: string;
}): string {
  const { storytelling, depth, base } = args;
  if (storytelling === "default" && depth === "standard") return base;

  let bump = "";
  if (storytelling === "documentary") {
    bump = depth === "deep" ? "py-28 md:py-36" : "py-24 md:py-28";
  } else if (storytelling === "editorial") {
    bump = depth === "shallow" ? "py-16 md:py-20" : "py-22 md:py-26";
  } else if (depth === "deep") {
    bump = "py-24 md:py-28";
  } else if (depth === "shallow") {
    bump = "py-14 md:py-16";
  }
  if (!bump) return base;
  return base.split(/\s+/).filter((c) => !/^py-/.test(c)).concat(bump.split(/\s+/)).join(" ").trim();
}

export function proseDepthClass(depth: ContentDepth): string {
  switch (depth) {
    case "shallow":
      return "max-w-xl text-base";
    case "deep":
      return "max-w-3xl text-lg leading-relaxed";
    default:
      return "max-w-2xl text-lg";
  }
}

/** Whether a section should render media full-bleed wider than container */
export function shouldFullBleedMedia(args: {
  storytelling: StorytellingMode;
  depth: ContentDepth;
  moduleType: string;
}): boolean {
  return (
    args.storytelling === "documentary" &&
    (args.moduleType === "hero" || args.moduleType === "mission") &&
    args.depth !== "shallow"
  );
}
