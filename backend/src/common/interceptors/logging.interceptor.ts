import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor to sanitize sensitive data from request/response logs
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly sensitiveFields = ['password', 'confirmPassword', 'accessToken', 'refreshToken', 'token'];

  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized = { ...obj };
    for (const key in sanitized) {
      if (this.sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }
    return sanitized;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    // Sanitize request body before logging
    const sanitizedBody = this.sanitizeObject(body);

    // Only log non-sensitive endpoints
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup');
    if (!isAuthEndpoint) {
      console.log(`[${method}] ${url}`, sanitizedBody ? { body: sanitizedBody } : '');
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Sanitize response data
          const sanitizedResponse = this.sanitizeObject(data);
          if (!isAuthEndpoint) {
            console.log(`[${method}] ${url} - Response`, sanitizedResponse);
          }
        },
        error: (error) => {
          // Log errors but sanitize any sensitive data
          const sanitizedError = {
            message: error.message,
            status: error.status,
            ...(error.response ? { response: this.sanitizeObject(error.response) } : {}),
          };
          console.error(`[${method}] ${url} - Error`, sanitizedError);
        },
      }),
    );
  }
}

