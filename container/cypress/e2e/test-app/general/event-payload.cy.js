import { Events } from '../../../../src/constants/communication';

/**
 * Helper function to check the emitted payload for a given event.
 * It clicks the corresponding trigger element and validates the payload
 * both for iframe and web component contexts.
 */
function checkPayload(eventId, payloadDataResolver, expectedValue, options = {}) {
  const timeout = options.timeout || 10000;

  // Ensure the trigger button exists and click it
  cy.get(`#actions [event_id="${eventId}"]`).should('be.visible').click();

  // Verify the payload in the iframe section (using Cypress retries)
  cy.get(`#results [restype="${eventId}"] [cnt_type=iframe]`, { timeout }).should(($els) => {
    expect($els.length, `iframe result elements for ${eventId}`).to.be.greaterThan(0);
    const payload = $els.get(0).payload;
    const resolved = payloadDataResolver(payload);
    expect(resolved).to.equal(expectedValue);
  });

  // Verify the payload in the Web Component section
  cy.get(`#results [restype="${eventId}"] [cnt_type=wc]`, { timeout })
    .first()
    .should(($el) => {
      const payload = $el.get(0).payload;
      const resolved = payloadDataResolver(payload);
      expect(resolved).to.equal(expectedValue);
    });
}

describe('Event payload Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/xtest.html');
    // Wait until both iframe and Web Component are initialized
    cy.get('body[iframe_init][wc_init]').should('exist');
  });

  describe('Client root API', () => {
    it(Events.SET_VIEW_GROUP_DATA_REQUEST, () => {
      checkPayload(Events.SET_VIEW_GROUP_DATA_REQUEST, (payload) => payload.vg1, 'Luigi rocks');
    });

    it(Events.SET_ANCHOR_LINK_REQUEST, () => {
      checkPayload(Events.SET_ANCHOR_LINK_REQUEST, (payload) => payload, 'myAnchor');
    });

    it(Events.ADD_NODE_PARAMS_REQUEST, () => {
      checkPayload(Events.ADD_NODE_PARAMS_REQUEST, (payload) => payload.data?.luigi, 'rocks');
    });

    it(Events.CUSTOM_MESSAGE, () => {
      checkPayload(Events.CUSTOM_MESSAGE, (payload) => payload.id, 'myId');
    });
  });

  describe('Client uxManager API', () => {
    it(Events.ALERT_REQUEST, () => {
      checkPayload(Events.ALERT_REQUEST, (payload) => payload.text, 'test text');
    });

    it(Events.SHOW_CONFIRMATION_MODAL_REQUEST, () => {
      checkPayload(Events.SHOW_CONFIRMATION_MODAL_REQUEST, (payload) => payload.text, 'test text');
    });

    it(Events.ADD_BACKDROP_REQUEST, () => {
      checkPayload(Events.ADD_BACKDROP_REQUEST, (payload) => payload._dontcare, undefined);
    });

    it(Events.REMOVE_BACKDROP_REQUEST, () => {
      checkPayload(Events.REMOVE_BACKDROP_REQUEST, (payload) => payload._dontcare, undefined);
    });

    // it(Events.SET_CURRENT_LOCALE_REQUEST, () => {
    //   checkPayload(Events.SET_CURRENT_LOCALE_REQUEST,
    //     (payload) => { return payload; },
    //     'de_DE'
    //   );
    // });

    // it(Events.SET_DIRTY_STATUS_REQUEST, () => {
    //   checkPayload(Events.SET_DIRTY_STATUS_REQUEST,
    //     (payload) => { return payload; },
    //     true
    //   );
    // });
  });

  describe('Client linkManager API', () => {
    it(Events.NAVIGATION_REQUEST, () => {
      checkPayload(Events.NAVIGATION_REQUEST, (payload) => payload.link, '/foo/bar');
    });

    it(Events.GO_BACK_REQUEST, () => {
      checkPayload(Events.GO_BACK_REQUEST, (payload) => payload.go, 'back');
    });

    it(Events.GET_CURRENT_ROUTE_REQUEST, () => {
      checkPayload(Events.GET_CURRENT_ROUTE_REQUEST, (payload) => payload._dontcare, undefined);
    });

    it(Events.CHECK_PATH_EXISTS_REQUEST, () => {
      checkPayload(Events.CHECK_PATH_EXISTS_REQUEST, (payload) => payload.link, 'some/path');
    });

    // it(Events.UPDATE_MODAL_PATH_DATA_REQUEST, () => {
    //   checkPayload(Events.UPDATE_MODAL_PATH_DATA_REQUEST,
    //     (payload) => { return payload.link; },
    //     'some/path'
    //   );
    // });

    // it(Events.UPDATE_MODAL_SETTINGS_REQUEST, () => {
    //   checkPayload(Events.UPDATE_MODAL_SETTINGS_REQUEST,
    //     (payload) => { return payload.updatedModalSettings.title; },
    //     'bar'
    //   );
    // });
  });

  // describe('Client storageManager API', () => {
  //   it(Events.LOCAL_STORAGE_SET_REQUEST, () => {
  //     checkPayload(Events.LOCAL_STORAGE_SET_REQUEST,
  //       (payload) => { return payload.key; },
  //       'storageKey'
  //     );
  //   });
  // });
});
