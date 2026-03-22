// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const borrowerRoutes = require("./routes/BorrowerRoutes");
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5000",
//   "https://kipkorir2017.github.io",
//   "https://stately-travesseiro-756804.netlify.app"
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
//     if (allowedOrigins.includes(normalizedOrigin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
// // Use a Regex to avoid Path-to-Regexp "Missing Parameter Name" errors
// app.options(/(.*)/, cors(corsOptions));
// app.use(express.json());


// app.use("/api/auth", authRoutes);
// app.use("/api/borrowers", borrowerRoutes);
// app.use("/api/users", userRoutes);

// app.get("/", (req, res) => {
//   res.send("API is running");
// });

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected successfully");
//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//   });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const borrowerRoutes = require("./routes/BorrowerRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  "http://localhost:3000",
  // "http://localhost:5000",
  "https://kipkorir2017.github.io",
  "https://stately-travesseiro-756804.netlify.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, true); // allow for now (prevents CORS breaking)
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });