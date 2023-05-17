import mongoose from 'mongoose'

interface DynamicSchema {
  question: string
  answers: [string]
  correctAnswer: string
  category: string
  webhook: object
}

/**
 * Schema for a question.
 */
export const Questionschema = new mongoose.Schema<DynamicSchema>({
  question: {
    type: String,
    trim: true,
    minlength: 1,
    required: true,
    unique: true
  },
  answers: {
    type: [String],
    trim: true,
    minlength: 1,
    required: true
  },
  correctAnswer: {
    type: String,
    trim: true,
    minlength: 1,
    required: true
  },
  category: {
    type: String,
    trim: true,
    minlength: 1,
    required: true
  }
})

/**
 * Creates model based on category name.
 * @returns The mongoose model.
 */
export async function createModel (categoryName: string) {
  try {
    return mongoose.model<DynamicSchema>(categoryName, Questionschema)
  } catch (err) {
    console.error(err)
  }
}

/**
 * Return specific model if it already exists(avoid creating a new collection).
 * @param categoryName category name of collection.
 * @returns The mongoose model
 */
export async function getModel (categoryName: string) {
  try {
    const collection = await mongoose.connection.db.listCollections({ name: categoryName }).toArray()
    if (collection.length === 1) {
      return mongoose.model<DynamicSchema>(categoryName, Questionschema)
    }
  } catch (err) {
    console.error(err)
  }
}

/**
 * Random question model.
 * @returns The mongoose model
 */
export async function getRandomModel () {
  try {
    const collectionInfo: any[] = await mongoose.connection.db.listCollections().toArray()

    // Discard users doc.
    let rndCollection = null
    do {
      rndCollection = collectionInfo[Math.floor(Math.random() * collectionInfo.length)]
    } while (rndCollection.name === 'users' || rndCollection.name === 'randoms')

    return mongoose.model(rndCollection.name, Questionschema)
  } catch (err) {
    console.error(err)
  }
}

mongoose.model<DynamicSchema>('random', Questionschema)
