import { BookingBody, BookingParam } from '@/repositories';
import Joi from 'joi';

export const bookingBodySchema = Joi.object<BookingBody>({
  roomId: Joi.number().required(),
});

export const bookingParamsSchema = Joi.object<BookingParam>({
  bookingId: Joi.number().required(),
});