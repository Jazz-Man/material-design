(function() {
  'use strict';

  /**
   * Class constructor for Button MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @param {HTMLElement} element The element that will be upgraded.
   */
  var MaterialButton = function(element) {
    this.element = element;

    // Initialize instance.
    this.init();
  };
  window['MaterialButton'] = MaterialButton;

  /**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
  MaterialButton.prototype.Constant = {
    // None for now.
  };

  /**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
  MaterialButton.prototype.cssClasses = {
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_CONTAINER: 'mdl-button__ripple-container',
    RIPPLE: 'mdl-ripple'
  };

  /**
   * Handle blur of element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
  MaterialButton.prototype.blurHandler = function(event) {
    if (event) {
      this.element.blur();
    }
  };

  // Public methods.

  /**
   * Disable button.
   *
   * @public
   */
  MaterialButton.prototype.disable = function() {
    this.element.disabled = true;
  };
  MaterialButton.prototype['disable'] = MaterialButton.prototype.disable;

  /**
   * Enable button.
   *
   * @public
   */
  MaterialButton.prototype.enable = function() {
    this.element.disabled = false;
  };
  MaterialButton.prototype['enable'] = MaterialButton.prototype.enable;

  /**
   * Initialize element.
   */
  MaterialButton.prototype.init = function() {
    if (this.element) {
      if (this.element.classList.contains(this.cssClasses.RIPPLE_EFFECT)) {
        var rippleContainer = document.createElement('span');
        rippleContainer.classList.add(this.cssClasses.RIPPLE_CONTAINER);
        this.rippleElement = document.createElement('span');
        this.rippleElement.classList.add(this.cssClasses.RIPPLE);
        rippleContainer.appendChild(this.rippleElement);
        this.boundRippleBlurHandler = this.blurHandler.bind(this);
        this.rippleElement.addEventListener('mouseup', this.boundRippleBlurHandler);
        this.element.appendChild(rippleContainer);
      }
      this.boundButtonBlurHandler = this.blurHandler.bind(this);
      this.element.addEventListener('mouseup', this.boundButtonBlurHandler);
      this.element.addEventListener('mouseleave', this.boundButtonBlurHandler);
    }
  };

  // The component registers itself. It can assume componentHandler is available
  // in the global scope.
  componentHandler.register({
    constructor: MaterialButton,
    classAsString: 'MaterialButton',
    cssClass: 'mdl-js-button',
    widget: true
  });
})();
