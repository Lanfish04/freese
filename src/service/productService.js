const prisma = require('../config/prisma');


async function getProducts() {
    return prisma.products.findMany({
        include :{ 
        farmer:{
            select:{
                farmName: true,
                address: true,
                productsType: true
                   }        
               }
        }
    });
}


async function getProductsByFarmerId(farmerId) {
    return prisma.products.findMany({
        where: { farmerId: Number(farmerId) },
        include :{
        farmer:{
            select:{
                farmName: true,
                address: true,
                productsType: true
                }        
            }
        }
    });
}

async function getProductById(id) {
    const product = await prisma.products.findUnique({
        where:{ id : Number(id)},
        include :{ 
        farmer:{
            select:{
                farmName: true,
                address: true,
                productsType: true
                }        
            }
        }
    });
    if (!product) {
        throw new Error("Produk tidak ditemukan");
    }
return product;
}

async function createProduct(userId, data) {
    const farmer = await prisma.farmers.findUnique({
        where: { userId: userId }
    });

    if (!farmer) {
        throw new Error("Farmer tidak ditemukan");
    }

   if (!data.name || !data.price || !data.stock) {
        throw new Error("Tidak Boleh Kosong ");
    }

    return prisma.products.create({
      data: {
        name: data.name,
        price: Number(data.price),
        stock: Number(data.stock),
        unit: data.unit,
        image: data.image,
        description: data.description,
        category: data.category,
        farmerId: farmer.id,
      },
    });
}

async function editProduct(userId, id) {
    const farmer = await prisma.farmers.findUnique({
        where: { userId: userId }
    });
    if (!farmer) {
        throw new Error("Farmer tidak ditemukan");
    }
    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
        throw new Error("Produk tidak ditemukan");
    }

    if (product.farmerId !== farmer.id) {
        throw new Error("Forbidden");
    }

    return product;
    
}

async function updateProduct(userId, id, data) {
  const farmer = await prisma.farmers.findUnique({
    where: { userId },
  });

  if (!farmer) {
    throw new Error("Farmer tidak ditemukan");
  }

  if (!id || isNaN(Number(id))) {
    throw new Error("ID produk tidak valid");
  }

  const product = await prisma.products.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    throw new Error("Produk tidak ditemukan");
  }

  if (product.farmerId !== farmer.id) {
    throw new Error("Forbidden");
  }

  const updatedProduct = await prisma.products.update({
    where: { id: Number(id) },
    data: {
      name: data.name ?? product.name,
      price: data.price ? Number(data.price) : product.price,
      stock: data.stock ? Number(data.stock) : product.stock,
      image: data.image ?? product.image, 
      unit: data.unit ?? product.unit,
      description: data.description ?? product.description,
      category: data.category ?? product.category,
    },
  });

  return updatedProduct;
}

async function deleteProduct(farmerId) {
    return prisma.products.delete({
        where: { id: Number(farmerId) },
    });
  
}


async function searchProduct(keyword) {
const searchProducts = await prisma.products.findMany({
  where: {
    body: {
      search : keyword,
    },
  },
  include: {
    farmer: {
      select: {
        farmName: true,
        address: true,
        productsType: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 20,
});


  //   const searchProducts = prisma.products.findMany({
//   where: {
//     AND: [
//       keyword ? { name: { contains: keyword, mode: 'insensitive' } } : {},
//       category && category !== 'all' ? { category: { equals: category } } : {},
//     ],
//   },
//   include: {
//     farmer: {
//       select: {
//         farmName: true,
//         address: true,
//         productsType: true,
        
//       },
//     },
//   },
//   orderBy: {
//     createdAt: 'desc',
//   },
//   take: 20,
// });

// if (!searchProducts) {
//     throw new Error("Produk tidak ditemukan");
// }
return searchProducts;
}

module.exports = { 
    getProducts,
    getProductById,
    getProductsByFarmerId,
    createProduct,
    editProduct,
    updateProduct,
    deleteProduct,
    searchProduct
};