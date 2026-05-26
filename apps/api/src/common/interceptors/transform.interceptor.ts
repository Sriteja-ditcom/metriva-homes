import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the controller already returns { success, data, meta } — pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Wrap paginated results
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            success: true,
            data: (data as { items: T }).items,
            meta: (data as { meta: Record<string, unknown> }).meta,
          };
        }

        return { success: true, data };
      }),
    );
  }
}
