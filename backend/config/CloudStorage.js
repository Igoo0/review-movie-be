// import { Storage } from '@google-cloud/storage';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Path to service account key
// const keyFilePath = path.join(__dirname, '..', 'xenon-axe-450704-n3-91cc5670cfc7.json');

// // Check if service account key exists
// if (!fs.existsSync(keyFilePath)) {
//   console.error('❌ Service account key file not found at:', keyFilePath);
//   console.error('Please ensure the file xenon-axe-450704-n3-91cc5670cfc7.json exists in your project root');
//   console.error('Current directory structure check:');
//   try {
//     const files = fs.readdirSync(path.join(__dirname, '..'));
//     console.log('Files in project root:', files.filter(f => f.includes('.json')));
//   } catch (err) {
//     console.log('Could not read project root directory');
//   }
// }

// let storage;
// try {
//   // Initialize Google Cloud Storage
//   storage = new Storage({
//     projectId: 'xenon-axe-450704', // Your project ID
//     keyFilename: keyFilePath, // Path to your service account key
//   });
//   console.log('✅ Google Cloud Storage initialized successfully');
// } catch (error) {
//   console.error('❌ Error initializing Google Cloud Storage:', error.message);
//   throw error;
// }

// const bucketName = 'patccprak';
// const bucket = storage.bucket(bucketName);

// // Test bucket connection
// (async () => {
//   try {
//     const [exists] = await bucket.exists();
//     if (exists) {
//       console.log(`✅ Successfully connected to GCS bucket: ${bucketName}`);
//     } else {
//       console.error(`❌ Bucket ${bucketName} does not exist or is not accessible`);
//     }
//   } catch (error) {
//     console.error('❌ Error connecting to GCS bucket:', error.message);
//     console.error('Please check:');
//     console.error('1. Service account key is valid');
//     console.error('2. Bucket name is correct');
//     console.error('3. Service account has proper permissions');
//   }
// })();

// export { storage, bucket, bucketName };










import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
function initializeStorage() {
  const projectId = 'xenon-axe-450704';
  
  // Check if running on GCP (Cloud Run, App Engine, Compute Engine, etc.)
  const isGCP = process.env.GOOGLE_CLOUD_PROJECT || 
                process.env.GAE_APPLICATION || 
                process.env.K_SERVICE || // Cloud Run
                process.env.FUNCTION_NAME; // Cloud Functions

  if (isGCP) {
    // Running on GCP - use Application Default Credentials
    console.log('🌩️ Running on GCP - using Application Default Credentials');
  } else {
    // Running locally - use Application Default Credentials
    console.log('💻 Running locally - using Application Default Credentials');
    console.log('💡 Make sure you run: "gcloud auth application-default login"');
  }

  return new Storage({
    projectId: projectId,
    // No keyFilename needed - ADC will be used automatically in both environments
  });
}

let storage;
try {
  storage = initializeStorage();
  console.log('✅ Google Cloud Storage initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Google Cloud Storage:', error.message);
  console.error('💡 Troubleshooting:');
  console.error('   Local: Ensure service account key exists OR run "gcloud auth application-default login"');
  console.error('   GCP: Verify service account has Storage Admin/Object Admin permissions');
  throw error;
}

const bucketName = 'patccprak';
const bucket = storage.bucket(bucketName);

// Test bucket connection
(async () => {
  try {
    const [exists] = await bucket.exists();
    if (exists) {
      console.log(`✅ Successfully connected to GCS bucket: ${bucketName}`);
    } else {
      console.error(`❌ Bucket ${bucketName} does not exist or is not accessible`);
    }
  } catch (error) {
    console.error('❌ Error connecting to GCS bucket:', error.message);
    console.error('🔧 Quick fixes:');
    console.error('   1. Verify bucket name: "patccprak"');
    console.error('   2. Check IAM permissions for Storage Admin role');
    console.error('   3. Ensure project ID is correct: xenon-axe-450704');
  }
})();

export { storage, bucket, bucketName };