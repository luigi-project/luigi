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
        if (Boolean(userSettings)) {
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
    dispatch('toggleDropdownState');
  }

  export function handleKeyUp({ keyCode }) {
    if (keyCode === KEYCODE_ENTER || keyCode === KEYCODE_SPACE) {
      document.querySelector('.lui-anchor-node>.fd-list__link').click();
    }
  }

  export let showUserInfo;
  $: showUserInfo = Boolean(userInfo && (userInfo.name || userInfo.email));
</script>

{#if !isHidden}
  <div class="fd-user-menu__body lui-user-menu-fiori">
    {#if showUserInfo}
      <div class="fd-user-menu__header">
        {#if userInfo.picture}
          <span
            class="fd-avatar fd-avatar--l fd-avatar--circle fd-avatar--thumbnail fd-user-menu__avatar"
            aria-label="Avatar"
            data-testid="luigi-topnav-profile-avatar"
            style="background-image:url('{userInfo.picture}')"
          />
        {:else}
          <span class="fd-avatar fd-avatar--l fd-avatar--circle fd-user-menu__avatar" aria-label="Avatar">
            {userInfo.initials ? userInfo.initials : ''}
          </span>
        {/if}
      </div>
      <div class="fd-user-menu__subheader">
        {#if userInfo.name}
          <div class="fd-user-menu__user-name" id="username" data-testid="luigi-topnav-profile-username">
            {userInfo.name}
          </div>
        {/if}
        {#if userInfo.description}
          <div class="fd-user-menu__user-role" data-testid="luigi-topnav-profile-description">
            {userInfo.description}
          </div>
        {/if}
      </div>

      <ul class="fd-list fd-list--compact fd-list--navigation fd-list--navigation-indication fd-list--no-border">
        {#each profileNav.items as profileItem}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li
            tabindex="-1"
            class="fd-list__item fd-list__item--link"
            on:click={() => onActionClick(profileItem)}
            data-testid={getTestId(profileItem)}
          >
            <a
              tabindex="0"
              class="fd-list__link"
              data-testid="luigi-topnav-profile-item"
              on:click={(event) => {
                NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event);
              }}
              href={addNavHrefForAnchor ? getRouteLink(profileItem) : undefined}
            >
              {#if profileItem.icon}
                {#if hasOpenUIicon(profileItem)}
                  <i role="presentation" class="fd-list__icon {getSapIconStr(profileItem.icon)}" />
                {:else}
                  <i role="presentation" class="fd-list__icon sap-icon">
                    <img
                      class="fd-top-nav__icon nav-icon"
                      src={profileItem.icon}
                      alt={profileItem.altText ? profileItem.altText : ''}
                    />
                  </i>
                {/if}
              {/if}
              <span class="fd-list__title">{$getTranslation(profileItem.label)}</span>
            </a>
          </li>
        {/each}
        {#if hasUserSettings}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li
            tabindex="-1"
            class="fd-list__item fd-list__item--link lui-anchor-node"
            on:click|preventDefault={onUserSettingsClick}
            on:keyup={(event) => handleKeyUp(event)}
          >
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a tabindex="0" class="fd-list__link" title="User Settings" data-testid="settings-link">
              {#if profileNav.settings.icon}
                {#if hasOpenUIicon(profileNav.settings)}
                  <i role="presentation" class="fd-list__icon {getSapIconStr(profileNav.settings.icon)}" />
                {:else}
                  <img
                    class="fd-top-nav__icon nav-icon"
                    src={profileNav.settings.icon}
                    alt={profileNav.settings.altText ? profileNav.settings.altText : ''}
                  />
                {/if}
              {/if}
              <span class="fd-list__title">{$getTranslation(profileNav.settings.label)}</span>
            </a>
          </li>
        {/if}
      </ul>
    {/if}
  </div>
  <div class="fd-popover__body-footer">
    <div class="fd-bar fd-bar--footer">
      <div class="fd-bar__right">
        <div class="fd-bar__element">
          {#if isAuthorizationEnabled || isProfileLogoutItem}
            {#if isLoggedIn || (!isAuthorizationEnabled && isProfileLogoutItem)}
              <div class="fd-bar__element" data-testid={getTestId(profileNav.logout)}>
                <button
                  class="fd-button fd-button--transparent fd-button--compact"
                  tabindex="0"
                  on:click={onLogoutClick}
                  data-testid="logout-btn"
                >
                  {$getTranslation(profileNav.logout.label)}
                </button>
              </div>
            {/if}
            {#if isAuthorizationEnabled && !isLoggedIn}
              <button
                class="fd-button fd-button--transparent fd-button--compact"
                tabindex="0"
                on:click={startAuthorization}
                data-testid="login-btn"
              >
                Login
              </button>
              <button
                class="fd-button fd-button--transparent fd-button--compact"
                tabindex="0"
                on:click={startAuthorization}
                data-testid="login-btn"
              >
                Login
              </button>
            {/if}
          {/if}
        </div>
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

  img.nav-icon {
    max-width: 1.5rem;
  }

  /* fixes for long User Name and role */
  .fd-user-menu__user-name,
  .fd-user-menu__user-role {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /*Fix a long list popover body*/
  .fd-user-menu__body.lui-user-menu-fiori {
    max-height: calc(100vh - 90px);
    overflow-y: auto;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    .fd-list__title {
      line-height: var(--sapContent_LineHeight);
    }
  }
</style>
