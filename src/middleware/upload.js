import multer from "multer";

// Keeps uploaded images in memory so they can be forwarded securely to ImgBB.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype));
  },
});
