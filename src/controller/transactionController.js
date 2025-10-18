const transactionsService = require("../service/transactionsService");


async function historyTransaction(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        if (req.user.role !== "BUYER") {
            return res.status(403).json({ error: "Hanya buyer yang bisa mengakses riwayat transaksi" });
        }
        const transactions = await transactionsService.getHistoryTransaction(req.user.id);
        res.status(200).json({
            message: "Riwayat transaksi berhasil diambil",
            transactions});
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

module.exports = {
    createOneTransaction,
    historyTransaction,
    createSelectedTransactions
};