require("dotenv").config();
const mongoose = require("mongoose");

// UNCAUGHT EXCEPTION:
process.on("uncaughtException", (err) => {
  // console.log(err.name, "-->", err.message);
  console.log("UNCAUGHT EXCEPTION, SERVER SHUTTING DOWN...");
  process.exit(1);
});

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("Database Connected ✓"))
  .catch((err) => console.log("DB Connection Error", "-->", err.message));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`)
);

// UNHANDLED PROMISE REJECTION CATCHER (GLOBALLY):
process.on("unhandledRejection", (err) => {
  // console.log(err.name, "-->", err.message);
  // console.log("UNHANDLER REJECTION, SERVER SHUTTING DOWN...");
  server.close(() => process.exit(1)); // Argument 0 for Success, and Argument 1 for Uncalled Exception
});
