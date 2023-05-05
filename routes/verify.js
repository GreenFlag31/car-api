import { User } from '../model/user.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const LIMIT_QUERIES = 100;

async function verifyAPIKEY(req, res, next) {
  // clientID might be of incorrect format or wrong, Mongoose crashes if incorrect format, hence following check:
  if (!mongoose.isValidObjectId(req.body.clientID)) {
    return res.status(400).send('Invalid clientID');
  }
  const user = await User.findById(req.body.clientID);
  if (!user) return res.status(400).send('ClientID not found');

  const validKEY = await bcrypt.compare(req.body.api_key, user.api_key);
  if (!validKEY) return res.status(400).send('Invalid key');

  res.locals.user = user;
  next();
}

async function verifyLimit(req, res, next) {
  const user = res.locals.user;

  if (user.queries.counter >= LIMIT_QUERIES) {
    return res.status(400).send({
      error: 'Quota exhausted',
      message: 'Your quota limit is reached',
      quota: LIMIT_QUERIES,
    });
  }

  next();
}

async function verifyJWT(req, res, next) {
  const token = req.body.jwt;
  if (!token) return res.status(401).send({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.TOKEN);
    req.user = verified;
  } catch (error) {
    return res.status(401).send({ error: 'Access denied, invalid or expired token' });
  }

  const user = await User.findById(req.user.id);
  res.locals.user = user;

  next();
}

export { verifyAPIKEY, verifyLimit, verifyJWT };
