import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req;

    const bookingRoom = await bookingService.getBookings(userId)
    return res.status(httpStatus.OK).send(bookingRoom)
}

