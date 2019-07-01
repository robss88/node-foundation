const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../passport');

const {
    validateBody,
    validateParam,
    schemas
} = require('../helpers/routehelpers');
const UsersController = require('../controllers/users');

const passportSignIn = passport.authenticate('local', {
    session: false,
    failWithError: true
});
const passportJWT = passport.authenticate('jwt', {
    session: false,
    failWithError: true
});

router.route("/")
    .get(passportJWT, UsersController.index)

router.route('/signup')
    .post(validateBody(schemas.signUpSchema), UsersController.signUp);

router.route('/signin')
    .post(validateBody(schemas.signInSchema), passportSignIn, UsersController.signIn);

router.route("/:userId")
    .get(validateParam(schemas.idSchema, "userId"), UsersController.getUser)
    .put([passportJWT, validateParam(schemas.idSchema, "userId"),
            validateBody(schemas.userSchema)
        ],
        UsersController.replaceUser)
    .patch([passportJWT, validateParam(schemas.idSchema, "userId"),
            validateBody(schemas.userOptionalSchema)
        ],
        UsersController.updateUser)
    .delete([passportJWT, validateParam(schemas.idSchema, "userId")],
        UsersController.deleteUser);

module.exports = router