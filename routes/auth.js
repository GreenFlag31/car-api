import express from 'express';
import { User } from '../model/user.js';
import { registerValidation, loginValidation } from '../validation.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
// import Jwt from 'jsonwebtoken';

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('email already exists');

  // hash password and APIKEY
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const APIKEY = crypto.randomUUID();
  const hashedAPIKEY = await bcrypt.hash(APIKEY, 10);
  console.log(APIKEY);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    APIKEY: hashedAPIKEY,
  });
  try {
    const savedUser = await user.save();
    res.status(201).send({ user: savedUser });
  } catch (err) {
    res.status(500).send(err);
  }
});

authRouter.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('email not found');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid password');

  // const token = Jwt.sign({ _id: user._id }, process.env.TOKEN);
  // res.header('auth-token', token).send(token);
});

export { authRouter };
