export type DigitalObject =
  | "organization"
  | "popup_poster"
  | "conversion_tool"
  | "editorial_room"
  | "community_platform";

export type InformationBudget = "scannable_20s" | "standard" | "documentary_deep";

export type HeroJob = "create_craving" | "build_trust" | "explain_offer" | "book_contact";

export type VisualVolume = "quiet" | "medium" | "loud";
export type CopyStyle =
  | "editorial_warm"
  | "documentary_calm"
  | "punchy_minimal"
  | "playful_loud"
  | "neutral";

export interface FormatBrief {
  digital_object: DigitalObject;
  feels_like: string[];
  must_not_feel_like: string[];
  information_budget: InformationBudget;
  hero_job: HeroJob;
  first_3_seconds: string;
  anti_patterns?: string[];
  digital_object_note?: string;
  visual_volume?: VisualVolume;
  copy_style?: CopyStyle;
  section_ceiling_override?: number;
}

export const EMPTY_FORMAT_BRIEF: FormatBrief = {
  digital_object: "organization",
  feels_like: [],
  must_not_feel_like: [],
  information_budget: "standard",
  hero_job: "build_trust",
  first_3_seconds: "",
};

const DIGITAL_OBJECTS: DigitalObject[] = [
  "organization",
  "popup_poster",
  "conversion_tool",
  "editorial_room",
  "community_platform",
];
const INFO_BUDGETS: InformationBudget[] = ["scannable_20s", "standard", "documentary_deep"];
const HERO_JOBS: HeroJob[] = ["create_craving", "build_trust", "explain_offer", "book_contact"];
const VISUAL_VOLUMES: VisualVolume[] = ["quiet", "medium", "loud"];
const COPY_STYLES: CopyStyle[] = [
  "editorial_warm",
  "documentary_calm",
  "punchy_minimal",
  "playful_loud",
  "neutral",
];

function isDigitalObject(v: unknown): v is DigitalObject {
  return typeof v === "string" && (DIGITAL_OBJECTS as string[]).includes(v);
}
function isInfoBudget(v: unknown): v is InformationBudget {
  return typeof v === "string" && (INFO_BUDGETS as string[]).includes(v);
}
function isHeroJob(v: unknown): v is HeroJob {
  return typeof v === "string" && (HERO_JOBS as string[]).includes(v);
}
function isVisualVolume(v: unknown): v is VisualVolume {
  return typeof v === "string" && (VISUAL_VOLUMES as string[]).includes(v);
}
function isCopyStyle(v: unknown): v is CopyStyle {
  return typeof v === "string" && (COPY_STYLES as string[]).includes(v);
}
function stringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .slice(0, max);
}

export function parseFormatBrief(raw: unknown): FormatBrief {
  if (!raw || typeof raw !== "object") return { ...EMPTY_FORMAT_BRIEF };
  const o = raw as Record<string, unknown>;
  const ceiling =
    typeof o.section_ceiling_override === "number" &&
    o.section_ceiling_override > 0 &&
    o.section_ceiling_override < 30
      ? Math.floor(o.section_ceiling_override)
      : undefined;
  return {
    digital_object: isDigitalObject(o.digital_object)
      ? o.digital_object
      : EMPTY_FORMAT_BRIEF.digital_object,
    feels_like: stringArray(o.feels_like, 5),
    must_not_feel_like: stringArray(o.must_not_feel_like, 8),
    information_budget: isInfoBudget(o.information_budget) ? o.information_budget : "standard",
    hero_job: isHeroJob(o.hero_job) ? o.hero_job : "build_trust",
    first_3_seconds:
      typeof o.first_3_seconds === "string" ? o.first_3_seconds.slice(0, 200) : "",
    anti_patterns: stringArray(o.anti_patterns, 12),
    digital_object_note:
      typeof o.digital_object_note === "string"
        ? o.digital_object_note.slice(0, 500)
        : undefined,
    visual_volume: isVisualVolume(o.visual_volume) ? o.visual_volume : undefined,
    copy_style: isCopyStyle(o.copy_style) ? o.copy_style : undefined,
    section_ceiling_override: ceiling,
  };
}

