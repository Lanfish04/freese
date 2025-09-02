const prisma = require("../config/prisma");

async function getProfileById(id, res) {
    const user = await prisma.users.findUnique({
        where: { id: Number(id) }
    });
    if (user.role === "Farmer") {
        return prisma.users.findUnique({
            where: { id: Number(id) },
            include: {
                farmer: {
                    select: {
                        farmName: true,
                        address: true,
                        productsType: true
                    }
                }
            }
        });
    } else if (user.role === "Buyer") {
        return prisma.users.findUnique({
            where: { id: Number(id) },
            include: {
                buyer: {
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