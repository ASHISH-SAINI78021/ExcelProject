require("dotenv").config(); // Load environment variables first

const express = require("express");
const cors = require("cors");
const DbConnect = require("./database.js");
const fileRoutes = require("./routes/fileRoutes.js");

// Initialize Express
const app = express();

// Connect to Database
DbConnect();

// CORS Configuration (More Secure)
const corsOptions = {
  origin: process.env.CLIENT_URL || "*", // Use a specific frontend URL in production
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("App is Listening...");
});

app.use("/api", fileRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start Server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
