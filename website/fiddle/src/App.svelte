<script>
  import { onDestroy, onMount } from 'svelte';

  import luigiCorePkgInfo from '../node_modules/@luigi-project/core/package.json';
  import defaultConfig from './defaultConfig.js';

  export let luigiVersion = luigiCorePkgInfo.version;
  export let customVersion;
  export let versions;
  export let showVersions;

  let defaultConfigString = defaultConfig;
  let configString = defaultConfigString;

  function exec(jsString) {
    return eval(jsString);
  }

  function closeDropdowns() {
    showVersions = false;
  }

  async function injectLuigiAssets() {
    let coreBasePath = '/vendor/luigi-core';
    let oidcBasePath = '/vendor/plugin-auth-oidc';
    let oauth2BasePath = '/vendor/plugin-auth-oauth2';
    let horizonStandard = true;

    customVersion = localStorage.getItem('luigi-version');
    if (customVersion) {
      const cdnBase = '/luigi-cdn/';
      coreBasePath = cdnBase + 'core@' + customVersion;
      oidcBasePath = cdnBase + 'plugin-auth-oidc@' + customVersion;
      oauth2BasePath = cdnBase + 'plugin-auth-oauth2@' + customVersion;

      luigiVersion = customVersion;
      const v_info = customVersion.split('.');
      if (v_info[0] < 2 || (v_info[0] === '2' && v_info[1] < 10)) {
        horizonStandard = false;
      }
      document.body.classList.add('lui-v' + v_info[0] + '_' + v_info[1]);
    }

    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', coreBasePath + (horizonStandard ? '/luigi_horizon.css' : '/luigi.css'));
    document.head.appendChild(style);

    const core = document.createElement('script');
    core.setAttribute('src', coreBasePath + '/luigi.js');
    document.head.appendChild(core);
    return new Promise((resolve) => {
      window.loadInterval = setInterval(() => {
        if (window.Luigi) {
          clearInterval(window.loadInterval);
          const s_oidc = document.createElement('script');
          s_oidc.setAttribute('src', oidcBasePath + '/plugin.js');
          document.head.appendChild(s_oidc);
          const s_oauth = document.createElement('script');
          s_oauth.setAttribute('src', oauth2BasePath + '/plugin.js');
          document.head.appendChild(s_oauth);

          window.loadInterval = setInterval(() => {
            if (window['LuigiPlugin-auth-oauth2'] && window['LuigiPlugin-auth-oidc']) {
              clearInterval(window.loadInterval);
              window.LuigiAuthOAuth2 = window['LuigiPlugin-auth-oauth2'];
              window.LuigiAuthOIDC = window['LuigiPlugin-auth-oidc'];
              resolve('resolved');
            }
          }, 100);
        }
      }, 100);
    });
  }

  function reloadConfig() {
    let customConfig = sessionStorage.getItem('fiddle');
    let customConfigPreviousSession = localStorage.getItem('fiddle');

    // init keyboard events
    initKeyboardEvents();

    // check if config saved from a previous session
    if (!customConfig && customConfigPreviousSession) {
      if (confirm('We found a fiddle from a previous session. Do you want to restore it?')) {
        customConfig = customConfigPreviousSession;
        sessionStorage.setItem('fiddle', customConfig);
      }
    }

    // try to execyte custom configuration or defaut
    try {
      if (!customConfig) {
        sessionStorage.setItem('fiddle', defaultConfigString);
        customConfig = defaultConfigString;
      }
      exec(customConfig);
      configString = customConfig;
    } catch (e) {
      console.error(e);
      sessionStorage.removeItem('fiddle');
      exec(defaultConfigString);
      configString = defaultConfigString;
    }
  }

  function handleKeydownEvent(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      saveConfig();
    }
  }

  function initKeyboardEvents() {
    window.addEventListener('keydown', handleKeydownEvent);
  }

  function saveConfig() {
    localStorage.setItem('fiddle', window.editor.getValue());
    sessionStorage.setItem('fiddle', window.editor.getValue());
    window.location.href = '/';
  }

  function saveConfigTA() {
    localStorage.setItem('fiddle', window.editorTA.value);
    sessionStorage.setItem('fiddle', window.editorTA.value);
    window.location.href = '/';
  }

  function closeConfig() {
    document.body.classList.remove('editorVisible');
  }

  function resetConfig() {
    window.editor.setValue(defaultConfigString);
    window.editorTA.textContent = defaultConfigString;
    window.editor.clearSelection();
  }

  function openConfig() {
    window.editor.setValue(configString);
    window.editorTA.textContent = configString;
    window.editor.clearSelection();
    document.body.classList.add('editorVisible');
  }

  function hide() {
    document.body.classList.remove('show-bar');
  }

  function clearAll() {
    if (confirm('Do you really want to clear all stored data?')) {
      window.location.href = '/secureLeave.html';
    }
  }

  async function chooseVersion() {
    showVersions = true;
    if (!versions) {
      const response = await fetch('https://registry.npmjs.org/@luigi-project/core');
      const entries = await response.json();
      versions = [...new Set(Object.values(entries['dist-tags']) || [])].sort((a, b) => {
        const a_parts = a.split('.');
        const b_parts = b.split('.');
        return a_parts[0] * 10000 + a_parts[1] * 1 - (b_parts[0] * 10000 + b_parts[1] * 1);
      });
      versions.push('Reset...');
    }
  }

  function switchVersion(version) {
    if (version === 'Reset...') {
      localStorage.removeItem('luigi-version');
    } else {
      localStorage.setItem('luigi-version', version);
    }
    window.location.reload();
  }

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydownEvent);
  });

  onMount(async () => {
    await injectLuigiAssets();

    window.editor = ace.edit('editor');
    window.editorTA = document.getElementById('editorTA');
    editor.session.setMode('ace/mode/javascript');
    reloadConfig();
  });
</script>

<svelte:window on:click={closeDropdowns} on:blur={closeDropdowns} />
<div class="editor_container">
  <div class="fd-dialog" role="dialog">
    <div class="fd-dialog__content" role="document" style="width:80%; max-width:80%;">
      <header class="fd-dialog__header fd-bar fd-bar--header">
        <div class="fd-bar__left">
          <div class="fd-bar__element">
            <h3 class="fd-dialog__title">Luigi Config</h3>
          </div>
        </div>
      </header>
      <div class="fd-dialog__body fd-dialog__body--no-vertical-padding">
        <div id="editor" class="lui-mobile-hide" />
        <textarea id="editorTA" class="lui-mobile-show" />
      </div>
      <footer class="fd-dialog__footer fd-bar fd-bar--footer">
        <div class="fd-bar__right">
          <div class="fd-bar__element">
            <button
              class="fd-dialog__decisive-button fd-button fd-button--transparent fd-button--compact"
              on:click={resetConfig}>Reset</button
            >
          </div>
          <div class="fd-bar__element">
            <button class="fd-dialog__decisive-button fd-button fd-button--compact" on:click={closeConfig}
              >Cancel</button
            >
          </div>
          <div class="fd-bar__element lui-mobile-hide">
            <button
              class="fd-dialog__decisive-button fd-button fd-button--emphasized fd-button--compact"
              on:click={saveConfig}>Apply</button
            >
          </div>
          <div class="fd-bar__element lui-mobile-show">
            <button
              class="fd-dialog__decisive-button fd-button fd-button--emphasized fd-button--compact"
              on:click={saveConfigTA}>Apply</button
            >
          </div>
        </div>
      </footer>
    </div>
  </div>
</div>

<div class="fiddle-toolbar">
  <div class="fd-action-bar">
    <div class="fd-action-bar__header">
      <div class="title-wrapper">
        <img alt="Luigi" src="./img/luigi.png" />
        <span class="lui-mobile-hide"
          >powered by Luigi
          <button
            class="fd-button fd-button--compact btn-primary"
            on:click|preventDefault|stopPropagation={chooseVersion}
          >
            <span class="lui-mobile-hide"
              >v{luigiVersion + (customVersion ? ' (CDN)' : '')}
              {#if showVersions}
                <div class="lui-version-chooser">
                  {#if !versions}
                    <div class="fiddle_spinner">
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                  {/if}
                  {#each versions || [] as version}
                    <a
                      class="fd-link"
                      href="#top"
                      target="_blank"
                      rel="noopener noreferrer"
                      on:click={switchVersion(version)}
                    >
                      {version}
                    </a><br />
                  {/each}
                </div>
              {/if}
            </span>
          </button>
        </span>
        <span class="lui-mobile-hide">
          <div class="cr-footer">
            Copyright © The Linux Foundation Europe. <br />For web site terms of use, trademark policy and other
            project policies please see
            <a href="https://linuxfoundation.eu/en/policies" target="_blank">
              https://linuxfoundation.eu/en/policies
            </a>.
          </div>
        </span>
      </div>

      <div class="fd-action-bar__actions">
        <button class="fd-button fd-button--standard btn-primary" on:click={clearAll}>
          <span class="lui-mobile-hide">Clear All</span>
          <span class="lui-mobile-show sap-icon--delete" />
        </button>
        <span class="lui-sep" />
        <button class="fd-button fd-button--standard btn-primary" on:click={openConfig}>
          <span class="lui-mobile-hide">Modify Config</span>
          <span class="lui-mobile-show sap-icon--edit" />
        </button>
        <button class="fd-button fd-button--standard btn-primary" on:click={hide}>
          <span class="lui-mobile-hide">Hide</span>
          <span class="lui-mobile-show sap-icon--hide" />
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.show-bar) .fiddle-toolbar {
    display: block;
  }

  :global(.show-bar #app .fd-app__sidebar),
  :global(.show-bar .fd-page.iframeContainer),
  :global(.show-bar #app .splitViewContainer) {
    bottom: 50px !important;
  }

  :global(body) {
    font-family: var(--sapFontFamily, '72', '72full', Arial, Helvetica, sans-serif);
  }

  :global(#ext-cookiebar) {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    padding: 10px 5px;
    background: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    color: white;
    text-align: center;
    box-sizing: border-box;
    z-index: 1000;
  }

  :global(#ext-cookiebar a) {
    color: #2deb8a;
  }

  :global(#ext-cookiebar a:hover) {
    text-decoration: none;
  }

  .fiddle-toolbar {
    border-top: 1px solid rgb(48, 48, 48);
    background: #3c4553;
    position: fixed;
    bottom: 0;
    height: 49px;
    width: 100%;
    z-index: 100000000000;
    display: none;
  }

  .fiddle-toolbar .fd-action-bar {
    background: none;
    padding: 0.5rem;
  }

  .fiddle-toolbar .title-wrapper {
    flex-grow: 1;
    position: relative;
  }

  .fiddle-toolbar .fd-link {
    color: #2deb8a;
    text-shadow: none;
  }

  .editor_container {
    visibility: hidden;
    z-index: -1;
  }

  :global(body.lui-v1_0) .editor_container .fd-dialog__content {
    background: white;
    padding: 0.5rem;
    border-radius: 1rem;
  }

  :global(body.lui-v1_0) .editor_container .fd-dialog__body {
    border: 1px solid #3c4553;
  }

  :global(.editorVisible) .editor_container {
    visibility: visible;
    z-index: 2;
  }

  .editor_container .fd-dialog {
    display: none;
  }

  :global(.editorVisible) .editor_container .fd-dialog {
    display: flex;
    position: fixed;
    z-index: 1000;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
  }

  .editor_container .fd-bar__right {
    display: flex;
    -webkit-box-pack: end;
    justify-content: flex-end;
  }

  #editor,
  #editorTA {
    width: 100%;
    height: calc(100vh - 300px);
  }

  #editorTA {
    font-family: monospace;
    padding: 0;
  }

  .fd-action-bar__header {
    overflow: visible;
    color: white;
    font-size: 0.8em;
  }

  .fd-action-bar__header a.fd-link {
    margin-left: 10px;
  }

  .fd-action-bar__header img {
    vertical-align: middle;
  }

  .btn-primary {
    display: inline-block;
    border: 2px solid #2deb8a;
    border-radius: 8px;
    box-shadow: 0 8px 24px -17px #000101;
    background-color: #2deb8a;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Open Sans', sans-serif;
    color: #29303a;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary:hover,
  .btn-primary:active,
  .btn-primary:focus {
    background-color: white;
    color: #2deb8a;
  }

  @media (max-width: 600px) {
    .lui-mobile-hide {
      display: none;
    }
  }
  @media (min-width: 600px) {
    .lui-mobile-show {
      display: none;
    }
  }

  .lui-version-chooser {
    position: absolute;
    bottom: 2rem;
    max-width: 300px;
    max-height: 50vh;
    background: #3c4553;
    display: block;
    border: 1px solid #2deb8a;
    border-radius: 1rem;
    color: white;
    left: 0;
    overflow: auto;
    text-align: left;
    padding: 5px;
    padding-right: 10px;
  }

  .fiddle_spinner {
    color: white;
  }
  .fiddle_spinner,
  .fiddle_spinner div {
    box-sizing: border-box;
  }
  .fiddle_spinner {
    display: inline-block;
    position: relative;
    width: 40px;
    height: 40px;
  }
  .fiddle_spinner div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 32px;
    height: 32px;
    margin: 8px;
    border: 8px solid currentColor;
    border-radius: 50%;
    animation: fiddle_spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: currentColor transparent transparent transparent;
  }
  .fiddle_spinner div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .fiddle_spinner div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .fiddle_spinner div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes fiddle_spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .fiddle-toolbar .fd-action-bar__header {
    display: flex;
    align-items: center;
    padding-top: 0;
  }

  .fiddle-toolbar .fd-button {
    position: relative;
    overflow: visible;
  }

  .fiddle-toolbar .cr-footer {
    position: absolute;
    left: 40%;
    color: lightgrey;
    text-align: center;
    top: -2px;
  }

  .fiddle-toolbar .cr-footer a {
    color: #2deb8a;
  }
</style>
