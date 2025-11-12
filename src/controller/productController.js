const { parse } = require('dotenv');
const prisma = require('../config/prisma');
const bucket = require('../config/storage');
const product = require('../service/productService')
const path = require('path');

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
      const {id} = req.params;
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

    let imageUrl = null;
    if (req.file) {
      const blob = bucket.file(`products/${req.user.id}/${Date.now()}-${path.basename(req.file.originalname)}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', resolve);
        blobStream.end(req.file.buffer);
      });

      
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    }

    const newProduct = await product.createProduct(req.user.id, {
      ...req.body,
      image: imageUrl, 
    });
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
    const productById = await product.editProduct(req.user.id, id);
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

    const file = req.file;
    
     if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }

    if (req.user.role !== 'FARMER') {
      return res.status(403).json({ error: "Hanya petani yang dapat mengedit produk" });
    }
    const existingProduct = await product.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    let imageUrl = existingProduct.image; // default: pakai yang lama

    // Jika ada upload file baru
    if (file) {
      const newFileName = `products/${req.user.id}/${Date.now()}-${file.originalname}`;
      const blob = bucket.file(newFileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      await new Promise((resolve, reject) => {
    blobStream.on('finish', resolve);
    blobStream.on('error', reject);
    blobStream.end(file.buffer);
  });

      imageUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;

      // Hapus file lama dari bucket (jika ada)
      if (existingProduct.image) {
        try {
          const oldFileName = existingProduct.image.split(`${bucket.name}/`)[1];
          await bucket.file(oldFileName).delete();
          console.log(`File lama dihapus: ${oldFileName}`);
        } catch (err) {
          console.warn("Gagal hapus file lama:", err.message);
        }
      }
    }

    const updatedProduct = await product.updateProduct(req.user.id, id, {
      ...req.body,
      image: imageUrl,
    });

    res.status(200).json({
      message: "Produk berhasil diupdate",
      updatedProduct,
    });

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
        const  keyword  = req.query.keyword || '';
        // const  category  = req.query.category || '';
        const products = await product.searchProduct(keyword);
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