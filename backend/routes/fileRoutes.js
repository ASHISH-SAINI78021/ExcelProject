const express = require("express");
const upload = require("../middleware/uploadMiddleware.js");
const { processFile } = require("../controllers/fileController.js");
const { getData } = require("../controllers/fileController.js");

const router = express.Router();

router.get("/" , async(req , res)=> {
    res.send("App is listening...");
})
router.post("/upload", upload.single("file"), processFile);
router.get("/get-data" , getData);

module.exports = router;
