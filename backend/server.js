const express = require("express");
const DbConnect = require('./database.js');
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes.js");
require("dotenv").config();


DbConnect();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());


app.get("/" , async(req , res)=> {
    res.send("App is Listening...");
})
app.use("/api", fileRoutes);

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
