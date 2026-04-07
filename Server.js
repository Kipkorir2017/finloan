// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const borrowerRoutes = require("./routes/BorrowerRoutes");
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");

// const app = express();
// const PORT = process.env.PORT || 8080;

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5000",
//   "https://kipkorir2017.github.io",
//   "https://stately-travesseiro-756804.netlify.app",
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     return callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.json());

// // app.options(/(.*)/, cors(corsOptions)); // enable if preflight issues

// app.get("/", (req, res) => res.send("API is running"));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/borrowers", borrowerRoutes);
// app.use("/api/users", userRoutes);

// // Optional: reuse borrowerRoutes for loans views
// // app.use("/api/loans", borrowerRoutes);

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
require("dotenv").config();

// Routes
const borrowerRoutes = require("./routes/BorrowerRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

// CORS CONFIG 
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://kipkorir2017.github.io",
  "https://stately-travesseiro-756804.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ROOT 
app.get("/", (req, res) => res.send("API is running"));

// ROUTES 
app.use("/api/auth", authRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/users", userRoutes);

// MONGODB CONNECT
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    // Start server 
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); 
  }
};

connectDB();

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: err.message || "Server Error" });
});