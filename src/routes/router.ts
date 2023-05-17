import express from 'express'
import createError from 'http-errors'
import { router as hookRouter } from './api/hook-router.js'
import { router as questionRouter } from './api/question-router.js'
import { router as categoryRouter } from './api/category-router.js'
import { router as accountController } from './api/account-router.js'

export const router = express.Router()

router.use('/api/webhook', hookRouter)
router.use('/api/', questionRouter)
router.use('/api/categories/', categoryRouter)
router.use('/api/', accountController)

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => next(createError(404)))
