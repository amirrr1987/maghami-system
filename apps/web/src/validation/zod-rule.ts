import type { RuleObject } from 'ant-design-vue/es/form';
import type { ZodType } from 'zod';

/**
 * Ant Design Vue rule backed by a Zod schema (shared API contract).
 * Compose with extra UX-only RuleObjects in the same field array.
 */
export function zodRule(
  schema: ZodType,
  fallbackMessage = 'Invalid value',
): RuleObject {
  return {
    async validator(_rule, value: unknown) {
      const parsed = await schema.safeParseAsync(value);
      if (parsed.success) {
        return;
      }
      const message = parsed.error.issues[0]?.message ?? fallbackMessage;
      return Promise.reject(message);
    },
  };
}
