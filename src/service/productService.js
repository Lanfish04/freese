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
    try {
        const newProduct = await prisma.products.create({
      data: {
        name: data.name,
        price: Number(data.price),
        stock: Number(data.stock),
        image: data.image,
        description: data.description,
        category: data.category,
        farmerId: data.farmerId,
      },
    });
    
        console.log("Product created successfully:", newProduct);
        return newProduct
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

async function updateProduct(req, res) {
  
}
async function deleteProduct(req, res) {
  
}
module.exports = { 
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};