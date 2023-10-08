import { getBooking } from '@/controllers/booking-controller';
import { authenticateToken, validateBody } from '@/middlewares';
import { Router } from 'express';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  //.post('/', getTicket)
  //.put('/', validateBody(ticketSchema), createTicket);

export { bookingRouter };