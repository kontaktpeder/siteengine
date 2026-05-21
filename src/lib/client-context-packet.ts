import { parseFormatBrief, type FormatBrief } from "./format-brief";
import {
  POSTER_MODULE_TYPES,
  getTemplateConfig,
  isPageTemplate,
  type PageTemplate,
} from "./page-templates";
import { mergeThemePack } from "./theme-packs";
import type { Client, ClientBrain, PageSection, SiteRecipe, ThemeTokens } from "./site-types";

export interface ClientContextPacket {
  meta: { client_id: string; slug: string; generated_at: string };
  page_template: PageTemplate;
  visual_tone: string;
  format_brief: FormatBrief;
  identity: {
    flagship_story?: string;
    representative_scene?: string;
    short_description?: string;
    products: unknown[];
    cta_primary_label?: string;
    cta_primary_href?: string;
  };
  template_config: {
    section_ceiling: number;
    allowed_modules: string[];
    forbidden_modules: string[];
    poster_module_order?: string[];
    shell: { minimal_nav: boolean; sticky_cta: boolean; compact_footer: boolean };
  };
  theme: ThemeTokens;
  constraints: {
    forbidden_assumptions: string[];
    banned_phrases: string[];
  };
}

export function buildClientContextPacket(args: {
  client: Client;
  brain: ClientBrain | null;
  recipe: SiteRecipe | null;
  sections?: PageSection[];
}): ClientContextPacket {
  const rawTemplate = (args.recipe as { page_template?: string } | null)?.page_template;
  const template: PageTemplate = isPageTemplate(rawTemplate)
    ? rawTemplate
    : "organization_documentary";
  const cfg = getTemplateConfig(template);
  const rawBrief = (args.brain as { format_brief?: unknown } | null)?.format_brief;
  const parsed = parseFormatBrief(rawBrief ?? cfg.default_format_brief);
  const tone =
    (args.recipe as { visual_tone?: string | null } | null)?.visual_tone ??
    cfg.default_visual_tone;

  const theme = mergeThemePack(template, tone, args.client.theme);

  const identity: ClientContextPacket["identity"] = {
    flagship_story: args.brain?.flagship_story ?? undefined,
    representative_scene: args.brain?.representative_scene ?? undefined,
    short_description: args.brain?.short_description ?? undefined,
    products: (args.brain?.services as unknown[]) ?? [],
    cta_primary_label: args.brain?.cta_primary_label ?? undefined,
    cta_primary_href: args.brain?.cta_primary_href ?? undefined,
  };

  return {
    meta: {
      client_id: args.client.id,
      slug: args.client.slug,
      generated_at: new Date().toISOString(),
    },
    page_template: template,
    visual_tone: tone,
    format_brief: {
      ...cfg.default_format_brief,
      ...parsed,
      information_budget: parsed.information_budget ?? cfg.default_information_budget,
    } as FormatBrief,
    identity,
    template_config: {
      section_ceiling: cfg.section_ceiling,
      allowed_modules:
        cfg.allowed_modules === "poster_modules"
          ? [...POSTER_MODULE_TYPES]
          : [...cfg.allowed_modules],
      forbidden_modules: cfg.forbidden_modules,
      poster_module_order: cfg.poster_module_order,
      shell: cfg.shell,
    },
    theme,
    constraints: {
      forbidden_assumptions: [
        ...(parsed.must_not_feel_like ?? []),
        "standard_ai_landing_page",
      ],
      banned_phrases: [
        "våre tjenester",
        "vår visjon",
        "vi tilbyr",
        ...(template === "brand_poster"
          ? ["vårt oppdrag", "forening", "inkludering"]
          : []),
      ],
    },
  };
}
