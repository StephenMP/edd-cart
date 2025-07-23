import Joi from 'joi';

export const validationSchema = Joi.object({
  KAFKA_BROKERS: Joi.string().required(),
});
