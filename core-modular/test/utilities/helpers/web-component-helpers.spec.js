const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const assert = chai.assert;

import {
  DefaultCompoundRenderer,
  CustomCompoundRenderer,
  GridCompoundRenderer,
  resolveRenderer,
  registerEventListeners
 } from '../../../src/utilities/helpers/web-component-helpers';

describe('WebComponentHelpers', function() {
  describe('check DefaultCompoundRenderer', function() {
    it('check default constructor and methods', () => {
      const dcr = new DefaultCompoundRenderer();

      const compoundContainer = dcr.createCompoundContainer();
      expect(compoundContainer.tagName).to.equal('DIV');

      const compoundItemContainer = dcr.createCompoundItemContainer();
      expect(compoundItemContainer.tagName).to.equal('DIV');

      dcr.attachCompoundItem(compoundContainer, compoundItemContainer);
      expect(compoundContainer.firstChild).to.equal(compoundItemContainer);
    });

    it('check constructor with renderer object', () => {
      const rendererObject = {
        config: {
          key: 'value'
        }
      };
      const dcr = new DefaultCompoundRenderer(rendererObject);
      expect(dcr.config.key).to.equal('value');
    });
  });

  describe('check CustomCompoundRenderer', function() {
    const sb = sinon.createSandbox();

    afterEach(() => {
      sb.restore();
    })

    it('check default constructor and methods', () => {
      const ccr = new CustomCompoundRenderer();

      const compoundContainer = ccr.createCompoundContainer();
      expect(compoundContainer.tagName).to.equal('DIV');

      const compoundItemContainer = ccr.createCompoundItemContainer();
      expect(compoundItemContainer.tagName).to.equal('DIV');

      ccr.attachCompoundItem(compoundContainer, compoundItemContainer);
      expect(compoundContainer.firstChild).to.equal(compoundItemContainer);
    });

    it('check constructor with custom renderer object', () => {
      const rendererObject = {
        config: {
          key: 'value',
          tag: 'span'
        },
        use: {
          createCompoundContainer: (config, superRenderer)=>{
            expect(superRenderer).to.be.undefined;
            return document.createElement(config.tag);
          },
          createCompoundItemContainer: (layoutConfig, config, superRenderer) => {
            expect(superRenderer).to.be.undefined;
            return document.createElement(config.tag);
          },
          attachCompoundItem: (compoundCnt, compoundItemCnt, superRenderer) => {
            expect(superRenderer).to.be.undefined;
            const wrapper = document.createElement('div');
            compoundCnt.appendChild(wrapper);
            wrapper.appendChild(compoundItemCnt);
          }
        }
      };
      const ccr = new CustomCompoundRenderer(rendererObject);
      expect(ccr.config.key).to.equal('value');
      expect(ccr.rendererObject).to.equal(rendererObject);

      const compoundContainer = ccr.createCompoundContainer();
      expect(compoundContainer.tagName).to.equal('SPAN');

      const compoundItemContainer = ccr.createCompoundItemContainer();
      expect(compoundItemContainer.tagName).to.equal('SPAN');

      ccr.attachCompoundItem(compoundContainer, compoundItemContainer);
      expect(compoundContainer.firstChild.tagName).to.equal('DIV');
      expect(compoundContainer.firstChild.firstChild).to.equal(compoundItemContainer);
    });

    it('check extending existing renderer', () => {
      const rendererObject = {
        config: {
          key: 'value',
          tag: 'span'
        },
        use: {
          extends: 'sth'
        }
      };

      const ccr = new CustomCompoundRenderer(rendererObject);
      const superRenderer = ccr.superRenderer;
      expect(superRenderer).to.not.be.undefined;
      sb.spy(superRenderer);

      const compoundContainer = ccr.createCompoundContainer();
      assert(superRenderer.createCompoundContainer.calledOnce, 'superrenderer should be called');

      const compoundItemContainer = ccr.createCompoundItemContainer();
      assert(superRenderer.createCompoundContainer.calledOnce, 'superrenderer should be called');

      ccr.attachCompoundItem(compoundContainer, compoundItemContainer);
      assert(superRenderer.attachCompoundItem.calledOnce, 'superrenderer should be called');
    });
  });

  describe('check GridCompoundRenderer', function() {
    it('check default constructor and methods', () => {
      const gcr = new GridCompoundRenderer();

      const compoundContainer = gcr.createCompoundContainer();
      const cnt = compoundContainer.innerHTML.trim();
      assert(cnt.indexOf('<style') === 0, 'should start with style tag');
      assert(cnt.indexOf('display: grid;') > 1, 'should contain display grid');
      assert(cnt.indexOf('grid-template-columns: auto') > 1, 'should contain default grid-template-columns');
      assert(cnt.indexOf('grid-template-rows: auto;') > 1, 'should contain default grid-template-rows');
      assert(cnt.indexOf('grid-gap: 0;') > 1, 'should contain default grid-gap');
      assert(cnt.indexOf('min-height: auto;') > 1, 'should contain default min-height');

      const compoundItemContainer = gcr.createCompoundItemContainer();
      assert(compoundItemContainer.getAttribute('style').indexOf('grid-row:') >= 0,
        'style attribute should contain grid-row');
      assert(compoundItemContainer.getAttribute('style').indexOf('grid-column:') >= 0,
        'style attribute should contain grid-column');

      const layoutConfig = {
        row: 'myrowconfigvalue',
        column: 'mycolumnconfigvalue'
      };
      const compoundItemContainer2 = gcr.createCompoundItemContainer(layoutConfig);
      assert(compoundItemContainer2.getAttribute('style').indexOf('myrowconfigvalue') >= 0,
        'style attribute should contain grid-row');
      assert(compoundItemContainer2.getAttribute('style').indexOf('mycolumnconfigvalue') >= 0,
        'style attribute should contain grid-column');

      gcr.attachCompoundItem(compoundContainer, compoundItemContainer);
      expect(compoundContainer.children[1]).to.equal(compoundItemContainer);
    });

    it('check layout config', () => {
      const rendererObject = {
        config: {
          columns: '10',
          rows: '10',
          gap: '20',
          minHeight: '10vh',
          layouts: [{
              minWidth: 0,
              maxWidth: 50,
              columns: 4,
              rows: 4,
              gap: 10
            },{
              minWidth: 51,
              maxWidth: 100,
              columns: 40,
              rows: 40,
              gap: 100
            }]
        }
      };

      const gcr = new GridCompoundRenderer(rendererObject);
      const compoundContainer = gcr.createCompoundContainer();
      const cnt = compoundContainer.innerHTML.trim();
      assert(cnt.indexOf('display: grid;') > 1, 'should contain display grid');
      assert(cnt.indexOf('grid-template-columns: 10') > 1, 'should contain configured grid-template-columns');
      assert(cnt.indexOf('grid-template-rows: 10;') > 1, 'should contain configured grid-template-rows');
      assert(cnt.indexOf('grid-gap: 20;') > 1, 'should contain configured grid-gap');
      assert(cnt.indexOf('min-height: 10vh;') > 1, 'should contain configured min-height');

      const mqIndex = cnt.indexOf('@media only screen and (min-width: 0px) and (max-width: 50px)');
      assert( mqIndex > 1, 'should contain proper media query');
      assert(cnt.indexOf('grid-template-columns: 4') > mqIndex, 'should contain configured mq grid-template-columns');
      assert(cnt.indexOf('grid-template-rows: 4;') > mqIndex, 'should contain configured mq grid-template-rows');
      assert(cnt.indexOf('grid-gap: 10;') > mqIndex, 'should contain configured mq grid-gap');

      const mqIndex2 = cnt.indexOf('@media only screen and (min-width: 51px) and (max-width: 100px)');
      assert( mqIndex2 > mqIndex, 'should contain proper media query');
      assert(cnt.indexOf('grid-template-columns: 40') > mqIndex2, 'should contain configured mq grid-template-columns');
      assert(cnt.indexOf('grid-template-rows: 40;') > mqIndex2, 'should contain configured mq grid-template-rows');
      assert(cnt.indexOf('grid-gap: 100;') > mqIndex2, 'should contain configured mq grid-gap');
    });
  });


  describe('check resolveRenderer function', function() {
    it('check gridRenderer resolution', () => {
      const rendererInstance = resolveRenderer({ use: 'grid' });
      expect(typeof rendererInstance === typeof new GridCompoundRenderer());
    });

    it('check customRenderer resolution', () => {
      let rendererInstance = resolveRenderer({
        use: { createCompoundContainer: () => {} }
      });
      expect(typeof rendererInstance === typeof new CustomCompoundRenderer());

      rendererInstance = resolveRenderer({
        use: { createCompoundItemContainer: () => {} }
      });
      expect(typeof rendererInstance === typeof new CustomCompoundRenderer());

      rendererInstance = resolveRenderer({
        use: { attachCompoundItem: () => {} }
      });
      expect(typeof rendererInstance === typeof new CustomCompoundRenderer());
    });

    it('check fallback to default', () => {
      let rendererInstance = resolveRenderer({});
      expect(typeof rendererInstance === typeof new DefaultCompoundRenderer());

      rendererInstance = resolveRenderer({ use: 'unknownRenderer'});
      expect(typeof rendererInstance === typeof new DefaultCompoundRenderer());
    });
  });

  describe('check registerEventListeners', function() {
    it('check resolve', () => {
      const navNode = {
        eventListeners: [{
          source: 'evSrc',
          name: 'someEvent',
          action: 'handler',
          dataConverter: (data) => { return data + 'tada'; }
        },{
          source: '*',
          name: 'update',
          action: 'doSth'
        }]
      };
      const eventbusListeners = {
        '*.update': ['listenerMock'],
        'src.someEvent' : ['listenerMock']
      };
      const nodeId = 'somerandomid';
      const wcElement = { elementmock : 1 };

      registerEventListeners(eventbusListeners, navNode, nodeId, wcElement);

      expect(Object.keys(eventbusListeners).length).to.equal(3);
      expect(eventbusListeners['evSrc.someEvent'].length).to.equal(1);
      expect(eventbusListeners['*.update'].length).to.equal(2);

      const listenerInfo = eventbusListeners['evSrc.someEvent'][0];
      expect(listenerInfo.wcElementId).to.equal(nodeId);
      expect(listenerInfo.wcElement).to.equal(wcElement);
      expect(listenerInfo.action).to.equal('handler');
      expect(listenerInfo.converter('data')).to.equal('datatada');
    });
  });
});

