const router = require('express-promise-router')();
const BeatsController = require('../controllers/beats');
const passport = require('passport');
const passportConf = require('../passport');

const {
    validateParam,
    validateBody,
    schemas
} = require('../helpers/routeHelpers')

const passportSignIn = passport.authenticate('local', {
    session: false,
    failWithError: true
});
const passportJWT = passport.authenticate('jwt', {
    session: false,
    failWithError: true
});

router.route('/')
    .get(passportJWT, BeatsController.userIndex, BeatsController.publicIndex)
    .post(passportJWT, validateBody(schemas.beatSchema),
        BeatsController.newBeat);

router.route("/id/:beatId")
    .get([passportJWT, validateParam(schemas.idSchema, "beatId")],
        BeatsController.getUserBeat, BeatsController.getPublicBeat)
    .put([passportJWT, validateParam(schemas.idSchema, "beatId"),
            validateBody(schemas.patchBeatSchema)
        ],
        BeatsController.replaceBeat)
    .patch([passportJWT, validateParam(schemas.idSchema, "beatId"),
            validateBody(schemas.patchBeatSchema)
        ],
        BeatsController.replaceBeat)
    .delete(passportJWT, validateParam(schemas.idSchema, "beatId"), BeatsController.deleteBeat)


router.route('/file')
    .post(passportJWT,
        BeatsController.newBeatFromFiles);

module.exports = router;