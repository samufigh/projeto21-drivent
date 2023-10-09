import { getBooking, postBooking } from '@/controllers/booking-controller';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingBodySchema } from '@/schemas/booking-schemas';
import { Router } from 'express';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingBodySchema), postBooking)
  //.put('/:bookingId', validateBody(bookingBodySchema), validateParams(bookingParamsSchema), putTradeBooking);

export { bookingRouter };