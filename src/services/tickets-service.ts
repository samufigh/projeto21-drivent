import { notFoundError } from "@/errors"
import { TicketResponse } from "@/protocols"
import { ticketRepository } from "@/repositories/tickets-repository"
import { TicketType } from "@prisma/client"

async function getTicketTypes() :Promise<TicketType[]>{
    const tickets = await ticketRepository.findMany()
    return tickets
}

async function getTickets(id :number) :Promise<TicketResponse>{
    const ticket = await ticketRepository.findFirst(id)

    if (!ticket) throw notFoundError()

    return ticket
}

export const ticketService = {
    getTicketTypes,
    getTickets
}
