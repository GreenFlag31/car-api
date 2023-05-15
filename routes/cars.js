import express from 'express';
import { verifyAPIKEY, verifyLimit } from './verify.js';
import { updateCounterAndDateStatus } from './updateData.js';
import { Car } from '../model/cars.js';
import apicache from 'apicache';

const cache = apicache.middleware;
const carsRouter = express.Router();
carsRouter.use(verifyAPIKEY, verifyLimit);
coffeeRouter.use(cache('24 hours'));

carsRouter.post('/', async (req, res) => {
  //  /cars?sort=origin (optional). Ex: sort=USA
  //  /cars?order=year_of_production (optional). Ex: order=asc
  const user = res.locals.user;
  await updateCounterAndDateStatus(user);

  if (req.query.order) {
    req.query.order = defineSortOrder(req.query.order);
  }

  const allCars = await Car.find({
    ...(req.query.sort ? { origin: new RegExp(`^${req.query.sort.trim()}$`, 'i') } : {}),
  })
    .sort(req.query.order ? { year_of_production: req.query.order } : {})
    .select('-_id -__v');
  console.log(allCars.length);
  res.send(allCars);
});

carsRouter.post('/make/:make', async (req, res) => {
  // Accepts an optional query parameter
  // Ex: /make/toyota?model=supra
  const user = res.locals.user;
  await updateCounterAndDateStatus(user);

  const carsSpecificMake = await Car.find(
    {
      make: new RegExp(`^${req.params.make}$`, 'i'),
      ...(req.query.model ? { model: new RegExp(`^${req.query.model.trim()}$`, 'i') } : {}),
    },
    { _id: 0, __v: 0 }
  );
  console.log(carsSpecificMake.length);
  res.send(carsSpecificMake);
});

carsRouter.post('/year_of_production', async (req, res) => {
  const user = res.locals.user;
  // Search between two provided years, optional order key
  // Ex /year_of_production?year_min=1950&year_max=1960&order=asc
  if (req.query.year_min < 1950 || isNaN(req.query.year_min)) {
    return res.status(400).send({
      error: 'Invalid year',
      message: 'Data is available from years 1950 to 2010',
    });
  }

  await updateCounterAndDateStatus(user);
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

carsRouter.post('/engine/:power', async (req, res) => {
  const user = res.locals.user;
  // search by hundreds : 100, 200, 300, ...
  if (req.params.power < 0 || isNaN(req.params.power)) {
    return res.status(400).send({
      error: 'Invalid number',
      message: 'Engine power must be a number greater or equal than 0',
    });
  }

  await updateCounterAndDateStatus(user);
  if (req.query.order) {
    req.query.order = defineSortOrder(req.query.order);
  }

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

carsRouter.post('/min_top_speed_kmh/:speed', async (req, res) => {
  const user = res.locals.user;
  if (req.params.speed < 0 || isNaN(req.params.speed)) {
    return res.status(400).send({
      error: 'Invalid number',
      message: 'Speed in km/h must be a number greater or equal than 0',
    });
  }

  await updateCounterAndDateStatus(user);
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

carsRouter.post('/weight', async (req, res) => {
  const user = res.locals.user;

  // search gte specific Kg
  if (req.query.min_weight < 0 || isNaN(req.query.min_weight)) {
    return res.status(400).send({
      error: 'Invalid number',
      message: 'Weight in kg must be a number greater or equal than 0',
    });
  }

  await updateCounterAndDateStatus(user);
  if (
    parseInt(req.query.max_weight, 10) <= parseInt(req.query.min_weight, 10) ||
    isNaN(req.query.max_weight)
  ) {
    req.query.max_weight = Math.floor(req.query.min_weight / 100 + 1) * 100;
  }

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

carsRouter.use((req, res, next) => {
  res.status(404).json({ error: 'Invalid endpoint' });
});

export { carsRouter };
