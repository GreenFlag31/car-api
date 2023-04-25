import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 6,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      min: 6,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 1000,
    },
    APIKEY: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('users', userSchema);

export { User };