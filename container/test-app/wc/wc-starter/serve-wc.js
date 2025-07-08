const fs = require('fs');
const path = require('path');
const express = require('express');

const inputPath = '/' + process.argv[2];

if (!inputPath) {
  console.error('Please provide the path to a webcomponent');
  process.exit(1);
}

const app = express();
const port = 8081;

const containerTemplate = path.join(__dirname, 'containerTemplateXTest.html');
const tempHtmlPath = path.join(__dirname, 'temp.html');

let htmlContent = fs.readFileSync(containerTemplate, 'utf-8');
htmlContent = htmlContent.replace('WC-URL', inputPath);

// Write the modified HTML to a temp file
fs.writeFileSync(tempHtmlPath, htmlContent);

// serve all files from the given directory - has to be the root of container?
app.use(express.static(path.join(__dirname, '../../../')));

// Serve the modified HTML as the default page
app.get('/', (req, res) => {
  res.sendFile(tempHtmlPath);
});

app.listen(port, () => {
  console.log(`Serving WebComponent: ${inputPath}`);
  console.log(`Server is running at http://localhost:${port}`);
});

// Clean up temp file
process.on('SIGINT', () => {
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
    console.log('deleting temp file');
  }
  process.exit();
});
