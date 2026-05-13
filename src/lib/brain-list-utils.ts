import type { Json } from "@/integrations/supabase/types";

export function linesToStringArray(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n|,/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function linesToLabeledJson(
  text: string,
  mode: "label" | "title" | "name",
): Json {
  const lines = linesToStringArray(text);
  if (mode === "name") return lines.map((name) => ({ name })) as unknown as Json;
  if (mode === "title")
    return lines.map((title) => ({ title })) as unknown as Json;
  return lines.map((label) => ({ label })) as unknown as Json;
}

export function jsonArrayToLines(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const main =
          (typeof o.label === "string" && o.label) ||
          (typeof o.title === "string" && o.title) ||
          (typeof o.name === "string" && o.name) ||
          (typeof o.question === "string" && o.question);
        const extra =
          (typeof o.description === "string" && o.description) ||
          (typeof o.answer === "string" && o.answer);
        if (main && extra) return `${main} — ${extra}`;
        return main || "";
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

/** Parse "Label — description" lines into [{label, description?}] */
export function linesToLabelDescJson(text: string): Json {
  return linesToStringArray(text).map((line) => {
    const m = line.split(/\s+[—–-]\s+/);
    if (m.length >= 2) return { label: m[0], description: m.slice(1).join(" — ") };
    return { label: line };
  }) as unknown as Json;
}

/** Parse "Title — description" lines into [{title, description?}] */
export function linesToTitleDescJson(text: string): Json {
  return linesToStringArray(text).map((line) => {
    const m = line.split(/\s+[—–-]\s+/);
    if (m.length >= 2) return { title: m[0], description: m.slice(1).join(" — ") };
    return { title: line };
  }) as unknown as Json;
}
