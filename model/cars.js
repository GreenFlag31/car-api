import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  origin: { type: String, required: true },
  year_of_production: { type: Number, required: true },
  version: { type: String, required: true },
  body_style: {
    type: { type: String, required: true },
    number_of_doors: { type: Number, required: true },
  },
  engine: {
    type: { type: String, required: true },
    number_of_cylinders: { type: Number, required: true },
    maximum_power: { type: Number, required: true },
    displacement: { type: String, required: true },
  },
  transmission: {
    type: { type: String, required: true },
    number_of_speeds: { type: Number, required: true },
  },
  dimensions: {
    length: { type: String, required: true },
    width: { type: String, required: true },
    height: { type: String, required: true },
    wheelbase: { type: String, required: true },
  },
  weight: { type: String, required: true },
  top_speed: { type: String, required: true },
  acceleration: {
    '0-100 km/h': { type: String, required: true },
    '0-400 m': { type: String, required: true },
  },
  fuel_consumption: {
    city: { type: String, required: true },
    highway: { type: String, required: true },
  },
  price: { type: String, required: true },
  description: { type: String, required: true },
});

const Car = mongoose.model('Car', carSchema);

export { Car };
