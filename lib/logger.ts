/**
 * Structured security logger — server-side only.
 * Outputs JSON lines in production for easy ingestion by log aggregators.
 * Prints readable format in development.
 */

type LogLevel = "info" | "warn" | "error"

type SecurityEvent =
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.logout"
  | "auth.token.invalid"
  | "auth.rate_limited"
  | "resource.created"
  | "resource.updated"
  | "resource.deleted"
  | "upload.rejected"
  | "request.blocked"

interface LogEntry {
  level: LogLevel
  event: SecurityEvent | string
  timestamp: string
  ip?: string
  user?: string
  resource?: string
  detail?: string
  [key: string]: unknown
}

function write(level: LogLevel, entry: Omit<LogEntry, "level" | "timestamp"> & { event: string }) {
  const record: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    ...entry,
  }

  if (process.env.NODE_ENV === "production") {
    // JSON lines — one event per line for log aggregators
    process.stdout.write(JSON.stringify(record) + "\n")
  } else {
    const { level: lvl, timestamp, event, ...rest } = record
    const tag = `[${lvl.toUpperCase()}][${event}]`
    const extras = Object.keys(rest).length
      ? " " + JSON.stringify(rest)
      : ""
    // eslint-disable-next-line no-console
    console.log(`${timestamp} ${tag}${extras}`)
  }
}

export const logger = {
  info: (event: SecurityEvent | string, meta?: Record<string, unknown>) =>
    write("info", { event, ...meta }),
  warn: (event: SecurityEvent | string, meta?: Record<string, unknown>) =>
    write("warn", { event, ...meta }),
  error: (event: SecurityEvent | string, meta?: Record<string, unknown>) =>
    write("error", { event, ...meta }),
}
