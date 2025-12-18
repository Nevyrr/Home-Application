import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import mongoose from "mongoose";
import TacoModel from "../models/TacoModel.js";
import cron from "node-cron"
import { sendEmail } from "../config/nodeMailConfig.js";

/* ------ SETUP CRON JOB ------ */

// Cron job execute every day at 8am
cron.schedule('0 8 * * *', async () => {
    console.log('Send reminders emails');
    const taco = await TacoModel.find();

    // Current Date
    const currentDate = new Date();

    const [day1, month1, year1] = taco[0].vermifugeReminder.split('/');
    const vermifugeReminderDate = new Date(`${year1}-${month1}-${day1}`);

    const [day2, month2, year2] = taco[0].antiPuceReminder.split('/');
    const antiPuceReminderDate = new Date(`${year2}-${month2}-${day2}`);

    if (vermifugeReminderDate.getTime() < currentDate.getTime()) {
        sendEmail("clement.davin998@gmail.com", "rappel vermifuge coco", "La date du rappel du vermifuge pour Taco DAVIN est désormais dépassée. Pensez à le faire au plus vite !");
        sendEmail("lyseknobloch@gmail.com", "rappel vermifuge coco", "La date du rappel du vermifuge pour Taco DAVIN est désormais dépassée. Pensez à le faire au plus vite !");
    };

    if (antiPuceReminderDate.getTime() < currentDate.getTime()) {
        sendEmail("clement.davin998@gmail.com", "rappel anti-puce coco", "La date du rappel de l'anti-puce pour Taco DAVIN est désormais dépassée. Pensez à le faire au plus vite !");
        sendEmail("lyseknobloch@gmail.com", "rappel anti-puce coco", "La date du rappel de l'anti-puce pour Taco DAVIN est désormais dépassée. Pensez à le faire au plus vite !");
    };
});


/* ------ SETUP MONGO IMAGE UPLOAD ------ */

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

const getTacoData = async (req, res) => {
    const taco = await TacoModel.find();
    res.status(200).json({ taco });
};

const updateVermifugeDate = async (req, res) => {
    const updatedTaco = await TacoModel.findOneAndUpdate(
        {}, // match the only taco document
        { vermifugeDate: req.body.date },
        { new: true }
    );

    res.json(updatedTaco);
};

const updateVermifugeReminder = async (req, res) => {
    const updatedTaco = await TacoModel.findOneAndUpdate(
        {}, // match the only taco document
        { vermifugeReminder: req.body.date },
        { new: true }
    );

    res.json(updatedTaco);
};

const updateAntiPuceDate = async (req, res) => {
    const updatedTaco = await TacoModel.findOneAndUpdate(
        {}, // match the only taco document
        { antiPuceDate: req.body.date },
        { new: true }
    );

    res.json(updatedTaco);
};

const updateAntiPuceReminder = async (req, res) => {
    const updatedTaco = await TacoModel.findOneAndUpdate(
        {}, // match the only taco document
        { antiPuceReminder: req.body.date },
        { new: true }
    );

    res.json(updatedTaco);
};

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

export { getTacoData, updateVermifugeDate, updateVermifugeReminder, updateAntiPuceDate, updateAntiPuceReminder, getFile, handleUpload };
