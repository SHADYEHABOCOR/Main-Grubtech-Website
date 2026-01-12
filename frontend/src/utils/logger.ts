/**
 * Production-safe Logger Utility
 *
 * Provides a drop-in replacement for console.log/error/warn that:
 * 1. Is automatically disabled in production
 * 2. Can be integrated with external logging services (Sentry, LogRocket, etc.)
 * 3. Provides consistent formatting
 * 4. Supports log levels
 */

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Format log message with timestamp and level
   */
  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      formatted += ` | Data: ${JSON.stringify(data)}`;
    }

    return formatted;
  }

  /**
   * Send log to external service in production
   */
  private sendToExternalService(_level: LogLevel, _message: string, _data?: unknown): void {
    // TODO: Integrate with your logging service (Sentry, LogRocket, DataDog, etc.)
    // Example for Sentry:
    // if (level === LogLevel.ERROR) {
    //   Sentry.captureException(new Error(message), { extra: data });
    // } else {
    //   Sentry.captureMessage(message, { level: level.toLowerCase(), extra: data });
    // }
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown): void {
    const errorData = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;

    if (this.isDevelopment) {
      console.error(this.formatMessage(LogLevel.ERROR, message, errorData));
      if (error instanceof Error) {
        console.error(error);
      }
    } else {
      // In production, send to external service only
      this.sendToExternalService(LogLevel.ERROR, message, errorData);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage(LogLevel.WARN, message, data));
    } else {
      this.sendToExternalService(LogLevel.WARN, message, data);
    }
  }

  /**
   * Log info messages (development only)
   */
  info(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage(LogLevel.INFO, message, data));
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  /**
   * Log regular messages (development only)
   */
  log(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LogLevel.INFO, message, data));
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for cleaner imports
export const logError = (message: string, error?: Error | unknown) => logger.error(message, error);
export const logWarn = (message: string, data?: unknown) => logger.warn(message, data);
export const logInfo = (message: string, data?: unknown) => logger.info(message, data);
export const logDebug = (message: string, data?: unknown) => logger.debug(message, data);
