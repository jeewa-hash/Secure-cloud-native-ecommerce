import User from '../models/User.js';

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public (or protected depending on requirements, kept public for inter-service calls)
/*
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user._id,
            username: user.userName,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            phone: user.phone
        });
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Get all shops
// @route   GET /api/users/shops
// @access  Public
export const getShops = async (req, res) => {
    try {
        const shops = await User.find({ role: 'shop' }).select('-password');

        const formattedShops = shops.map(shop => ({
            id: shop._id,
            username: shop.userName,
            name: `${shop.firstName} ${shop.lastName}`,
            email: shop.email,
            phone: shop.phone
        }));

        res.status(200).json(formattedShops);
    } catch (error) {
        console.error("Get Shops Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


*/

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public / Protected depending on architecture
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user._id,
            username: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            phone: user.phone
        });
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Update customer profile
// @route   PUT /api/users/:id
// @access  Protected
export const updateUserProfile = async (req, res) => {
    try {
        const { userName, firstName, lastName, phone } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.userName = userName ?? user.userName;
        user.firstName = firstName ?? user.firstName;
        user.lastName = lastName ?? user.lastName;
        user.phone = phone ?? user.phone;
        user.updatedAt = new Date();

        const updatedUser = await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                username: updatedUser.userName,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone
            }
        });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Get all shops
// @route   GET /api/users/shops
// @access  Public
export const getShops = async (req, res) => {
    try {
        const shops = await User.find({ role: 'shop' }).select('-password');

        const formattedShops = shops.map((shop) => ({
            id: shop._id,
            username: shop.userName,
            name: `${shop.firstName} ${shop.lastName}`,
            email: shop.email,
            phone: shop.phone
        }));

        res.status(200).json(formattedShops);
    } catch (error) {
        console.error('Get Shops Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
