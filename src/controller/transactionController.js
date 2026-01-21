const transactionsService = require("../service/transactionsService");
const bucket = require('../config/storage');

//Function untuk get history
async function historyTransaction(req, res, next) {
    try {
      const status = req.query.status;  
      
      if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        if (req.user.role === "BUYER") {
            const buyerTransactions = await transactionsService.getHistoryBuyerTransaction(req.user.id, status);
            res.status(200).json({
            message: "Riwayat transaksi berhasil diambil",
            buyerTransactions});
        }
        else if (req.user.role === "FARMER") {
        const farmerTransactions = await transactionsService.getHistoryFarmerTransaction(req.user.id, status);
        res.status(200).json({
            message: "Riwayat transaksi berhasil diambil",
            farmerTransactions
        });
      }

      return res.status(403).json({ error: "Forbidden" });
  
    } catch (error) {
        next(error);
    }
}   

//Function untuk get history by id
async function getHistoryById(req, res, next) {
 try{
  const id = Number(req.params.id);
  if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        if (req.user.role === "BUYER") {
            const buyerTransactions = await transactionsService.getHistoryBuyerById(req.user.id, id);
            res.status(200).json({
            message: "Riwayat transaksi berhasil diambil",
            buyerTransactions});
        }
        else if (req.user.role === "FARMER") {
        const farmerTransactions = await transactionsService.getHistoryFarmerById(req.user.id, id);
        res.status(200).json({
            message: "Riwayat transaksi berhasil diambil",
            farmerTransactions
        });
      }

      return  res.status(403).json({ error: "Forbidden" });
  
    } catch (error) {
        next(error);
    } 
}

//Function untuk membuat 1 transaksi
async function createOneTransaction(req, res, next) {
  try {
    if (!req.user || req.user.role !== "BUYER") {
      return res.status(403).json({ error: "Hanya buyer yang bisa membuat transaksi" });
    }

    const transaction = await transactionsService.createOneTransaction(req.user.id, req.body);

    res.status(201).json({
      message: "Transaksi berhasil dibuat",
      transaction
    });
  } catch (error) {
    next(error);
  }
}

//Function untuk membuat banyak transaksi dari keranjang
async function createSelectedTransactions(req, res, next) {
  try {
  const {shipAddress} = req.body; 
 if (!req.user || req.user.role !== "BUYER") {
      return res.status(403).json({ error: "Hanya buyer yang bisa membuat transaksi" });
    }
    const transactions = await transactionsService.createManyTransactions(req.user.id, shipAddress);

    res.status(201).json({  
      message: "Transaksi berhasil dibuat",
      transactions
    });
  } catch (error) {
    next(error);
  }
}

//Function untuk update status transaksi dari midtrans
async function updateStatusPembayaran(req, res, next) {
  try {
    const { order_id, status_code, transaction_status } = req.query

    await transactionsService.getRefreshTransaction(order_id, status_code, transaction_status);
    res.json({ message: "Status pembayaran diperbarui" });
  
}catch (error) {
    next(error);
  }
}

//Function untuk mengubah status transaksi untuk farmer
async function editTransactionStatus(req, res, next) {
  try {
    const { transactionId } =req.body;
    const invoice = req.file;
    const userId = req.user.id;
    if (!req.user || req.user.role !== "FARMER") {
      return res.status(403).json({ error: "Hanya farmer yang bisa mengubah status transaksi" });
    }
    let imageUrl = null
    if (invoice) {
      const blob = bucket.file(`${userId}/invoices/${Date.now()}_${invoice.originalname}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: invoice.mimetype,
      });
        await new Promise((resolve, reject) => {
        blobStream.on('finish', resolve);
        blobStream.on('error', reject);
        blobStream.end(req.file.buffer);
  });
    imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    }

    const transaction = await transactionsService.editStatusTransactionFarmer(userId, transactionId, imageUrl);
    res.status(200).json({
      message: "Status transaksi berhasil diperbarui",
      transaction
    });
  } catch (error) {
    next(error);
  }
}

//Function untuk mengubah status transaksi untuk buyer
async function updateStatusComplete(req, res, next) {
  try{
    const {transactionId, status} = req.body;
    const userId = req.user.id;
    if(!req.user || req.user.role !== "BUYER"){
      return res.status(403).json({ error: "Hanya buyer yang bisa mengubah status transaksi" });
    }
    const transaction = await transactionsService.editStatusTransactionBuyer(userId, transactionId, status);
    res.status(200).json({
      message: "Status transaksi berhasil diperbarui",
      transaction
    });
  }catch(error){
    next(error);

  }
}

//Function untuk melakukan pembayaran
async function payClick(req, res, next) {
  try {
    const transactionsId = req.params.transactionsId;
    if (!req.user || req.user.role !== "BUYER") {
      return res.status(403).json({ error: "Hanya buyer yang bisa melakukan pembayaran" });
    }
    const paymentUrl = await transactionsService.payClick(transactionsId);
    res.status(200).json({
      message: "Pembayaran berhasil diproses",
      paymentUrl
    });
  } catch (error) {
    next(error);
  } 
}


module.exports = {
    getHistoryById,
    createOneTransaction,
    historyTransaction,
    createSelectedTransactions,
    editTransactionStatus,
    updateStatusPembayaran,
    updateStatusComplete,
    payClick
};
