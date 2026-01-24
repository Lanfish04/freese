const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const { NotFound, Forbidden, BadRequest } = require("../error/errorFactory");

async function validateUser(data) {
    const user = await prisma.users.findUnique({
        where: { email: data.email }
    });
    
    if (!user) {
        throw BadRequest("Email atau password salah");
    }
    if (data.password.length < 8) {
        throw BadRequest("Password harus memiliki minimal 8 karakter");
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
    throw BadRequest("Email atau password salah");
    }

    return user;    
}

async function addUser(data) {
    if (!data.email || !data.password || !data.full_name || !data.phone || !data.role) {
    throw BadRequest("Semua field wajib diisi");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const existingUser = await prisma.users.findUnique({
    where: { email: data.email }
    });    
    if (data.email === existingUser) {
        throw BadRequest("Email sudah terdaftar");
    }
   
    if (!emailRegex.test(data.email)) {
    throw BadRequest("Email tidak valid");
    }

    if (data.password.length < 8) {
    throw BadRequest("Password minimal 8 karakter");
   }

    if (data.role !== "BUYER" && data.role !== "FARMER") {
    throw BadRequest("Role tidak valid");
    }     

    const photoUrl = `https://storage.googleapis.com/user-photos/profileDefault.png`; 
    if (!data.photo) {
        data.photo = photoUrl;
    }  
    const hashedPassword = await bcrypt.hash(data.password, 10);
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
