export class I18nHelpers {
  static hasLocaleChangePermission(containerElement: any): boolean {
    if (!(containerElement?.clientPermissions as any)?.changeCurrentLocale) {
      console.error(
        'Current locale change declined from client, as client permission "changeCurrentLocale" is not set for this view.'
      );
      return false;
    }
    return true;
  }
}
