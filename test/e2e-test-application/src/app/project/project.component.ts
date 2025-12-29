import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import {
  linkManager,
  uxManager,
  getClientPermissions,
  addContextUpdateListener,
  removeContextUpdateListener,
  storageManager
} from '@luigi-project/client';
import { LuigiContextService, IContextMessage } from '@luigi-project/client-support-angular';
import { Subscription } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  standalone: false
})
export class ProjectComponent implements OnInit, OnDestroy {
  @ViewChild('luigiAlertForm') luigiAlertForm: NgForm;
  @ViewChild('luigiLocalizationForm') luigiLocalizationForm: NgForm;
  public linkManager = linkManager;
  public uxManager = uxManager;
  public projectId: string;
  public modalActive = false;
  public preservedViewCallbackContext: any;
  private lcSubscription: Subscription = new Subscription();
  private cudListener: string;
  public pathExists: { formValue: string; result: boolean | null };
  public confirmationModalResult = signal<'' | 'confirmed' | 'dismissed'>('');
  public alertDismissed = signal<boolean | undefined>(false);
  public alertDismissKey = signal<boolean | undefined>(false);
  public alertTypes = ['success', 'info', 'warning', 'error'];
  public isDirty = false;
  public splitViewHandle;
  public currentLocale = '';
  public canChangeLocale = false;
  public storageDemoKey = '';
  public storageDemoValue = '';
  public storageDemoOperation = false;

  public constructor(
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private luigiService: LuigiContextService
  ) {
    this.pathExists = {
      formValue: '/projects/pr2',
      result: null
    };
  }

  ngOnDestroy() {
    if (this.lcSubscription) {
      this.lcSubscription.unsubscribe();
    }
    if (this.cudListener) {
      removeContextUpdateListener(this.cudListener);
    }
  }

  navigateAndShowAlert() {
    linkManager().navigate('/settings', null, true);

    const type: any = 'info';
    setTimeout(() => {
      const settings = {
        text: 'Information alert sent from an inactive iFrame',
        type
      };
      uxManager().showAlert(settings);
    }, 2000);
  }

  navigatePreservedViewGoBack() {
    linkManager().navigate('/projects/pr1/users/groups/test1/settings', null, true);
  }

  navigateWithSync(path) {
    linkManager()['options'].withoutSync = false;
    linkManager().navigate(path);
  }

  public ngOnInit() {
    // We suggest to use a centralized approach of LuigiClient.addContextUpdateListener
    // Take a look at ngOnInit in this component and app.component.ts where we set the listeners.
    this.lcSubscription.add(
      this.luigiService.contextObservable().subscribe((ctx: IContextMessage) => {
        this.projectId = ctx.context.currentProject;
        this.preservedViewCallbackContext = ctx.context.goBackContext;
        this.currentLocale = uxManager().getCurrentLocale();
        this.canChangeLocale = getClientPermissions().changeCurrentLocale;
        // Since Luigi runs outside of Zone.js, changes need
        // to be updated manually
        // Be sure to check for destroyed ChangeDetectorRef,
        // else you get runtime Errors
        if (!this.cdr['destroyed']) {
          this.cdr.detectChanges();
        }
      })
    );

    this.activatedRoute.params.subscribe((params: Params) => {
      this.projectId = params['projectId'];
    });

    // Decentralized approach, using LuigiClient listeners directly
    //
    this.cudListener = addContextUpdateListener((updatedContext) => {
      // this.projectId = updatedContext.currentProject;
      // this.preservedViewCallbackContext = updatedContext.goBackContext;
      this.currentLocale = uxManager().getCurrentLocale();
      this.canChangeLocale = getClientPermissions().changeCurrentLocale;
      console.log('context updated', this.currentLocale, updatedContext);
      // Be sure to check for destroyed ChangeDetectorRef,
      // else you get runtime Errors
      if (!this.cdr['destroyed']) {
        this.cdr.detectChanges();
      }
    });
  }

  toggleModal() {
    this.modalActive = !this.modalActive;
    if (!this.cdr['destroyed']) {
      this.cdr.detectChanges();
    }
  }

  openAsModal() {
    linkManager()
      .openAsModal('/projects/pr2/settings', {
        title: 'microfrontend in a modal',
        size: 'm'
      })
      .then(() => {
        document.getElementById('promiseTest').innerHTML = 'promise resolved!';
      });
  }

  showConfirmationModal() {
    this.confirmationModalResult.set('');

    const settings = {
      // header: 'Modal Header - Luigi modal',
      type: 'confirmation',
      body: `Lorem <i>tipsum</i> dolor sit amet, <b>consectetur adipisicing elit</b>, sed do eiusmod tempor incididunt ut labore et dolore magna
        aliqua. Ut enim ad minim veniam, <br/><br/>quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
      buttonConfirm: 'Confirm',
      buttonDismiss: 'Cancel'
    };

    uxManager()
      .showConfirmationModal(settings)
      .then(
        () => {
          this.confirmationModalResult.set('confirmed');
        },
        () => {
          this.confirmationModalResult.set('dismissed');
        }
      );
  }

  showWarningModal() {
    this.confirmationModalResult.set('');

    const settings = {
      header: 'Warning',
      type: 'warning',
      body: `<mark>Lorem tipsum dolor sit amet,</mark> <b>consectetur adipisicing elit</b>, sed do eiusmod tempor incididunt ut labore et dolore magna
        aliqua. Ut enim ad minim veniam, <small>quis nostrud exercitation ullamco</small> laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in <del>reprehenderit</del> in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
      buttonConfirm: false,
      buttonDismiss: 'Close'
    };

    uxManager()
      .showConfirmationModal(settings)
      .then(
        () => {
          this.confirmationModalResult.set('confirmed');
        },
        () => {
          this.confirmationModalResult.set('dismissed');
        }
      );
  }

  showAlert() {
    const { type, links, text, closeAfter } = this.luigiAlertForm.value;

    this.alertDismissed.set(text ? false : undefined);
    this.alertDismissKey.set(text ? false : undefined);

    const texts = {
      withoutLink: `<b onmouseover=alert('Wufff!')>click me!</b> Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
      withLink: `Ut enim ad minim veniam, {goToHome} quis nostrud exercitation
        ullamco {relativePath} laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor {goToOtherProject} in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. {neverShowItAgain}.`
    };
    const exampleLinks = {
      goToHome: { text: 'homepage', url: '/overview' },
      goToOtherProject: { text: 'other project', url: '/projects/pr2' },
      relativePath: { text: 'relative hide side nav', url: 'hideSideNav' },
      neverShowItAgain: { text: 'Never show it again', dismissKey: 'neverShowItAgain' }
    };

    const textData = !text ? '' : links ? texts.withLink : texts.withoutLink;
    const linkData = links ? exampleLinks : undefined;

    const settings = {
      text: textData,
      type,
      links: linkData,
      closeAfter
    };

    uxManager()
      .showAlert(settings)
      .then((data) => {
        if (typeof data === 'string' && data.includes('neverShowItAgain')) {
          this.alertDismissKey.set(true);
        }
        this.alertDismissed.set(true);
      });
  }

  setCurrentLocale() {
    uxManager().setCurrentLocale(this.luigiLocalizationForm.value.locale);
  }

  checkIfPathExists() {
    linkManager()
      .pathExists(this.pathExists.formValue)
      .then((pathExists: boolean) => {
        this.pathExists.result = pathExists;
        this.cdr.detectChanges();
      });
  }

  resetPathExistsResult() {
    this.pathExists.result = undefined;
  }

  public sendDirtyEvent() {
    uxManager().setDirtyStatus(this.isDirty);
  }

  public openSplitView() {
    this.splitViewHandle = linkManager().withParams({ test: 'true' }).openAsSplitView('/settings', {
      title: 'Logs',
      size: 30
    });

    this.splitViewHandle.on('resize', (newSize) => {
      console.info('on:resize: split view got resized to', newSize);
      if (!this.cdr['destroyed']) {
        this.cdr.detectChanges();
      }
    });
    this.splitViewHandle.on('expand', () => {
      console.info('on:expand: split view got expanded', 'size:', this.splitViewHandle.getSize());
      if (!this.cdr['destroyed']) {
        this.cdr.detectChanges();
      }
    });
    this.splitViewHandle.on('collapse', () => {
      console.info('on:collapse: split view got collapsed');
      if (!this.cdr['destroyed']) {
        this.cdr.detectChanges();
      }
    });
    this.splitViewHandle.on('close', () => {
      console.info('on:close: split view got closed');
      this.splitViewHandle = undefined;
      if (!this.cdr['destroyed']) {
        this.cdr.detectChanges();
      }
    });
  }

  // Start Storage part
  public storage_setItem() {
    if (this.validateKeyAndValue()) {
      return;
    }
    const promiseStorage = storageManager().setItem(this.storageDemoKey, this.storageDemoValue);
    this.executeWithTimeout(
      promiseStorage,
      100,
      (result) => 'success',
      (result) => 'Key ' + this.storageDemoKey + 'successfully stored with value ' + this.storageDemoValue
    );
  }

  public storage_getItem() {
    if (this.validateKey()) {
      return;
    }
    const promiseStorage = storageManager().getItem(this.storageDemoKey);
    this.executeWithTimeout(
      promiseStorage,
      100,
      (result) => (result ? 'info' : 'warning'),
      (result) =>
        result ? 'Value for key ' + this.storageDemoKey + ' is ' + result : 'No value for key ' + this.storageDemoKey
    );
  }

  public storage_removeItem() {
    if (this.validateKey()) {
      return;
    }
    const promiseStorage = storageManager().removeItem(this.storageDemoKey);
    const messageOk = 'Value for key ' + this.storageDemoKey + ' had been removed';
    const messageKo = 'Nothing to delete: we could not find any value for key ' + this.storageDemoKey;
    this.executeWithTimeout(
      promiseStorage,
      100,
      (result) => (result ? 'success' : 'warning'),
      (result) => (result ? messageOk : messageKo)
    );
  }

  public storage_clear() {
    const promiseStorage = storageManager().clear();
    this.executeWithTimeout(
      promiseStorage,
      100,
      (result) => 'success',
      (result) => 'Clear all the storage'
    );
  }

  public storage_has() {
    if (this.validateKey()) {
      return;
    }
    const promiseStorage = storageManager().has(this.storageDemoKey);
    const messageOk = this.storageDemoKey + ' is present in the storage';
    const messageKo = this.storageDemoKey + ' not present in the storage';
    this.executeWithTimeout(
      promiseStorage,
      100,
      (result) => (result ? 'info' : 'warning'),
      (result) => (result ? messageOk : messageKo)
    );
  }

  public storage_getAllKeys() {
    let promiseStorage = storageManager().getAllKeys();
    this.executeWithTimeout(
      promiseStorage,
      100,
      (result) => 'info',
      (keys) => 'All keys present:<br/><br/>' + keys.join('<br/>')
    );
  }

  executeWithTimeout(promise, timeout, alertType, successFullyMessage) {
    this.startStorageOperation();
    fromPromise(promise)
      .pipe(delay(timeout))
      .subscribe(
        (result) => {
          this.storageShowAlert(alertType(result), successFullyMessage(result));
        },
        (error) => {
          this.storageShowAlert('error', error);
          this.finishStorageOperation();
        },
        () => {
          this.finishStorageOperation();
        }
      );
  }

  startStorageOperation() {
    this.storageDemoOperation = true;
    uxManager().showLoadingIndicator();
  }

  finishStorageOperation() {
    this.storageDemoOperation = false;
    uxManager().hideLoadingIndicator();
  }

  validateKeyAndValue() {
    const notValidInput =
      !this.storageDemoKey ||
      this.storageDemoKey.trim().length === 0 ||
      !this.storageDemoValue ||
      this.storageDemoValue.trim().length === 0;
    if (notValidInput) {
      this.storageShowAlert('error', 'Please fill Key and Value fields');
    }
    return notValidInput;
  }

  validateKey() {
    const notValidInput = !this.storageDemoKey || this.storageDemoKey.trim().length === 0;
    if (notValidInput) {
      this.storageShowAlert('error', 'Please fill Key field');
    }
    return notValidInput;
  }

  storageShowAlert(type, text) {
    uxManager().showAlert({
      type,
      text
    });
  }
}
