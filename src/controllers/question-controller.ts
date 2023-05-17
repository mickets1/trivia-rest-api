import createError from 'http-errors'
import fetch from 'node-fetch'
import { createModel, getModel, getRandomModel } from '../models/question.js'
import { User } from '../models/user.js'

export class QuestionController {
  /**
   * HATEOAS representations.
   */
  async index (req: any, res: any, next: Function) {
    res
      .json({
        _links: {
          self: { href: '/api' },
          next: { href: '/api/categories' },
          login: { href: '/api/login' },
          register: { href: '/api/register' },
          webhook: [{ href: '/api/webhook/register' }, { href: '/api/webhook/events' }, { href: '/api/webhook/subscribe' }]
        }
      })
  }

  /**
   * Returns a random question information.
   * @returns question object
   */
  async randomQuestionByCategory (req: any, res: any, next: Function) {
    try {
      const extractedCategory:string = req.params['1'].split('/')[1]

      let Category = null
      if (extractedCategory === 'random' || extractedCategory === 'randoms') {
        Category = await getRandomModel()
      } else {
        Category = await getModel(extractedCategory)
      }

      // If category does not exist
      if (!Category) {
        throw new Error('404')
      }

      const [getRndQuestion] = await Category?.aggregate([{ $sample: { size: 1 } }]) || []

      // Randomize answers
      const answers = getRndQuestion.answers
      for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = answers[i]
        answers[i] = answers[j]
        answers[j] = temp
      }

      res
        .json(getRndQuestion)
        .status(200)
    } catch (err: any) {
      // Non-existing category
      if (err.name === 'TypeError' || err.message === '404') {
        next(createError(404))
      }

      next(err)
    }
  }

  /**
   * Creates a question and category collection dynamically.
   */
  async createNewQuestion (req: any, res: any, next: Function) {
    try {
      if (!req.body.category) {
        next(createError(400))
      }

      const newQuestion = {
        question: req.body.question,
        answers: req.body.answers,
        correctAnswer: req.body.correctAnswer,
        category: req.body.category
      }

      // Create category if it doesn't exist
      const Category = await createModel(req.body.category)
      let questionDoc: any = await Category?.findOne({ question: req.body.question })

      if (!questionDoc) {
        questionDoc = await Category?.create(newQuestion)
      }

      this.notifyWebhookSubsribers(newQuestion)

      res
        .status(200)
        .json({ _id: questionDoc._id })
    } catch (err: any) {
      next(err)
    }
  }

  /**
   * Updates a question document.
   */
  async updateQuestion (req: any, res: any, next: Function) {
    try {
      const extractedCategory:string = req.params['1'].split('/')[1]
      const Category = await getModel(extractedCategory)

      const result = await Category?.updateOne({ _id: req.body._id }, {
        question: req.body.question,
        answers: req.body.answers,
        correctAnswer: req.body.correctAnswer,
        category: req.body.category
      })

      if (result?.modifiedCount === 1) {
        res
          .status(200)
          .json('Question Updated.')
      } else if (result?.modifiedCount === 0) {
        res
          .status(400)
          .json('Question Not updated.')
      } else {
        next(createError(400))
      }
    } catch (err) {
      // Defaults to 404
      next(err)
    }
  }

  /**
   * Deletes a question document.
   */
  async deleteQuestion (req: any, res: any, next: Function) {
    try {
      const extractedCategory:string = req.params['1'].split('/')[1]

      const Category = await getModel(extractedCategory)
      const result = await Category?.deleteOne({ _id: req.body._id })

      if (result?.deletedCount === 1) {
        res
          .status(200)
          .json('Question Removed.')
      } else {
        res
          .status(400)
          .json('Question Not Removed.')
      }
    } catch (err) {
      console.error()
    }
  }

  /**
   * Sends POST request of the user specified webhook url.
   * Tested through: https://webhook.site
   */
  async notifyWebhookSubsribers (newQuestion: Object) {
    try {
      const users: any = await User.find()

      // Continue if user provides a non-valid url.
      for (let i = 0; i < users.length; i++) {
        try {
          await fetch(users[i].webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newQuestion)
          })
        } catch (err) {
          continue
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
}
