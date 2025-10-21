const prisma = require("../config/prisma");
const fetch = require("node-fetch");
const axios = require("axios");
const dotenv = require('dotenv');


async function getHistoryTransaction(userId, status) {
    const buyer = await prisma.buyers.findUnique({
        where: { userId: userId }
    });
    if (!buyer) {
        throw new Error("Buyer tidak ditemukan");
    }
    return prisma.transactions.findMany({
        where: { buyerId: buyer.id, 
          paymentStatus: status },
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

    await prisma.products.update({
      where: { id: product.id },
      data: { stock: product.stock - item.quantity },
    });

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

  await prisma.transactions.createMany({
    data: transactionsData,
  });
  await prisma.cart.deleteMany({
    where: { buyerId: buyer.id, isSelected: true },
  });
  return transactionsData;
}

async function uploadPaymentProof(order_id, status_code, transaction_status) {
const order = await prisma.transactions.findUnique({
  where: { id: Number(order_id) }
});
if (!order) {
  throw new Error("Transaksi tidak ditemukan");
}
const status = transaction_status === "capture" ? "PAID" : "FAILED";

return prisma.transactions.update({
  where: { id: Number(order_id) },
  data: {
    paymentStatus: status,
    updatedAt: new Date()
  }
});
  //   const buyer = await prisma.buyers.findUnique({
//     where: { userId: userId }
//   });

// if(!buyer) {
//   throw new Error("Buyer tidak ditemukan");
// }

// const transaction = await prisma.transactions.findUnique({
//   where: { id: Number(transactionId) }
// });

// if (!transaction) {
//   throw new Error("Transaksi tidak ditemukan");
// }

// if (!transaction.buyerId === buyer.id) {
//   throw new Error("Anda tidak berhak mengunggah bukti pembayaran untuk transaksi ini");
// }


// return prisma.transactions.update({
//   where: { id: Number(transactionId) },
//   data: {
//     paymentProof: paymentProofUrl,
//     status: "PAID",
//     paymentStatus: "PAID",
//   }
// });
} 

async function editPaymentStatus(userId, data) {
  const farmer = await prisma.farmers.findUnique({
      where: { userId: userId }
    });

    if (!farmer){
      throw new Error("Farmer tidak ditemukan");
    }
    
    const farmerProducts = await prisma.products.findMany({
      where: { farmerId: farmer.id }
    }); 

    const transaction = await prisma.transactions.findUnique({
      where: { id: Number(data.transactionId),
      productId: farmerProducts.id
       },
      include: { product: true }
    });

    if (!transaction) {
    throw new Error("Transaksi tidak ditemukan");
  }

  if (transaction.product.farmerId !== farmer.id) {
    throw new Error("Anda tidak berhak mengubah status transaksi ini");
  } 

 const allowedStatus = ["PENDING", "PROCESSING", "COMPLETED", "CANCELED"];
  if (!allowedStatus.includes(data.newStatus)) {
    throw new Error("Status tidak valid");
  }

  const updateTransaction = await prisma.transactions.update({
    where: { id: Number(data.transactionId) },
    data: { status: newStatus,
    updatedAt: new Date() },
    include: { product: true, buyer: true },
  });

  return updateTransaction;
}


async function editStatusTransaction(userId, data) {

  const farmer = await prisma.farmers.findUnique({
      where: { userId: userId }
    });
    if (!farmer){
      throw new Error("Farmer tidak ditemukan");
    }
    const transaction = await prisma.transactions.findUnique({
      where: { id: Number(data.transactionId) },
      include: { product: true }
    });
    if (!transaction) {
    throw new Error("Transaksi tidak ditemukan");
  }
  if (transaction.product.farmerId !== farmer.id) {
    throw new Error("Anda tidak berhak mengubah status transaksi ini");
  }

}

async function deleteTransactions(userId, transactionId) {
  const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }
  });
  if (!buyer) {
    throw new Error("Buyer tidak ditemukan");
  }

  const transactions = await prisma.transactions.findUnique({
    where: { id: Number(transactionId),
      status: "COMPLETED" || "CANCELED"
     }
  });

  if (!transactions) {
    throw new Error("Transaksi tidak ditemukan");
  }


  return prisma.transactions.delete({
    where: {
      id: Number(transactionId),
      buyerId: buyer.id,
      status: "COMPLETED" || "CANCELED"
    }
  });
}




async function payClick(transactionsId) {
  const transaction = await prisma.transactions.findFirst({
    where: {
      id: Number(transactionsId),
      status: "PENDING",
    },
  });

  if (!transaction) {
    throw new Error("Tidak ada transaksi yang dapat diproses untuk pembayaran");
  }

  const body = {
    transaction_details: {
      order_id: transaction.id,
      gross_amount: transaction.totalPrice,
    },
  };

  // Kirim request ke Midtrans pakai axios
  const response = await axios.post(process.env.BASE_URL_MIDTRANS,
    body,
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": process.env.MIDTRANS_SERVER_KEY,
      },
    }
  );

  const result = response.data;

  console.log("Midtrans response:", result);
  return result.redirect_url;
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
  createManyTransactions,
  uploadPaymentProof,
  editStatusTransaction,
  editPaymentStatus,
  deleteTransactions,
  payClick
};

  
  
  