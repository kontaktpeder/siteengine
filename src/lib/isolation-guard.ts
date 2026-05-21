import type { ClientContextPacket } from "./client-context-packet";

export interface GuardableSection {
  module_type: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
}

export interface GuardResult {
  violations: string[];
  warnings: string[];
  retry_needed: boolean;
}

export function runIsolationGuard(
  packet: ClientContextPacket,
  sections: GuardableSection[],
): GuardResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  for (const s of sections) {
    if (packet.template_config.forbidden_modules.includes(s.module_type)) {
      violations.push(`Forbidden module: ${s.module_type}`);
    }
    if (
      packet.template_config.allowed_modules.length > 0 &&
      !packet.template_config.allowed_modules.includes(s.module_type)
    ) {
      warnings.push(`Module ${s.module_type} not in allowed list`);
    }
    const hay = [s.title, s.subtitle, s.body]
      .filter((x): x is string => typeof x === "string")
      .join(" ")
      .toLowerCase();
    for (const phrase of packet.constraints.banned_phrases) {
      if (hay.includes(phrase.toLowerCase())) {
        violations.push(`Banned phrase "${phrase}" in ${s.module_type}`);
      }
    }
  }
  if (sections.length > packet.template_config.section_ceiling) {
    violations.push(
      `Too many sections: ${sections.length} > ceiling ${packet.template_config.section_ceiling}`,
    );
  }
  return { violations, warnings, retry_needed: violations.length > 0 };
}
