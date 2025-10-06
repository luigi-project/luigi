import { GenericHelpers } from '../utilities/helpers/generic-helpers';

export class ViewUrlDecoratorSvc {
  decorators: any[];

  constructor() {
    this.decorators = [];
  }

  hasDecorators() {
    return this.decorators.length > 0;
  }

  add(decorator: any) {
    this.decorators = this.decorators.filter((d) => d.uid !== decorator.uid).concat(decorator);
  }

  applyDecorators(url: string, decode: boolean) {
    if (!url) {
      return url;
    }

    const urlObj = new URL(GenericHelpers.prependOrigin(url));
    // apply query params
    const queryParamDecorators = this.decorators.filter((d) => d.type === 'queryString');
    for (let i = 0; i < queryParamDecorators.length; i++) {
      const decorator = queryParamDecorators[i];
      if (urlObj.searchParams.has(decorator.key)) {
        urlObj.searchParams.delete(decorator.key);
      }
      const value = decorator.valueFn();
      urlObj.searchParams.append(decorator.key, value);
    }
    if (decode) {
      urlObj.search = decodeURIComponent(urlObj.search);
    }
    return urlObj.href;
  }
}
