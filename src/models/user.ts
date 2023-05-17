import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

interface IUser {
  email: string,
  password: string
  userData: object
}

interface UserModel extends mongoose.Model<IUser> {
  authenticate(email: string, password: string): any
  insert(userData: object): any
  pre(): any
  virtual(): any
}

const accountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'User email required.'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: [10, 'The password must be of minimum length 10 characters.'],
    required: [true, 'User password required.']
  },
  webhook: {
    type: Object,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id
    },
    virtuals: true // ensure virtual fields are serialized
  }
})

accountSchema.virtual('id').get(function (this: any) {
  return this._id.toHexString()
})

// Salts and hashes password before save.
accountSchema.pre('save', async function (this: any) {
  this.password = await bcrypt.hash(this.password, 10)
})

accountSchema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({ email })

  // If no user found or password is wrong, throw an error.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid username or password.')
  }

  // User found and password correct, return the user.
  return user
}

accountSchema.statics.insert = async function (userData) {
  const user = new User(userData)
  return user.save()
}

export const User = mongoose.model<IUser, UserModel>('User', accountSchema)
