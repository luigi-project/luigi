import type { ModalSettings, LeftNavData, Node, TopNavData, TabNavData } from '../services/navigation.service';
import type {
  AlertHandler,
  AlertSettings,
  ConfirmationModalHandler,
  ConfirmationModalSettings,
  UserSettings
} from '../modules/ux-module';

export interface LuigiConnector {
  renderMainLayout(): void;

  renderTopNav(data: TopNavData): void;

  renderLeftNav(data: LeftNavData): void;

  getContainerWrapper(): HTMLElement;

  renderModal(
    content: HTMLElement,
    modalSettings: ModalSettings,
    onCloseCallback?: Function,
    onCloseRequest?: Function
  ): any;

  renderDrawer(content: HTMLElement, modalSettings: ModalSettings, onCloseCallback?: Function): any;

  renderTabNav(data: TabNavData): void;

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

  openUserSettings(settings: UserSettings): void;

  closeUserSettings(): void;

  setCurrentLocale(locale: string): void;

  getCurrentLocale(): string;

  updateModalSettings(modalSettings: ModalSettings): void;

  showFatalError(error: string): void;
}

export type { Node };
