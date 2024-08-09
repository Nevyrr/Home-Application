import multer from "multer";
import {GridFsStorage}  from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import mongoose from "mongoose";


const conn = mongoose.createConnection(process.env.DB_URI);

let gfs;

conn.once('open', () => {
    // Initialize stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('images');
});

// Create storage engine for multer
const storage = new GridFsStorage({
    url: process.env.DB_URI,
    file: (_, file) => {
        return {
            filename: file.originalname,
            bucketName: 'images',
        };
    },
});

const upload = multer({ storage });


const getFile = async (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (_, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
        }
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({ err: 'Not an image' });
        }
    });
};

// Middleware to handle file upload
function handleUpload(req, res, next) {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(500).send('Error uploading image');
      }
      next();
    });
  }

export { getFile, handleUpload };
