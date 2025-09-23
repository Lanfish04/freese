const prisma = require("../config/prisma");

async function getProfileById(id) {
    const Finduser = await prisma.users.findUnique({
        where: { id: Number(id) }
    });
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
        return res.json({ error: "Role tidak dikenali" });
}
}


async function updateProfile(id, data) {
    try {
        const role = await prisma.users.findUnique({
            where: { id: Number(id) },
        });
        if (!role) {
            throw new Error("User not found");
        }
        else if (role.role === "Farmer") {
          const updatedProfile = await prisma.users.update({
            where: { id: Number(id) },
            data: {
                full_name: data.full_name,
                phone: data.phone,
                email: data.email // Assuming email can be updated
            }
        });
        return updatedProfile; 
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
}


module.exports = {
    getProfileById,
    updateProfile
};