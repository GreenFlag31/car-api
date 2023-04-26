import express from 'express';
import { verifyRequest } from './verifyAPIKEY.js';
import { Car } from '../model/cars.js';

const carsRouter = express.Router();

// REPLACE ALL by POST for credentials
carsRouter.get('/', async (req, res) => {
  // console.log(res.locals.user);
  //  /cars?sort=year_of_production (optional). Ex: sort=asc
  if (req.query.order) {
    req.query.order = defineSortOrder(req.query.order);
  }
  console.log('order:', req.query.order);

  const allCars = await Car.find()
    .sort(req.query.order ? { year_of_production: req.query.order } : {})
    .select('-_id -__v');
  console.log(allCars.length);
  res.send(allCars);
});

carsRouter.get('/make/:make', async (req, res) => {
  // Accepts an optional query parameter
  // Ex: /make/toyota?model=supra

  console.log('make:', req.params.make);
  console.log('model:', req.query.model);
  const carsSpecificMake = await Car.find(
    {
      make: new RegExp(`^${req.params.make}$`, 'i'),
      ...(req.query.model ? { model: new RegExp(`^${req.query.model.trim()}$`, 'i') } : null),
    },
    { _id: 0, __v: 0 }
  );
  console.log(carsSpecificMake.length);
  res.send(carsSpecificMake);
});

carsRouter.get('/year_of_production', async (req, res) => {
  // Search between two provided years, optional sort key
  // Ex /year_of_production?year_min=1950&year_max=1960&sort=asc
  if (req.query.year_min < 1950 || isNaN(req.query.year_min)) {
    return res.status(400).send({
      error: 'Invalid year',
      message: 'Data is available from year 1950 to 2010',
    });
  }

  if (
    parseInt(req.query.year_max, 10) <= parseInt(req.query.year_min, 10) ||
    isNaN(req.query.year_max)
  ) {
    req.query.year_max = Math.floor(req.query.year_min / 10 + 1) * 10;
  }

  if (req.query.order) {
    req.query.order = defineSortOrder(req.query.order);
  }

  const carsSpecificYProduction = await Car.find(
    {
      year_of_production: {
        $gte: req.query.year_min,
        $lt: req.query.year_max,
      },
    },
    { _id: 0, __v: 0 }
  ).sort(req.query.order ? { year_of_production: req.query.order } : {});

  console.log(carsSpecificYProduction.length);
  res.send(carsSpecificYProduction);
});

function defineSortOrder(order) {
  if (
    !['asc', 'desc'].includes(order.toLowerCase().trim()) ||
    order.toLowerCase().trim() === 'asc'
  ) {
    return 1;
  } else if (order.toLowerCase().trim() === 'desc') {
    return -1;
  }
}

carsRouter.get('/engine/:power', async (req, res) => {
  // search by hundreds : 100, 200, 300, ...
  if (req.params.power < 0 || isNaN(req.params.power)) {
    return res.status(400).send({
      error: 'Invalid number',
      message: 'Engine power must be a number greater or equal than 0',
    });
  }

  if (req.query.order) {
    req.query.order = defineSortOrder(req.query.order);
  }

  console.log(req.query.order);
  console.log(req.params.power);
  console.log(Math.floor(req.params.power / 100 + 1) * 100);
  const carsSpecificPower = await Car.find(
    {
      'engine.maximum_power_hp': {
        $gte: req.params.power,
        $lt: Math.floor(req.params.power / 100 + 1) * 100,
      },
    },
    { _id: 0, __v: 0 }
  ).sort(req.query.order ? { 'engine.maximum_power_hp': req.query.order } : {});
  console.log(carsSpecificPower.length);
  res.send(carsSpecificPower);
});

carsRouter.get('/min_top_speed_kmh/:speed', async (req, res) => {
  if (req.params.speed < 0 || isNaN(req.params.speed)) {
    return res.status(400).send({
      error: 'Invalid number',
      message: 'Speed in km/h must be a number greater or equal than 0',
    });
  }

  console.log(req.params.speed);

  if (req.query.order) {
    req.query.order = defineSortOrder(req.query.order);
  }

  const carsMinTopSpeed = await Car.find(
    {
      top_speed_kmh: {
        $gte: req.params.speed,
      },
    },
    { _id: 0, __v: 0 }
  ).sort(req.query.order ? { top_speed_kmh: req.query.order } : {});
  console.log(carsMinTopSpeed.length);
  res.send(carsMinTopSpeed);
});

carsRouter.get('/weight', async (req, res) => {
  // search gte specific Kg
  if (req.query.min_weight < 0 || isNaN(req.query.min_weight)) {
    return res.status(400).send({
      error: 'Invalid number',
      message: 'Weight in kg must be a number greater or equal than 0',
    });
  }

  if (
    parseInt(req.query.max_weight, 10) <= parseInt(req.query.min_weight, 10) ||
    isNaN(req.query.max_weight)
  ) {
    req.query.max_weight = Math.floor(req.query.min_weight / 100 + 1) * 100;
  }

  console.log(req.query.max_weight);

  if (req.query.order) {
    req.query.order = defineSortOrder(req.query.order);
  }

  const carsSpecifWeight = await Car.find(
    {
      weight_kg: {
        $gte: req.query.min_weight,
        $lt: req.query.max_weight,
      },
    },
    { _id: 0, __v: 0 }
  ).sort(req.query.order ? { weight_kg: req.query.order } : {});
  console.log(carsSpecifWeight.length);
  res.send(carsSpecifWeight);
});

import { User } from '../model/user.js';
const LIMIT_QUERIES = 100;

carsRouter.get('/updateCounterTest/:clientID', async (req, res) => {
  const user = await User.findById(req.params.clientID);
  const dateInDataBase = user.queries.dateNow;
  let addingOneMonthTodateInDataBase = dateInDataBase.setMonth(dateInDataBase.getMonth() + 1);

  // const currentDateOfQuery = Date.now();
  const currentDateOfQuery = Date.parse('December 17, 2023 03:24:00');
  console.log('counter in DB:', user.queries.counter);

  // In the interval of time of one month
  if (currentDateOfQuery < addingOneMonthTodateInDataBase && user.queries.counter < LIMIT_QUERIES) {
    try {
      const incrementCounter = await User.updateOne(
        { _id: user._id },
        { $inc: { 'queries.counter': 1 } }
      );
      return res.status(200).send(incrementCounter);
    } catch (error) {
      return res.status(500).send(error);
    }
  } else if (user.queries.counter >= LIMIT_QUERIES) {
    res.status(400).send({ error: 'Quota exhausted', message: 'Your quota limit is reached' });
  } else {
    while (currentDateOfQuery >= addingOneMonthTodateInDataBase + 1) {
      addingOneMonthTodateInDataBase = dateInDataBase.setMonth(dateInDataBase.getMonth() + 1);
    }

    console.log(new Date(addingOneMonthTodateInDataBase));
    const timeStampToIsoString = new Date(addingOneMonthTodateInDataBase).toISOString();
    const incrementDateResetCounter = await User.updateOne(
      { _id: user._id },
      { $set: { 'queries.dateNow': timeStampToIsoString, 'queries.counter': 0 } }
    );
    return res.status(200).send(incrementDateResetCounter);
  }
});

carsRouter.use((req, res, next) => {
  res.status(404).json({ error: 'Invalid endpoint' });
});

export { carsRouter };
