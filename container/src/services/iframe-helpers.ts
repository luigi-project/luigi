/**
 * Retrieves the allow rules for iframes and modifies them according to w3c standard conditions.
 * @param {string[]} allowRules - qn array of allow rules
 * @returns {string|undefined} the modified allow rules joined as a single string, or undefined if allowRules is falsy
 */
export const getAllowRules = (allowRules: string[]): string | undefined => {
  if (!allowRules) return undefined;

  const rules = allowRules;

  rules.forEach((rule, index) => {
    rules[index] = rule + (rule.indexOf(';') != -1 ? '' : ';');
    rules[index] = allowRules[index].replaceAll('"', "'");
  });

  return rules.join(' ');
};
