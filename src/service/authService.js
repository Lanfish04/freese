const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

async function findUser(email) {
    return prisma.users.findUnique({
        where: { email }
    });
}
async function addUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.users.create({
        data: {
            email: data.email,
            password: hashedPassword,
            full_name: data.full_name,
            phone: data.phone,
            role: data.role // Assuming role is part of the user data
        }
    });
}


module.exports = {
    findUser,
    addUser
};