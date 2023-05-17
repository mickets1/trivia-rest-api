import express from 'express'
import { QuestionController } from '../../controllers/question-controller.js'
import { jwtValidation } from './JwtValidation-router.js'

export const router = express.Router()

const controller = new QuestionController()

router.get('/', controller.index)
router.get('(/*)?/random-question', controller.randomQuestionByCategory)

// Unsafe http methods require a valid JWT:
router.post('(/*)?/add-question', jwtValidation, (req, res, next) => controller.createNewQuestion(req, res, next))
router.put('(/*)?/edit-question', jwtValidation, (req, res, next) => controller.updateQuestion(req, res, next))
router.delete('(/*)?/remove-question', jwtValidation, (req, res, next) => controller.deleteQuestion(req, res, next))
