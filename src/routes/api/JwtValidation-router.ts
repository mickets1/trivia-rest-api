import express from 'express'
import createError from 'http-errors'
import fse from 'fs-extra'
import jwt from 'jsonwebtoken'
import { dirname } from 'path'
import * as path from 'path'
import { fileURLToPath } from 'url'

export const router = express.Router()

/**
 * JWT verification.
 */
export const jwtValidation = async (req: any, res: any, next: Function) => {
  try {
    // If user already has permission, no need to re-verify.
    if (req.user?.permissionLevel === 1) {
      console.log('user has perm')
      next()
    }

    const authorization = req.headers.authorization?.split(' ')

    if (authorization?.[0] !== 'Bearer') {
      next(createError(401))
      return
    }

    const __dirname = dirname(fileURLToPath(import.meta.url))
    const keyPath = path.join(__dirname, '..', '..', '..', 'jwtRS256.key.pub')

    // Read path and file with public key.
    const publicKey = await fse.readFile(keyPath, 'utf-8')
    const payload = jwt.verify(authorization[1], publicKey)

    req.user = {
      email: payload.sub,
      permissionLevel: 1
    }

    next()
  } catch (err) {
    console.log(err)
    next(createError(403))
  }
}
