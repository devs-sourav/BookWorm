const path = require("path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const monogoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const globalErrorMiddleware = require("./middlewares/globalErrorMiddleware");
const routes = require("./routes");

const app = express();

// GLOBAL MIDDLEWARES:
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bookwormm.netlify.app",
  "https://dashboardbookworm.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman or server-to-server
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/xwww-form-urlencoded

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serving static files
app.use(helmet()); // Set security HTTP headers

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, Please try again after an hour!",
// });

// app.use("/api", limiter); // Limit request from same IP
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(monogoSanitize()); // Data sanitization against NoSQL query injection --> "email": { "$gt": "" }

app.use(routes);
app.use(globalErrorMiddleware);

module.exports = app;
