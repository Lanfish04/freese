const { parse } = require('dotenv');
const prisma = require('../config/prisma');
const bucket = require('../config/storage');
const product = require('../service/productService')
const path = require('path');

async function getProductsWithFilter(req, res, next) {
try{
const searchProduct = await product.getProductsWithFilter(req.query);
res.status(200).json({
    message: "Berhasil menampilkan produk dengan filter",
    data: searchProduct
});
}catch (error) {
    next(error);
}
}

async function detailProduct(req, res, next) {
    try {
      const {id} = req.params;
        const productById = await product.getProductById(id);
        res.status(200).json(productById);
    } catch (error) {
        next(error);
    }
}

async function getMyProducts(req, res, next) {
    try {
	const userId = req.user.id;
        if (!req.user || !userId) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        
        if (req.user.role !== 'FARMER') {
          return res.status(403).json({ error: "Hanya petani yang dapat mengakses produk mereka" });
        }
        const products = await product.getProductsByFarmerId(userId);
        res.status(200).json({
          message: "Berhasil menampilkan produk",
          products});
    } catch (error) {
        next(error);
    }
}

async function createProduct(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
    }
    if (req.user.role !== 'FARMER') {
      return res.status(403).json({ error: "Hanya petani yang dapat membuat produk" });
    }

    let imageUrl = null;
    if (req.file) {
      const filename = `${req.user.id}/products/${Date.now()}-${path.basename(req.file.originalname)}`;
      const { error } = await bucket.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

       if (error) {
    throw error;
  }

  const { data } = bucket.storage
    .from(process.env.SUPABASE_BUCKET)
    .getPublicUrl(filename);

  imageUrl = data.publicUrl;
}

    const newProduct = await product.createProduct(req.user.id, {
      ...req.body,
      image: imageUrl, 
    });
    res.status(201).json({
      message: "Produk berhasil dibuat",
      newProduct });
  }catch (error) {
    next(error);
  }
}

async function showEditProduct(req, res, next) {
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
    next(error);
  }
}

async function updateProduct(req, res, next) {
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
      const fileName = `${req.user.id}/products/${Date.now()}-${path.basename(file.originalname)}`;

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = bucket.storage
    .from(process.env.SUPABASE_BUCKET)
    .getPublicUrl(fileName);

  imageUrl = data.publicUrl;

  // Hapus gambar lama
  if (existingProduct.image) {

    try {

      const oldPath = existingProduct.image.split(
        `/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/`
      )[1];

      if (oldPath) {
        await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .remove([oldPath]);
      }

    } catch (err) {
      console.warn("Gagal menghapus gambar lama:", err.message);
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
        next(error);
}

}
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "User tidak ditemukan atau belum login",
      });
    }

    if (req.user.role !== "FARMER") {
      return res.status(403).json({
        error: "Hanya petani yang dapat menghapus produk",
      });
    }

    // Ambil data produk terlebih dahulu
    const existingProduct = await product.getProductById(id);

    if (!existingProduct) {
      return res.status(404).json({
        error: "Produk tidak ditemukan",
      });
    }

    // Hapus gambar dari Supabase Storage
    if (existingProduct.image) {
      try {
        const oldPath = existingProduct.image.split(
          `/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/`
        )[1];

        if (oldPath) {
          const { error } = await bucket.storage
            .from(process.env.SUPABASE_BUCKET)
            .remove([oldPath]);

          if (error) {
            console.warn("Gagal menghapus gambar:", error.message);
          }
        }
      } catch (err) {
        console.warn("Gagal menghapus gambar:", err.message);
      }
    }

    // Hapus data produk
    await product.deleteProduct(req.user.id, id);

    res.status(200).json({
      message: "Produk berhasil dihapus",
    });

  } catch (error) {
    next(error);
  }
}

module.exports = { 
    getProductsWithFilter,
    getMyProducts,
    detailProduct,
    createProduct,
    showEditProduct,
    updateProduct,
    deleteProduct,
};
