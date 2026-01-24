const authService = require("../service/authService");
const tokenUtils = require("../utils/jwt");

async function login(req, res, next) {
  try {
    const user = await authService.validateUser(req.body);
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
  } catch (error) {
    next(error); 
  }
}


async function register(req, res, next) { 
    try {
        const { email, password, full_name, phone, role, photo } = req.body;
        const newUser = await authService.addUser({ email, password, full_name, phone, photo, role });
        return res.status(201).json({
            message: "Registrasi berhasil",
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    register
};
