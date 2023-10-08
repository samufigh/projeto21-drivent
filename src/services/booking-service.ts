import { notFoundError } from "@/errors";
import { bookingRepository } from "@/repositories/booking-repository"

async function getBookings(userId : number){
    const bookingRoom = await bookingRepository.getBookingByUserId(userId);
    if (!bookingRoom) throw notFoundError();
    return bookingRoom
}

export const bookingService = {
    getBookings
}