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

async function createManyTransactions(userId, data) {
  const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }
  });
  if (!buyer) {
    throw new Error("Buyer tidak ditemukan");
  }



 const selectedItems = await prisma.cart.findMany({
    where: {
       buyerId: buyer.id, 
       isSelected: true },
    include: { product: true }
  });

  if (selectedItems.length === 0) {
    throw new Error("Tidak ada item yang dipilih");
  }

  // 3️⃣ Proses setiap item cart yang dipilih
  const transactionsData = [];

  for (const item of selectedItems) {
    const product = item.product;

    if (!product) {
      throw new Error(`${product.name} tidak ditemukan`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Stok produk ${product.name} tidak mencukupi`);
    }

    const totalPrice = product.price * item.quantity;

    // Kurangi stok produk
    await prisma.products.update({
      where: { id: product.id },
      data: { stock: product.stock - item.quantity },
    });

    // Simpan data transaksi
    transactionsData.push({
      buyerId: buyer.id,
      productId: product.id,
      quantity: item.quantity,
      totalPrice,
      status: "PENDING",
      shipAddress: data.shipAddress || buyer.address,
      paymentMethod: data.paymentMethod || "TRANSFER_BANK",
      createdAt: new Date(),
    });
  }

  // 4️⃣ Simpan semua transaksi sekaligus
  await prisma.transactions.createMany({
    data: transactionsData,
  });

  // 5️⃣ (Opsional) Hapus item dari cart setelah transaksi
  await prisma.cart.deleteMany({
    where: { buyerId: buyer.id, isSelected: true },
  });

  return transactionsData;
}
  // const createdTransactions = [];

  // for (const item of items) {
  //   if (item.product.stock < item.quantity) {
  //     throw new Error(`Stok produk ${item.product.name} tidak mencukupi`);
  //   }

  //   const totalPrice = item.product.price * item.quantity;
  //   await prisma.products.update({
  //     where: { id: item.product.id },
  //     data: { stock: item.product.stock - item.quantity },
  //   });

  //   const transaction = await prisma.transactions.create({
  //     data: {
  //       buyerId: buyer.id,
  //       productId: item.product.id,
  //       totalPrice: totalPrice,
  //       quantity: item.quantity,
  //       shipAddress: transactionsData.shipAddress || buyer.address,
  //       status: "PENDING",
  //       paymentMethod: transactionsData.paymentMethod || "TRANSFER_BANK"
  //     },
  //     include: { product: true, buyer: true }
  //   });
  //   createdTransactions.push(transaction);
  // } 
  // await prisma.cart.deleteMany({
  //   where: { buyerId: buyer.id }
  // });
  // return createdTransactions;

module.exports = {
  createOneTransaction,
  getHistoryTransaction,
  createManyTransactions
};

  
  
  