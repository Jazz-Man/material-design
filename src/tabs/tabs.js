(function() {
  'use strict';

  /**
   * Class constructor for Tabs MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */
  var MaterialTabs = function MaterialTabs(element) {
    // Stores the HTML element.
    this.element = element;

    // Initialize instance.
    this.init();
  };
  window['MaterialTabs'] = MaterialTabs;

  /**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string}
   * @private
   */
  MaterialTabs.prototype.Constant = {
    // None at the moment.
  };

  /**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
  MaterialTabs.prototype.cssClasses = {
    TAB_CLASS: 'mdl-tabs__tab',
    PANEL_CLASS: 'mdl-tabs__panel',
    ACTIVE_CLASS: 'is-active',
    UPGRADED_CLASS: 'is-upgraded',

    MDL_JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    MDL_RIPPLE_CONTAINER: 'mdl-tabs__ripple-container',
    MDL_RIPPLE: 'mdl-ripple',
    MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events'
  };

  /**
   * Handle clicks to a tabs component
   *
   * @private
   */
  MaterialTabs.prototype.initTabs_ = function() {
    if (this.element.classList.contains(this.cssClasses.MDL_JS_RIPPLE_EFFECT)) {
      this.element.classList.add(
        this.cssClasses.MDL_JS_RIPPLE_EFFECT_IGNORE_EVENTS);
    }

    // Select element tabs, document panels
    this.tabs_ = this.element.querySelectorAll('.' + this.cssClasses.TAB_CLASS);
    this.panels_ =
        this.element.querySelectorAll('.' + this.cssClasses.PANEL_CLASS);

    // Create new tabs for each tab element
    for (var i = 0; i < this.tabs_.length; i++) {
      new MaterialTab(this.tabs_[i], this);
    }

    this.element.classList.add(this.cssClasses.UPGRADED_CLASS);
  };

  /**
   * Reset tab state, dropping active classes
   *
   * @private
   */
  MaterialTabs.prototype.resetTabState_ = function() {
    for (var k = 0; k < this.tabs_.length; k++) {
      this.tabs_[k].classList.remove(this.cssClasses.ACTIVE_CLASS);
    }
  };

  /**
   * Reset panel state, droping active classes
   *
   * @private
   */
  MaterialTabs.prototype.resetPanelState_ = function() {
    for (var j = 0; j < this.panels_.length; j++) {
      this.panels_[j].classList.remove(this.cssClasses.ACTIVE_CLASS);
    }
  };

  /**
   * Initialize element.
   */
  MaterialTabs.prototype.init = function() {
    if (this.element) {
      this.initTabs_();
    }
  };

  /**
   * Constructor for an individual tab.
   *
   * @constructor
   * @param {Element} tab The HTML element for the tab.
   * @param {MaterialTabs} ctx The MaterialTabs object that owns the tab.
   */
  function MaterialTab(tab, ctx) {
    if (tab) {
      if (ctx.element.classList.contains(ctx.cssClasses.MDL_JS_RIPPLE_EFFECT)) {
        var rippleContainer = document.createElement('span');
        rippleContainer.classList.add(ctx.cssClasses.MDL_RIPPLE_CONTAINER);
        rippleContainer.classList.add(ctx.cssClasses.MDL_JS_RIPPLE_EFFECT);
        var ripple = document.createElement('span');
        ripple.classList.add(ctx.cssClasses.MDL_RIPPLE);
        rippleContainer.appendChild(ripple);
        tab.appendChild(rippleContainer);
      }

      tab.addEventListener('click', function(e) {
        e.preventDefault();
        var href = tab.href.split('#')[1];
        var panel = ctx.element.querySelector('#' + href);
        ctx.resetTabState_();
        ctx.resetPanelState_();
        tab.classList.add(ctx.cssClasses.ACTIVE_CLASS);
        panel.classList.add(ctx.cssClasses.ACTIVE_CLASS);
      });

    }
  }

  // The component registers itself. It can assume componentHandler is available
  // in the global scope.
  componentHandler.register({
    constructor: MaterialTabs,
    classAsString: 'MaterialTabs',
    cssClass: 'mdl-js-tabs'
  });
})();
