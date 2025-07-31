export const RoutingHelpers = {
  addParamsOnHashRouting(params: Record<string, any>, hash: string, paramPrefix?: string) {
    let localhash = hash;
    const [hashValue, givenQueryParamsString] = localhash.split('?');
    const searchParams = new URLSearchParams(givenQueryParamsString);
    this.modifySearchParams(params, searchParams, paramPrefix);
    localhash = hashValue;
    if (searchParams.toString() !== '') {
      localhash += `?${searchParams.toString()}`;
    }
    return localhash;
  },

  /**
   * Modifies the given `URLSearchParams` object by setting or deleting parameters based on the provided `params` object.
   *
   * For each key-value pair in `params`, the function sets the corresponding parameter in `searchParams`.
   * If a `paramPrefix` is provided, it is prepended to each parameter key.
   * If a value in `params` is `undefined`, the corresponding parameter is deleted from `searchParams`.
   *
   * @param params - An object containing key-value pairs to set or delete in the search parameters.
   * @param searchParams - The `URLSearchParams` instance to modify.
   * @param paramPrefix - (Optional) A string to prefix to each parameter key.
   */
  modifySearchParams(params: Record<string, any>, searchParams: URLSearchParams, paramPrefix?: string): void {
    for (const [key, value] of Object.entries(params)) {
      const paramKey = paramPrefix ? `${paramPrefix}${key}` : key;

      searchParams.set(paramKey, value);
      if (value === undefined) {
        searchParams.delete(paramKey);
      }
    }
  }
};
