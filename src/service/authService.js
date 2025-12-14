const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

async function validateUser(email) {
    const user = prisma.users.findUnique({
        where: { email }
    });
    return user;    

}
async function addUser(data) {
    const password = data.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const photoUrl = `https://storage.googleapis.com/user-photos/profileDefault.png`;
    if (!data.photo) {
        data.photo = photoUrl;
    }

    const newUser = await prisma.users.create({
        data: {
            email: data.email,
            password: hashedPassword,
            full_name: data.full_name,
            phone: data.phone,
            photo: data.photo,
            role: data.role
        },
    });

    if (data.role === "FARMER") {
        await prisma.farmers.create({
            data: {
                userId: newUser.id,
                farmName: data.farmName,
                address: data.address,
                productsType: data.productsType
            }
        });
    }

    if (data.role === "BUYER") {
        await prisma.buyers.create({
            data: {
                userId: newUser.id,
                businessName: data.businessName,
                businessType: data.businessType,
                address: data.address
            }
        });
    }

    return newUser; // selalu return user, bukan farmers/buyers
}

module.exports = {
    validateUser,
    addUser
};