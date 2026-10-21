// Load hermes/.env no matter which directory Hermes is run from
// (plain `dotenv/config` only looks in the current working directory).
import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true })
