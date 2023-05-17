import express from 'express'
import { AccountController } from '../../controllers/account-controller.js'

export const router = express.Router()

const controller = new AccountController()

router.post('/login', (req, res, next) => controller.login(req, res, next))
router.post('/register', (req, res, next) => controller.register(req, res, next))
