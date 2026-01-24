const bcrypt = require("bcrypt");
const authService = require("../service/authService");
const tokenUtils = require("../utils/jwt");

async function login(req, res) {
    try { 
        const { email, password } = req.body;
        const user = await authService.validateUser(email);

        if (!user) {
            return res.status(400).json({ message: "Email atau password salah" });
        }

        if (!password || password.length < 8) {
            res.status(400).json({ message: "Password harus memiliki minimal 8 karakter" });
                 }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!user || !isPasswordValid) {
        return res.status(400).json({ message: "Email atau password salah" });
        }
        const accessToken = tokenUtils.generateToken(user);
      return res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
        token: accessToken,
    });
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
}


async function register(req, res, next) { 
    try {
        const { email, password, full_name, phone, role, photo } = req.body;
        const existingUser = await authService.validateUser(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password harus memiliki minimal 8 karakter" });
        }
        if(!req.body.email || !req.body.password || !req.body.full_name || !req.body.phone || !req.body.role){
            return  res.status(400).json({ message: "Semua field wajib diisi" });
        }
        const newUser = await authService.addUser({ email, password, full_name, phone, photo, role });
        return res.status(201).json({
            message: "Registrasi berhasil",
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch () {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    login,
    register
};
