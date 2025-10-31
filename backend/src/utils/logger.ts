import pino from "pino";

/**
 * Base Pino logger instance with configuration for different environments
 * - Development: Uses pino-pretty for colorized, human-readable output
 * - Production: Outputs JSON format for log aggregation tools
 * @type {pino.Logger}
 */
const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Logger instance for authentication module operations
 * @type {pino.Logger}
 */
export const authLogger = baseLogger.child({ module: "AUTH" });

/**
 * Logger instance for user module operations
 * @type {pino.Logger}
 */
export const userLogger = baseLogger.child({ module: "USER" });

/**
 * Logger instance for project module operations
 * @type {pino.Logger}
 */
export const projectLogger = baseLogger.child({ module: "PROJECT" });

/**
 * Logger instance for customer module operations
 * @type {pino.Logger}
 */
export const customerLogger = baseLogger.child({ module: "CUSTOMER" });

/**
 * Logger instance for payment module operations
 * @type {pino.Logger}
 */
export const paymentLogger = baseLogger.child({ module: "PAYMENT" });

export const sessionLogger = baseLogger.child({ module: "SESSION" });

/**
 * Logger instance for general application operations
 * @type {pino.Logger}
 */
export const appLogger = baseLogger.child({ module: "APP" });

/**
 * Default export of the base logger instance
 * Use this for general logging or create custom child loggers
 */
export default baseLogger;
