const prisma = require("../config/prisma");
const axios = require("axios");
const dotenv = require('dotenv');
const { NotFound, BadRequest, Forbidden } = require("../error/errorFactory");

//Function untuk get data history buyer
async function getHistoryBuyerTransaction(userId, status) {
    const buyer = await prisma.buyers.findUnique({
        where: { userId: userId }
    });
    if (!buyer) {
        throw NotFound("Buyer tidak ditemukan");
    }
    return prisma.transactions.findMany({
        where: { buyerId: buyer.id, 
          paymentStatus: status },
        include: {  
        product: {
          select : {
                id: true,
                name: true,
                price: true,
                image: true,
                unit: true,
       }
      },
     }
    });
}

//Function untuk get data history buyer by id
async function getHistoryBuyerById(userId, id){
const buyer = await prisma.buyers.findUnique({
        where: { userId: userId }
    });
    if (!buyer) {
        throw NotFound("Buyer tidak ditemukan");
    }
    const transaction = await prisma.transactions.findFirst({
      where: { id: Number(id),
      buyerId: buyer.id },
      include: {  
        product: {
          select : {
                id: true,
                name: true,
                price: true,
                image: true,
                unit: true,
	    	   }
     		 }
    		 }
    });
    if (!transaction) {
      throw NotFound("Transaksi tidak ditemukan");
    }
    return transaction;
}



//Function untuk get data history farmer
async function getHistoryFarmerTransaction(userId, status){
  const farmer = await prisma.farmers.findUnique({
    where : {userId: userId}
  });
  if (!farmer){
    throw NotFound("Farmer tidak ditemukan");
  }
  return prisma.transactions.findMany({
    where: { product: { 
      farmerId: farmer.id 
    },
    paymentStatus: "PAID" },
    include: {  
      product: {
        select : {
                id: true,
                name: true,
                price: true,
                image: true,
                unit: true,
      		 }
      },
      buyer: true
   }
  });
} 

//Function untuk get data history farmer by id
async function getHistoryFarmerById(userId, id){
  const farmer = await prisma.farmers.findUnique({
    where : {userId: userId}
  });
  if (!farmer){
    throw NotFound("Farmer tidak ditemukan");
  }
  const transaction = await prisma.transactions.findUnique({
    where: { product: { 
      id : Number(id),
      farmerId: farmer.id
    },
    paymentStatus: "PAID" },
    include: {  
      product: {
        select : {
                id: true,
                name: true,
                price: true,
                image: true,
                unit: true,
       }
      },
      buyer: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          address: true
       } 
      }
     }
  });
  if (!transaction) {
      throw new Error("Transaksi tidak ditemukan");
    }
    return transaction;
}


//Function to create a transaction for a single product
async function createOneTransaction(userId, data) {
  const buyer = await prisma.buyers.findUnique({
  where: { userId: userId }});
  
  if (!buyer) {
    throw NotFound("Buyer tidak ditemukan");
  }
  //Check apakah produk tersedia
  const products = await prisma.products.findFirst({
    where:{ id: Number(data.productId),
      isDeleted: false
    }
  })
  if (!products) {
    throw NotFound("Produk tidak ditemukan");
  }
  if (products.stock < data.quantity) {
    throw BadRequest("Stok produk tidak mencukupi");
  }
  if (buyer.shipAddress === null){
    throw BadRequest("Alamat pengiriman masih kosong")
  }

  const totalPrice = products.price * data.quantity;
  const transaction = await prisma.transactions.create({
    data: {
      buyerId: buyer.id,
      productId: products.id,
      totalPrice: totalPrice,
      quantity: Number(data.quantity),
      shipAddress: data.shipAddress || buyer.address,
    }, 
    include: {
       product: {
        select : {
                id: true,
                name: true,
                price: true,
                image: true,
                unit: true,
       }
      },
       buyer: true
      }
  });
  return transaction;
}

//Function to create transactions for multiple products from cart
async function createManyTransactions(userId, data) {
  
  const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }
  });
  if (!buyer) {
    throw NotFound("Buyer tidak ditemukan");
  }
await prisma.cart.updateMany({
  where: {
    buyerId: buyer.id,
    isSelected: true,
    product: {
      isDeleted: true
    }
  },
  data: {
    isSelected: false
  }
});

 const selectedItems = await prisma.cart.findMany({
    where: {
       buyerId: buyer.id, 
       isSelected: true,
      product: {
        isDeleted: false
      },
    },
    include: { 
      product: true
    }
  });
  if (selectedItems.some(item => item.product.isDeleted)) {
    throw BadRequest("Salah satu produk dalam keranjang tidak tersedia");
  }
if (selectedItems.length === 0) {
    throw BadRequest("Tidak ada item yang dipilih");
  }
  const transactionsData = [];

  for (const item of selectedItems) {
    const product = item.product;

    if (!product) {
      throw NotFound(`Produk tidak ditemukan atau tidak tersedia untuk produk ${item.name}`);
    }

    if (product.stock < item.quantity) {
      throw BadRequest(`Stok produk ${product.name} tidak mencukupi`);
    }

    const totalPrice = product.price * item.quantity;

    // await prisma.products.update({
    //   where: { id: product.id },
    //   data: { stock: product.stock - item.quantity },
    // });

    transactionsData.push({
      buyerId: buyer.id,
      productId: product.id,
      quantity: item.quantity,
      totalPrice,
      shipAddress: data.shipAddress || buyer.address,
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

//Function mengubah status pembeli
async function getRefreshTransaction(order_id, status_code, transaction_status) {
const order = await prisma.transactions.findUnique({
  where: { id: Number(order_id) }
});
if (!order) {
  throw NotFound("Transaksi tidak ditemukan");
}
const status = transaction_status === "capture" ? "PAID" : "FAILED";

if (status === "FAILED") {
  return prisma.transactions.update({
    where: { id: Number(order_id) },
    data: { 
      paymentStatus: status,
      status : "CANCELED",
      updatedAt: new Date()
    }
  }); 
}

await prisma.products.update({
  where: { id: order.productId },
  data: { stock: { decrement: order.quantity } }
});

return prisma.transactions.update({
  where: { id: Number(order_id) },
  data: {
    paymentStatus: status,
    updatedAt: new Date()
  }
});
} 

//Function edit status untuk farmer
async function editStatusTransactionFarmer(userId, transactionId, imageUrl) {
  const farmer = await prisma.farmers.findUnique({
      where: { userId: userId }
    });

    if (!farmer){
      throw NotFound("Farmer tidak ditemukan");
    }
    const transaction = await prisma.transactions.findUnique({
      where: { id: Number(transactionId)},
      include: { 
        product: true
    }
  });
  if (!transaction) {
    throw NotFound("Transaksi tidak ditemukan");
  }
  if(transaction.product.farmerId !== farmer.id) {
  throw Forbidden("Anda tidak berhak mengubah status transaksi ini");
  }
  if (transaction.paymentStatus !== "PAID") {
  throw Forbidden("Pembayaran belum selesai");
}

if (transaction.status === "PROCESSING") {
  throw BadRequest("Transaksi sudah diproses");
}

if (transaction.status === "COMPLETED") {
  throw BadRequest("Transaksi sudah selesai");
}

if (transaction.status !== "PENDING") {
  throw BadRequest("Status transaksi tidak valid");
}
if(!imageUrl){
  throw BadRequest("Bukti resi tidak boleh kosong")
}

  const updateTransaction = await prisma.transactions.update({
    where: { id: Number(transactionId) },
    data: { invoice : imageUrl,
      status : "PROCESSING"
    },
    include: { 
      product: true, 
      buyer: true },
  });

  return updateTransaction;
}

async function editStatusTransactionBuyer(userId, transactionId, status) {
  const buyer = await prisma.buyers.findUnique({
      where: { userId: userId }
    });
    if (!buyer){
      throw NotFound("Buyer tidak ditemukan");
    }
    const transaction = await prisma.transactions.findUnique({
      where: { id: Number(transactionId)},
  });
  if (!transaction) {
    throw NotFound("Transaksi tidak ditemukan");
  }
  if(transaction.buyerId !== buyer.id) {
  throw Forbidden("Anda tidak berhak mengubah status transaksi ini");
  }
  if (transaction.status !== "PROCESSING") {
  throw BadRequest("Status transaksi tidak valid untuk diproses");
  }
  const updateTransaction = await prisma.transactions.update({
    where: { id: Number(transactionId) },
    data: { status : status
    },
  }); 
  return updateTransaction;
}

// async function deleteTransactions(userId, transactionId) {
//   const buyer = await prisma.buyers.findUnique({
//     where: { userId: userId }
//   });
//   if (!buyer) {
//     throw new Error("Buyer tidak ditemukan");
//   }

//   const transactions = await prisma.transactions.findUnique({
//     where: { id: Number(transactionId),
//       status: "COMPLETED" || "CANCELED"
//      }
//   });

//   if (!transactions) {
//     throw new Error("Transaksi tidak ditemukan");
//   }


//   return prisma.transactions.delete({
//     where: {
//       id: Number(transactionId),
//       buyerId: buyer.id,
//       status: "COMPLETED" || "CANCELED"
//     }
//   });
// }



//Function generate link pembayaran
async function payClick(transactionsId) {
  const transaction = await prisma.transactions.findFirst({
    where: {
      id: Number(transactionsId),
      status: "PENDING",
    },
  });

  if (!transaction) {
    throw NotFound("Tidak ada transaksi yang dapat diproses untuk pembayaran");
  }

  const body = {
    transaction_details: {
      order_id: `TRX-${transaction.id}-${Date.now}`,
      gross_amount: Number(transaction.totalPrice),
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
	console.log(body);
  console.log("Midtrans response:", result);
  return result.redirect_url;
}


module.exports = {
  createOneTransaction,
  getHistoryBuyerTransaction,
  getHistoryFarmerTransaction,
  createManyTransactions,
  getRefreshTransaction,
  editStatusTransactionFarmer,
  getHistoryBuyerById,
  getHistoryFarmerById,
  editStatusTransactionBuyer,
  // deleteTransactions,
  payClick
};

  
  
  
