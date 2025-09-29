const prisma = require("../config/prisma");

async function createTransaction(buyerId, data) {
  const product = await prisma.products.findUnique({
    where: { id: Number(data.productId) }
  });

  if (!product) throw new Error("Produk tidak ditemukan");
  if (product.stock < data.quantity) throw new Error("Stok tidak mencukupi");

  const totalPrice = product.price * data.quantity;
  const buyer = await prisma.buyers.findUnique({
    where: { userId: buyerId }
  });
  const shippingAddress = data.shipAddress || buyer.address;
  if (!shippingAddress) throw new Error("Alamat pengiriman tidak ditemukan");

  const transaction = await prisma.transactions.create({
    data: {
      buyer:{
        connect: { id: buyerId }
      },
      product:{
        connect: { id: Number(data.productId) }
      },
      quantity: data.quantity,
      totalPrice,
      shipAddress: shippingAddress, 
      paymentMethod: data.paymentMethod || "QRIS",
      paymentStatus: "UNPAID",
      orderStatus: "PENDING"
    },
    include: {
      Product: true
    }
  });

  return transaction;
}

async function getTransactionHistory(userId) {
  const transactions = await prisma.transactions.findMany({
    where: { buyerId: userId },
    include: {
      Products: true
    },  
    orderBy: {
      createdAt: 'desc'
    }
  });
  return transactions;
}



module.exports = { 
    createTransaction,
    getTransactionHistory

};