const fs = require('fs');
const path = require('path');

const luigiContainerEventsPath = '../../docs/luigi-container-events.md';

/**
 * Writes parsed MD content to original file
 * @param {Object} content parsed MD content
 */
function writeFile(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid content - cannot write file!');
  }

  const parsedContent = content
    .replace(/\s*Type: .*?Payload\s*/g, '\n\n')
    .replaceAll('Type: unspecified', '')
    .replaceAll('Type:', 'Payload:')
    .replaceAll('Returns **void**', '');

  fs.writeFile(path.join(__dirname, luigiContainerEventsPath), parsedContent, 'utf8', (error) => {
    if (error) {
      console.error('An error occurred while writing to MD file:', error);
      return;
    }

    console.log('MD file has been written successfully!');
  });
}

/**
 * Reads specified MD file to get its content
 */
function readFile() {
  fs.readFile(path.join(__dirname, luigiContainerEventsPath), 'utf8', (error, data) => {
    if (error) {
      console.error('An error occurred while reading MD file:', error);
      return;
    }

    writeFile(data);
  });
}

readFile();
