import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isApiResult, okResult } from '@maghami-system/schemas';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
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
