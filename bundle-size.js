/**
 * This file is used to check if bundle size threshold is not exceded
 */

const fs = require('fs');
const path = require('path');

const filesAndLimits = [
  {
    path: 'client/public/luigi-client.js',
    limit: 50
  },
  {
    path: 'core/public/luigi.js',
    limit: 650
  },
  {
    path: 'core/public/luigi.css',
    limit: 1100
  },
  {
    path: 'plugins/auth/public/auth-oauth2/plugin.js',
    limit: 75
  }
];

async function checkFileSizes() {
  for (const { path: filePath, limit } of filesAndLimits) {
    const fullPath = path.resolve(__dirname, filePath);
    console.log(`\x1b[33m\n\nChecking bundlesize in \x1b[32m${filePath}\x1b[0m`);

    try {
      const stats = await fs.promises.stat(fullPath);
      const fileSizeInKB = (stats.size / 1024).toFixed(2);

      if (fileSizeInKB > limit) {
        console.error(
          `\x1b[31m \n ERROR: ${filePath} exceeds the size limit.  Actual size: ${fileSizeInKB} KB, Limit: ${limit} KB ! \x1b[0m\n`
        );
        process.exit(1);
      } else {
        console.log(
          `\x1b[32m\u2713\x1b[0m  ${filePath} is within the size limit. Size: \x1b[33m${fileSizeInKB} KB\x1b[0m < \x1b[32m${limit} KB\x1b[0m`
        );
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\x1b[32m\u2713\x1b[0m \x1b[32m All files are within their size limits.\x1b[0m \x1b[32m\u2713\x1b[0m');
}

checkFileSizes();
