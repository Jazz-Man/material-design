/**
 * Class constructor for Animation MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 * @param {HTMLElement} element The element that will be upgraded.
 */
function demoAnimation(element) {
  'use strict';

  this.element = element;
  this.position = this.Constant.STARTING_POSITION;
  this.movable_ = this.element.querySelector('.' + this.cssClasses.MOVABLE);
  // Initialize instance.
  this.init();
}

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 * @enum {string}
 * @private
 */
demoAnimation.prototype.cssClasses = {
  MOVABLE: 'demo-animation__movable',
  POSITION_PREFIX: 'demo-animation--position-',
  FAST_OUT_SLOW_IN: 'mdl-animation--fast-out-slow-in',
  LINEAR_OUT_SLOW_IN: 'mdl-animation--linear-out-slow-in',
  FAST_OUT_LINEAR_IN: 'mdl-animation--fast-out-linear-in'
};

/**
 * Store constants in one place so they can be updated easily.
 * @enum {string | number}
 * @private
 */
demoAnimation.prototype.Constant = {
  STARTING_POSITION: 0,
  // Which animation to use for which state. Check demo.css for an explanation.
  ANIMATIONS: [
    demoAnimation.prototype.cssClasses.FAST_OUT_LINEAR_IN,
    demoAnimation.prototype.cssClasses.LINEAR_OUT_SLOW_IN,
    demoAnimation.prototype.cssClasses.FAST_OUT_SLOW_IN,
    demoAnimation.prototype.cssClasses.FAST_OUT_LINEAR_IN,
    demoAnimation.prototype.cssClasses.LINEAR_OUT_SLOW_IN,
    demoAnimation.prototype.cssClasses.FAST_OUT_SLOW_IN
  ]
};

/**
 * Handle click of element.
 * @param {Event} event The event that fired.
 * @private
 */
demoAnimation.prototype.handleClick_ = function(event) {
  'use strict';

  this.movable_.classList.remove(this.cssClasses.POSITION_PREFIX +
                                 this.position);
  this.movable_.classList.remove(this.Constant.ANIMATIONS[this.position]);

  this.position++;
  if (this.position > 5) {
    this.position = 0;
  }

  this.movable_.classList.add(this.Constant.ANIMATIONS[this.position]);
  this.movable_.classList.add(this.cssClasses.POSITION_PREFIX +
                              this.position);
};

/**
 * Initialize element.
 */
demoAnimation.prototype.init = function() {
  'use strict';

  if (this.element) {
    if (!this.movable_) {
      return;
    }

    this.element.addEventListener('click', this.handleClick_.bind(this));
  }
};

// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
  constructor: demoAnimation,
  classAsString: 'demoAnimation',
  cssClass: 'demo-js-animation'
});
