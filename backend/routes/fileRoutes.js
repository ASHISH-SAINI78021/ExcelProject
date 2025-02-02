const express = require("express");
const upload = require("../middleware/uploadMiddleware.js");
const { processFile } = require("../controllers/fileController.js");
const { getData } = require("../controllers/fileController.js");
const { progressReport } = require("../controllers/fileController.js");

const router = express.Router();

router.post("/upload", upload.single("file"), processFile);
router.get("/progress" , progressReport);
router.get("/get-data" , getData);

module.exports = router;
