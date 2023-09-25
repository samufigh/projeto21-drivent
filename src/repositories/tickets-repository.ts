import { Enrollment, Ticket, TicketType } from '@prisma/client';
import { prisma } from '@/config';

async function findMany(): Promise<TicketType[]> {
  const types = await prisma.ticketType.findMany();
  return types as TicketType[];
}

async function findEnrollment(userId: number): Promise<Enrollment> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId },
  });
  return enrollment as Enrollment;
}

async function findTicketType(id: number): Promise<TicketType> {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id },
  });
  return ticketType as TicketType;
}

async function findFirst(userId: number): Promise<TicketResponse | null> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      Enrollment: { userId },
    },
    include: {
      TicketType: true,
    },
  });
  return ticket as TicketResponse;
}
async function create(data: CreateTicket, userId: number): Promise<TicketResponse> {
  const createdTicket = await prisma.ticket.create({ data });
  const ticketType = await findTicketType(data.ticketTypeId);

  const response = {
    ...createdTicket,
    TicketType: ticketType,
  };
  return response as TicketResponse;
}

export const ticketRepository = {
  findMany,
  findFirst,
  create,
  findEnrollment,
  findTicketType,
};

export type TicketResponse = Ticket & {
  TicketType: TicketType;
};

export type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;
