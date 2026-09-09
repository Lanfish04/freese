const prisma = require('../config/prisma');
const bucket = require('../config/storage');
const product = require('../service/productService');
const path = require('path');

async function getProductsWithFilter(req, res, next) {
  try {
    const searchProduct = await product.getProductsWithFilter(req.query);

    res.status(200).json({
      message: "Berhasil menampilkan produk dengan filter",
      data: searchProduct
    });
  } catch (error) {
    next(error);
  }
}

async function detailProduct(req, res, next) {
  try {
    const { id } = req.params;

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
      return res.status(401).json({
        error: "User tidak ditemukan atau belum login"
      });
    }

    if (req.user.role !== 'FARMER') {
      return res.status(403).json({
        error: "Hanya petani yang dapat mengakses produk mereka"
      });
    }

    const products = await product.getProductsByFarmerId(userId);

    res.status(200).json({
      message: "Berhasil menampilkan produk",
      products
    });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "User tidak ditemukan atau belum login"
      });
    }

    if (req.user.role !== 'FARMER') {
      return res.status(403).json({
        error: "Hanya petani yang dapat membuat produk"
      });
    }

    let imageUrl = null;

    if (req.file) {
      const fileName =
        `${req.user.id}/products/${Date.now()}-${path.basename(req.file.originalname)}`;

      const blob = bucket.file(fileName);

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', reject);
        blobStream.on('finish', resolve);

        blobStream.end(req.file.buffer);
      });

      imageUrl =
        `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const newProduct = await product.createProduct(req.user.id, {
      ...req.body,
      image: imageUrl,
    });

    res.status(201).json({
      message: "Produk berhasil dibuat",
      newProduct
    });

  } catch (error) {
    next(error);
  }
}

async function showEditProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "User tidak ditemukan atau belum login"
      });
    }

    if (req.user.role !== 'FARMER') {
      return res.status(403).json({
        error: "Hanya petani yang dapat mengedit produk"
      });
    }

    const productById = await product.editProduct(req.user.id, id);

    res.status(200).json({
      message: "Berhasil menampilkan produk untuk di edit",
      productById
    });

  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "User tidak ditemukan atau belum login"
      });
    }

    if (req.user.role !== 'FARMER') {
      return res.status(403).json({
        error: "Hanya petani yang dapat mengedit produk"
      });
    }

    const existingProduct = await product.getProductById(id);

    if (!existingProduct) {
      return res.status(404).json({
        error: "Produk tidak ditemukan"
      });
    }

    // Default menggunakan gambar lama
    let imageUrl = existingProduct.image;

    // Jika ada gambar baru
    if (file) {

      const newFileName =
        `${req.user.id}/products/${Date.now()}-${path.basename(file.originalname)}`;

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

      // URL gambar baru
      imageUrl =
        `https://storage.googleapis.com/${bucket.name}/${newFileName}`;

      // Hapus gambar lama dari GCP Storage
      if (existingProduct.image) {
        try {

          const oldFileName =
            existingProduct.image.split(`${bucket.name}/`)[1];

          if (oldFileName) {
            await bucket.file(oldFileName).delete();

            console.log(
              `File lama berhasil dihapus: ${oldFileName}`
            );
          }

        } catch (err) {
          console.warn(
            "Gagal menghapus gambar lama:",
            err.message
          );
        }
      }
    }

    const updatedProduct = await product.updateProduct(
      req.user.id,
      id,
      {
        ...req.body,
        image: imageUrl,
      }
    );

    res.status(200).json({
      message: "Produk berhasil diupdate",
      updatedProduct,
    });

  } catch (error) {
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

    // Hapus gambar dari GCP Storage
    if (existingProduct.image) {
      try {

        const oldFileName =
          existingProduct.image.split(`${bucket.name}/`)[1];

        if (oldFileName) {
          await bucket.file(oldFileName).delete();

          console.log(
            `Gambar berhasil dihapus: ${oldFileName}`
          );
        }

      } catch (err) {
        console.warn(
          "Gagal menghapus gambar:",
          err.message
        );
      }
    }

    // Hapus data produk dari database
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