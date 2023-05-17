import express from 'express'
import { CategoryController } from '../../controllers/category-controller.js'
import { jwtValidation } from './JwtValidation-router.js'

export const router = express.Router()

const controller = new CategoryController()

router.get('/', controller.index)
router.post('/add-category', jwtValidation, (req, res, next) => controller.addCategory(req, res, next))
router.get('(/*)?/', controller.category)
