import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { carsRouter } from './routes/cars.js';
dotenv.config();

const corsOptions = {
  origin: '*',
  methods: 'GET, POST',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
mongoose.connect(process.env.DATABASE_URI);
const db = mongoose.connection;
db.once('open', () => console.log('connected to DB'));
app.use('/api/user', authRouter);
app.use('/cars', carsRouter);

app.listen(3000, () => {
  console.log('server started');
});
