<script>
  import { AuthLayerSvc } from './services';
  import { createEventDispatcher, onMount, getContext } from 'svelte';
  import { LuigiAuth, LuigiConfig, LuigiUX } from './core-api';
  import { AuthHelpers, GenericHelpers, NavigationHelpers, StateHelpers, RoutingHelpers } from './utilities/helpers';
  import { AuthStoreSvc, Routing } from './services';
  import { TOP_NAV_DEFAULTS } from './utilities/luigi-config-defaults';
  import { KEYCODE_ENTER, KEYCODE_SPACE } from './utilities/keycode.js';

  const dispatch = createEventDispatcher();

  export let isHidden = false;
  export let addNavHrefForAnchor;

  let idpProviderInstance;
  let userInfo;
  let isLoggedIn;
  let profileNav = { logout: {}, items: [], settings: {} };
  let isAuthorizationEnabled;
  let isProfileLogoutItem;
  let hasUserSettings;
  let navProfileListenerInstalled;
  let profileLogoutFnDefined;
  let store = getContext('store');
  let getTranslation = getContext('getTranslation');
  let getUnsavedChangesModalPromise = getContext('getUnsavedChangesModalPromise');
  let openViewInModal = getContext('openViewInModal');
  let initialsOfUser;

  onMount(async () => {
    if (!LuigiAuth.isAuthorizationEnabled()) {
      isAuthorizationEnabled = false;
      setProfileUserData();
    } else {
      isAuthorizationEnabled = true;
    }
    setProfileNavData();

    AuthLayerSvc.getLoggedInStore().subscribe((loggedIn) => {
      isLoggedIn = loggedIn;
    });
    AuthLayerSvc.getUserInfoStore().subscribe((uInfo) => {
      userInfo = uInfo;
      dispatch('userInfoUpdated', userInfo);
    });
  });

  function startAuthorization() {
    AuthLayerSvc.startAuthorization();
  }

  function getSapIconStr(iconString) {
    return NavigationHelpers.renderIconClassName(iconString);
  }

  function hasOpenUIicon(node) {
    return NavigationHelpers.isOpenUIiconName(node.icon);
  }

  function getTestId(profileItem) {
    return profileItem.testId ? profileItem.testId : NavigationHelpers.prepareForTests(profileItem.label);
  }
  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node);
  }

  // [svelte-upgrade suggestion]
  // review these functions and remove unnecessary 'export' keywords
  export function setProfileNavData() {
    if (!navProfileListenerInstalled) {
      StateHelpers.doOnStoreChange(store, async () => {
        setTimeout(async () => {
          const logoutItem = await LuigiConfig.getConfigValueAsync('navigation.profile.logout');
          //check if the User Settings schema exist
          const userSettingsConfig = await LuigiConfig.getConfigValueAsync('userSettings');
          const userSettings = userSettingsConfig
            ? userSettingsConfig
            : await LuigiConfig.getConfigValueAsync('settings.userSettings');
          //check if Settings dropdown is enabled for navigation in Shellbar
          const profileNavData = {
            items: (await LuigiConfig.getConfigValueAsync('navigation.profile.items')) || []
          };
          if (userSettings) {
            const userSettingsProfileMenuEntry = userSettings.userSettingsProfileMenuEntry;
            profileNavData['settings'] = {
              ...TOP_NAV_DEFAULTS.userSettingsProfileMenuEntry,
              ...userSettingsProfileMenuEntry
            };
          }
          profileNavData['logout'] = {
            ...TOP_NAV_DEFAULTS.logout,
            ...logoutItem
          };
          isProfileLogoutItem = Boolean(logoutItem);
          profileLogoutFnDefined = false;
          AuthLayerSvc.setProfileLogoutFn(null);
          if (logoutItem && GenericHelpers.isFunction(logoutItem.customLogoutFn)) {
            // TODO: PROFNAVLOGOUT: three smiliar implementations.
            // TODO: whats the difference between this profileLogoutFn, profileNav, auth-layer
            profileLogoutFnDefined = true;
            AuthLayerSvc.setProfileLogoutFn(logoutItem.customLogoutFn);
          }
          profileNav = profileNavData;
          hasUserSettings = Boolean(userSettings);
        });
      }, ['navigation.profile']);
      navProfileListenerInstalled = true;
    }
  }

  export async function setProfileUserData() {
    const uInfo = await LuigiConfig.getConfigValueAsync('navigation.profile.staticUserInfoFn');
    if (uInfo) {
      AuthLayerSvc.setUserInfo(userInfo);
      userInfo = uInfo;
      dispatch('userInfoUpdated', userInfo);
    }
  }

  export function onActionClick(item) {
    getUnsavedChangesModalPromise().then(
      () => {
        if (item.openNodeInModal) {
          const route = RoutingHelpers.buildRoute(item, `${item.link}`);
          openViewInModal(route, item.openNodeInModal === true ? {} : item.openNodeInModal);
        } else {
          Routing.navigateToLink(item);
        }
      },
      () => {}
    );
    dispatch('toggleDropdownState');
  }

  export function onLogoutClick() {
    getUnsavedChangesModalPromise().then(
      () => {
        if (isAuthorizationEnabled) {
          logout();
        } else if (isProfileLogoutItem && profileLogoutFnDefined) {
          // TODO: PROFNAVLOGOUT: check if auth-layer logout _profileLogoutFn is a duplicate
          // TODO: PROFNAVLOGOUT: three smiliar implementations. profilen
          profileNav.logout.customLogoutFn();
        } else {
          console.error('No IDP provider or profile.customLogoutFn is defined.');
        }
      },
      () => {}
    );
  }

  export function onUserSettingsClick() {
    LuigiUX.openUserSettings();
    dispatch('toggleDropdownState');
  }

  export function logout() {
    AuthLayerSvc.logout();
  }

  export function handleKeyUp({ keyCode }) {
    if (keyCode === KEYCODE_ENTER || keyCode === KEYCODE_SPACE) {
      document.querySelector('.lui-anchor-node>.fd-menu__link').click();
    }
  }

  export let showUserInfo;
  $: showUserInfo = Boolean(userInfo && (userInfo.name || userInfo.email));
</script>

{#if !isHidden}
  <div class="fd-popover__wrapper fd-user-menu__popover-wrapper">
    <div class="fd-user-menu__body">
      {#if showUserInfo}
        <div class="fd-user-menu__header">
          {#if userInfo?.picture}
            <span
              class="fd-avatar fd-avatar--lg fd-avatar--circle fd-avatar--thumbnail"
              aria-label="Avatar"
              style="background-image:url('{userInfo?.picture}')"
            >
            </span>
          {:else}
            <span class="fd-avatar fd-avatar--lg fd-avatar--circle fd-avatar--thumbnail" aria-label="Avatar">
              {userInfo?.initials ? userInfo.initials : ''}
            </span>
          {/if}
          <div class="fd-user-menu__header-container">
            <div class="fd-user-menu__user-name" data-testid="luigi-topnav-profile-username">
              {userInfo.name || ''}
            </div>
            <div class="fd-user-menu__subline">
              {userInfo.email || ''}
            </div>
            <div class="fd-user-menu__subline" data-testid="luigi-topnav-profile-description">
              {userInfo.description || ''}
            </div>
          </div>
        </div>
      {/if}
      <div class="fd-user-menu__content-container">
        <nav class="fd-menu fd-menu--icons fd-user-menu__menu">
          <ul class="fd-menu__list fd-user-menu__menu-list" role="menu">
            {#if hasUserSettings}
              <li
                class="fd-menu__item"
                role="presentation"
                on:click|preventDefault={onUserSettingsClick}
                on:keyup={(event) => handleKeyUp(event)}
              >
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="fd-menu__link" role="menuitem" data-testid="settings-link">
                  <span class="fd-menu__addon-before">
                    <!-- <i class="sap-icon--action-settings" role="presentation"></i> -->
                    {#if profileNav.settings?.icon}
                      {#if hasOpenUIicon(profileNav.settings)}
                        <i class="fd-top-nav__icon {getSapIconStr(profileNav.settings.icon)}" />
                      {:else}
                        <img
                          class="fd-top-nav__icon nav-icon"
                          src={profileNav.settings.icon}
                          alt={profileNav.settings.altText ? profileNav.settings.altText : ''}
                        />
                      {/if}
                    {/if}
                  </span>
                  <span class="fd-menu__title">Settings</span>
                </a>
              </li>
            {/if}
            {#each profileNav.items as profileItem}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
              <li
                class="fd-menu__item"
                on:click={() => onActionClick(profileItem)}
                data-testid={getTestId(profileItem)}
              >
                <a
                  class="fd-menu__link"
                  data-testid="luigi-topnav-profile-item"
                  href={addNavHrefForAnchor ? getRouteLink(profileItem) : undefined}
                  on:click={(event) => {
                    NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event);
                  }}
                >
                  <span class="fd-menu__title">{$getTranslation(profileItem.label)}</span>
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="fd-bar fd-bar--footer">
    <div class="fd-bar__right">
      <div class="fd-bar__element" data-testid={getTestId(profileNav.logout)}>
        <button aria-label="button" class="fd-button fd-button--transparent" on:click={onLogoutClick}>
          <i class="sap-icon--log"></i>
          <span class="fd-button__text">{$getTranslation(profileNav.logout.label)}</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .fd-top-nav__icon {
    display: inline-block;
    vertical-align: middle;
    margin-right: 5px;
  }
  .nav-icon {
    height: 2em;
  }

  /* fixes for long User Name and role */
  .fd-user-menu__user-name,
  .fd-user-menu__user-role {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lui-username {
    display: block;
    padding: 0.75rem 1rem 0.75rem 0.75rem;
    cursor: default;
    font-size: 1.125rem;
  }

  /*Fix a long list popover body*/
  .lui-profile-simple-menu {
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .lui-profile-simple-menu .lui-logout-btn {
    text-align: left;
  }

  li > button.fd-menu__link {
    background-color: var(--sapList_Background, #fff);

    &:hover {
      background-color: var(--sapList_Hover_Background, #f5f5f5);
    }
  }
</style>
