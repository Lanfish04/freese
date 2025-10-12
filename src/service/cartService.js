const prisma = require("../config/prisma");


async function addToCart(userId, data) {
    const product = await prisma.products.findUnique({
        where: { id: Number(data.productId) }
    });
    if (!product) {
        throw new Error("Product tidak ditemukan");
        
    }
    const buyer = await prisma.buyers.findUnique({
  where: { userId: userId }});  
    
    const existingCartItem = await prisma.cart.findFirst({
        where: {
            buyerId: buyer.id,
            productId: Number(data.productId)
        }
    });
    if (existingCartItem) {
        return prisma.cart.update({
            where: { id: existingCartItem.id },
            data: { quantity: existingCartItem.quantity + Number(data.quantity || 1) },
            include: { product: true }
        });
    }



    return prisma.cart.create({
        data: {
            buyerId: buyer.id,
            productId: Number(data.productId),
            quantity: data.quantity ? Number(data.quantity) : 1 
        },
        include: {
         product: {
            select: {
                id: true,
                name: true,
                price: true
                    }
                  }
             }
        });
}

async function updatedStock(userId, data) {
    const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }});

    const productStock = await prisma.products.findUnique({
        where: {id : Number(data.productId)}
    })

    const decreasedStock = prisma.products.update({
        where: { id: Number(data.productId) },
        data: { stock: productStock.stock - (data.quantity) },
    });

    if (decreasedStock < 0) {
        throw new Error("Stok produk tidak mencukupi"); 
    }
    return decreasedStock;
    
}

async function getCartByUserId(id) {
    const buyer = await prisma.buyers.findUnique({
  where: { userId: id }});
    return prisma.cart.findMany({
        where: { buyerId : buyer.id },
        include: {
            product: true
        }
        
    });
}

async function updateCartItem(id, quantity) {
    return prisma.cart.update({
        where: { id: Number(id) },
        data: { quantity: Number(quantity) },
        include: { product: true }
    });
}

async function removeCartItem(id) {
    return prisma.cart.delete({
        where: { id: Number(id) }
    });
}

module.exports = {
    addToCart,
    updatedStock,
    getCartByUserId,
    updateCartItem,
    removeCartItem
};