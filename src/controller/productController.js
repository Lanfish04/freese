const { parse } = require('dotenv');
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

async function getMyProducts(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        
        const farmer = await prisma.farmers.findFirst({
            where: { userId: req.user.id },
        });

        if (!farmer) {
            return res.status(404).json({ error: "Petani tidak ditemukan, pastikan akun anda terdaftar sebagai petani" });
        }

        const products = await product.getProductsByFarmerId(farmer.id);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products for farmer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function createProduct(req, res) {
  try {
    const { name, price, stock, image, description, category } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
   
    if (!name || !price || !stock) {
      return res.status(400).json({ error: "Nama, Harga dan Stock tidak boleh kosong" });
    }

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

async function showEditProduct(req, res ) {
    try{
    const { id } = req.params;
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }

    const productById = await product.editProduct(id);
    if (!productById) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

     const farmer = await prisma.farmers.findFirst({
      where: { userId: req.user.id },
    });

    if (!farmer) {
      return res.status(403).json({ error: "Anda bukan petani" });
    }

    // Cek kepemilikan produk
    if (productById.farmerId !== farmer.id) {
      return res.status(403).json({ error: "Forbidden: Milik orang lain" });
    }

    


    res.status(200).json(productById);
    return productById;
    }catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ error: "Internal server error" });
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

    if (!data.name || !data.price || !data.stock) {
      return res.status(400).json({ error: "Nama, Harga dan Stock tidak boleh kosong" });
    }

    const updateProduct = await product.updateProduct(id, data, farmer.id);
    res.status(200).json(updateProduct);
    }catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
}

}
async function deleteProduct(req, res) {
  
}
module.exports = { 
    getProducts,
    getMyProducts,
    detailProduct,
    createProduct,
    showEditProduct,
    updateProduct,
    deleteProduct
};