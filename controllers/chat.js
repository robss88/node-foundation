const User = require('../models/user');

module.exports = {
    chatInvite: async (req, res) => {
        const roomId = req.params.roomId;

        const user = await User.findById(req.user.id);
        if (!user.chatRooms.includes(roomId)) {
            user.chatRooms.push(roomId);
        }
        await user.save()

        const invitee = await User.findById(req.params.userId);
        if (!invitee.chatRooms.includes(roomId)) {
            invitee.chatRooms.push(roomId);
        }

        await invitee.save()
        res.status(200);
    }
}