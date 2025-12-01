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

  return name.replace('\\_this.', '').replace('\\_proto.', '');
}

module.exports = { parseName };
