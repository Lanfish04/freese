const prisma = require("../config/prisma");

async function getProfileById(id) {
    const Finduser = await prisma.users.findUnique({
        where: { id: Number(id) },
        

    });
    if(!Finduser){
        return null;
    }
    if (Finduser.role === "FARMER") {
        return prisma.users.findUnique({
            where: { id: Number(id) },
            select: { 
            full_name: true,
            phone: true,
            email: true,
            role: true,
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
            select: { 
            full_name: true,
            phone: true,
            email: true,
            role: true,
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


async function getMyAkunProfile(id) {
    return prisma.users.findUnique({
        where: { id: Number(id) },
        select: {   
            email: true,
            password: true
        }
    });
}


async function updateMyDataProfile(id, data) {
    const user = await prisma.users.findUnique({
        where: { id: Number(id) }
    });

    if (!user) return null;

    if (user.role === "FARMER") {
    return prisma.users.update({
        where: { id: Number(id) },
        data: {
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.phone && { phone: data.phone }),
            Farmers: (data.farmName || data.address || data.productsType)
                ? {
                    update: {
                        ...(data.farmName && { farmName: data.farmName }),
                        ...(data.address && { address: data.address }),
                        ...(data.productsType && { productsType: data.productsType }),
                        ...(data.location && { location: data.location })
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
            ...(data.phone && { phone: data.phone }),
            Buyers: (data.businessName || data.businessType || data.address)
                ? {
                    update: {
                        ...(data.businessName && { businessName: data.businessName }),
                        ...(data.businessType && { businessType: data.businessType }),
                        ...(data.address && { address: data.address }),
                        ...(data.location && { location: data.location })
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

async function updateMyAkunProfile(id, data) {
    return prisma.users.update({
        where: { id: Number(id) },
        data: {
            ...(data.email && { email: data.email }),
            ...(data.password && { password: data.password })
        }
    });
}
            

async function deleteProfileById(id) {
    return prisma.users.delete({
        where: { id: Number(id) }
    });
}


module.exports = {
    getProfileById,
    getMyAkunProfile,
    updateMyDataProfile,
    updateMyAkunProfile,
    deleteProfileById

};