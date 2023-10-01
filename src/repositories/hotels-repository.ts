import { prisma } from "@/config"
import { Hotel } from "@prisma/client";

async function findAllHotels() :Promise<{hotels: Hotel[], count: number}>{
    const result = await prisma.hotel.findMany();
    const count = await prisma.hotel.count();
    return {hotels: result, count}
}

async function findHotelById(id: number) {
    const result = await prisma.hotel.findUnique({
      where: { id },
      include: { Rooms: true },
    });
    return result;
  }

export const hotelsRepository = {
    findAllHotels,
    findHotelById
}