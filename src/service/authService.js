const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const { NotFound, Forbidden, BadRequest } = require("../error/errorFactory");

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
    const allowedRoles = ['BUYER', 'FARMER'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const existingUser = await validateUser(email);


    if (data.email === existingUser) {
           throw BadRequest ("Email sudah terdaftar");
        }
   
 if (!emailRegex.test(data.email)) {
    throw BadRequest("Email tidak valid");
    }

    if (!data.photo) {
        data.photo = photoUrl;
    }  

    if (data.role !== "BUYER" && data.role !== "FARMER") {
    throw BadRequest("Role tidak valid");
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
