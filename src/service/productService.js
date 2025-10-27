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
        where: { farmerId: Number(farmerId) }
    });
}

async function getProductById(id) {
return prisma.products.findUnique({
    where:{id : Number(id)},
    include :{ 
        farmer:{
            select:{
                farmName: true,
                address: true,
                productsType: true
                }        
            }
        }
    })  
}

async function createProduct(data) {
    const newProduct = await prisma.products.create({
      data: {
        name: data.name,
        price: Number(data.price),
        stock: Number(data.stock),
        unit: data.unit,
        image: data.image,
        description: data.description,
        category: data.category,
        farmerId: data.farmerId,
      },
    });
    return newProduct;
}

async function editProduct(id) {
    return getProduct = await prisma.products.findUnique({
      where: { id: Number(id) },
    });
    
}

async function updateProduct(id, data) {
  const updateProduct = await prisma.products.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      price: Number(data.price),
      stock: Number(data.stock),
      image: data.image,
      description: data.description,
      category: data.category,
    },
  });

        return updateProduct;
}
async function deleteProduct(farmerId) {
    return prisma.products.delete({
        where: { id: Number(farmerId) },
    });
  
}


async function searchProduct(keyword, category) {
    return prisma.products.findMany({
        where: {
            name: {
                contains: keyword ? keyword : {},
                mode: 'insensitive',
            },
            AND: {
                category: {
                    equals: category && category !== 'all' ? { category: category } : undefined,
                },
            },
        },
        include: {
            farmer: {
                select: {
                    farmName: true,
                    address: true,
                    productsType: true,
                    location: true
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 20,
    });
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