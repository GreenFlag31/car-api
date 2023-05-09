import express from 'express';
import { User } from '../model/user.js';
import { registerValidation, loginValidation } from '../validation.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { verifyJWT, LIMIT_QUERIES } from './verify.js';

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('Email already exists');

  // hash password, create new random api_key and hash it
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const api_key = crypto.randomUUID();
  const hashedAPIKEY = await bcrypt.hash(api_key, 10);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    api_key: hashedAPIKEY,
  });

  try {
    await user.save();
  } catch (err) {
    res.status(500).send(err);
  }

  addJWTinLocalStorage(res, user, api_key);
});

authRouter.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send('Email not found');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(401).send('Invalid password');

  addJWTinLocalStorage(res, user);
});

// checks the queries quota
authRouter.post('/quota', verifyJWT, (req, res) => {
  const user = res.locals.user;

  return res.status(200).send({
    ...(user.queries.counter >= LIMIT_QUERIES ? { error: 'Quota exhausted' } : {}),
    quota: user.queries.counter,
  });
});

//  get new api key
authRouter.post('/api-key/new', verifyJWT, async (req, res) => {
  const user = res.locals.user;

  // Not possible to generate new key for test account
  if (user.testAccount) return res.status(400);

  const api_key = crypto.randomUUID();
  const hashedAPIKEY = await bcrypt.hash(api_key, 10);

  await User.updateOne({ _id: user.id }, { $set: { api_key: hashedAPIKEY } });

  return res.status(201).send({
    new_api_key: api_key,
  });
});

function addJWTinLocalStorage(res, user, apiKeyAtRegister = '') {
  const token = jwt.sign({ id: user._id }, process.env.TOKEN, { expiresIn: '1h' });
  res.send({
    jwt: token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toLocaleString(),
    ...(apiKeyAtRegister ? { id: user._id, api_key: apiKeyAtRegister } : {}),
  });
}

export { authRouter };
