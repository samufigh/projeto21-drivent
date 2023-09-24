import { prisma } from "@/config"

async function findMany(){
    const types = await prisma.ticketType.findMany()
    return types
}

export const ticketRepository = {
    findMany
}