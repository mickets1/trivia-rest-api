import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

/**
 * The code in this file, including global.d.ts is a workaround for Typescript and dotenv.
 * Code borrowed from: https://dev.to/asjadanis/parsing-env-with-typescript-3jjm
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

interface ENV {
  PORT: number | undefined
  DB_CONNECTION_STRING: string | undefined
}

interface Config {
  PORT: number
  DB_CONNECTION_STRING: string
}

// Loading process.env as ENV interface
const getConfig = (): ENV => {
  return {
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING
  }
}

// Throwing an Error if any field was undefined.
const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`)
    }
  }
  return config as Config
}

const config = getConfig()

const sanitizedConfig = getSanitzedConfig(config)

export default sanitizedConfig
