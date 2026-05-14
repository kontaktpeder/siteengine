import type { PageSection, SiteRecipe } from "@/lib/site-types";

export type StorytellingMode = "default" | "documentary" | "editorial";
export type ContentDepth = "shallow" | "standard" | "deep";

export function getStorytellingMode(recipe: SiteRecipe | null): StorytellingMode {
  // Single source of truth: recipe.storytelling_mode (root column).
  // Recipe values: minimal | editorial | documentary | conversion → mapped to
  // renderer rhythm modes: default | editorial | documentary.
  const root = (recipe as unknown as { storytelling_mode?: string } | null)?.storytelling_mode;
  if (root === "documentary") return "documentary";
  if (root === "editorial") return "editorial";
  if (root === "minimal" || root === "conversion") return "default";
  // Backwards compat (deprecated): module_strategy.storytelling_mode
  const legacy = (recipe?.module_strategy as Record<string, unknown> | null)?.storytelling_mode;
  if (legacy === "documentary" || legacy === "editorial") return legacy;
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
    bump = depth === "shallow" ? "py-16 md:py-20" : "py-20 md:py-24";
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
