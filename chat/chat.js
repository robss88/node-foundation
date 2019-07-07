const { generateMessage } = require("./message");
const { isRealString } = require("./validation");
const { Users } = require("./users");
const socketIO = require("socket.io");

module.exports = {
  start: function(server) {
    const io = socketIO(server);
    const chatUsers = new Users();

    io.on("connection", socket => {
      console.log("New user connected");

      socket.on("join", (params, callback) => {
        console.log(params);
        if (!isRealString(params.user.username) || !isRealString(params.room)) {
          return callback("Username and room name are required");
        }

        socket.join(params.room);
        chatUsers.removeUser(socket.id);
        chatUsers.addUser(socket.id, params.user, params.room);

        io.to(params.room).emit(
          "updateUserList",
          chatUsers.getUserList(params.room)
        );
        socket.emit(
          "newMessage",
          generateMessage({ username: "Admin" }, "Welcome to the chat room")
        );
        socket.broadcast
          .to(params.room)
          .emit(
            "newMessage",
            generateMessage(
              { username: "Admin" },
              `${params.user.username} has joined.`
            )
          );

        if (callback) {
          callback();
        }
      });

      socket.on("createMessage", (message, callback) => {
        const user = chatUsers.getUser(socket.id);

        if (user && isRealString(message.text)) {
          io.to(user.room).emit(
            "newMessage",
            generateMessage(user.userData, message.text)
          );
        }

        if (callback) {
          callback("");
        }
      });

      socket.on("disconnect", () => {
        const user = chatUsers.removeUser(socket.id);

        if (user) {
          io.to(user.room).emit(
            "updateUserList",
            chatUsers.getUserList(user.room)
          );
          io.to(user.room).emit(
            "newMessage",
            generateMessage(
              { username: "Admin" },
              `${user.userData.username} has left`
            )
          );
        }
      });
    });
  }
};
