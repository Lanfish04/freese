const prisma = require('../config/prisma');
const product = require('../service/productService')

async function getProducts(req, res) {
    try {
        const products = await product.getProducts();
        res.status(200).json(products);
    }catch{

    }
  
}

async function getProductById(req, res) {
  
}
async function createProduct(req, res) {
    try {
    const { name, price, stock, image, description, farmerId } = req.body;
    const farmer = await prisma.farmers.findUnique({
        where: { id: farmerId },
    });
    if (!farmer) {
        return res.status(404).json({ error: "Farmer not found" });
    }   

    if (!name || !price || !stock) {
        return res.status(400).json({ error: "Nama, Harga dan Stock tidak boleh kosong" });
    }
        const newProduct = await product.createProduct(name, price, stock, image, description);

        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });

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