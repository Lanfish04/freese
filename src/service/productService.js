// const prisma = require('../config/prisma');


// async function getProducts() {
//     return prisma.Products.findMany();
// }

// async function getProductById(id) {
// return prisma.Products.findUnique({
//     where:{id : Number(id)}
// })  
// }
// async function createProduct(data) {
//     try {
//         const newProduct = await prisma.products.create({      
//             data: {
//                 name : data.name,
//                 price : data.price,
//                 stock : data.stock,
//                 image : data.image,
//                 description : data.description,
//                 farmer: {
//                 connect: { id: data.farmerId }// Hubungkan ke farmer
//             }
//         }
//      });
    
//         console.log("Product created successfully:", newProduct);
//         return newProduct
//     } catch (error) {
//         console.error("Error creating product:", error);
//         throw error;
//     }
// }

// async function updateProduct(req, res) {
  
// }
// async function deleteProduct(req, res) {
  
// }
// module.exports = { 
//     getProducts,
//     getProductById,
//     createProduct,
//     updateProduct,
//     deleteProduct
// };