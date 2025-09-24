const transactionsService = require("../service/transactionsServic");

async function createTransaction(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        const { productId, quantity, totalPrice } = req.body;
        if (!productId || !quantity || !totalPrice) {
            return res.status(400).json({ error: "Product ID, Quantity, dan Total Price harus diisi" });
        }
        const newTransaction = await transactionsService.createTransaction({
            buyerId: req.user.id,
            farmerId: req.body.farmerId, // Pastikan farmerId dikirim dari client
            productId,
            quantity,
            totalPrice,
            status: req.body.status || "PENDING",
        });
        res.status(201).json({  
            message: "Transaksi berhasil dibuat",
            transaction: newTransaction,
        });
    }
    catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    createTransaction,
};