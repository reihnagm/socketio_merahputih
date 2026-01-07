const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const { updatePaymentPaid, getEmailByInvoiceValue } = require("./model");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());

const connectedUsers = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.user_id;

  if (userId) {
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  } else {
    console.log("Client connected without user_id");
  }

  socket.on("payment-update", (data) => {
    console.log("payment-update", data);
  });

  socket.on("disconnect", () => {
    for (const [uid, sid] of Object.entries(connectedUsers)) {
      if (sid === socket.id) {
        delete connectedUsers[uid];
        console.log(`User ${uid} disconnected`);
        break;
      }
    }
  });
});

app.post("/midtrans-callback", async (req, res) => {
  const { order_id, status } = req.body;

  if (status == "PAID") {
    await updatePaymentPaid(order_id);

    var orders = await getEmailByInvoiceValue(order_id);

    var app = "MRHPUTIH";
    var body =
      "<h1>Please check our website for any detail. https://merah-putih-htci-dki-jakarta.langitdigital78.com</h1>";

    if (orders[0].type == "ATJ") {
      app = "ATJ";
      body = "Thankyou for purchasing our merchandise";
    }

    io.to(orders[0].user_id).emit("payment-update", orders);

    await sendEmail(
      app,
      `ORDER ID #${order_id} Successfully Paid !`,
      orders[0].email,
      body,
      "payment-paid-merah-putih"
    );
  }

  res.status(200).send("OK");
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
