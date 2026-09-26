import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

// Register Validation Schema
const registerSchema = Joi.object({
    userName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid('customer', 'shop').default('customer'),
    phone: Joi.string().optional()
});

// Login Validation Schema
const loginSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required()
});

export const register = async (req, res) => {
    try {
        // 1. Validate request body
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { userName, email, password, firstName, lastName, role, phone } = value;

        // 2. Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
        if (existingUser) {
            return res.status(409).json({ message: "User with given email or username already exists!" });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create new user
        const newUser = new User({
            userName,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: role || 'customer',
            roles: role ? [role] : ['customer'], // Synchronize roles array with primary role
            phone
        });

        await newUser.save();

        // 5. Send success response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        // 1. Validate request
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { userName, password } = value;

        // 2. Find user by userName or email
        const user = await User.findOne({ $or: [{ userName: userName }, { email: userName }] });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is disabled. Please contact support." });
        }

        // 3. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 4. Generate JWT
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET environment variable is required');
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createInitialAdmin = async () => {
    try {
        const adminUsername = process.env.INITIAL_ADMIN_USERNAME;
        const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
        const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

        if (!adminUsername || !adminEmail || !adminPassword) {
            console.log("Initial admin credentials are not configured.");
            return;
        }

        const existingAdmin = await User.findOne({
            $or: [
                { userName: adminUsername },
                { email: adminEmail }
            ]
        });

        if (existingAdmin) {
            console.log("Initial admin already exists.");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const admin = new User({
            userName: adminUsername,
            email: adminEmail,
            password: hashedPassword,
            firstName: "System",
            lastName: "Administrator",
            role: "admin",
            roles: ["admin"]
        });

        await admin.save();

        console.log("Initial admin account created.");
    } catch (error) {
        console.error("Initial admin creation failed:", error);
    }
};

export const createAdmin = async (req, res) => {
    try {
        const { userName, email, password, firstName, lastName, phone } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { userName }]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User with given email or username already exists!"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({
            userName,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: "admin",
            roles: ["admin"],
            phone
        });

        await newAdmin.save();

        res.status(201).json({
            message: "Admin created successfully",
            user: {
                id: newAdmin._id,
                userName: newAdmin.userName,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });

    } catch (error) {
        console.error("Create Admin Error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
