const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const {
    ExtractJwt
} = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;

const {
    JWT_SECRET
} = require('./configuration');
const User = require('./models/user');

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET
}, async (payload, done) => {
    try {
        // Find the user specified in token
        const user = await User.findById(payload.sub)

        // If user doesn't exist handle
        if (!user) {
            return done(null, false);
        }

        // Return user
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try {
        // Find the user given the email
        const user = await User.findOne({
            email
        });
        // If user doesn't exist handle
        if (!user) {
            return done(null, false);
        }
        // Check if the password is correct
        const isMatch = await user.isValidPassword(password);

        // If not, handle it
        if (!isMatch) {
            return done(null, false);
        }
        // return user
        return done(null, user);
    } catch (error) {
        done(error, false);
    }
}));