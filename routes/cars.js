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

carsRouter.get('/year_of_production/:year', async (req, res) => {
  // Search by decade : 50, 60, 70, ...
  if (req.params.year < 1950 || isNaN(req.params.year)) {
    return res.status(400).send({
      error: 'Invalid year',
      message: 'Data available from year 1950 to 2010',
    });
  }

  const allCars = await Car.find(
    {
      year_of_production: {
        $gte: req.params.year,
        $lt: Math.floor(req.params.year / 10 + 1) * 10,
      },
    },
    { _id: 0, __v: 0 }
  );
  res.send(allCars.length.toString());
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
  const allCars = await Car.find(
    {
      'engine.maximum_power': {
        $gte: req.params.power,
        $lt: Math.floor(req.params.power / 100 + 1) * 100,
      },
    },
    { _id: 0, __v: 0 }
  );
  console.log(allCars.length);
  res.send(allCars);
});

carsRouter.use((req, res, next) => {
  res.status(404).json({ error: 'Invalid endpoint' });
});

export { carsRouter };
