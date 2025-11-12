const multer = require('multer');
const path = require('path');

// simpan file sementara di memori sebelum diupload ke bucket
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // maks 5 MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung'));
    }
  },
});

module.exports = upload;
