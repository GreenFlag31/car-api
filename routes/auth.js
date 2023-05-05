import express from 'express';
import { User } from '../model/user.js';
import { registerValidation, loginValidation } from '../validation.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { verifyJWT } from './verify.js';

const authRouter = express.Router();
const LIMIT_QUERIES = 100;

authRouter.post('/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('Email already exists');

  // hash password, create new random api_key and hash it
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const api_key = crypto.randomUUID();
  const hashedAPIKEY = await bcrypt.hash(api_key, 10);
  console.log(api_key);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    api_key: hashedAPIKEY,
  });

  try {
    const savedUser = await user.save();
    // const updatedUser = { ...savedUser.toObject(), api_key };
    // res.status(201).send({ user: updatedUser });
  } catch (err) {
    res.status(500).send(err);
  }

  addJWTinLocalStorage(res, user);
});

authRouter.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Email not found');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid password');

  addJWTinLocalStorage(res, user);
});

// checks the queries quota
authRouter.post('/quota', verifyJWT, (req, res) => {
  const user = res.locals.user;

  return res.status(200).send({
    ...(user.queries.counter >= LIMIT_QUERIES ? { error: 'Quota exhausted' } : null),
    quota: user.queries.counter,
  });
});

//  get new api key
authRouter.post('/api-key/new', verifyJWT, async (req, res) => {
  const user = res.locals.user;

  const api_key = crypto.randomUUID();
  const hashedAPIKEY = await bcrypt.hash(api_key, 10);

  await User.updateOne({ _id: user.id }, { $set: { api_key: hashedAPIKEY } });

  return res.status(201).send({
    new_api_key: api_key,
  });
});

function addJWTinLocalStorage(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.TOKEN, { expiresIn: '1h' });
  res.send({ jwt: token, expiresAt: new Date(Date.now() + 1000 * 60 * 60).toLocaleString() });
}

export { authRouter };
