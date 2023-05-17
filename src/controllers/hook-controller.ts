import { User } from '../models/user.js'
import createError from 'http-errors'

export class HookController {
  /**
   * Registers webhook for an authenticated user.
   * Saves/updates hook secret and url in the user document.
   */
  async registerHook (req: any, res: any, next: Function) {
    try {
      const user: any = await User.updateOne({ email: req.user.email }, {
        webhook: { url: req.body.url, secret: req.headers['x-secret-token'] }
      }, { upsert: true })

      if (user.modifiedCount === 1) {
        res
          .status(200)
          .json('Webhook Registered!')
      } else if (user?.modifiedCount === 0) {
        res
          .status(400)
          .json('Bad Request')
      }
    } catch (err) {
      next(err)
    }
  }

  /**
   * Validates the hook secret for a user.
   */
  async authorizeHookSecret (req: any, res: any, next: Function) {
    try {
      const header = req.headers['x-secret-token']

      const user: any = await User.findOne({ email: req.user.email })

      // If user is not registered
      if (!user) {
        next(createError(403))
      }

      if (header !== user.webhook.secret) {
        res.status(403).send('Incorrect Secret')
        return
      }

      next()
    } catch (err) {
      next(err)
    }
  }

  /**
   * HATEOAS representation of subscribable events.
   */
  async subscribableEvents (req: any, res: any, next: Function) {
    res.json({
      _links: {
        self: req.originalUrl,
        events: 'new-question'
      }
    })
  }

  /**
   * Saves event type in user document.
   */
  async newQuestionEvent (req: any, res: any, next: Function) {
    try {
      await User.findOneAndUpdate({ email: req.user.email }, { 'webhook.events': 'new-question' })

      res
        .status(200)
        .json('Subscribed')
    } catch (err) {
      next(err)
    }
  }
}
