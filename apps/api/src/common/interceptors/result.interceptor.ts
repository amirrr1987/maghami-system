import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isApiResult, okResult } from '@maghami-system/schemas';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RAW_RESPONSE_KEY } from '../decorators/raw-response.decorator';

function crudSuccessMessages(method: string): string[] {
  switch (method.toUpperCase()) {
    case 'POST':
      return ['Created successfully'];
    case 'PATCH':
    case 'PUT':
      return ['Updated successfully'];
    case 'DELETE':
      return ['Deleted successfully'];
    case 'GET':
      return ['Retrieved successfully'];
    default:
      return [];
  }
}

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const raw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (raw) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      map((payload: unknown) => {
        if (isApiResult(payload)) {
          return payload;
        }
        const status = response.statusCode || 200;
        const messages = crudSuccessMessages(request.method ?? 'GET');
        if (payload === undefined || payload === null) {
          return okResult(undefined, status, messages);
        }
        return okResult(payload, status, messages);
      }),
    );
  }
}
