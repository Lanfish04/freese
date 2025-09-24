const prisma = require("../config/prisma");

async function createTransaction(data) {
    const newTransaction = await prisma.transactions.create({
        data: {
            buyerId: data.buyerId,
            farmerId: data.farmerId,
            productId: data.productId,  
            quantity: Number(data.quantity),
            totalPrice: Number(data.totalPrice),
            status: data.status || "PENDING",
        },
    });
    return newTransaction;
}

module.exports = { 
    createTransaction,

};