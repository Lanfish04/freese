const prisma = require("../config/prisma");
const { NotFound, BadRequest, Forbidden } = require("../error/errorFactory");

async function addToCart(userId, data) {
    const product = await prisma.products.findUnique({
        where: { id: Number(data.productId) }
    });
    if (!product) {
        throw NotFound("Produk tidak ditemukan");
    }
    if (product.isDeleted) {
        throw NotFound("Produk tidak ditemukan");
    }
const buyer = await prisma.buyers.findUnique({
  where: { userId: userId }});  
    
    if (!buyer) {
        throw NotFound("Pembeli tidak ditemukan");
    }
    if (buyer.userId !== userId) {
        throw Forbidden("Forbidden");
    }

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
            include: {
            product: {
                select : {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    unit: true,
                    category: true,
                    description: true,
                    isDeleted : false
                }
            } }
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
            select : {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    unit: true,
                    category: true,
                    description: true,
                    isDeleted : false
                }
         }
        }
        });
}

async function getCartByUserId(id) {
    const buyer = await prisma.buyers.findUnique({
    where: { userId: id }});
    if (!buyer) {
        throw NotFound("Pembeli tidak ditemukan");
    }
    if (buyer.userId !== id) {
        throw Forbidden("Forbidden");
    }
    
    return prisma.cart.findMany({
        where: { buyerId : buyer.id,
            product : {
                isDeleted : false
            }
         },
        include: {
            product: {
                select : {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    unit: true,
                    category: true,
                    description: true,
                }
            }
        }
        
    });
}

async function showEditCart(userId, cartId) {
    const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }});
    if (!buyer) {
        throw NotFound("Pembeli tidak ditemukan");
    }
    if (buyer.userId !== userId) {
        throw Forbidden("Forbidden");
    }

    const cartItem = await prisma.cart.findUnique({
        where: {
            id : Number(cartId),
            buyerId : buyer.id,
            
         },
        include: {
            product: {
                select : {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    unit: true,
                    category: true,
                }
            }
        }
    });
    if (!cartItem) {
        throw NotFound("Item keranjang tidak ditemukan");
    }
    return cartItem;

}

async function updateCartItem(userId, cartId, quantity) {
    const buyer = await prisma.buyers.findUnique({
  where: { userId: userId }});
    if (!buyer) {
        throw NotFound("Pembeli tidak ditemukan");
    } 
    if (buyer.userId !== userId) {
        throw Forbidden("Forbidden");
    }
    const cartItem = await prisma.cart.findFirst({
        where: {
            id : Number(cartId),
            buyerId : buyer.id,
         }
    });
    if (!cartItem) {
        throw NotFound("Item keranjang tidak ditemukan");
    }

    const stockProduct = await prisma.products.findUnique({
        where: { id: cartItem.productId }
    });
    if (quantity <= 0) {
        throw BadRequest("Kuantitas harus lebih besar dari 0");
    }
    if (quantity > stockProduct.stock) {
        throw BadRequest("Stok produk tidak mencukupi");
    }


    return prisma.cart.update({
        where: { id: cartItem.id },
        data: { quantity: Number(quantity) },
        include: { product: {
            select : {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    unit: true,
                    category: true,
                    description: true,
                    isDeleted : false
                }
        } }
    });
}

async function removeCartItem(userId, cartId) {
    const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }});
    if (!buyer) {
        throw NotFound("Pembeli tidak ditemukan");
    }
    if (buyer.userId !== userId) {
        throw Forbidden("Forbidden");
    }

    const cartItem = await prisma.cart.findFirst({
        where: {
            id : Number(cartId),
            buyerId : buyer.id
         }
    });
    
    if (!cartItem) {
        throw NotFound("Item keranjang tidak ditemukan");
    }

    return prisma.cart.delete({
        where: { id: cartItem.id}
    });
}

async function deleteAllItem(userId) {
 const buyer = await prisma.buyers.findUnique({
    where: { userId: userId }});
    if (!buyer) {
        throw NotFound("Pembeli tidak ditemukan");
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
        throw NotFound("Buyer tidak ditemukan");
    }
    if (buyer.userId !== userId){
        throw Forbidden("Forbidden");
    }

    const cartItem = await prisma.cart.findFirst({
        where : {
            id : Number(cartId),
            buyerId : buyer.id}
});
    if (!cartItem){
        throw NotFound("Item tidak ditemukan");
    }

    return prisma.cart.update({
        where : {id : Number(cartId)},
        data : { isSelected : Boolean(isSelected) },
        include : {product:{
            select : {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    unit: true,
                    category: true,
                    description: true,
                    isDeleted : false
                }
        }}
    });
}

module.exports = {
    addToCart,
    showEditCart,
    getCartByUserId,
    updateCartItem,
    removeCartItem,
    deleteAllItem,
    selectionItemCart
};