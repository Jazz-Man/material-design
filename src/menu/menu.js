(function() {
  'use strict';

  /**
   * Class constructor for dropdown MDL component.
   * Implements MDL component design pattern defined at:
   * https://github.com/jasonmayes/mdl-component-design-pattern
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
  var materialMenu = function (element) {
    this.element = element;

    // Initialize instance.
    this.init();
  };
  window['materialMenu'] = materialMenu;

  /**
   * Store constants in one place so they can be updated easily.
   *
   * @enum {string | number}
   * @private
   */
  materialMenu.prototype.Constant = {
    // Total duration of the menu animation.
    TRANSITION_DURATION_SECONDS: 0.3,
    // The fraction of the total duration we want to use for menu item animations.
    TRANSITION_DURATION_FRACTION: 0.8,
    // How long the menu stays open after choosing an option (so the user can see
    // the ripple).
    CLOSE_TIMEOUT: 150
  };

  /**
   * Keycodes, for code readability.
   *
   * @enum {number}
   * @private
   */
  materialMenu.prototype.Keycodes_ = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    UP_ARROW: 38,
    DOWN_ARROW: 40
  };

  /**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
  materialMenu.prototype.cssClasses = {
    CONTAINER: 'mdl-menu__container',
    OUTLINE: 'mdl-menu__outline',
    ITEM: 'mdl-menu__item',
    ITEM_RIPPLE_CONTAINER: 'mdl-menu__item-ripple-container',
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE: 'mdl-ripple',
    // Statuses
    IS_UPGRADED: 'is-upgraded',
    IS_VISIBLE: 'is-visible',
    IS_ANIMATING: 'is-animating',
    // Alignment options
    BOTTOM_LEFT: 'mdl-menu--bottom-left',  // This is the default.
    BOTTOM_RIGHT: 'mdl-menu--bottom-right',
    TOP_LEFT: 'mdl-menu--top-left',
    TOP_RIGHT: 'mdl-menu--top-right',
    UNALIGNED: 'mdl-menu--unaligned'
  };

  /**
   * Initialize element.
   */
  materialMenu.prototype.init = function() {
    if (this.element) {
      // Create container for the menu.
      var container = document.createElement('div');
      container.classList.add(this.cssClasses.CONTAINER);
      this.element.parentElement.insertBefore(container, this.element);
      this.element.parentElement.removeChild(this.element);
      container.appendChild(this.element);
      this.container = container;

      // Create outline for the menu (shadow and background).
      var outline = document.createElement('div');
      outline.classList.add(this.cssClasses.OUTLINE);
      this.outline = outline;
      container.insertBefore(outline, this.element);

      // Find the "for" element and bind events to it.
      var forElId = this.element.getAttribute('for') ||
                    this.element.getAttribute('data-mdl-for');
      var forEl = null;
      if (forElId) {
        forEl = document.getElementById(forElId);
        if (forEl) {
          this.forElement = forEl;
          forEl.addEventListener('click', this.handleForClick.bind(this));
          forEl.addEventListener('keydown',
              this.handleForKeyboardEvent_.bind(this));
        }
      }

      var items = this.element.querySelectorAll('.' + this.cssClasses.ITEM);
      this.boundItemKeydown_ = this.handleItemKeyboardEvent_.bind(this);
      this.boundItemClick_ = this.handleItemClick_.bind(this);
      for (var i = 0; i < items.length; i++) {
        // Add a listener to each menu item.
        items[i].addEventListener('click', this.boundItemClick_);
        // Add a tab index to each menu item.
        items[i].tabIndex = '-1';
        // Add a keyboard listener to each menu item.
        items[i].addEventListener('keydown', this.boundItemKeydown_);
      }

      // Add ripple classes to each item, if the user has enabled ripples.
      if (this.element.classList.contains(this.cssClasses.RIPPLE_EFFECT)) {
        this.element.classList.add(this.cssClasses.RIPPLE_IGNORE_EVENTS);

        for (i = 0; i < items.length; i++) {
          var item = items[i];

          var rippleContainer = document.createElement('span');
          rippleContainer.classList.add(this.cssClasses.ITEM_RIPPLE_CONTAINER);

          var ripple = document.createElement('span');
          ripple.classList.add(this.cssClasses.RIPPLE);
          rippleContainer.appendChild(ripple);

          item.appendChild(rippleContainer);
          item.classList.add(this.cssClasses.RIPPLE_EFFECT);
        }
      }

      // Copy alignment classes to the container, so the outline can use them.
      if (this.element.classList.contains(this.cssClasses.BOTTOM_LEFT)) {
        this.outline.classList.add(this.cssClasses.BOTTOM_LEFT);
      }
      if (this.element.classList.contains(this.cssClasses.BOTTOM_RIGHT)) {
        this.outline.classList.add(this.cssClasses.BOTTOM_RIGHT);
      }
      if (this.element.classList.contains(this.cssClasses.TOP_LEFT)) {
        this.outline.classList.add(this.cssClasses.TOP_LEFT);
      }
      if (this.element.classList.contains(this.cssClasses.TOP_RIGHT)) {
        this.outline.classList.add(this.cssClasses.TOP_RIGHT);
      }
      if (this.element.classList.contains(this.cssClasses.UNALIGNED)) {
        this.outline.classList.add(this.cssClasses.UNALIGNED);
      }

      container.classList.add(this.cssClasses.IS_UPGRADED);
    }
  };

  /**
   * Handles a click on the "for" element, by positioning the menu and then
   * toggling it.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
  materialMenu.prototype.handleForClick = function(evt) {
    if (this.element && this.forElement) {
      var rect = this.forElement.getBoundingClientRect();
      var forRect = this.forElement.parentElement.getBoundingClientRect();

      if (this.element.classList.contains(this.cssClasses.UNALIGNED)) {
        // Do not position the menu automatically. Requires the developer to
        // manually specify position.
      } else if (this.element.classList.contains(
          this.cssClasses.BOTTOM_RIGHT)) {
        // Position below the "for" element, aligned to its right.
        this.container.style.right = (forRect.right - rect.right) + 'px';
        this.container.style.top =
          this.forElement.offsetTop + this.forElement.offsetHeight + 'px';
      } else if (this.element.classList.contains(this.cssClasses.TOP_LEFT)) {
        // Position above the "for" element, aligned to its left.
        this.container.style.left = this.forElement.offsetLeft + 'px';
        this.container.style.bottom = (forRect.bottom - rect.top) + 'px';
      } else if (this.element.classList.contains(this.cssClasses.TOP_RIGHT)) {
        // Position above the "for" element, aligned to its right.
        this.container.style.right = (forRect.right - rect.right) + 'px';
        this.container.style.bottom = (forRect.bottom - rect.top) + 'px';
      } else {
        // Default: position below the "for" element, aligned to its left.
        this.container.style.left = this.forElement.offsetLeft + 'px';
        this.container.style.top =
          this.forElement.offsetTop + this.forElement.offsetHeight + 'px';
      }
    }

    this.toggle(evt);
  };

  /**
   * Handles a keyboard event on the "for" element.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
  materialMenu.prototype.handleForKeyboardEvent_ = function(evt) {
    if (this.element && this.container && this.forElement) {
      var items = this.element.querySelectorAll('.' + this.cssClasses.ITEM +
                                                ':not([disabled])');

      if (items && items.length > 0 &&
          this.container.classList.contains(this.cssClasses.IS_VISIBLE)) {
        if (evt.keyCode === this.Keycodes_.UP_ARROW) {
          evt.preventDefault();
          items[items.length - 1].focus();
        } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
          evt.preventDefault();
          items[0].focus();
        }
      }
    }
  };

  /**
   * Handles a keyboard event on an item.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
  materialMenu.prototype.handleItemKeyboardEvent_ = function(evt) {
    if (this.element && this.container) {
      var items = this.element.querySelectorAll('.' + this.cssClasses.ITEM +
                                                ':not([disabled])');

      if (items && items.length > 0 &&
          this.container.classList.contains(this.cssClasses.IS_VISIBLE)) {
        var currentIndex = Array.prototype.slice.call(items).indexOf(evt.target);

        if (evt.keyCode === this.Keycodes_.UP_ARROW) {
          evt.preventDefault();
          if (currentIndex > 0) {
            items[currentIndex - 1].focus();
          } else {
            items[items.length - 1].focus();
          }
        } else if (evt.keyCode === this.Keycodes_.DOWN_ARROW) {
          evt.preventDefault();
          if (items.length > currentIndex + 1) {
            items[currentIndex + 1].focus();
          } else {
            items[0].focus();
          }
        } else if (evt.keyCode === this.Keycodes_.SPACE ||
              evt.keyCode === this.Keycodes_.ENTER) {
          evt.preventDefault();
          // Send mousedown and mouseup to trigger ripple.
          var e = new MouseEvent('mousedown');
          evt.target.dispatchEvent(e);
          e = new MouseEvent('mouseup');
          evt.target.dispatchEvent(e);
          // Send click.
          evt.target.click();
        } else if (evt.keyCode === this.Keycodes_.ESCAPE) {
          evt.preventDefault();
          this.hide();
        }
      }
    }
  };

  /**
   * Handles a click event on an item.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
  materialMenu.prototype.handleItemClick_ = function(evt) {
    if (evt.target.hasAttribute('disabled')) {
      evt.stopPropagation();
    } else {
      // Wait some time before closing menu, so the user can see the ripple.
      this.closing_ = true;
      window.setTimeout(function(evt) {
        this.hide();
        this.closing_ = false;
      }.bind(this), /** @type {number} */ (this.Constant.CLOSE_TIMEOUT));
    }
  };

  /**
   * Calculates the initial clip (for opening the menu) or final clip (for closing
   * it), and applies it. This allows us to animate from or to the correct point,
   * that is, the point it's aligned to in the "for" element.
   *
   * @param {number} height Height of the clip rectangle
   * @param {number} width Width of the clip rectangle
   * @private
   */
  materialMenu.prototype.applyClip_ = function(height, width) {
    if (this.element.classList.contains(this.cssClasses.UNALIGNED)) {
      // Do not clip.
      this.element.style.clip = '';
    } else if (this.element.classList.contains(this.cssClasses.BOTTOM_RIGHT)) {
      // Clip to the top right corner of the menu.
      this.element.style.clip =
          'rect(0 ' + width + 'px ' + '0 ' + width + 'px)';
    } else if (this.element.classList.contains(this.cssClasses.TOP_LEFT)) {
      // Clip to the bottom left corner of the menu.
      this.element.style.clip =
          'rect(' + height + 'px 0 ' + height + 'px 0)';
    } else if (this.element.classList.contains(this.cssClasses.TOP_RIGHT)) {
      // Clip to the bottom right corner of the menu.
      this.element.style.clip = 'rect(' + height + 'px ' + width + 'px ' +
                                height + 'px ' + width + 'px)';
    } else {
      // Default: do not clip (same as clipping to the top left corner).
      this.element.style.clip = '';
    }
  };

  /**
   * Cleanup function to remove animation listeners.
   *
   * @param {Event} evt
   * @private
   */

  materialMenu.prototype.removeAnimationEndListener_ = function(evt) {
    evt.target.classList.remove(materialMenu.prototype.cssClasses.IS_ANIMATING);
  };

  /**
   * Adds an event listener to clean up after the animation ends.
   *
   * @private
   */
  materialMenu.prototype.addAnimationEndListener_ = function() {
    this.element.addEventListener('transitionend', this.removeAnimationEndListener_);
    this.element.addEventListener('webkitTransitionEnd', this.removeAnimationEndListener_);
  };

  /**
   * Displays the menu.
   *
   * @public
   */
  materialMenu.prototype.show = function(evt) {
    if (this.element && this.container && this.outline) {
      // Measure the inner element.
      var height = this.element.getBoundingClientRect().height;
      var width = this.element.getBoundingClientRect().width;

      // Apply the inner element's size to the container and outline.
      this.container.style.width = width + 'px';
      this.container.style.height = height + 'px';
      this.outline.style.width = width + 'px';
      this.outline.style.height = height + 'px';

      var transitionDuration = this.Constant.TRANSITION_DURATION_SECONDS *
                               this.Constant.TRANSITION_DURATION_FRACTION;

      // Calculate transition delays for individual menu items, so that they fade
      // in one at a time.
      var items = this.element.querySelectorAll('.' + this.cssClasses.ITEM);
      for (var i = 0; i < items.length; i++) {
        var itemDelay = null;
        if (this.element.classList.contains(this.cssClasses.TOP_LEFT) ||
            this.element.classList.contains(this.cssClasses.TOP_RIGHT)) {
          itemDelay = ((height - items[i].offsetTop - items[i].offsetHeight) /
              height * transitionDuration) + 's';
        } else {
          itemDelay = (items[i].offsetTop / height * transitionDuration) + 's';
        }
        items[i].style.transitionDelay = itemDelay;
      }

      // Apply the initial clip to the text before we start animating.
      this.applyClip_(height, width);

      // Wait for the next frame, turn on animation, and apply the final clip.
      // Also make it visible. This triggers the transitions.
      window.requestAnimationFrame(function() {
        this.element.classList.add(this.cssClasses.IS_ANIMATING);
        this.element.style.clip = 'rect(0 ' + width + 'px ' + height + 'px 0)';
        this.container.classList.add(this.cssClasses.IS_VISIBLE);
      }.bind(this));

      // Clean up after the animation is complete.
      this.addAnimationEndListener_();

      // Add a click listener to the document, to close the menu.
      var callback = function(e) {
        // Check to see if the document is processing the same event that
        // displayed the menu in the first place. If so, do nothing.
        // Also check to see if the menu is in the process of closing itself, and
        // do nothing in that case.
        // Also check if the clicked element is a menu item
        // if so, do nothing.
        if (e !== evt && !this.closing_ && e.target.parentNode !== this.element) {
          document.removeEventListener('click', callback);
          this.hide();
        }
      }.bind(this);
      document.addEventListener('click', callback);
    }
  };
  materialMenu.prototype['show'] = materialMenu.prototype.show;

  /**
   * Hides the menu.
   *
   * @public
   */
  materialMenu.prototype.hide = function() {
    if (this.element && this.container && this.outline) {
      var items = this.element.querySelectorAll('.' + this.cssClasses.ITEM);

      // Remove all transition delays; menu items fade out concurrently.
      for (var i = 0; i < items.length; i++) {
        items[i].style.removeProperty('transition-delay');
      }

      // Measure the inner element.
      var rect = this.element.getBoundingClientRect();
      var height = rect.height;
      var width = rect.width;

      // Turn on animation, and apply the final clip. Also make invisible.
      // This triggers the transitions.
      this.element.classList.add(this.cssClasses.IS_ANIMATING);
      this.applyClip_(height, width);
      this.container.classList.remove(this.cssClasses.IS_VISIBLE);

      // Clean up after the animation is complete.
      this.addAnimationEndListener_();
    }
  };
  materialMenu.prototype['hide'] = materialMenu.prototype.hide;

  /**
   * Displays or hides the menu, depending on current state.
   *
   * @public
   */
  materialMenu.prototype.toggle = function(evt) {
    if (this.container.classList.contains(this.cssClasses.IS_VISIBLE)) {
      this.hide();
    } else {
      this.show(evt);
    }
  };
  materialMenu.prototype['toggle'] = materialMenu.prototype.toggle;

  // The component registers itself. It can assume componentHandler is available
  // in the global scope.
  componentHandler.register({
    constructor: materialMenu,
    classAsString: 'materialMenu',
    cssClass: 'mdl-js-menu',
    widget: true
  });
})();
