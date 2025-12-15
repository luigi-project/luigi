/**
 * Returns simplified name without prefixes.
 *
 * @param {string} name - orgiginal name
 * @returns {string} parsed name
 */
function parseName(name) {
  if (!name) {
    return '';
  }

  if (name.includes('#')) {
    name = name.substring(name.indexOf('#') + 1);
  }

  return name.replace('\\_this.', '').replace('\\_proto.', '').replace('exports.', '');
}

module.exports = { parseName };
