import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { failResult } from '@maghami-system/schemas';
import type { Response } from 'express';

function collectStringMessages(value: unknown): string[] {
  if (typeof value === 'string' && value.trim() !== '') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === 'string' && item.trim() !== '',
    );
  }
  return [];
}

/**
 * Build ApiResult.message[] from Nest/Zod exception bodies.
 * Prefer an explicit message list; otherwise flatten fieldErrors / formErrors.
 */
function messagesFromException(exception: unknown): string[] {
  if (exception instanceof HttpException) {
    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body.trim() === '' ? [exception.message] : [body];
    }
    if (body && typeof body === 'object') {
      const record = body as Record<string, unknown>;
      const fromMessage = collectStringMessages(record.message);
      if (fromMessage.length > 0) {
        return fromMessage;
      }

      const issues = record.issues;
      if (issues && typeof issues === 'object') {
        const flattened = issues as {
          formErrors?: unknown;
          fieldErrors?: Record<string, unknown>;
        };
        const list: string[] = [...collectStringMessages(flattened.formErrors)];
        if (
          flattened.fieldErrors &&
          typeof flattened.fieldErrors === 'object'
        ) {
          for (const [field, errors] of Object.entries(flattened.fieldErrors)) {
            for (const error of collectStringMessages(errors)) {
              list.push(`${field}: ${error}`);
            }
          }
        }
        if (list.length > 0) return list;
      }
    }
    return [exception.message];
  }
  if (exception instanceof Error && exception.message.trim() !== '') {
    return [exception.message];
  }
  return ['Internal server error'];
}

@Catch()
export class ResultExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const messages = messagesFromException(exception);
    const body = failResult(
      status,
      messages.length > 0 ? messages : ['Request failed'],
    );
    response.status(status).json(body);
  }
}
