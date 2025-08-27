const prisma = require('../config/prisma');
const product = require('../service/productService')

async function getProducts(req, res) {
    try {
        const products = await product.getProducts();
        res.status(200).json(products);
    }catch{

    }
  
}

async function detailProduct(req, res) {
    try {
        const { id } = req.params;
        const productById = await product.getProductById(id);
        if (!productById) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(productById);
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }

  
}
async function createProduct(req, res) {
  try {
    // Pastikan req.user dan req.user.id tersedia
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }

    if (req.user.role !== 'FARMER') {
      return res.status(403).json({ error: "Hanya petani yang dapat membuat produk" });
    }

    const { name, price, stock, image, description, category } = req.body;

    if (!name || !price || !stock) {
      return res.status(400).json({ error: "Nama, Harga dan Stock tidak boleh kosong" });
    }

    // Cari farmer berdasarkan userId
    const farmer = await prisma.farmers.findFirst({
      where: { userId: req.user.id },
    });
    console.log(farmer);

    if (!farmer) {
      return res.status(404).json({ error: "Petani tidak ditemukan, pastikan akun anda terdaftar sebagai petani" });
    }

      const newProduct = await product.createProduct({
      name: name,
      price: price,
      stock: stock,
      image: image,
      description: description,
      category: category,
      farmerId: farmer.id,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  
}
async function deleteProduct(req, res) {
  
}
module.exports = { 
    getProducts,
    detailProduct,
    createProduct,
    updateProduct,
    deleteProduct
};