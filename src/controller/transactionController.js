const transactionsService = require("../service/transactionsService");


async function historyTransaction(req, res) {
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
        
        if (req.user.role === "FARMER") {
        const farmerTransactions = await transactionsService.getHistoryFarmerTransaction(req.user.id, status);
        res.status(200).json({
            message: "Riwayat transaksi berhasil diambil",
            farmerTransactions
        });
      }

      else{
        res.status(403).json({ error: "Forbidden" });
      }
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}   




async function createOneTransaction(req, res) {
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
    console.error("Error create transaction:", error);
    res.status(400).json({ error: error.message });
  }
}

async function createSelectedTransactions(req, res) {
  try {
    if (!req.user || req.user.role !== "BUYER") {
      return res.status(403).json({ error: "Hanya buyer yang bisa membuat transaksi" });
    }
    const transactions = await transactionsService.createManyTransactions(req.user.id, req.body);

    res.status(201).json({  
      message: "Transaksi berhasil dibuat",
      transactions
    });
  } catch (error) {
    console.error("Error create transactions:", error);
    res.status(400).json({ error: error.message });
  }
}

async function updateStatusTransaction(req, res) {
  try {
    const { order_id, status_code, transaction_status } = req.query

    await transactionsService.getRefreshTransaction(order_id, status_code, transaction_status);

    res.json({ message: "Bukti pembayaran berhasil diunggah dan status transaksi diperbarui" });
  
}catch (error) {
    console.error("Error uploading payment proof:", error);
    res.status(400).json({ error: error.message });
  }
}


async function editPaymentStatus(req, res) {
  try {
    if (!req.user || req.user.role !== "FARMER") {
      return res.status(403).json({ error: "Hanya farmer yang bisa mengubah status transaksi" });
    }
    const transaction = await transactionsService.editPaymentStatus(req.user.id, req.body);
    res.status(200).json({
      message: "Status pembayaran berhasil diperbarui",
      transaction
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(400).json({ error: error.message });
  }
}

async function payClick(req, res) {
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
    console.error("Error processing payment:", error);
    res.status(400).json({ error: error.message });
  } 
}


module.exports = {
    createOneTransaction,
    historyTransaction,
    createSelectedTransactions,
    updateStatusTransaction,
    editPaymentStatus,
    payClick
};