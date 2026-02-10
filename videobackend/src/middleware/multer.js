import multer from "multer";

const MAX_VIDEO_SIZE = 5 * 1024 * 1024; 

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_VIDEO_SIZE, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"), false);
    }
  },
});

export default upload;