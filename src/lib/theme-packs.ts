import { PAGE_TEMPLATES, type PageTemplate } from "./page-templates";
import type { ThemeTokens } from "./site-types";

export function mergeThemePack(
  template: PageTemplate,
  visualTone: string | null | undefined,
  clientTheme: unknown,
): ThemeTokens {
  const cfg = PAGE_TEMPLATES[template];
  const tones = cfg.theme_pack;
  const toneKey = (visualTone && tones[visualTone] ? visualTone : Object.keys(tones)[0]) ?? "";
  const pack = tones[toneKey] ?? {};
  const client = (clientTheme ?? {}) as ThemeTokens;

  if (template === "brand_poster") {
    // Template wins on brand colors and font for poster
    return {
      ...client,
      ...pack,
      primaryColor: pack.primaryColor,
      secondaryColor: pack.secondaryColor,
      backgroundColor: pack.backgroundColor,
      fontStyle: pack.fontStyle ?? "sans",
    };
  }
  // Organization: pack provides defaults, client can override
  return { ...pack, ...client };
}
