const Beat = require('../models/beat');
const User = require('../models/user');

module.exports = {
    userIndex: async (req, res, next) => {
        const owner = await User.findById(req.user.id);
        const beats = await Beat.find({
            $or: [{
                    public: true
                },
                {
                    owner: owner
                }
            ]
        });
        res.status(200).json({
            beats
        })
    },

    publicIndex: async (err, req, res, next) => {
        const beats = await Beat.find({
            public: true
        });
        res.status(200).json(beats)
    },

    newBeatFromFiles: async (req, res, next) => {
        const owner = await User.findById(req.user.id);
        if (!req.files) {
            res.status(400).json({
                error: "no files"
            });
        }
        if (req.files.uploads.length > 1) {
            for (const file of req.files.uploads) {
                await beatFromFile(file, owner, res);
            }
        } else {
            await beatFromFile(req.files.uploads, owner, res);
        }
        res.status(200).json({
            success: true
        });
    },

    newBeat: async (req, res, next) => {
        const owner = await User.findById(req.user.id);

        const newBeat = req.value.body;
        delete newBeat.owner;

        const beat = new Beat(newBeat);
        beat.owner = owner;

        const file = req.files.uploads;

        if (!file || Array.isArray(file)) {
            res.status(400).json({
                error: "must have 1 file"
            });
        }
        console.log(req.files);
        if (file) {
            await uploadFile(file, beat, res)
        }

        await beat.save();

        owner.beats.push(beat);
        await owner.save();

        res.status(201).json(beat);
    },

    getUserBeat: async (req, res, next) => {
        const beat = await Beat.findById(req.value.params.beatId);
        if (beat.public == true || beat.owner == req.user.id) {
            return res.status(200).json(beat);
        }
        res.status(400).json({
            error: "unauthorized"
        });
    },

    getPublicBeat: async (err, req, res, next) => {
        const beat = await Beat.findById(req.params.beatId);
        if (beat.public == true) {
            return res.status(200).json(beat);
        }
        res.status(400).json({
            error: "unauthorized"
        });
    },

    replaceBeat: async (req, res, next) => {
        const {
            beatId
        } = req.value.params;
        const newBeat = req.value.body;
        const beat = await Beat.findById(beatId);
        if (req.user.id != beat.owner) {
            return res.status(401).json({
                error: "unaurthorized"
            });
        }

        const result = await Beat.findByIdAndUpdate(beatId, newBeat);
        res.status(200).json({
            success: true
        });
    },

    deleteBeat: async (req, res, next) => {
        const {
            beatId
        } = req.value.params;

        const beat = await Beat.findById(beatId);
        if (!beat) {
            return res.status(404).json({
                error: "beat doesn't exist"
            });
        }
        if (req.user.id != beat.owner) {
            return res.status(401).json({
                error: "unaurthorized"
            });
        }
        const ownerId = beat.owner;
        await beat.remove();

        const owner = await User.findById(ownerId);
        if (owner) {
            owner.beats.pull(beat);
            await owner.save();
        }

        res.status(200).json({
            success: true
        });
    },
}

async function uploadFile(file, beat, res) {
    var fs = require('fs');
    var dir = './uploads/' + beat.owner.id + "/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    file.mv(dir + beat.id, function (err) {
        if (err) {
            return res.status(500).json({
                error: err
            });
        }
        console.log("UPLOADED");
        return;
    });
}

async function beatFromFile(file, owner, res) {
    const beat = new Beat();
    beat.name = file.name;
    beat.owner = owner;

    await beat.save();

    await uploadFile(file, beat, res);

    owner.beats.push(beat);
    await owner.save();

    return;
}