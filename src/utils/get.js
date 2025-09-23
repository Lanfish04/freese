const prisma = require("../prismaClient");

async function getFarmerById(userId) {
    return prisma.farmers.findUnique({
        where: { userId: Number(userId) }
    });
}

async function getFarmersAll() {
    return prisma.farmers.findMany();
    
}