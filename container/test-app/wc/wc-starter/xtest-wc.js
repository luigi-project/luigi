/** @typedef {import('../src/constants/communication.ts').Events} Events */
import Events from '/test-app/bundle.js';

/** @type {Events} */
const LuigiEvents = Events;
const wcContainer = document.querySelector('#wc-based-container-test');
const res = document.querySelector('#results');

wcContainer.addEventListener(Events.INITIALIZED, (event) => {
  document.body.setAttribute('wc_init', true);
});

window.clearResults = function () {
  res.innerHTML = '';
};

function getWCClient() {
  return wcContainer.shadowRoot.querySelector('[lui_web_component]').LuigiClient;
}

function getCreateResultContainer(id) {
  let resCnt = res.querySelector(`[restype=${id}]`);
  if (!resCnt) {
    resCnt = document.createElement('div');
    resCnt.setAttribute('restype', id);
    resCnt.setAttribute('style', 'border: 1px solid grey; overflow: hidden');
    resCnt.innerHTML = `<span style="font-weight: bold">${id}</span>`;
    res.appendChild(resCnt);
  }
  return resCnt;
}

function createApiTrigger(luigiEventID, manager, functionName, ...args) {
  const createPayloadEL = (type, color) => {
    return (event) => {
      const payloadCnt = document.createElement('div');
      payloadCnt.setAttribute('cnt_type', type);
      payloadCnt.style.color = color;
      payloadCnt.innerHTML = `${JSON.stringify(event.payload, undefined, 1)}`;
      payloadCnt.title = payloadCnt.innerHTML;
      payloadCnt.payload = event.payload;
      getCreateResultContainer(event.type).appendChild(payloadCnt);
    };
  };

  wcContainer.addEventListener(luigiEventID, createPayloadEL('wc', 'blue'));

  const btn = document.createElement('button');
  btn.innerHTML = luigiEventID;
  btn.setAttribute('event_id', luigiEventID);
  document.querySelector('#actions').appendChild(btn);
  const keepResultCheck = document.getElementById('keepRes');
  btn.addEventListener('click', () => {
    if (!keepResultCheck.checked) {
      window.clearResults();
    }
    let wcBase = getWCClient();
    if (manager) {
      try {
        wcBase = wcBase[manager]();
      } catch (e) {
        console.error(e);
      }
    }
    if (functionName === 'sendCustomMessage') {
      // Exception for customMessage
      wcBase.publishEvent(new CustomEvent(args[0].id, { detail: args[0] }));
    } else {
      wcBase[functionName](...args);
    }
  });
}

//
// ROOT
createApiTrigger(LuigiEvents.SET_VIEW_GROUP_DATA_REQUEST, undefined, 'setViewGroupData', { vg1: 'Luigi rocks' });
createApiTrigger(LuigiEvents.SET_ANCHOR_LINK_REQUEST, undefined, 'setAnchor', 'myAnchor');
createApiTrigger(LuigiEvents.ADD_NODE_PARAMS_REQUEST, undefined, 'addNodeParams', { luigi: 'socks' }, true);
createApiTrigger(LuigiEvents.ADD_SEARCH_PARAMS_REQUEST, undefined, 'addCoreSearchParams', { luigi: 'rocks' }, true);
createApiTrigger(LuigiEvents.CUSTOM_MESSAGE, undefined, 'sendCustomMessage', {
  id: 'myId',
  foo: 'bar'
});

// UXMANAGER
document.querySelector('#actions').appendChild(document.createElement('br'));
document.querySelector('#actions').appendChild(document.createElement('br'));

createApiTrigger(LuigiEvents.ALERT_REQUEST, 'uxManager', 'showAlert', {
  text: 'test text'
});
createApiTrigger(LuigiEvents.SHOW_CONFIRMATION_MODAL_REQUEST, 'uxManager', 'showConfirmationModal', {
  text: 'test text'
});
createApiTrigger(LuigiEvents.ADD_BACKDROP_REQUEST, 'uxManager', 'addBackdrop', {});
createApiTrigger(LuigiEvents.REMOVE_BACKDROP_REQUEST, 'uxManager', 'removeBackdrop', {});
createApiTrigger(LuigiEvents.SET_CURRENT_LOCALE_REQUEST, 'uxManager', 'setCurrentLocale', 'de_DE');
createApiTrigger(LuigiEvents.SET_DIRTY_STATUS_REQUEST, 'uxManager', 'setDirtyStatus', true); // dirty status missing on wc client
//createApiTrigger(LuigiEvents.SET_DOCUMENT_TITLE_REQUEST, 'uxManager', 'setDocumentTitle', 'newtitle'); // NOT available at iframe client

// LINKMANAGER
document.querySelector('#actions').appendChild(document.createElement('br'));
document.querySelector('#actions').appendChild(document.createElement('br'));

createApiTrigger(LuigiEvents.NAVIGATION_REQUEST, 'linkManager', 'navigate', '/foo/bar');
createApiTrigger(LuigiEvents.GO_BACK_REQUEST, 'linkManager', 'goBack', { go: 'back' });
createApiTrigger(LuigiEvents.GET_CURRENT_ROUTE_REQUEST, 'linkManager', 'getCurrentRoute');
createApiTrigger(LuigiEvents.CHECK_PATH_EXISTS_REQUEST, 'linkManager', 'pathExists', 'some/path');
createApiTrigger(
  LuigiEvents.UPDATE_MODAL_PATH_DATA_REQUEST,
  'linkManager',
  'updateModalPathInternalNavigation',
  'some/path',
  { foo: 'bar' },
  true
); // missing on wc
createApiTrigger(
  LuigiEvents.UPDATE_MODAL_SETTINGS_REQUEST,
  'linkManager',
  'updateModalSettings',
  { title: 'bar', size: 'm' },
  true
); // missing on wc

// SplitviewHandle events omitted for now (`luigi.navigation.splitview.${action}`)