import multer from 'multer';
import { bucket } from '../config/CloudStorage.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('File filter - checking file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log('✅ File type validation passed');
    return cb(null, true);
  } else {
    console.log('❌ File type validation failed');
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Function to upload file to Google Cloud Storage
export const uploadToGCS = async (file, folderName = 'posters') => {
  try {
    console.log('Starting GCS upload for file:', file.originalname);
    
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.buffer) {
      throw new Error('File buffer is missing');
    }

    // Generate unique filename
    const fileName = `${folderName}/${uuidv4()}-${file.originalname}`;
    console.log('Generated filename:', fileName);
    
    // Create a new blob in the bucket
    const blob = bucket.file(fileName);

    // Create a stream to write the file
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      public: true, // Make file publicly accessible
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('GCS upload stream error:', err);
        reject(err);
      });

      blobStream.on('finish', () => {
        // The file upload is complete
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log('✅ File uploaded successfully to:', publicUrl);
        resolve({
          fileName: fileName,
          publicUrl: publicUrl,
          message: 'File uploaded successfully'
        });
      });

      // Write the file buffer to the stream
      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('❌ GCS upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Function to delete file from Google Cloud Storage
export const deleteFromGCS = async (fileName) => {
  try {
    console.log('Deleting file from GCS:', fileName);
    await bucket.file(fileName).delete();
    console.log('✅ File deleted successfully from GCS');
    return { message: 'File deleted successfully' };
  } catch (error) {
    console.error('❌ GCS delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};