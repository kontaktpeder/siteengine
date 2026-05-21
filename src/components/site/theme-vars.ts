import type { ThemeTokens } from "@/lib/site-types";

export function themeToCssVars(theme: ThemeTokens | undefined | null): React.CSSProperties {
  if (!theme) return {};
  const vars: Record<string, string> = {};
  if (theme.primaryColor) vars["--primary"] = theme.primaryColor;
  if (theme.primaryForegroundColor) vars["--primary-foreground"] = theme.primaryForegroundColor;
  if (theme.secondaryColor) vars["--secondary"] = theme.secondaryColor;
  if (theme.secondaryForegroundColor)
    vars["--secondary-foreground"] = theme.secondaryForegroundColor;
  if (theme.accentColor) vars["--accent"] = theme.accentColor;
  if (theme.backgroundColor) vars["--background"] = theme.backgroundColor;
  if (theme.surfaceColor) vars["--card"] = theme.surfaceColor;
  if (theme.textColor) vars["--foreground"] = theme.textColor;
  if (theme.mutedColor) vars["--muted-foreground"] = theme.mutedColor;
  if (theme.borderColor) vars["--border"] = theme.borderColor;
  if (theme.radius) vars["--radius"] = theme.radius;
  return vars as React.CSSProperties;
}
