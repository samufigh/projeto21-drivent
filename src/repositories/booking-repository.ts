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

export const bookingRepository = {
    getBookingByUserId
}