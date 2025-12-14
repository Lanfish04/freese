const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

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
            photo: true,
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


async function updateMyDataProfile(userId, data) {
    const user = await prisma.users.findUnique({
        where: { id: Number(userId) }
    });

    if (!user){
        throw new Error("User tidak ditemukan");
    }

    if (user.role === "FARMER") {
    return prisma.users.update({
        where: { id: Number(userId) },
        data: {
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.phone && { phone: data.phone }),
            ...(data.photo && { photo: data.photo }),
            Farmers: (data.farmName || data.address || data.productsType || data.location)
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
        where: { id: Number(userId) },
        data: {
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.phone && { phone: data.phone }),
            ...(data.photo && { photo: data.photo }),
            Buyers: (data.businessName || data.businessType || data.address || data.location)
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

//Ganti password user
async function changeMyPasswordProfile(id, data) {
    const userLama = await prisma.users.findUnique({
        where: { id: Number(id) }
    });

    if (!userLama) {
        throw new Error("User tidak ditemukan");
    }

    const oldPassword = data.oldPassword;
    const newPassword  = data.newPassword

    if (!oldPassword || !newPassword) {
        throw new Error("Password lama dan password baru wajib diisi");
    }

    // cek password lama
    const isMatch = await bcrypt.compare(oldPassword, userLama.password);
    if (!isMatch) {
        throw new Error("Password lama salah");
    }

    // cegah password lama dipakai ulang
    const isSamePassword = await bcrypt.compare(newPassword, userLama.password);
    if (isSamePassword) {
        throw new Error("Password baru tidak boleh sama dengan password lama");
    }

    if (newPassword.length < 8) {
        throw new Error("Password baru minimal 8 karakter");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateAkun = await prisma.users.update({
        where: { id: Number(id) },
        data: {
            password: hashedPassword
        }
    });

    return updateAkun;
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
    changeMyPasswordProfile, 
    deleteProfileById

};