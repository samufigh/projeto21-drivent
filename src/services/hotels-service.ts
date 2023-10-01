import { notFoundError, paymentError } from "@/errors";
import { enrollmentRepository, ticketsRepository } from "@/repositories"
import { hotelsRepository } from "@/repositories/hotels-repository";

async function findHotels(userId :number){
    const enrollment = await enrollmentRepository.findByUserId(userId);
    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    const hotelsInfo = await hotelsRepository.findAllHotels()

    if(!enrollment || !ticket || hotelsInfo.count === 0) throw notFoundError()

    if(ticket.status === "RESERVED" 
        || ticket.TicketType.isRemote 
        || !ticket.TicketType.includesHotel) 
        throw paymentError()

    console.log(hotelsInfo.count)
    console.log(hotelsInfo.hotels)
    return hotelsInfo.hotels
}

export const hotelsService = {
    findHotels
}