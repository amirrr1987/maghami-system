import {
  BadRequestException,
  type PipeTransform,
} from '@nestjs/common';
import type { ZodType } from 'zod';

function zodIssueMessages(error: {
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>;
}): string[] {
  return error.issues.map((issue) => {
    const path = issue.path
      .map((segment) => String(segment))
      .filter((segment) => segment.length > 0)
      .join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

export class ZodValidationPipe<TSchema extends ZodType>
  implements PipeTransform<unknown, TSchema['_output']>
{
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): TSchema['_output'] {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      const messages = zodIssueMessages(parsed.error);
      throw new BadRequestException({
        message: messages.length > 0 ? messages : ['Validation failed'],
      });
    }
    return parsed.data;
  }
}
