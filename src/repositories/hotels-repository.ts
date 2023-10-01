import { prisma } from "@/config"
import { Hotel } from "@prisma/client";

async function findAllHotels() :Promise<{hotels: Hotel[], count: number}>{
    const result = await prisma.hotel.findMany();
    const count = await prisma.hotel.count();
    return {hotels: result, count}
}

export const hotelsRepository = {
    findAllHotels
}