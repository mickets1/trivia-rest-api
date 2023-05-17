import mongoose from 'mongoose'
import createError from 'http-errors'
import { getModel, createModel } from '../models/question.js'

export class CategoryController {
  /**
   * HATEOAS representation of question categories.
   */
  async index (req: any, res: any, next: Function) {
    const baseUrl = '/api/categories'
    const categoryCollection: any = {
      _links: {
        self: baseUrl,
        href: '/api/categories/add-category',
        categories: []
      }
    }

    const collectionInfo: any[] = await mongoose.connection.db.listCollections().toArray()

    const categories = categoryCollection._links.categories
    collectionInfo.forEach(collection => {
      // Discard user db doc.
      if (collection.name === 'users') {
        return
      }

      categories.push({ href: baseUrl + '/' + collection.name })
    })

    res
      .status(200)
      .json(categoryCollection)
  }

  /**
   * Add a new category collection.
   */
  async addCategory (req: any, res: any, next: Function) {
    try {
      if (req.body.category) {
        await createModel(req.body.category)

        res
          .json('Category Created!')
          .status(201)
      } else {
        next(createError(400))
      }
    } catch (err) {
      next(err)
    }
  }

  /**
   * HATEOAS representation of a single question category + methods.
   */
  async category (req: any, res: any, next: Function) {
    try {
      const extractedCategory: string = req.params['1'].split('/')[0]
      const Category = await getModel(extractedCategory)

      // If category does not exist
      if (!Category) {
        throw new Error('404')
      }

      res
        .json({
          _links: [
            { href: '/api/categories/' + Category.modelName + '/random-question' },
            { href: '/api/categories/' + Category.modelName + '/add-question' },
            { href: '/api/categories/' + Category.modelName + '/edit-question' },
            { href: '/api/categories/' + Category.modelName + '/remove-question' }
          ]
        })
    } catch (err) {
      next(createError(404))
    }
  }
}
