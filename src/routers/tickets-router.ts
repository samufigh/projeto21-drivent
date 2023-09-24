import { Router } from 'express';
import { singInPost } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';
import { signInSchema } from '@/schemas';
import { getTicketTypes, getTickets } from '@/controllers/tickets-controller';

const ticketsRouter = Router();

ticketsRouter
    .all('/*', authenticateToken)
    .get('/types', getTicketTypes)
    .get('/', getTickets)
    .post('/', validateBody(signInSchema), singInPost);

export { ticketsRouter };