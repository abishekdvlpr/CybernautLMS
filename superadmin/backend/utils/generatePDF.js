const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const {
  S3Client,
  PutObjectCommand
} = require('@aws-sdk/client-s3');

// Setup S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.S3_BUCKET;

// Sanitize function to prevent illegal S3 path characters
function sanitizeForPath(str) {
  return str.replace(/[:*?"<>|\\\/]/g, '').replace(/\s+/g, '_');
}

async function generatePDF(name) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Read and customize the template
  let html = fs.readFileSync(path.join(__dirname, '../templates/template.html'), 'utf-8');
  html = html.replace('{{name}}', name);

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Define sanitized output file name and path
  const sanitizedName = sanitizeForPath(name);
  const outputDir = path.join(__dirname, 'certificates');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const fileName = `${sanitizedName}.pdf`;
  const localPath = path.join(outputDir, fileName);

  // Generate and save locally
  await page.pdf({ path: localPath, format: 'A4' });
  await browser.close();

  // Upload to S3 with the same path
  const s3Key = `certificates/${fileName}`;
  const fileBuffer = fs.readFileSync(localPath);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: 'application/pdf'
    })
  );

  const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  console.log('✅ Uploaded to S3:', s3Url);

  return localPath; // or return { localPath, s3Url } if both needed
}

module.exports = { generatePDF };
