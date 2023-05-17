import mongoose from 'mongoose'
import config from '../config.js'

/**
 * Establishes a connection to a database.
 *
 * @returns {Promise} Resolves to this if connection succeeded.
 */
export const connectDB = async () => {
  const mongoCFG = {
    useNewUrlParser: true,
    // Disable SSL when running on localhost.
    // ssl: true,
    // authSource: 'admin',
    retryWrites: true,
    useUnifiedTopology: true
  }

  // Bind connection to events (to get notifications).
  mongoose.connection.on('connected', () => console.log('Mongoose connection is open.'))
  mongoose.connection.on('error', err => console.error(`Mongoose connection error has occurred: ${err}`))
  mongoose.connection.on('disconnected', () => console.log('Mongoose connection is disconnected.'))

  // If the Node process ends, close the Mongoose connection.
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose connection is disconnected due to application termination.')
      process.exit(0)
    })
  })

  // Connect to the server.
  console.log('Establishing a Mongoose connection')
  return mongoose.connect(config.DB_CONNECTION_STRING, mongoCFG)
}
