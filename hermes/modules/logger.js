// modules/logger.js — Winston logger
import winston from 'winston'
import { config } from '../config.js'
import { mkdirSync } from 'fs'

// Ensure logs directory exists
mkdirSync(config.logs.dir, { recursive: true })

export const logger = winston.createLogger({
  level: config.logs.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `${config.logs.dir}/hermes.log`,
      maxsize: 1024 * 1024, // 1MB max log size
      maxFiles: 5,
    }),
  ],
})
