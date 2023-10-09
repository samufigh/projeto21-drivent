import { prisma } from "@/config";

async function getBookingByUserId(userId: number) {
    const booking = await prisma.booking.findFirst({
      where: { userId },
    });
    if (!booking) return null;
    const room = await prisma.room.findUnique({
      where: { id: booking.roomId },
    });
    return { id: booking.id, Room: room };
  }

  async function roomExists(roomId: number) {
    return prisma.room.findFirst({
      where: {
        id: roomId,
      },
      include: {
        Booking: true,
      },
    });
  }

  async function create(userId: number, roomId: number) {
    return prisma.booking.create({
      data: {
        userId,
        roomId,
      },
    });
  }

export const bookingRepository = {
    getBookingByUserId,
    roomExists,
    create
}

export type BookingBody = { roomId: number };
export type BookingParam = { bookingId: number };