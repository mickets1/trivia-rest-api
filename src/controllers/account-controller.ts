import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { User } from '../models/user.js'
import fse from 'fs-extra'
import { dirname } from 'path'
import * as path from 'path'
import { fileURLToPath } from 'url'

export class AccountController {
  /**
   * Account authentication using JWT.
   */
  async login (req: any, res: any, next: Function) {
    try {
      const user = await User.authenticate(req.body.email, req.body.password)

      const payload = {
        sub: user.email
      }

      const __dirname = dirname(fileURLToPath(import.meta.url))
      const keyPath = path.join(__dirname, '..', '..', 'jwtRS256.key')

      const privateKey = await fse.readFile(keyPath, 'utf-8')

      const accessToken = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '9999999999'
      })

      res
        .status(200)
        .json({
          access_token: accessToken
        })
    } catch (error) {
      // Authentication failed.
      const err = createError(401)
      err.innerException = error

      next(err)
    }
  }

  /**
   * Register a user in DB.
   */
  async register (req: any, res: any, next: Function) {
    try {
      const user = new User({
        email: req.body.email,
        password: req.body.password
      })

      user.save()

      res
        .status(201)
        .json({ id: user.id })
    } catch (err: any) {
      if (err.code === 11000) {
        // Duplicated keys.
        createError(409)
        err.innerException = err
      } else if (err.name === 'ValidationError') {
        // Validation error(s).
        createError(400)
        err.innerException = err
      }

      next(err)
    }
  }
}
