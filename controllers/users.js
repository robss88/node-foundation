const JWT = require('jsonwebtoken');
const User = require('../models/user');

const {
    JWT_SECRET,
    JWT_ISSUER
} = require('../configuration');

const signToken = (user) => {
    return JWT.sign({
        iss: JWT_ISSUER,
        sub: user.id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1)
    }, JWT_SECRET);
};

module.exports = {

    signUp: async (req, res) => {
        const {
            email,
            password,
            username
        } = req.value.body;
        
        // Check if user exist with same email
        const foundEmail = await User.findOne({
            email
        });
        if (foundEmail) {
            return res.status(403).json({
                error: 'Email is already in use'
            });
        }
        // Check if user exist with same username
        const foundUsername = await User.findOne({
            username
        });
        if (foundUsername) {
            return res.status(403).json({
                error: 'Username is already in use'
            });
        }

        // Create a new user
        const newUser = new User({
            email,
            password,
            username
        });
        await newUser.createPasswordHash();
        await newUser.save();

        // Generate token
        const token = signToken(newUser);

        // Respond with token
        res.status(201).json({
            token, user : newUser
        });
    },

    signIn: async (req, res) => {
        // Generate token
        const user = req.user;
        const token = signToken(user);
        res.status(200).json({
            token, user
        });
    },

    index: async (req, res) => {
        const users = await User.find({});
        res.status(200).json(users);
    },

    getUser: async (req, res) => {
        const {
            userId
        } = req.value.params;
        const user = await User.findById(userId);
        user.password = undefined;
        res.status(200).json(user);
    },

    replaceUser: async (req, res) => {
        const {
            userId
        } = req.value.params;
        if (req.user.id != userId) {
            return res.status(401).json({
                error: 'unaurthorized'
            });
        }
        const newUser = req.value.body;

        await User.findByIdAndUpdate(userId, newUser);
        res.status(200).json({
            success: true
        });
    },

    updateUser: async (req, res) => {
        const {
            userId
        } = req.value.params;
        if (req.user.id != userId) {
            return res.status(401).json({
                error: 'unaurthorized'
            });
        }
        const newUser = req.value.body;

        await User.findByIdAndUpdate(userId, newUser);
        res.status(200).json({
            success: true
        });
    },

    deleteUser: async (req, res) => {
        const {
            userId
        } = req.value.params;
        if (req.user.id != userId) {
            return res.status(401).json({
                error: 'unaurthorized'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'user doesn\'t exist'
            });
        }

        await user.remove();

        res.status(200).json({
            success: true
        });
    }
};