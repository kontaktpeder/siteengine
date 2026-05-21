import type { FormatBrief, InformationBudget } from "./format-brief";
import type { ModuleType, ThemeTokens } from "./site-types";

export type PageTemplate =
  | "organization_documentary"
  | "brand_poster"
  | "local_conversion"
  | "portfolio_editorial";

export const POSTER_MODULE_TYPES = [
  "popup_hero",
  "menu_preview",
  "food_gallery",
  "story_snippet",
  "faq",
  "drop_cta",
] as const;

export type PosterModuleType = (typeof POSTER_MODULE_TYPES)[number];

export interface PageTemplateConfig {
  id: PageTemplate;
  label: string;
  description: string;
  default_visual_tone: string;
  default_information_budget: InformationBudget;
  section_ceiling: number;
  allowed_modules: ModuleType[] | "poster_modules";
  forbidden_modules: string[];
  default_format_brief: Partial<FormatBrief>;
  theme_pack: Record<string, ThemeTokens>;
  shell: {
    minimal_nav: boolean;
    sticky_cta: boolean;
    compact_footer: boolean;
  };
  poster_module_order?: string[];
}

const PACKAGING_SOFT: ThemeTokens = {
  primaryColor: "oklch(0.62 0.14 35)",
  primaryForegroundColor: "oklch(0.98 0.01 80)",
  secondaryColor: "oklch(0.94 0.03 75)",
  secondaryForegroundColor: "oklch(0.22 0.03 40)",
  accentColor: "oklch(0.20 0.04 40)",
  backgroundColor: "oklch(0.96 0.02 85)",
  surfaceColor: "oklch(1 0 0)",
  textColor: "oklch(0.22 0.03 40)",
  mutedColor: "oklch(0.50 0.03 40)",
  borderColor: "oklch(0.90 0.03 70)",
  radius: "0.375rem",
  fontStyle: "sans",
};

const STREET_BOLD: ThemeTokens = {
  ...PACKAGING_SOFT,
  primaryColor: "oklch(0.55 0.22 30)",
  backgroundColor: "oklch(0.16 0.02 40)",
  surfaceColor: "oklch(0.22 0.03 40)",
  textColor: "oklch(0.96 0.02 80)",
  mutedColor: "oklch(0.75 0.02 80)",
  borderColor: "oklch(0.30 0.03 40)",
};

const WARM_DOCUMENTARY: ThemeTokens = {
  primaryColor: "oklch(0.55 0.09 168)",
  backgroundColor: "oklch(0.985 0.012 95)",
  surfaceColor: "oklch(1 0 0)",
  textColor: "oklch(0.22 0.02 160)",
  borderColor: "oklch(0.9 0.02 130)",
  radius: "1rem",
  fontStyle: "mixed",
};

export const PAGE_TEMPLATES: Record<PageTemplate, PageTemplateConfig> = {
  organization_documentary: {
    id: "organization_documentary",
    label: "Organisasjon (dokumentarisk)",
    description: "Tillit, bredde, historie — foreninger og lignende.",
    default_visual_tone: "warm_documentary",
    default_information_budget: "documentary_deep",
    section_ceiling: 9,
    allowed_modules: [
      "hero",
      "trust_strip",
      "mission",
      "services_grid",
      "activities",
      "partners",
      "proof",
      "faq",
      "contact_cta",
    ],
    forbidden_modules: [],
    default_format_brief: {
      digital_object: "organization",
      hero_job: "build_trust",
      information_budget: "documentary_deep",
      must_not_feel_like: ["startup", "saas", "aggressive_sales"],
    },
    theme_pack: { warm_documentary: WARM_DOCUMENTARY, fiken_calm: WARM_DOCUMENTARY },
    shell: { minimal_nav: false, sticky_cta: false, compact_footer: false },
  },
  brand_poster: {
    id: "brand_poster",
    label: "Brand poster (popup / drop)",
    description: "Én opplevelse: bilde, sult, én handling. Ikke bedriftsside.",
    default_visual_tone: "packaging_soft",
    default_information_budget: "scannable_20s",
    section_ceiling: 5,
    allowed_modules: "poster_modules",
    forbidden_modules: [
      "trust_strip",
      "mission",
      "services_grid",
      "activities",
      "partners",
      "proof",
      "contact_cta",
    ],
    default_format_brief: {
      digital_object: "popup_poster",
      hero_job: "create_craving",
      information_budget: "scannable_20s",
      must_not_feel_like: [
        "startup",
        "saas",
        "nonprofit",
        "restaurant_chain",
        "agency",
        "corporate",
        "tech_landing",
      ],
      feels_like: ["warm", "packaging", "editorial_food", "limited_drop"],
    },
    theme_pack: {
      packaging_soft: PACKAGING_SOFT,
      street_bold: STREET_BOLD,
    },
    shell: { minimal_nav: true, sticky_cta: true, compact_footer: true },
    poster_module_order: [
      "popup_hero",
      "menu_preview",
      "food_gallery",
      "story_snippet",
      "faq",
      "drop_cta",
    ],
  },
  local_conversion: {
    id: "local_conversion",
    label: "Local conversion (kommer)",
    description: "Stub.",
    default_visual_tone: "warm_documentary",
    default_information_budget: "standard",
    section_ceiling: 6,
    allowed_modules: ["hero", "services_grid", "faq", "contact_cta"],
    forbidden_modules: [],
    default_format_brief: { digital_object: "conversion_tool", hero_job: "book_contact" },
    theme_pack: { warm_documentary: WARM_DOCUMENTARY },
    shell: { minimal_nav: false, sticky_cta: true, compact_footer: false },
  },
  portfolio_editorial: {
    id: "portfolio_editorial",
    label: "Portfolio editorial (kommer)",
    description: "Stub.",
    default_visual_tone: "warm_documentary",
    default_information_budget: "standard",
    section_ceiling: 6,
    allowed_modules: ["hero", "services_grid", "faq", "contact_cta"],
    forbidden_modules: [],
    default_format_brief: { digital_object: "editorial_room", hero_job: "build_trust" },
    theme_pack: { warm_documentary: WARM_DOCUMENTARY },
    shell: { minimal_nav: false, sticky_cta: false, compact_footer: false },
  },
};

export function isPageTemplate(v: unknown): v is PageTemplate {
  return typeof v === "string" && v in PAGE_TEMPLATES;
}

export function getTemplateConfig(t: PageTemplate): PageTemplateConfig {
  return PAGE_TEMPLATES[t] ?? PAGE_TEMPLATES.organization_documentary;
}
