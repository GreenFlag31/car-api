import { User } from '../model/user.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const LIMIT_QUERIES = 100;

async function verifyRequest(req, res, next) {
  // clientID might be of incorrect format or wrong, Mongoose crashes if incorrect format, hence following check:
  if (!mongoose.isValidObjectId(req.body.clientID)) {
    return res.status(400).send('Invalid clientID');
  }
  const user = await User.findById(req.body.clientID);
  if (!user) return res.status(400).send('ClientID not found');

  const validKEY = await bcrypt.compare(req.body.APIKEY, user.api_key);
  if (!validKEY) return res.status(400).send('Invalid key');

  // Timestamp date
  // const dateInDataBase = Date.parse('2023-04-26T17:13:34.922Z');
  const dateInDataBase = Date.parse(user.queries.dateNow);
  const addingOneMonthTodateInDataBase = dateInDataBase.setMonth(dateInDataBase.getMonth() + 1);

  const currentDateOfQuery = Date.now();
  console.log(user.queries.counter);

  // In the interval of time of one month
  if (addingOneMonthTodateInDataBase < currentDateOfQuery && user.queries.counter < LIMIT_QUERIES) {
    try {
      const incrementCounter = await user.updateOne({ $inc: { counter: 1 } });
      res.status(201).send(incrementCounter);
    } catch (error) {
      res.status(500).send(error);
    }
  } else if (dateInDataBase >= addingOneMonthToDateOfQuery) {
  }

  next();
}

export { verifyRequest };
