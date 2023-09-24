import { ticketRepository } from "@/repositories/tickets-repository"
import { TicketType } from "@prisma/client"

async function getTicketTypes() :Promise<TicketType[]>{
    const tickets = await ticketRepository.findMany()
    return tickets
}

export const ticketService = {
    getTicketTypes
}
