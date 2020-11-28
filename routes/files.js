const { Router } = require('express');

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/files');
const { v4: uuidv4 } = require('uuid');



let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName)
    },
});
let upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 * 100 },
}).single('myfile');

router.post('/', (req, res) => {
    //validate request
    //store files
    upload(req, res, async (err) => {

        if (!req.file) {
            return res.json({ error: 'all fields are required' });
        }

        if (err) {
            return res.status(500).send({ error: err.message })
        }
        //store into database
        const file = new File({

            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size

        });

        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
        //http://localhost/files/165461655151-456465465

    });
});

router.post('/send', async (req, res) => {

    const { uuid, emailTo, emailFrom } = req.body;
    //console.log(req.body);
    // return res.send({});

    //validate request

    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required,' });
    }
    //get data from database
    try {
        const file = await File.findOne({ uuid: uuid });
        // console.log(uuid);
        if (file.sender) {
            return res.status(422).send({ error: 'Email alredy sent' });
        }
        file.sender = emailFrom;
        file.receiver = emailTo;


        //  console.log(file.sender);
        const response = await file.save();
        //console.log('file saved');

        //send email
        const sendMail = require('../services/emailService');
        sendMail({
            from: emailFrom,
            to: emailTo,

            subject: 'fileshare',
            text: `${emailFrom} shared a file with you.`,
            html: require('../services/emailTemplate')({
                emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
                size: parseInt(file.size / 1000) + 'KB',
                expires: '24 hours'
            })

        }).then(() => {
            return res.send({ success: true });
        }).catch(err => {
            return res.status(500).json({ error: 'error in email sending' });

        });
    } //tryblock
    catch (err) {
        return res.status(500).send({ error: 'something went wrong' });
    }

});


module.exports = router;
