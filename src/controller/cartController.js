const cartService = require('../service/cartService');


async function getCart(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        const cartItems = await cartService.getCartByUserId(req.user.id);
        res.status(200).json({
            message : "Berhasil menampilkan cart",
            data : {cartItems},
        });

    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    if (!req.user || !userId) {
        return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    const result = await cartService.addToCart(userId, req.body);
    res.status(200).json({
      message: "Produk berhasil ditambahkan ke keranjang",
      data: result
    });
  } catch (error) {
    console.error("Error add to cart:", error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
    getCart,
    addToCart
};