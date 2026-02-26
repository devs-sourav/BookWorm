const path = require("path");
const express = require("express");
const helmet = require("helmet");
const monogoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const globalErrorMiddleware = require("./middlewares/globalErrorMiddleware");
const routes = require("./routes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bookwormm.netlify.app",
  "https://dashboardbookworm.netlify.app",
  "https://sandbox.sslcommerz.com",
  "https://securepay.sslcommerz.com",
  "https://www.sslcommerz.com",
];

// ✅ STEP 1: Body parsers FIRST — before anything else
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ STEP 2: Payment gateway CORS bypass — before global cors()
app.use("/api/v1/order/payment", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ✅ STEP 3: Global CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ STEP 4: Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ STEP 5: Security (after payment routes bypass)
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(monogoSanitize());

// ✅ STEP 6: Routes
app.use(routes);

// ✅ STEP 7: Global error handler
app.use(globalErrorMiddleware);

module.exports = app;