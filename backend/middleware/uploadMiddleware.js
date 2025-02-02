const multer = require("multer");

// Set file storage & validation
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file limit
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
      return cb(new Error("Only .xlsx files are allowed!"), false);
    }
    cb(null, true);
  }
});

module.exports = upload;
