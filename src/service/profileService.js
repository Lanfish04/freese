const prisma = require("../config/prisma");

async function getProfileById(id) {
    const Finduser = await prisma.users.findUnique({
        where: { id: Number(id) }
    });
    if(!Finduser){
        return null;
    }
    if (Finduser.role === "FARMER") {
        return prisma.users.findUnique({
            where: { id: Number(id) },
            include: {
                Farmers: {
                    select: {
                        farmName: true,
                        address: true,
                        productsType: true
                    }
                }
            }
        });
    } else if (Finduser.role === "BUYER") {
        return prisma.users.findUnique({
            where: { id: Number(id) },
            include: {
                Buyers: {
                    select: {
                        businessName: true,
                        businessType: true,
                        address: true
                    }
                }
            }
        });

    } else {
        return null;
}
}


async function updateProfileById(id, data) {
    const user = await prisma.users.findUnique({
        where: { id: Number(id) }
    });

    if (!user) return null;

    if (user.role === "FARMER") {
    return prisma.users.update({
        where: { id: Number(id) },
        data: {
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.email && { email: data.email }),
            ...(data.phone && { phone: data.phone }),
            Farmers: (data.farmName || data.address || data.productsType)
                ? {
                    update: {
                        ...(data.farmName && { farmName: data.farmName }),
                        ...(data.address && { address: data.address }),
                        ...(data.productsType && { productsType: data.productsType })
                    }
                }
                : undefined
        },
        include: {
            Farmers: true
        }
    });
}

if (user.role === "BUYER") {
    return prisma.users.update({
        where: { id: Number(id) },
        data: {
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.email && { email: data.email }),
            ...(data.phone && { phone: data.phone }),
            Buyers: (data.businessName || data.businessType || data.address)
                ? {
                    update: {
                        ...(data.businessName && { businessName: data.businessName }),
                        ...(data.businessType && { businessType: data.businessType }),
                        ...(data.address && { address: data.address })
                    }
                }
                : undefined
        },
        include: {
            Buyers: true
        }
    });
}

    return null;
}



module.exports = {
    getProfileById,
    updateProfileById,
};