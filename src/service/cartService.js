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
         product: true
        }
        });
}

// async function updatedStock(userId, data) {
//     const buyer = await prisma.buyers.findUnique({
//     where: { userId: userId }});

//     const productStock = await prisma.products.findUnique({
//         where: {id : Number(data.productId)}
//     })

//     const decreasedStock = prisma.products.update({
//         where: { id: Number(data.productId) },
//         data: { stock: productStock.stock - (data.quantity) },
//     });

//     if (decreasedStock < 0) {
//         throw new Error("Stok produk tidak mencukupi"); 
//     }
//     return decreasedStock;
    
// }

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

async function updateCartItem(userId, data) {
    const buyer = await prisma.buyers.findUnique({
  where: { userId: userId }});
    const cartItem = await prisma.cart.findFirst({
        where: {
            buyerId : buyer.id,
            productId : Number(data.productId)
         }
    });
    if (!buyer) {
        throw new Error("Pembeli tidak ditemukan");
    } 

    if (!cartItem) {
        throw new Error("Item keranjang tidak ditemukan");
    }

    const stockProduct = await prisma.products.findUnique({
        where: { id: cartItem.productId }
    });
    if (data.quantity <= 0) {
        throw new Error("Kuantitas harus lebih besar dari 0");
    }
    if (data.quantity > stockProduct.stock) {
        throw new Error("Stok produk tidak mencukupi");
    }


    return prisma.cart.update({
        where: { id: cartItem.id },
        data: { quantity: Number(data.quantity) },
        include: { product: true }
    });
}

async function removeCartItem(userId, productId) {

    const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }});
    const cartItem = await prisma.cart.findFirst({
        where: {
            buyerId : buyer.id,
            productId : Number(productId)
         }
    });
    if (!buyer) {
        throw new Error("Pembeli tidak ditemukan");
    } 

    if (!cartItem) {
        throw new Error("Item keranjang tidak ditemukan");
    }

    return prisma.cart.delete({
        where: { id: cartItem.id}
    });
}

async function deleteAllItem(userId) {
 const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }});
    if (!buyer) {
        throw new Error("Pembeli tidak ditemukan");
    } 

    return prisma.cart.deleteMany({
        where: { buyerId : buyer.id }
    });
}


async function selectionItemCart(userId, cartId, isSelected) {
    const buyer = await prisma.buyers.findUnique({
        where:{userId : userId},   
    });
    
    if (!buyer){
        throw new Error ("Buyer tidak ditemukan");
    }

    const cartItem = await prisma.cart.findFirst({
        where : {
            id : Number(cartId),
            buyerId : buyer.id}
});
    if (!cartItem){
        throw new Error ("Item tidak ditemukan");
    }

    return prisma.cart.update({
        where : {id : Number(cartId)},
        data : { isSelected : Boolean(isSelected) },
        include : {product:true}
    });
}

module.exports = {
    addToCart,
    getCartByUserId,
    updateCartItem,
    removeCartItem,
    deleteAllItem,
    selectionItemCart
};