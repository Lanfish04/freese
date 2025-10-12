const cartService = require('../service/cartService');


async function getCart(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
      if (req.user.role !== 'BUYER') {
        return res.status(403).json({ error: "Forbidden" });
      }
      const cartItems = await cartService.getCartByUserId(req.user.id);
      
      const formattedCart = cartItems.map(item => ({
      id: item.id,
      productName: item.product.name,
      productImage: item.product.image,
      quantity: item.quantity,
      unit: item.product.unit,
      price: item.product.price,
      totalPrice: item.quantity * item.product.price
    }));

      const cartTotal = formattedCart.reduce((total, item) => total + item.totalPrice, 0);

        res.status(200).json({
            message : "Berhasil menampilkan cart",
              items: formattedCart,
              cartTotal: cartTotal
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
    if (req.user.role !== 'BUYER') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const result = await cartService.addToCart(userId, req.body);
    if (result) {
      cartService.updatedStock(userId, req.body);
      res.status(200).json({
      message: "Produk berhasil ditambahkan ke keranjang",
      data: result
    });
  }
    // res.status(200).json({
    //   message: "Produk berhasil ditambahkan ke keranjang",
    //   data: result
    // });
  } catch (error) {
    console.error("Error add to cart:", error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
    getCart,
    addToCart
};