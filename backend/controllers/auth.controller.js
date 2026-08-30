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

        // DEMO MOCK — works without DB for 3 demo accounts
        const demoUsers = {
            "rohan.das@example.com": { id: "demo-customer-1", name: "Rohan Das", role: "CUSTOMER" },
            "rahul.sharma@example.com": { id: "demo-provider-1", name: "Rahul Sharma", role: "PROVIDER" },
            "admin@example.com": { id: "demo-admin-1", name: "Admin", role: "ADMIN" }
        };
        if (demoUsers[email] && password === "password123") {
            const mock = demoUsers[email];
            const token = generateToken({ id: mock.id, name: mock.name, email, role: mock.role });
            res.cookie("token", token, {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                maxAge: 3600000,
            });
            return res.status(200).json({ message: "Login successful", token, user: mock });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        if (user.status === "BLOCKED") {
            return res.status(403).json({ message: "Your account is BLOCKED by admin. Contact support." });
        }
        if (user.status === "SUSPENDED") {
            return res.status(403).json({ message: "Your account is suspended." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = generateToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        res.cookie("token", token, {
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
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