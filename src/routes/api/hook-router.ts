import express from 'express'
import { HookController } from '../../controllers/hook-controller.js'
import { jwtValidation } from './JwtValidation-router.js'

export const router = express.Router()

const hookController = new HookController()

router.get('/events', hookController.subscribableEvents)

// Unsafe http methods require a valid JWT:
router.post('/register', jwtValidation, (req, res, next) => hookController.registerHook(req, res, next))
router.post('/subscribe', jwtValidation, (req, res, next) => hookController.authorizeHookSecret(req, res, next), (req, res, next) => hookController.newQuestionEvent(req, res, next))
