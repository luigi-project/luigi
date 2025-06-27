export const NavigationHelpers = {
  normalizePath: (raw: string) => {
    if (!raw || raw.length <= 0) {
      return raw;
    }
    let value = raw;
    if (value.startsWith('#')) {
      value = value.substring(1);
    }
    if (value.startsWith('/')) {
      value = value.substring(1);
    }
    return value;
  }
};
