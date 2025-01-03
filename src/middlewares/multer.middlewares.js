import multer from "multer";

const storage = multer.diskStorage({
  // req contains json data, file contains access to all the files in file system
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // unique filename is used to distiguish files
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // for now let's keep original file name because this is gonna stay in file system for seconds and then upload on cloudinary
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
