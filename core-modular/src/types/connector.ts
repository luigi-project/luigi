import type { CoreAPISupportedElements } from './dom-elements';
import type { GlobalSearchHandler } from './global-search';
import type { AlertHandler, AlertSettings, ConfirmationModalHandler, ConfirmationModalSettings } from './ux';
import type {
  ModalSettings,
  LeftNavData,
  Node,
  TopNavData,
  TabNavData,
  BreadcrumbData,
  DrawerSettings,
  UserSettingsDialogSettings
} from './navigation';

export interface LuigiConnector {
  renderMainLayout(): void;

  renderTopNav(data: TopNavData): void;

  renderLeftNav(data: LeftNavData): void;

  getContainerWrapper(): HTMLElement;

  renderModal(
    content: HTMLElement,
    modalSettings: ModalSettings,
    onCloseCallback?: () => void,
    onCloseRequest?: () => void
  ): void;

  renderDrawer(
    content: HTMLElement,
    drawerSettings: DrawerSettings,
    onCloseCallback?: () => void,
    onCloseRequest?: () => void
  ): void;

  renderTabNav(data: TabNavData): void;

  renderBreadcrumbs(data: BreadcrumbData): void;

  renderAlert(alertSettings: AlertSettings, alertHandler: AlertHandler): void;

  renderConfirmationModal(
    confirmationModalSettings: ConfirmationModalSettings,
    containerHandler: ConfirmationModalHandler
  ): void;

  setDocumentTitle(documentTitle: string): void;

  getDocumentTitle(): string;

  showLoadingIndicator(container?: HTMLElement): void;

  hideLoadingIndicator(container?: HTMLElement): void;

  addBackdrop(): void;

  removeBackdrop(): void;

  openUserSettings(
    dialogSettings: UserSettingsDialogSettings,
    userSettingData: Record<string, any>[],
    previousUserSettings: Record<string, any> | null
  ): void;

  closeUserSettings(): void;

  setCurrentLocale(locale: string): void;

  getCurrentLocale(): string;

  updateModalSettings(modalSettings: ModalSettings): void;

  showFatalError(error: string): void;

  getCoreAPISupportedElements(): CoreAPISupportedElements;

  unload(): void;

  getGlobalSearchHandler?(): GlobalSearchHandler;
}

export type { Node };
