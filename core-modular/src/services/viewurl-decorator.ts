/**
 * ViewUrl Decorator Service
 * manages a list of decorators that will be applied to all viewUrls right before iframe creation
 */
import { GenericHelpers } from '../utilities/helpers/generic-helpers';

interface Decorator {
  key: string;
  type: string; // queryString
  uid: string; // identifier of the current decorator - required to replace it after config update
  valueFn(): string; // a callback function that returns a string
}

class ViewUrlDecoratorSvc {
  private decorators!: Decorator[];

  constructor() {
    this.decorators = [];
  }

  hasDecorators(): boolean {
    return this.decorators.length > 0;
  }

  add(decorator: Decorator) {
    this.decorators = this.decorators.filter((d: Decorator) => d.uid !== decorator.uid).concat(decorator);
  }

  applyDecorators(url: string, decode: boolean): string {
    if (!url) {
      return url;
    }

    const urlObj = new URL(GenericHelpers.prependOrigin(url));
    // apply query params
    const queryParamDecorators = this.decorators.filter((d: Decorator) => d.type === 'queryString');

    for (let i = 0; i < queryParamDecorators.length; i++) {
      const decorator: Decorator = queryParamDecorators[i];

      if (urlObj.searchParams.has(decorator.key)) {
        urlObj.searchParams.delete(decorator.key);
      }

      const value: string = decorator.valueFn();

      urlObj.searchParams.append(decorator.key, value);
    }

    if (decode) {
      urlObj.search = decodeURIComponent(urlObj.search);
    }

    return urlObj.href;
  }
}

export const ViewUrlDecorator = new ViewUrlDecoratorSvc();
