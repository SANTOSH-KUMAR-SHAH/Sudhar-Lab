const prisma = require('../utils/db');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

async function Signup(req, res) {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        if (!email.includes("@") || !email.includes(".com")) {
            return res.status(400).json({ message: "Invalid Email" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        if (!phone || phone.length < 10 || phone.length > 10) {
            return res.status(400).json({ message: "Invalid Phone Number" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || null
            
            }
        });
        console.log("Signup successful")
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role      
            }
        });

    } catch (err) {
        console.log("Error in signup Controller:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function Login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });
        localStorage.setItem("token", token);
        res.cookie("token", token, {
            httpOnly: process.env.NODE_ENV === 'production',
            // Use secure cookies only in production (HTTPS). In dev (http) this prevents cookie being set.
            secure: process.env.NODE_ENV === 'production',
            // When in production and cross-site, SameSite=None is required for cookies to be sent.
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            // domain : process.env.NODE_ENV === 'production' ? 'localhelpbackendv2.onrender.com' : 'localhost',
            maxAge: 3600000,
        });

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });

    } catch (err) {
        console.log("Error in login Controller:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
async function Logout(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });
        localStorage.removeItem("token");
        return res.status(200).json({ message: "Logged out successfully" });

    } catch (err) {
        console.error("Error in logout controller:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    signup: Signup,
    login: Login,
    logout: Logout
};