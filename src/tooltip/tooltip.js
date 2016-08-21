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
   * Class constructor for Tooltip MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
  var MaterialTooltip = function MaterialTooltip(element) {
    this.element = element;

    // Initialize instance.
    this.init();
  };
  window['MaterialTooltip'] = MaterialTooltip;

  /**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
  MaterialTooltip.prototype.Constant = {
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
  MaterialTooltip.prototype.cssClasses = {
    IS_ACTIVE: 'is-active',
    BOTTOM: 'mdl-tooltip--bottom',
    LEFT: 'mdl-tooltip--left',
    RIGHT: 'mdl-tooltip--right',
    TOP: 'mdl-tooltip--top'
  };

  /**
   * Handle mouseenter for tooltip.
   *
   * @param {Event} event The event that fired.
   * @private
   */
  MaterialTooltip.prototype.handleMouseEnter_ = function(event) {
    var props = event.target.getBoundingClientRect();
    var left = props.left + (props.width / 2);
    var top = props.top + (props.height / 2);
    var marginLeft = -1 * (this.element.offsetWidth / 2);
    var marginTop = -1 * (this.element.offsetHeight / 2);

    if (this.element.classList.contains(this.cssClasses.LEFT) || this.element.classList.contains(this.cssClasses.RIGHT)) {
      left = (props.width / 2);
      if (top + marginTop < 0) {
        this.element.style.top = '0';
        this.element.style.marginTop = '0';
      } else {
        this.element.style.top = top + 'px';
        this.element.style.marginTop = marginTop + 'px';
      }
    } else {
      if (left + marginLeft < 0) {
        this.element.style.left = '0';
        this.element.style.marginLeft = '0';
      } else {
        this.element.style.left = left + 'px';
        this.element.style.marginLeft = marginLeft + 'px';
      }
    }

    if (this.element.classList.contains(this.cssClasses.TOP)) {
      this.element.style.top = props.top - this.element.offsetHeight - 10 + 'px';
    } else if (this.element.classList.contains(this.cssClasses.RIGHT)) {
      this.element.style.left = props.left + props.width + 10 + 'px';
    } else if (this.element.classList.contains(this.cssClasses.LEFT)) {
      this.element.style.left = props.left - this.element.offsetWidth - 10 + 'px';
    } else {
      this.element.style.top = props.top + props.height + 10 + 'px';
    }

    this.element.classList.add(this.cssClasses.IS_ACTIVE);
  };

  /**
   * Hide tooltip on mouseleave or scroll
   *
   * @private
   */
  MaterialTooltip.prototype.hideTooltip_ = function() {
    this.element.classList.remove(this.cssClasses.IS_ACTIVE);
  };

  /**
   * Initialize element.
   */
  MaterialTooltip.prototype.init = function() {

    if (this.element) {
      var forElId = this.element.getAttribute('for') ||
                    this.element.getAttribute('data-mdl-for');

      if (forElId) {
        this.forElement = document.getElementById(forElId);
      }

      if (this.forElement) {
        // It's left here because it prevents accidental text selection on Android
        if (!this.forElement.hasAttribute('tabindex')) {
          this.forElement.setAttribute('tabindex', '0');
        }

        this.boundMouseEnterHandler = this.handleMouseEnter_.bind(this);
        this.boundMouseLeaveAndScrollHandler = this.hideTooltip_.bind(this);
        this.forElement.addEventListener('mouseenter', this.boundMouseEnterHandler, false);
        this.forElement.addEventListener('touchend', this.boundMouseEnterHandler, false);
        this.forElement.addEventListener('mouseleave', this.boundMouseLeaveAndScrollHandler, false);
        window.addEventListener('scroll', this.boundMouseLeaveAndScrollHandler, true);
        window.addEventListener('touchstart', this.boundMouseLeaveAndScrollHandler);
      }
    }
  };

  // The component registers itself. It can assume componentHandler is available
  // in the global scope.
  componentHandler.register({
    constructor: MaterialTooltip,
    classAsString: 'MaterialTooltip',
    cssClass: 'mdl-tooltip'
  });
})();
