const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Create a schema
const userSchema = new Schema({
    email: String,
    username: String,
    password: {
        type: String,
        required: true
    }
});

userSchema.methods.createPasswordHash = async function (next) {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Generate password hash (salt + hash)
        const passwordHash = await bcrypt.hash(this.password, salt);
        // Re-assign hashed version over original
        this.password = passwordHash;
    } catch (error) {
        next(error);
    }
};

userSchema.methods.isValidPassword = async function (newPassword) {
    try {
        return await bcrypt.compare(newPassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

// Create a model
const User = mongoose.model('user', userSchema);
// Export the model

module.exports = User;