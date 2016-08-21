/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  'use strict';

  /**
   * Class constructor for Slider MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
  var MaterialSlider = function MaterialSlider(element) {
    this.element = element;
    // Browser feature detection.
    this.isIE_ = window.navigator.msPointerEnabled;
    // Initialize instance.
    this.init();
  };
  window['MaterialSlider'] = MaterialSlider;

  /**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
  MaterialSlider.prototype.Constant = {
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
  MaterialSlider.prototype.cssClasses = {
    IE_CONTAINER: 'mdl-slider__ie-container',
    SLIDER_CONTAINER: 'mdl-slider__container',
    BACKGROUND_FLEX: 'mdl-slider__background-flex',
    BACKGROUND_LOWER: 'mdl-slider__background-lower',
    BACKGROUND_UPPER: 'mdl-slider__background-upper',
    IS_LOWEST_VALUE: 'is-lowest-value',
    IS_UPGRADED: 'is-upgraded'
  };

  /**
   * Handle input on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
  MaterialSlider.prototype.onInput_ = function(event) {
    this.updateValueStyles_();
  };

  /**
   * Handle change on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
  MaterialSlider.prototype.onChange_ = function(event) {
    this.updateValueStyles_();
  };

  /**
   * Handle mouseup on element.
   *
   * @param {Event} event The event that fired.
   * @private
   */
  MaterialSlider.prototype.onMouseUp_ = function(event) {
    event.target.blur();
  };

  /**
   * Handle mousedown on container element.
   * This handler is purpose is to not require the use to click
   * exactly on the 2px slider element, as FireFox seems to be very
   * strict about this.
   *
   * @param {Event} event The event that fired.
   * @private
   * @suppress {missingProperties}
   */
  MaterialSlider.prototype.onContainerMouseDown_ = function(event) {
    // If this click is not on the parent element (but rather some child)
    // ignore. It may still bubble up.
    if (event.target !== this.element.parentElement) {
      return;
    }

    // Discard the original event and create a new event that
    // is on the slider element.
    event.preventDefault();
    var newEvent = new MouseEvent('mousedown', {
      target: event.target,
      buttons: event.buttons,
      clientX: event.clientX,
      clientY: this.element.getBoundingClientRect().y
    });
    this.element.dispatchEvent(newEvent);
  };

  /**
   * Handle updating of values.
   *
   * @private
   */
  MaterialSlider.prototype.updateValueStyles_ = function() {
    // Calculate and apply percentages to div structure behind slider.
    var fraction = (this.element.value - this.element.min) /
                   (this.element.max - this.element.min);

    if (fraction === 0) {
      this.element.classList.add(this.cssClasses.IS_LOWEST_VALUE);
    } else {
      this.element.classList.remove(this.cssClasses.IS_LOWEST_VALUE);
    }

    if (!this.isIE_) {
      this.backgroundLower_.style.flex = fraction;
      this.backgroundLower_.style.webkitFlex = fraction;
      this.backgroundUpper_.style.flex = 1 - fraction;
      this.backgroundUpper_.style.webkitFlex = 1 - fraction;
    }
  };

  // Public methods.

  /**
   * Disable slider.
   *
   * @public
   */
  MaterialSlider.prototype.disable = function() {
    this.element.disabled = true;
  };
  MaterialSlider.prototype['disable'] = MaterialSlider.prototype.disable;

  /**
   * Enable slider.
   *
   * @public
   */
  MaterialSlider.prototype.enable = function() {

    this.element.disabled = false;
  };
  MaterialSlider.prototype['enable'] = MaterialSlider.prototype.enable;

  /**
   * Update slider value.
   *
   * @param {number} value The value to which to set the control (optional).
   * @public
   */
  MaterialSlider.prototype.change = function(value) {

    if (typeof value !== 'undefined') {
      this.element.value = value;
    }
    this.updateValueStyles_();
  };
  MaterialSlider.prototype['change'] = MaterialSlider.prototype.change;

  /**
   * Initialize element.
   */
  MaterialSlider.prototype.init = function() {

    if (this.element) {
      if (this.isIE_) {
        // Since we need to specify a very large height in IE due to
        // implementation limitations, we add a parent here that trims it down to
        // a reasonable size.
        var containerIE = document.createElement('div');
        containerIE.classList.add(this.cssClasses.IE_CONTAINER);
        this.element.parentElement.insertBefore(containerIE, this.element);
        this.element.parentElement.removeChild(this.element);
        containerIE.appendChild(this.element);
      } else {
        // For non-IE browsers, we need a div structure that sits behind the
        // slider and allows us to style the left and right sides of it with
        // different colors.
        var container = document.createElement('div');
        container.classList.add(this.cssClasses.SLIDER_CONTAINER);
        this.element.parentElement.insertBefore(container, this.element);
        this.element.parentElement.removeChild(this.element);
        container.appendChild(this.element);
        var backgroundFlex = document.createElement('div');
        backgroundFlex.classList.add(this.cssClasses.BACKGROUND_FLEX);
        container.appendChild(backgroundFlex);
        this.backgroundLower_ = document.createElement('div');
        this.backgroundLower_.classList.add(this.cssClasses.BACKGROUND_LOWER);
        backgroundFlex.appendChild(this.backgroundLower_);
        this.backgroundUpper_ = document.createElement('div');
        this.backgroundUpper_.classList.add(this.cssClasses.BACKGROUND_UPPER);
        backgroundFlex.appendChild(this.backgroundUpper_);
      }

      this.boundInputHandler = this.onInput_.bind(this);
      this.boundChangeHandler = this.onChange_.bind(this);
      this.boundMouseUpHandler = this.onMouseUp_.bind(this);
      this.boundContainerMouseDownHandler = this.onContainerMouseDown_.bind(this);
      this.element.addEventListener('input', this.boundInputHandler);
      this.element.addEventListener('change', this.boundChangeHandler);
      this.element.addEventListener('mouseup', this.boundMouseUpHandler);
      this.element.parentElement.addEventListener('mousedown', this.boundContainerMouseDownHandler);

      this.updateValueStyles_();
      this.element.classList.add(this.cssClasses.IS_UPGRADED);
    }
  };

  // The component registers itself. It can assume componentHandler is available
  // in the global scope.
  componentHandler.register({
    constructor: MaterialSlider,
    classAsString: 'MaterialSlider',
    cssClass: 'mdl-js-slider',
    widget: true
  });
})();
