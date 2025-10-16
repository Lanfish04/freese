const prisma = require("../config/prisma");


async function getHistoryTransaction(userId) {
    const buyer = await prisma.buyers.findUnique({
        where: { userId: userId }
    });
    if (!buyer) {
        throw new Error("Buyer tidak ditemukan");
    }
    return prisma.transactions.findMany({
        where: { buyerId: buyer.id },
        include: { product: true }
    });
}


async function createOneTransaction(userId, data) {
  const buyer = await prisma.buyers.findUnique({
  where: { userId: userId }});
  
  if (!buyer) {
    throw new Error("Buyer tidak ditemukan");
  }

  const products = await prisma.products.findFirst({
    where:{ id: Number(data.productId)}
  })

  if (!products) {
    throw new Error("Produk tidak ditemukan");
  }
  
  if (products.stock < data.quantity) {
    throw new Error("Stok produk tidak mencukupi");
  }

  const totalPrice = products.price * data.quantity;

  await prisma.products.update({
    where: { id: products.id },
    data: { stock: products.stock - data.quantity },
  });

  const transaction = await prisma.transactions.create({
    data: {
      buyerId: buyer.id,
      productId: products.id,
      totalPrice: totalPrice,
      quantity: Number(data.quantity),
      shipAddress: data.shipAddress || buyer.address,
      status: "PENDING",
      paymentMethod: data.paymentMethod || "TRANSFER_BANK"
    }, include: { product: true, buyer: true }
      
  });
  return transaction;
}



module.exports = {
  createOneTransaction,
  getHistoryTransaction
};

  
  
  