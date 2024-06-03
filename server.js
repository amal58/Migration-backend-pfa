const app = require("./app");
const http = require("http");
const socketIo = require("socket.io");
const Notification = require("./models/notifcation");
const server = http.createServer(app);
const elimination = require("./models/elimination");
const matiere = require("./models/matiere");
const etudiantId = require("./models/user");
const cors = require("cors");
const io = socketIo(server);
const schedule = require("node-schedule");
server.listen(5000, "localhost", () => {
  io.on("connection", (socket) => {
    socket.on("notification", (data) => {
      schedule.scheduleJob("* * * * *", async () => {
        const newNotifs = await Notification.find({
          open: false,
          etudiantId: data,
        })
          .populate("etudiantId")
          .populate({ path: "elimination", populate: { path: "matiere" } });
        if (newNotifs) {
          socket.emit("newNotifs", newNotifs);
        }
      });
    });
  });
});
