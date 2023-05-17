import express from 'express'
import { router } from './routes/router.js'
// @ts-ignore - mongoose includes own TS-types by default.
import { connectDB } from './config/mongoose.js'
import config from './config.js'
// @ts-ignore
import cors from 'cors'

mainSetup()
async function mainSetup () {
  try {
    await connectDB()

    const app = express()

    app.use(express.json())
    app.use(cors())
    app.use(express.urlencoded({ extended: false }))

    app.use('/', router)

    // Error handler.
    app.use(function (err: any, req: any, res: any, next: any) {
      err.status = err.status || 500
      res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
    })

    app.listen(config.PORT, () => {
      console.log(`Server running at http://localhost:${config.PORT}`)
      console.log('Press Ctrl-C to terminate...')
    })
  } catch (error) {
    console.error(error)
  }
}
