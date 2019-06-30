const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');

const http = require('http');
const socketIO = require('socket.io');
const { generateMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

// MongoDB
const {
    DB_URL,
    PORT
} = require('./configuration');

mongoose.Promise = global.Promise;
mongoose.connect(DB_URL);

const app = express();
app.use(helmet());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
const users = require('./routes/users')

app.use("/users", users);

// Catch 404
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler function
app.use((err, req, res, next) => {
    const error = app.get('env') === 'development' ? err : {};
    const status = err.status || 500;
    // Respond to client
    res.status(status).json({
        error: {
            message: error.message
        }
    });
    // Respond to ourselves
    console.error(err);
});

// SocketIO
const server = http.createServer(app);
const io = socketIO(server);
const chatUsers = new Users();

io.on('connection', (socket) => {
    console.log('New user connected');
  
    socket.on('join', (params, callback) => {
      if (!isRealString(params.username) || !isRealString(params.room)) {
        return callback('Username and room name are required');
      }
  
      socket.join(params.room);
      chatUsers.removeUser(socket.id);
      chatUsers.addUser(socket.id, params.username, params.room);
  
      io.to(params.room).emit('updateUserList', chatUsers.getUserList(params.room));
      socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat room'));
      socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.username} has joined.`));
  
      if (callback) {
        callback();
      }
    });
  
    socket.on('createMessage', (message, callback) => {
      const user = chatUsers.getUser(socket.id);
  
      if (user && isRealString(message.text)) {
        io.to(user.room).emit('newMessage', generateMessage(user.username, message.text));
      }
  
      if (callback) {
        callback('');
      }
    });
  
    socket.on('disconnect', () => {
      const user = chatUsers.removeUser(socket.id);
  
      if (user) {
        io.to(user.room).emit('updateUserList', chatUsers.getUserList(user.room));
        io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.username} has left`));
      }
    });
  });


// Start the server
const port = process.env.PORT || PORT;
server.listen(port);
console.log('Server listening at ' + port);