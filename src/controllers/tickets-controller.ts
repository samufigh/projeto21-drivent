import { AuthenticatedRequest } from '@/middlewares';
import { ticketService } from '@/services/tickets-service';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
const ticketTypes = await ticketService.getTicketTypes()

return res.status(httpStatus.OK).send(ticketTypes);
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
const { userId } = req;

const ticketTypes = await ticketService.getTickets(userId)

return res.status(httpStatus.OK).send(ticketTypes);
}

