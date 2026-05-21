import type { Database } from "@/integrations/supabase/types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientBrain = Database["public"]["Tables"]["client_brains"]["Row"];
export type SitePage = Database["public"]["Tables"]["site_pages"]["Row"];
export type PageSection = Database["public"]["Tables"]["page_sections"]["Row"];
export type SiteRecipe = Database["public"]["Tables"]["site_recipes"]["Row"];

export type ModuleType =
  | "hero"
  | "trust_strip"
  | "mission"
  | "services_grid"
  | "partners"
  | "proof"
  | "activities"
  | "faq"
  | "contact_cta";

export interface ThemeTokens {
  primaryColor?: string;
  primaryForegroundColor?: string;
  secondaryColor?: string;
  secondaryForegroundColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  radius?: string;
  fontStyle?: "serif" | "sans" | "mixed";
}

export type BackgroundStyle = "default" | "muted" | "mint" | "dark" | "image";
export type LayoutStyle = "centered" | "split" | "grid" | "editorial";

export interface AudienceItem {
  label: string;
  description?: string;
}
export interface TrustPoint {
  label: string;
  description?: string;
}
export interface ServiceItem {
  title: string;
  description?: string;
  icon?: string;
}
export interface PartnerItem {
  name: string;
  url?: string;
}
export interface FaqItem {
  question: string;
  answer: string;
}
export interface ActivityItem {
  title: string;
  description?: string;
}

export interface SiteData {
  client: Client;
  brain: ClientBrain | null;
  recipe: SiteRecipe | null;
  page: SitePage | null;
  sections: PageSection[];
}
