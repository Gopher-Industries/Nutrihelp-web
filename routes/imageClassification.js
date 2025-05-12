const express = require('express');
const predictionController = require('../controller/imageClassificationController.js');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

// Define multer configuration for file upload / setting up to allow png or jpeg only
const upload = multer({
  dest: 'uploads/', 
  fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png'].includes(file.mimetype))
});

// Define route for receiving input data and returning predictions
router.post('/', upload.single('image'), (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // Call the predictImage function from the controller with req and res objects
  predictionController.predictImage(req, res);

  // Delete the uploaded file after processing
  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      //console.log('File deleted successfully');
    }
  });
});

module.exports = router;
