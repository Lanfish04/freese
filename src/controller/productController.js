const { parse } = require('dotenv');
const prisma = require('../config/prisma');
const product = require('../service/productService')

async function getProducts(req, res) {
    try {
        const products = await product.getProducts();
        res.status(200).json(products);
    }catch{
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
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

async function getMyProducts(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        
        if (req.user.role !== 'FARMER') {
          return res.status(403).json({ error: "Hanya petani yang dapat mengakses produk mereka" });
        }
        const farmer = await prisma.farmers.findFirst({
            where: { userId: req.user.id },
        });

        if (!farmer) {
            return res.status(404).json({ error: "Petani tidak ditemukan, pastikan akun anda terdaftar sebagai petani" });
        }

        const products = await product.getProductsByFarmerId(farmer.id);
        res.status(200).json({
          message: "Berhasil menampilkan produk",
          products});
    } catch (error) {
        console.error("Error fetching products for farmer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function createProduct(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    if (req.user.role !== 'FARMER') {
      return res.status(403).json({ error: "Hanya petani yang dapat membuat produk" });
    }
    const newProduct = await product.createProduct(req.user.id, req.body);
    res.status(201).json({
      message: "Produk berhasil dibuat",
      newProduct });
  }catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: error.message });
  }
}

async function showEditProduct(req, res ) {
    try{
    const { id } = req.params;
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    if (req.user.role !== 'FARMER') {
      return res.status(403).json({ error: "Hanya petani yang dapat mengedit produk" });
    }
    const productById = await product.editProduct(id);
    res.status(200).json({
      message: "Berhasil menampilkan produk untuk di edit",
      productById});
    return productById;
    }catch (error) {
    console.error("Error fetching product:", error);
    res.status(400).json({ error: error.message });
  }
}

async function updateProduct(req, res) {
    try {
    const { id } = req.params;
    const data = req.body;
    const farmer = await prisma.farmers.findFirst({
      where: { userId: req.user.id },
    });
    
     if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }

    if (req.user.role !== 'FARMER') {
      return res.status(403).json({ error: "Hanya petani yang dapat mengedit produk" });
    }

    if (!farmer) {
      return res.status(404).json({ error: "Petani tidak ditemukan, pastikan akun anda terdaftar sebagai petani" });
    }

    if (id == null || isNaN(Number(id))) {
      return res.status(400).json({ error: "ID produk tidak valid" });
    }

    const updateProduct = await product.updateProduct(id, data, farmer.id);
    res.status(200).json(
      {
        message: "Produk berhasil diupdate",
        updateProduct});
    }catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
}

}
async function deleteProduct(req, res) {
    try {
    const { id } = req.params;
    const farmer = await prisma.farmers.findFirst({
      where: { userId: req.user.id },
    });
      if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }

    if (req.user.role !== 'FARMER') {
      return res.status(403).json({ error: "Hanya petani yang dapat menghapus produk" });
    }
    if (!farmer) {
      return res.status(404).json({ error: "Petani tidak ditemukan, pastikan akun anda terdaftar sebagai petani" });
    }
    const productById = await product.getProductById(id);
    if (!productById) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    // Cek kepemilikan produk
    if (productById.farmerId !== farmer.id) {
      return res.status(403).json({ error: "Forbidden: Milik orang lain" });
    }
    await product.deleteProduct(id);
    res.status(200).json({ message: "Produk berhasil dihapus" });
    }catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
  
}

async function searchProduct(req, res) {
    try {
        const { query, category } = req.query;
        const products = await product.searchProduct(query, category);
        res.status(200).json({
          message: "Hasil pencarian produk",
          products});
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ error: "Internal server error" });
    } 
}


module.exports = { 
    getProducts,
    getMyProducts,
    detailProduct,
    createProduct,
    showEditProduct,
    updateProduct,
    deleteProduct,
    searchProduct
};