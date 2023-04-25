import { User } from '../model/user.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

async function verifyRequest(req, res, next) {
  // clientID might be of incorrect format or wrong, Mongoose crashes if incorrect format, hence following check:
  if (!mongoose.isValidObjectId(req.body.clientID)) {
    return res.status(400).send('Invalid clientID');
  }
  const user = await User.findById(req.body.clientID);
  if (!user) return res.status(400).send('ClientID not found');

  const validKEY = await bcrypt.compare(req.body.APIKEY, user.APIKEY);
  if (!validKEY) return res.status(400).send('Invalid key');

  res.locals.user = user;
  next();
}

export { verifyRequest };
