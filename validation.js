import Joi from 'joi';

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

const credentialValidation = (data) => {
  const schema = Joi.object({
    clientID: Joi.string().required(),
    APIKEY: Joi.string().required(),
  });

  return schema.validate(data);
};

export { registerValidation, loginValidation, credentialValidation };