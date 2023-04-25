import express from 'express';
import { verifyRequest } from './verifyAPIKEY.js';
import { Car } from '../model/cars.js';

const carsRouter = express.Router();

// REPLACE ALL by POST for credentials
carsRouter.get('/', async (req, res) => {
  // res.status(200).send(res.locals.user);
  const allCars = await Car.find();
  console.log(allCars.length);
  res.send(allCars.length.toString());
});

carsRouter.get('/make/:make', async (req, res) => {
  // Accepts a make name aswell as a optional query parameter
  // Ex: /make/toyota?model=supra

  console.log('make:', req.params.make);
  console.log('model:', req.query.model);
  const allCars = await Car.find(
    {
      make: new RegExp(`^${req.params.make}$`, 'i'),
      ...(req.query.model ? { model: new RegExp(`^${req.query.model}$`, 'i') } : null),
    },
    { _id: 0, __v: 0 }
  );
  res.send(allCars.length.toString());
});

carsRouter.get('/year_of_production', async (req, res) => {
  // Search between two provided years
  // Ex /year_of_production?year_min=1950&year_max=1960&sort=asc
  if (req.query.year_min < 1950 || isNaN(req.query.year_min)) {
    return res.status(400).send({
      error: 'Invalid year',
      message: 'Data is available from year 1950 to 2010',
    });
  }

  if (req.query.year_max <= req.query.year_min || isNaN(req.query.year_max)) {
    req.query.year_max = Math.floor(req.params.year / 10 + 1) * 10;
  }

  if (
    (req.query.order && !['asc', 'desc'].includes(req.query.order.toLowerCase())) ||
    req.query.order?.toLowerCase() === 'asc'
  ) {
    req.query.order = 1;
  } else if (req.query.order?.toLowerCase() === 'desc') {
    req.query.order = -1;
  }
  console.log(req.query.order);

  const carsSpecificYProduction = await Car.find(
    {
      year_of_production: {
        $gte: req.query.year_min,
        $lt: req.query.year_max,
      },
    },
    { _id: 0, __v: 0 }
  ).sort(req.query.order ? { year_of_production: req.query.order } : {});
  res.send(carsSpecificYProduction);
});

carsRouter.get('/engine/:power', async (req, res) => {
  // search by hundreds : 100, 200, 300, ...
  if (req.params.power < 0 || isNaN(req.params.power)) {
    return res.status(400).send({
      error: 'Invalid number',
      message: 'Engine power must be a number greater or equal than 0',
    });
  }

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
  );
  console.log(carsSpecificPower.length);
  res.send(carsSpecificPower);
});

carsRouter.get('/weight/:kg', async (req, res) => {
  // search gte specific Kg
  if (req.params.kg < 0 || isNaN(req.params.kg)) {
    return res.status(400).send({
      error: 'Invalid number',
      message: 'Weight in kg must be a number greater or equal than 0',
    });
  }

  console.log(req.params.kg);
  const carsSpecifWeight = await Car.find(
    {
      weight_kg: {
        $gte: req.params.kg,
      },
    },
    { _id: 0, __v: 0 }
  );
  console.log(carsSpecifWeight.length);
  res.send(carsSpecifWeight);
});

carsRouter.use((req, res, next) => {
  res.status(404).json({ error: 'Invalid endpoint' });
});

export { carsRouter };
