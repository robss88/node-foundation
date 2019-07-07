require('../passport')
const router = require('express-promise-router')();
const passport = require('passport');

const {
    validateBody,
    validateParam,
    schemas
} = require('../helpers/routehelpers');
const ChatController = require('../controllers/chat');

const passportJWT = passport.authenticate('jwt', {
    session: false,
    failWithError: true
});

router.route("/:roomId/invite/:userId")
.post([passportJWT, validateParam(schemas.idSchema, "userId")], ChatController.chatInvite);

module.exports = router