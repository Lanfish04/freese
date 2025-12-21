const prisma = require('../config/prisma');
const { NotFound, Forbidden, BadRequest } = require("../error/errorFactory");

// async function getProducts() {
//     return prisma.products.findMany({
//       where: { isDeleted: false },  
//       include :{ 
//         farmer:{
//             select:{
//                 farmName: true,
//                 address: true,
//                 productsType: true
//                    }        
//                }
//         }
//     });
// }


async function getProductsByFarmerId(farmerId) {
    const products = await prisma.products.findMany({
        where: { farmerId: Number(farmerId), 
        isDeleted : false },
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
    if (!products) {
        throw NotFound("Produk tidak ditemukan");
    }
    if (products.length === 0) {
        throw NotFound("Produk tidak ditemukan untuk petani ini");
    }
    if (products.farmerId !== Number(farmerId)) {
        throw Forbidden("Produk bukan milik petani ini");
    }

return products;
}

async function getProductById(id) {
    const product = await prisma.products.findUnique({
        where:{ id : Number(id), isDeleted : false },
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
        throw NotFound("Produk tidak ditemukan");
    }
return product;
}

async function createProduct(userId, data) {
    const farmer = await prisma.farmers.findUnique({
        where: { userId: userId }
    });

    if (!farmer) {
        throw NotFound("Farmer tidak ditemukan");
    }
    if (farmer.userId !== userId) {
        throw Forbidden("Anda bukan petani");
    }

   if (!data.name || !data.price || !data.stock) {
        throw BadRequest("Tidak Boleh Kosong");
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
        throw NotFound("Farmer tidak ditemukan");
    }
    if (farmer.userId !== userId) {
        throw Forbidden("Anda bukan petani");
    }
    if (!id || isNaN(Number(id))) {
        throw new BadRequest("ID produk tidak valid");
    }

    const product = await prisma.products.findUnique({
      where: { id: Number(id),
        isDeleted : false
       },
    });

    if (!product) {
        throw NotFound("Produk tidak ditemukan");
    }

    if (product.farmerId !== farmer.id) {
        throw Forbidden("Produk bukan milik Anda");
    }

    return product;
    
}

async function updateProduct(userId, id, data) {
  const farmer = await prisma.farmers.findUnique({
    where: { userId : userId },
  });

  if (!farmer) {
    throw NotFound("Farmer tidak ditemukan");
  }

  if (!id || isNaN(Number(id))) {
    throw new BadRequest("ID produk tidak valid");
  }

  const product = await prisma.products.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    throw NotFound("Produk tidak ditemukan");
  }

  if (product.farmerId !== farmer.id) {
    throw Forbidden("Produk bukan milik Anda");
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

async function deleteProduct(userId, id) {
  const farmer = await prisma.farmers.findUnique({
        where: { userId: userId }
    });
    if (!farmer) {
        throw NotFound("Farmer tidak ditemukan");
    }
    if (farmer.userId !== userId) {
        throw Forbidden("Anda bukan petani");
    }
    if (!id || isNaN(Number(id))) {
        throw new BadRequest("ID produk tidak valid");
    }
    
    const product = await prisma.products.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
        throw NotFound("Produk tidak ditemukan");
    }

    if (product.farmerId !== farmer.id) {
        throw Forbidden("Produk bukan milik Anda");
    }

    return prisma.products.update({
      where: { id: Number(id) },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });  
}


async function getProductsWithFilter(query) {
  const {
    search,
    category,
    minPrice,
    maxPrice
  } = query;

  return prisma.products.findMany({
    where: {
      isDeleted: false,

      // SEARCH (nama produk)
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      }),

      // FILTER KATEGORI
      ...(category && {
        category: {
          equals: category,
          mode: "insensitive"
        }
      }),

      // FILTER HARGA
      ...(minPrice || maxPrice ? {
        price: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) })
        }
      } : {})
    },

    include: {
      farmer: {
        select: {
          farmName: true,
          address: true,
          productsType: true
        }
      }
    },

    orderBy: {
      createdAt: "desc"
    }
  });
}

module.exports = { 
    getProductById,
    getProductsByFarmerId,
    createProduct,
    editProduct,
    updateProduct,
    deleteProduct,
    getProductsWithFilter
};