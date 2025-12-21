const cartService = require('../service/cartService');


async function getCart(req, res, next) {
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
      isSelected : item.isSelected,
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
        next(error);
    }
}

async function addToCart(req, res, next) {
  try {
    const userId = req.user.id;

    if (!req.user || !userId) {
        return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    if (req.user.role !== 'BUYER') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const result = await cartService.addToCart(userId, req.body);
    res.status(200).json({
      message: "Produk berhasil ditambahkan ke keranjang",
      data: result
    });
  } catch (error) {
   next(error);
  }
}

async function showEditCart(req, res, next) {
try {
    const userId = req.user.id;
    const productId = req.params.product;

    if (!req.user || !userId) {
        return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    if (req.user.role !== 'BUYER') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const cartItem = await cartService.showEditCart(userId, productId);
    res.status(200).json({
      message: "Berhasil menampilkan item keranjang",
      data: cartItem
    });
} catch (error) {
  next(error);
}
}

async function editCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    if (!req.user || !userId) {
        return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    if (req.user.role !== 'BUYER') {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await cartService.updateCartItem(userId, productId, req.body.quantity);
    res.status(200).json({
      message: "Stok produk berhasil diperbarui",
      data: result
    });
  }
  catch (error) {
    next(error);
  } 
}

async function deleteCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    // if (isNaN(productId)) {
    //   return res.status(400).json({ error: "productId tidak valid" });
    // }
    if (!req.user || !userId) {
        return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    if (req.user.role !== 'BUYER') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const result = await cartService.removeCartItem(userId, productId);
    res.status(200).json({
      message: "Item keranjang berhasil dihapus",
      data: result
    });
  } catch (error) {
    next(error);
  } 
}

async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;
    if (!req.user || !userId) {
        return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    if (req.user.role !== 'BUYER') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const result = await cartService.deleteAllItem(userId);
    res.status(200).json({
      message: "Keranjang berhasil dikosongkan",
      data: result
    });
  } catch (error) {
    next(error);

  }
  
}

async function itemSelected(req, res, next) {
 try{
  const userId = req.user.id;
  const {isSelected} = req.body;
  const cartId = Number(req.params.id);
  if (!req.user || !userId) {
    return res.status(401).json({ message: "User tidak ditemukan atau belum login" });
  }

  if (req.user.role !== 'BUYER') {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updatedCart = await cartService.selectionItemCart(userId, cartId, isSelected);

  res.status(200).json({
      message: "Berhasil dipilih",
      data: updatedCart
    });
}catch (error) {
next(error);
}

}

module.exports = {
    getCart,
    addToCart,
    showEditCart,
    editCartItem,
    deleteCartItem,
    clearCart,
    itemSelected
};