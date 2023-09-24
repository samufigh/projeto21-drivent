import { prisma } from "@/config"
import { TicketResponse } from "@/protocols";
import { TicketType } from "@prisma/client";

async function findMany():Promise<TicketType[]>{
    const types = await prisma.ticketType.findMany();
    return types as TicketType[];
}

async function findFirst(userId: number): Promise<TicketResponse | null> {
    const ticket = await prisma.ticket.findFirst({
      where: {
        Enrollment: { userId }
      },
      include: {
        TicketType: true,
      }
    });
    return ticket as TicketResponse;
  }

export const ticketRepository = {
    findMany,
    findFirst
}