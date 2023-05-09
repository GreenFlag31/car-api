import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
  api_key: {
    type: String,
  },
  testAccount: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  queries: {
    counter: { type: Number, default: 0 },
    dateNow: { type: Date, default: Date.now },
  },
});

const User = mongoose.model('users', userSchema);

export { User };
