const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");

const http = require("http");

// MongoDB
const { DB_URL, PORT } = require("./configuration");

mongoose.Promise = global.Promise;
mongoose.connect(DB_URL);

const app = express();
app.use(helmet());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
  })
);

// Middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());

// Routes
const users = require("./routes/users");
const chat = require("./routes/chat");

app.use("/users", users);
app.use("/chat", chat);

// Catch 404
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler function
app.use((err, req, res, next) => {
  const error = app.get("env") === "development" ? err : {};
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
const ChatServer = require("./chat/chat");
ChatServer.start(server);

// Start the server
const port = process.env.PORT || PORT;
server.listen(port);
console.log("Server listening at " + port);
