/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v4.0.6
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("whatInput", [], factory);
	else if(typeof exports === 'object')
		exports["whatInput"] = factory();
	else
		root["whatInput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	module.exports = (function() {

	  /*
	    ---------------
	    Variables
	    ---------------
	  */

	  // cache document.documentElement
	  var docElem = document.documentElement;

	  // last used input type
	  var currentInput = 'initial';

	  // last used input intent
	  var currentIntent = null;

	  // form input types
	  var formInputs = [
	    'input',
	    'select',
	    'textarea'
	  ];

	  // list of modifier keys commonly used with the mouse and
	  // can be safely ignored to prevent false keyboard detection
	  var ignoreMap = [
	    16, // shift
	    17, // control
	    18, // alt
	    91, // Windows key / left Apple cmd
	    93  // Windows menu / right Apple cmd
	  ];

	  // mapping of events to input types
	  var inputMap = {
	    'keyup': 'keyboard',
	    'mousedown': 'mouse',
	    'mousemove': 'mouse',
	    'MSPointerDown': 'pointer',
	    'MSPointerMove': 'pointer',
	    'pointerdown': 'pointer',
	    'pointermove': 'pointer',
	    'touchstart': 'touch'
	  };

	  // array of all used input types
	  var inputTypes = [];

	  // boolean: true if touch buffer timer is running
	  var isBuffering = false;

	  // map of IE 10 pointer events
	  var pointerMap = {
	    2: 'touch',
	    3: 'touch', // treat pen like touch
	    4: 'mouse'
	  };

	  // touch buffer timer
	  var touchTimer = null;


	  /*
	    ---------------
	    Set up
	    ---------------
	  */

	  var setUp = function() {

	    // add correct mouse wheel event mapping to `inputMap`
	    inputMap[detectWheel()] = 'mouse';

	    addListeners();
	    setInput();
	  };


	  /*
	    ---------------
	    Events
	    ---------------
	  */

	  var addListeners = function() {

	    // `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
	    // can only demonstrate potential, but not actual, interaction
	    // and are treated separately

	    // pointer events (mouse, pen, touch)
	    if (window.PointerEvent) {
	      docElem.addEventListener('pointerdown', updateInput);
	      docElem.addEventListener('pointermove', setIntent);
	    } else if (window.MSPointerEvent) {
	      docElem.addEventListener('MSPointerDown', updateInput);
	      docElem.addEventListener('MSPointerMove', setIntent);
	    } else {

	      // mouse events
	      docElem.addEventListener('mousedown', updateInput);
	      docElem.addEventListener('mousemove', setIntent);

	      // touch events
	      if ('ontouchstart' in window) {
	        docElem.addEventListener('touchstart', touchBuffer);
	      }
	    }

	    // mouse wheel
	    docElem.addEventListener(detectWheel(), setIntent);

	    // keyboard events
	    docElem.addEventListener('keydown', updateInput);
	    docElem.addEventListener('keyup', updateInput);
	  };

	  // checks conditions before updating new input
	  var updateInput = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var eventKey = event.which;
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (
	        currentInput !== value ||
	        currentIntent !== value
	      ) {

	        var activeElem = document.activeElement;
	        var activeInput = (
	          activeElem &&
	          activeElem.nodeName &&
	          formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1
	        ) ? true : false;

	        if (
	          value === 'touch' ||

	          // ignore mouse modifier keys
	          (value === 'mouse' && ignoreMap.indexOf(eventKey) === -1) ||

	          // don't switch if the current element is a form input
	          (value === 'keyboard' && activeInput)
	        ) {

	          // set the current and catch-all variable
	          currentInput = currentIntent = value;

	          setInput();
	        }
	      }
	    }
	  };

	  // updates the doc and `inputTypes` array with new input
	  var setInput = function() {
	    docElem.setAttribute('data-whatinput', currentInput);
	    docElem.setAttribute('data-whatintent', currentInput);

	    if (inputTypes.indexOf(currentInput) === -1) {
	      inputTypes.push(currentInput);
	      docElem.className += ' whatinput-types-' + currentInput;
	    }
	  };

	  // updates input intent for `mousemove` and `pointermove`
	  var setIntent = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentIntent !== value) {
	        currentIntent = value;

	        docElem.setAttribute('data-whatintent', currentIntent);
	      }
	    }
	  };

	  // buffers touch events because they frequently also fire mouse events
	  var touchBuffer = function(event) {

	    // clear the timer if it happens to be running
	    window.clearTimeout(touchTimer);

	    // set the current input
	    updateInput(event);

	    // set the isBuffering to `true`
	    isBuffering = true;

	    // run the timer
	    touchTimer = window.setTimeout(function() {

	      // if the timer runs out, set isBuffering back to `false`
	      isBuffering = false;
	    }, 200);
	  };


	  /*
	    ---------------
	    Utilities
	    ---------------
	  */

	  var pointerType = function(event) {
	   if (typeof event.pointerType === 'number') {
	      return pointerMap[event.pointerType];
	   } else {
	      return (event.pointerType === 'pen') ? 'touch' : event.pointerType; // treat pen like touch
	   }
	  };

	  // detect version of mouse wheel event to use
	  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
	  var detectWheel = function() {
	    return 'onwheel' in document.createElement('div') ?
	      'wheel' : // Modern browsers support "wheel"

	      document.onmousewheel !== undefined ?
	        'mousewheel' : // Webkit and IE support at least "mousewheel"
	        'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
	  };


	  /*
	    ---------------
	    Init

	    don't start script unless browser cuts the mustard
	    (also passes if polyfills are used)
	    ---------------
	  */

	  if (
	    'addEventListener' in window &&
	    Array.prototype.indexOf
	  ) {
	    setUp();
	  }


	  /*
	    ---------------
	    API
	    ---------------
	  */

	  return {

	    // returns string: the current input type
	    // opt: 'loose'|'strict'
	    // 'strict' (default): returns the same value as the `data-whatinput` attribute
	    // 'loose': includes `data-whatintent` value if it's more current than `data-whatinput`
	    ask: function(opt) { return (opt === 'loose') ? currentIntent : currentInput; },

	    // returns array: all the detected input types
	    types: function() { return inputTypes; }

	  };

	}());


/***/ }
/******/ ])
});
;
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
              _this = this,
              fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function fNOP() {},
          fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
        // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function findFocusable($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },


    /**
     * Traps the focus in the given element.
     * @param  {jQuery} $element  jQuery object to trap the foucs into.
     */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
          $firstFocusable = $focusable.eq(0),
          $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },

    /**
     * Releases the trapped focus from the given element.
     * @param  {jQuery} $element  jQuery object to release the focus for.
     */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Checks if the screen matches to a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
     */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function _watcher() {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          });
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'role': 'menu'
          });
          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
'use strict';

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */
    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        var _this2 = this;

        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('[data-accordion-item]');

        this.$tabs.each(function (idx, el) {
          var $el = $(el),
              $content = $el.children('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });

          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        this.firstTimeInit = true;
        if ($initActive.length) {
          this.down($initActive, this.firstTimeInit);
          this.firstTimeInit = false;
        }

        this._checkDeepLink = function () {
          var anchor = window.location.hash;
          //need a hash and a relevant anchor in this tabset
          if (anchor.length) {
            var $link = _this2.$element.find('[href$="' + anchor + '"]'),
                $anchor = $(anchor);

            if ($link.length && $anchor) {
              if (!$link.parent('[data-accordion-item]').hasClass('is-active')) {
                _this2.down($anchor, _this2.firstTimeInit);
                _this2.firstTimeInit = false;
              };

              //roll up a little to show the titles
              if (_this2.options.deepLinkSmudge) {
                var _this = _this2;
                $(window).load(function () {
                  var offset = _this.$element.offset();
                  $('html, body').animate({ scrollTop: offset.top }, _this.options.deepLinkSmudgeDelay);
                });
              }

              /**
                * Fires when the zplugin has deeplinked at pageload
                * @event Accordion#deeplink
                */
              _this2.$element.trigger('deeplink.zf.accordion', [$link, $anchor]);
            }
          }
        };

        //use browser to open a tab, if it exists in this tabset
        if (this.options.deepLink) {
          this._checkDeepLink();
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              e.preventDefault();
              _this.toggle($tabContent);
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function toggle() {
                  _this.toggle($tabContent);
                },
                next: function next() {
                  var $a = $elem.next().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                previous: function previous() {
                  var $a = $elem.prev().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                handled: function handled() {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
        if (this.options.deepLink) {
          $(window).on('popstate', this._checkDeepLink);
        }
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle (`.accordion-content`).
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          this.up($target);
        } else {
          this.down($target);
        }
        //either replace or update browser history
        if (this.options.deepLink) {
          var anchor = $target.prev('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open (`.accordion-content`).
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this3 = this;

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive.not($target));
          }
        }

        $target.slideDown(this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this3.$element.trigger('down.zf.accordion', [$target]);
        });

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close (`.accordion-content`).
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;

        if (!this.options.allowAllClosed && !$aunts.hasClass('is-active') || !$target.parent().hasClass('is-active')) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');
        if (this.options.deepLink) {
          $(window).off('popstate', this._checkDeepLink);
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @type {number}
     * @default 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @type {boolean}
     * @default false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @type {boolean}
     * @default false
     */
    allowAllClosed: false,
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @type {boolean}
     * @default false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the accordion panel is visible
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @type {number}
     * @default 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open accordion
     * @option
     * @type {boolean}
     * @default false
     */
    updateHistory: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Interchange module.
   * @module foundation.interchange
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.timerAndImageLoader
   */

  var Interchange = function () {
    /**
     * Creates a new instance of Interchange.
     * @class
     * @fires Interchange#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Interchange(element, options) {
      _classCallCheck(this, Interchange);

      this.$element = element;
      this.options = $.extend({}, Interchange.defaults, options);
      this.rules = [];
      this.currentPath = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Interchange');
    }

    /**
     * Initializes the Interchange plugin and calls functions to get interchange functioning on load.
     * @function
     * @private
     */


    _createClass(Interchange, [{
      key: '_init',
      value: function _init() {
        this._addBreakpoints();
        this._generateRules();
        this._reflow();
      }

      /**
       * Initializes events for Interchange.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        $(window).on('resize.zf.interchange', Foundation.util.throttle(function () {
          _this2._reflow();
        }, 50));
      }

      /**
       * Calls necessary functions to update Interchange upon DOM change
       * @function
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        var match;

        // Iterate through each rule, but only save the last match
        for (var i in this.rules) {
          if (this.rules.hasOwnProperty(i)) {
            var rule = this.rules[i];
            if (window.matchMedia(rule.query).matches) {
              match = rule;
            }
          }
        }

        if (match) {
          this.replace(match.path);
        }
      }

      /**
       * Gets the Foundation breakpoints and adds them to the Interchange.SPECIAL_QUERIES object.
       * @function
       * @private
       */

    }, {
      key: '_addBreakpoints',
      value: function _addBreakpoints() {
        for (var i in Foundation.MediaQuery.queries) {
          if (Foundation.MediaQuery.queries.hasOwnProperty(i)) {
            var query = Foundation.MediaQuery.queries[i];
            Interchange.SPECIAL_QUERIES[query.name] = query.value;
          }
        }
      }

      /**
       * Checks the Interchange element for the provided media query + content pairings
       * @function
       * @private
       * @param {Object} element - jQuery object that is an Interchange instance
       * @returns {Array} scenarios - Array of objects that have 'mq' and 'path' keys with corresponding keys
       */

    }, {
      key: '_generateRules',
      value: function _generateRules(element) {
        var rulesList = [];
        var rules;

        if (this.options.rules) {
          rules = this.options.rules;
        } else {
          rules = this.$element.data('interchange');
        }

        rules = typeof rules === 'string' ? rules.match(/\[.*?\]/g) : rules;

        for (var i in rules) {
          if (rules.hasOwnProperty(i)) {
            var rule = rules[i].slice(1, -1).split(', ');
            var path = rule.slice(0, -1).join('');
            var query = rule[rule.length - 1];

            if (Interchange.SPECIAL_QUERIES[query]) {
              query = Interchange.SPECIAL_QUERIES[query];
            }

            rulesList.push({
              path: path,
              query: query
            });
          }
        }

        this.rules = rulesList;
      }

      /**
       * Update the `src` property of an image, or change the HTML of a container, to the specified path.
       * @function
       * @param {String} path - Path to the image or HTML partial.
       * @fires Interchange#replaced
       */

    }, {
      key: 'replace',
      value: function replace(path) {
        if (this.currentPath === path) return;

        var _this = this,
            trigger = 'replaced.zf.interchange';

        // Replacing images
        if (this.$element[0].nodeName === 'IMG') {
          this.$element.attr('src', path).on('load', function () {
            _this.currentPath = path;
          }).trigger(trigger);
        }
        // Replacing background images
        else if (path.match(/\.(gif|jpg|jpeg|png|svg|tiff)([?#].*)?/i)) {
            this.$element.css({ 'background-image': 'url(' + path + ')' }).trigger(trigger);
          }
          // Replacing HTML
          else {
              $.get(path, function (response) {
                _this.$element.html(response).trigger(trigger);
                $(response).foundation();
                _this.currentPath = path;
              });
            }

        /**
         * Fires when content in an Interchange element is done being loaded.
         * @event Interchange#replaced
         */
        // this.$element.trigger('replaced.zf.interchange');
      }

      /**
       * Destroys an instance of interchange.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        //TODO this.
      }
    }]);

    return Interchange;
  }();

  /**
   * Default settings for plugin
   */


  Interchange.defaults = {
    /**
     * Rules to be applied to Interchange elements. Set with the `data-interchange` array notation.
     * @option
     * @type {?array}
     * @default null
     */
    rules: null
  };

  Interchange.SPECIAL_QUERIES = {
    'landscape': 'screen and (orientation: landscape)',
    'portrait': 'screen and (orientation: portrait)',
    'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
  };

  // Window exports
  Foundation.plugin(Interchange, 'Interchange');
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tabs module.
   * @module foundation.tabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader if tabs contain images
   */

  var Tabs = function () {
    /**
     * Creates a new instance of tabs.
     * @class
     * @fires Tabs#init
     * @param {jQuery} element - jQuery object to make into tabs.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Tabs(element, options) {
      _classCallCheck(this, Tabs);

      this.$element = element;
      this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

      this._init();
      Foundation.registerPlugin(this, 'Tabs');
      Foundation.Keyboard.register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      });
    }

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */


    _createClass(Tabs, [{
      key: '_init',
      value: function _init() {
        var _this2 = this;

        var _this = this;

        this.$element.attr({ 'role': 'tablist' });
        this.$tabTitles = this.$element.find('.' + this.options.linkClass);
        this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

        this.$tabTitles.each(function () {
          var $elem = $(this),
              $link = $elem.find('a'),
              isActive = $elem.hasClass('' + _this.options.linkActiveClass),
              hash = $link[0].hash.slice(1),
              linkId = $link[0].id ? $link[0].id : hash + '-label',
              $tabContent = $('#' + hash);

          $elem.attr({ 'role': 'presentation' });

          $link.attr({
            'role': 'tab',
            'aria-controls': hash,
            'aria-selected': isActive,
            'id': linkId
          });

          $tabContent.attr({
            'role': 'tabpanel',
            'aria-hidden': !isActive,
            'aria-labelledby': linkId
          });

          if (isActive && _this.options.autoFocus) {
            $(window).load(function () {
              $('html, body').animate({ scrollTop: $elem.offset().top }, _this.options.deepLinkSmudgeDelay, function () {
                $link.focus();
              });
            });
          }
        });
        if (this.options.matchHeight) {
          var $images = this.$tabContent.find('img');

          if ($images.length) {
            Foundation.onImagesLoaded($images, this._setHeight.bind(this));
          } else {
            this._setHeight();
          }
        }

        //current context-bound function to open tabs on page load or history popstate
        this._checkDeepLink = function () {
          var anchor = window.location.hash;
          //need a hash and a relevant anchor in this tabset
          if (anchor.length) {
            var $link = _this2.$element.find('[href$="' + anchor + '"]');
            if ($link.length) {
              _this2.selectTab($(anchor), true);

              //roll up a little to show the titles
              if (_this2.options.deepLinkSmudge) {
                var offset = _this2.$element.offset();
                $('html, body').animate({ scrollTop: offset.top }, _this2.options.deepLinkSmudgeDelay);
              }

              /**
                * Fires when the zplugin has deeplinked at pageload
                * @event Tabs#deeplink
                */
              _this2.$element.trigger('deeplink.zf.tabs', [$link, $(anchor)]);
            }
          }
        };

        //use browser to open a tab, if it exists in this tabset
        if (this.options.deepLink) {
          this._checkDeepLink();
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._addKeyHandler();
        this._addClickHandler();
        this._setHeightMqHandler = null;

        if (this.options.matchHeight) {
          this._setHeightMqHandler = this._setHeight.bind(this);

          $(window).on('changed.zf.mediaquery', this._setHeightMqHandler);
        }

        if (this.options.deepLink) {
          $(window).on('popstate', this._checkDeepLink);
        }
      }

      /**
       * Adds click handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        var _this = this;

        this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this._handleTabChange($(this));
        });
      }

      /**
       * Adds keyboard event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addKeyHandler',
      value: function _addKeyHandler() {
        var _this = this;

        this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
          if (e.which === 9) return;

          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              if (_this.options.wrapOnKeys) {
                $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
                $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
              } else {
                $prevElement = $elements.eq(Math.max(0, i - 1));
                $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              }
              return;
            }
          });

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Tabs', {
            open: function open() {
              $element.find('[role="tab"]').focus();
              _this._handleTabChange($element);
            },
            previous: function previous() {
              $prevElement.find('[role="tab"]').focus();
              _this._handleTabChange($prevElement);
            },
            next: function next() {
              $nextElement.find('[role="tab"]').focus();
              _this._handleTabChange($nextElement);
            },
            handled: function handled() {
              e.stopPropagation();
              e.preventDefault();
            }
          });
        });
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`. Collapses active tab.
       * @param {jQuery} $target - Tab to open.
       * @param {boolean} historyHandled - browser has already handled a history update
       * @fires Tabs#change
       * @function
       */

    }, {
      key: '_handleTabChange',
      value: function _handleTabChange($target, historyHandled) {

        /**
         * Check for active class on target. Collapse if exists.
         */
        if ($target.hasClass('' + this.options.linkActiveClass)) {
          if (this.options.activeCollapse) {
            this._collapseTab($target);

            /**
             * Fires when the zplugin has successfully collapsed tabs.
             * @event Tabs#collapse
             */
            this.$element.trigger('collapse.zf.tabs', [$target]);
          }
          return;
        }

        var $oldTab = this.$element.find('.' + this.options.linkClass + '.' + this.options.linkActiveClass),
            $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        //close old tab
        this._collapseTab($oldTab);

        //open new tab
        this._openTab($target);

        //either replace or update browser history
        if (this.options.deepLink && !historyHandled) {
          var anchor = $target.find('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }

        /**
         * Fires when the plugin has successfully changed tabs.
         * @event Tabs#change
         */
        this.$element.trigger('change.zf.tabs', [$target, $targetContent]);

        //fire to children a mutation event
        $targetContent.find("[data-mutate]").trigger("mutateme.zf.trigger");
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_openTab',
      value: function _openTab($target) {
        var $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        $target.addClass('' + this.options.linkActiveClass);

        $tabLink.attr({ 'aria-selected': 'true' });

        $targetContent.addClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'false' });
      }

      /**
       * Collapses `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_collapseTab',
      value: function _collapseTab($target) {
        var $target_anchor = $target.removeClass('' + this.options.linkActiveClass).find('[role="tab"]').attr({ 'aria-selected': 'false' });

        $('#' + $target_anchor.attr('aria-controls')).removeClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'true' });
      }

      /**
       * Public method for selecting a content pane to display.
       * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
       * @param {boolean} historyHandled - browser has already handled a history update
       * @function
       */

    }, {
      key: 'selectTab',
      value: function selectTab(elem, historyHandled) {
        var idStr;

        if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
          idStr = elem[0].id;
        } else {
          idStr = elem;
        }

        if (idStr.indexOf('#') < 0) {
          idStr = '#' + idStr;
        }

        var $target = this.$tabTitles.find('[href$="' + idStr + '"]').parent('.' + this.options.linkClass);

        this._handleTabChange($target, historyHandled);
      }
    }, {
      key: '_setHeight',

      /**
       * Sets the height of each panel to the height of the tallest panel.
       * If enabled in options, gets called on media query change.
       * If loading content via external source, can be called directly or with _reflow.
       * If enabled with `data-match-height="true"`, tabs sets to equal height
       * @function
       * @private
       */
      value: function _setHeight() {
        var max = 0,
            _this = this; // Lock down the `this` value for the root tabs object

        this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {

          var panel = $(this),
              isActive = panel.hasClass('' + _this.options.panelActiveClass); // get the options from the parent instead of trying to get them from the child

          if (!isActive) {
            panel.css({ 'visibility': 'hidden', 'display': 'block' });
          }

          var temp = this.getBoundingClientRect().height;

          if (!isActive) {
            panel.css({
              'visibility': '',
              'display': ''
            });
          }

          max = temp > max ? temp : max;
        }).css('height', max + 'px');
      }

      /**
       * Destroys an instance of an tabs.
       * @fires Tabs#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

        if (this.options.matchHeight) {
          if (this._setHeightMqHandler != null) {
            $(window).off('changed.zf.mediaquery', this._setHeightMqHandler);
          }
        }

        if (this.options.deepLink) {
          $(window).off('popstate', this._checkDeepLink);
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tabs;
  }();

  Tabs.defaults = {
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @type {boolean}
     * @default false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the tab panel is visible
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @type {number}
     * @default 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open tab
     * @option
     * @type {boolean}
     * @default false
     */
    updateHistory: false,

    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * Not recommended if more than one tab panel per page.
     * @option
     * @type {boolean}
     * @default false
     */
    autoFocus: false,

    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @type {boolean}
     * @default true
     */
    wrapOnKeys: true,

    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @type {boolean}
     * @default false
     */
    matchHeight: false,

    /**
     * Allows active tabs to collapse when clicked.
     * @option
     * @type {boolean}
     * @default false
     */
    activeCollapse: false,

    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @type {string}
     * @default 'tabs-title'
     */
    linkClass: 'tabs-title',

    /**
     * Class applied to the active `li` in tab link list.
     * @option
     * @type {string}
     * @default 'is-active'
     */
    linkActiveClass: 'is-active',

    /**
     * Class applied to the content containers.
     * @option
     * @type {string}
     * @default 'tabs-panel'
     */
    panelClass: 'tabs-panel',

    /**
     * Class applied to the active content container.
     * @option
     * @type {string}
     * @default 'is-active'
     */
    panelActiveClass: 'is-active'
  };

  // Window exports
  Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.LazyLoad = factory();
})(this, function () {
    'use strict';

    var defaultSettings = {
        elements_selector: "img",
        container: window,
        threshold: 300,
        throttle: 150,
        data_src: "original",
        data_srcset: "originalSet",
        class_loading: "loading",
        class_loaded: "loaded",
        class_error: "error",
        class_initial: "initial",
        skip_invisible: true,
        callback_load: null,
        callback_error: null,
        callback_set: null,
        callback_processed: null
    };

    var isBot = !("onscroll" in window) || /glebot/.test(navigator.userAgent);

    var callCallback = function callCallback(callback, argument) {
        if (callback) {
            callback(argument);
        }
    };

    var getTopOffset = function getTopOffset(element) {
        return element.getBoundingClientRect().top + window.pageYOffset - element.ownerDocument.documentElement.clientTop;
    };

    var isBelowViewport = function isBelowViewport(element, container, threshold) {
        var fold = container === window ? window.innerHeight + window.pageYOffset : getTopOffset(container) + container.offsetHeight;
        return fold <= getTopOffset(element) - threshold;
    };

    var getLeftOffset = function getLeftOffset(element) {
        return element.getBoundingClientRect().left + window.pageXOffset - element.ownerDocument.documentElement.clientLeft;
    };

    var isAtRightOfViewport = function isAtRightOfViewport(element, container, threshold) {
        var documentWidth = window.innerWidth;
        var fold = container === window ? documentWidth + window.pageXOffset : getLeftOffset(container) + documentWidth;
        return fold <= getLeftOffset(element) - threshold;
    };

    var isAboveViewport = function isAboveViewport(element, container, threshold) {
        var fold = container === window ? window.pageYOffset : getTopOffset(container);
        return fold >= getTopOffset(element) + threshold + element.offsetHeight;
    };

    var isAtLeftOfViewport = function isAtLeftOfViewport(element, container, threshold) {
        var fold = container === window ? window.pageXOffset : getLeftOffset(container);
        return fold >= getLeftOffset(element) + threshold + element.offsetWidth;
    };

    var isInsideViewport = function isInsideViewport(element, container, threshold) {
        return !isBelowViewport(element, container, threshold) && !isAboveViewport(element, container, threshold) && !isAtRightOfViewport(element, container, threshold) && !isAtLeftOfViewport(element, container, threshold);
    };

    /* Creates instance and notifies it through the window element */
    var createInstance = function createInstance(classObj, options) {
        var instance = new classObj(options);
        var event = new CustomEvent("LazyLoad::Initialized", { detail: { instance: instance } });
        window.dispatchEvent(event);
    };

    /* Auto initialization of one or more instances of lazyload, depending on the 
        options passed in (plain object or an array) */
    var autoInitialize = function autoInitialize(classObj, options) {
        var optsLength = options.length;
        if (!optsLength) {
            // Plain object
            createInstance(classObj, options);
        } else {
            // Array of objects
            for (var i = 0; i < optsLength; i++) {
                createInstance(classObj, options[i]);
            }
        }
    };

    var setSourcesForPicture = function setSourcesForPicture(element, srcsetDataAttribute) {
        var parent = element.parentElement;
        if (parent.tagName !== "PICTURE") {
            return;
        }
        for (var i = 0; i < parent.children.length; i++) {
            var pictureChild = parent.children[i];
            if (pictureChild.tagName === "SOURCE") {
                var sourceSrcset = pictureChild.dataset[srcsetDataAttribute];
                if (sourceSrcset) {
                    pictureChild.setAttribute("srcset", sourceSrcset);
                }
            }
        }
    };

    var setSources = function setSources(element, srcsetDataAttribute, srcDataAttribute) {
        var tagName = element.tagName;
        var elementSrc = element.dataset[srcDataAttribute];
        if (tagName === "IMG") {
            setSourcesForPicture(element, srcsetDataAttribute);
            var imgSrcset = element.dataset[srcsetDataAttribute];
            if (imgSrcset) {
                element.setAttribute("srcset", imgSrcset);
            }
            if (elementSrc) {
                element.setAttribute("src", elementSrc);
            }
            return;
        }
        if (tagName === "IFRAME") {
            if (elementSrc) {
                element.setAttribute("src", elementSrc);
            }
            return;
        }
        if (elementSrc) {
            element.style.backgroundImage = "url(" + elementSrc + ")";
        }
    };

    /*
     * Constructor
     */

    var LazyLoad = function LazyLoad(instanceSettings) {
        this._settings = _extends({}, defaultSettings, instanceSettings);
        this._queryOriginNode = this._settings.container === window ? document : this._settings.container;

        this._previousLoopTime = 0;
        this._loopTimeout = null;
        this._boundHandleScroll = this.handleScroll.bind(this);

        this._isFirstLoop = true;
        window.addEventListener("resize", this._boundHandleScroll);
        this.update();
    };

    LazyLoad.prototype = {

        /*
         * Private methods
         */

        _reveal: function _reveal(element) {
            var settings = this._settings;

            var errorCallback = function errorCallback() {
                /* As this method is asynchronous, it must be protected against external destroy() calls */
                if (!settings) {
                    return;
                }
                element.removeEventListener("load", loadCallback);
                element.removeEventListener("error", errorCallback);
                element.classList.remove(settings.class_loading);
                element.classList.add(settings.class_error);
                callCallback(settings.callback_error, element);
            };

            var loadCallback = function loadCallback() {
                /* As this method is asynchronous, it must be protected against external destroy() calls */
                if (!settings) {
                    return;
                }
                element.classList.remove(settings.class_loading);
                element.classList.add(settings.class_loaded);
                element.removeEventListener("load", loadCallback);
                element.removeEventListener("error", errorCallback);
                /* Calling LOAD callback */
                callCallback(settings.callback_load, element);
            };

            if (element.tagName === "IMG" || element.tagName === "IFRAME") {
                element.addEventListener("load", loadCallback);
                element.addEventListener("error", errorCallback);
                element.classList.add(settings.class_loading);
            }

            setSources(element, settings.data_srcset, settings.data_src);
            /* Calling SET callback */
            callCallback(settings.callback_set, element);
        },

        _loopThroughElements: function _loopThroughElements() {
            var settings = this._settings,
                elements = this._elements,
                elementsLength = !elements ? 0 : elements.length;
            var i = void 0,
                processedIndexes = [],
                firstLoop = this._isFirstLoop;

            for (i = 0; i < elementsLength; i++) {
                var element = elements[i];
                /* If must skip_invisible and element is invisible, skip it */
                if (settings.skip_invisible && element.offsetParent === null) {
                    continue;
                }

                if (isBot || isInsideViewport(element, settings.container, settings.threshold)) {
                    if (firstLoop) {
                        element.classList.add(settings.class_initial);
                    }
                    /* Start loading the image */
                    this._reveal(element);
                    /* Marking the element as processed. */
                    processedIndexes.push(i);
                    element.dataset.wasProcessed = true;
                }
            }
            /* Removing processed elements from this._elements. */
            while (processedIndexes.length > 0) {
                elements.splice(processedIndexes.pop(), 1);
                /* Calling the end loop callback */
                callCallback(settings.callback_processed, elements.length);
            }
            /* Stop listening to scroll event when 0 elements remains */
            if (elementsLength === 0) {
                this._stopScrollHandler();
            }
            /* Sets isFirstLoop to false */
            if (firstLoop) {
                this._isFirstLoop = false;
            }
        },

        _purgeElements: function _purgeElements() {
            var elements = this._elements,
                elementsLength = elements.length;
            var i = void 0,
                elementsToPurge = [];

            for (i = 0; i < elementsLength; i++) {
                var element = elements[i];
                /* If the element has already been processed, skip it */
                if (element.dataset.wasProcessed) {
                    elementsToPurge.push(i);
                }
            }
            /* Removing elements to purge from this._elements. */
            while (elementsToPurge.length > 0) {
                elements.splice(elementsToPurge.pop(), 1);
            }
        },

        _startScrollHandler: function _startScrollHandler() {
            if (!this._isHandlingScroll) {
                this._isHandlingScroll = true;
                this._settings.container.addEventListener("scroll", this._boundHandleScroll);
            }
        },

        _stopScrollHandler: function _stopScrollHandler() {
            if (this._isHandlingScroll) {
                this._isHandlingScroll = false;
                this._settings.container.removeEventListener("scroll", this._boundHandleScroll);
            }
        },

        /* 
         * Public methods
         */

        handleScroll: function handleScroll() {
            var throttle = this._settings.throttle;

            if (throttle !== 0) {
                var getTime = function getTime() {
                    new Date().getTime();
                };
                var now = getTime();
                var remainingTime = throttle - (now - this._previousLoopTime);
                if (remainingTime <= 0 || remainingTime > throttle) {
                    if (this._loopTimeout) {
                        clearTimeout(this._loopTimeout);
                        this._loopTimeout = null;
                    }
                    this._previousLoopTime = now;
                    this._loopThroughElements();
                } else if (!this._loopTimeout) {
                    this._loopTimeout = setTimeout(function () {
                        this._previousLoopTime = getTime();
                        this._loopTimeout = null;
                        this._loopThroughElements();
                    }.bind(this), remainingTime);
                }
            } else {
                this._loopThroughElements();
            }
        },

        update: function update() {
            // Converts to array the nodeset obtained querying the DOM from _queryOriginNode with elements_selector
            this._elements = Array.prototype.slice.call(this._queryOriginNode.querySelectorAll(this._settings.elements_selector));
            this._purgeElements();
            this._loopThroughElements();
            this._startScrollHandler();
        },

        destroy: function destroy() {
            window.removeEventListener("resize", this._boundHandleScroll);
            if (this._loopTimeout) {
                clearTimeout(this._loopTimeout);
                this._loopTimeout = null;
            }
            this._stopScrollHandler();
            this._elements = null;
            this._queryOriginNode = null;
            this._settings = null;
        }
    };

    /* Automatic instances creation if required (useful for async script loading!) */
    var autoInitOptions = window.lazyLoadOptions;
    if (autoInitOptions) {
        autoInitialize(LazyLoad, autoInitOptions);
    }

    return LazyLoad;
});

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * Flickity PACKAGED v2.0.5
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * http://flickity.metafizzy.co
 * Copyright 2016 Metafizzy
 */

!function (t, e) {
  "function" == typeof define && define.amd ? define("jquery-bridget/jquery-bridget", ["jquery"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("jquery")) : t.jQueryBridget = e(t, t.jQuery);
}(window, function (t, e) {
  "use strict";
  function i(i, o, a) {
    function l(t, e, n) {
      var s,
          o = "$()." + i + '("' + e + '")';return t.each(function (t, l) {
        var h = a.data(l, i);if (!h) return void r(i + " not initialized. Cannot call methods, i.e. " + o);var c = h[e];if (!c || "_" == e.charAt(0)) return void r(o + " is not a valid method");var d = c.apply(h, n);s = void 0 === s ? d : s;
      }), void 0 !== s ? s : t;
    }function h(t, e) {
      t.each(function (t, n) {
        var s = a.data(n, i);s ? (s.option(e), s._init()) : (s = new o(n, e), a.data(n, i, s));
      });
    }a = a || e || t.jQuery, a && (o.prototype.option || (o.prototype.option = function (t) {
      a.isPlainObject(t) && (this.options = a.extend(!0, this.options, t));
    }), a.fn[i] = function (t) {
      if ("string" == typeof t) {
        var e = s.call(arguments, 1);return l(this, t, e);
      }return h(this, t), this;
    }, n(a));
  }function n(t) {
    !t || t && t.bridget || (t.bridget = i);
  }var s = Array.prototype.slice,
      o = t.console,
      r = "undefined" == typeof o ? function () {} : function (t) {
    o.error(t);
  };return n(e || t.jQuery), i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.EvEmitter = e();
}("undefined" != typeof window ? window : undefined, function () {
  function t() {}var e = t.prototype;return e.on = function (t, e) {
    if (t && e) {
      var i = this._events = this._events || {},
          n = i[t] = i[t] || [];return n.indexOf(e) == -1 && n.push(e), this;
    }
  }, e.once = function (t, e) {
    if (t && e) {
      this.on(t, e);var i = this._onceEvents = this._onceEvents || {},
          n = i[t] = i[t] || {};return n[e] = !0, this;
    }
  }, e.off = function (t, e) {
    var i = this._events && this._events[t];if (i && i.length) {
      var n = i.indexOf(e);return n != -1 && i.splice(n, 1), this;
    }
  }, e.emitEvent = function (t, e) {
    var i = this._events && this._events[t];if (i && i.length) {
      var n = 0,
          s = i[n];e = e || [];for (var o = this._onceEvents && this._onceEvents[t]; s;) {
        var r = o && o[s];r && (this.off(t, s), delete o[s]), s.apply(this, e), n += r ? 0 : 1, s = i[n];
      }return this;
    }
  }, t;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("get-size/get-size", [], function () {
    return e();
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.getSize = e();
}(window, function () {
  "use strict";
  function t(t) {
    var e = parseFloat(t),
        i = t.indexOf("%") == -1 && !isNaN(e);return i && e;
  }function e() {}function i() {
    for (var t = { width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0 }, e = 0; e < h; e++) {
      var i = l[e];t[i] = 0;
    }return t;
  }function n(t) {
    var e = getComputedStyle(t);return e || a("Style returned " + e + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), e;
  }function s() {
    if (!c) {
      c = !0;var e = document.createElement("div");e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style.boxSizing = "border-box";var i = document.body || document.documentElement;i.appendChild(e);var s = n(e);o.isBoxSizeOuter = r = 200 == t(s.width), i.removeChild(e);
    }
  }function o(e) {
    if (s(), "string" == typeof e && (e = document.querySelector(e)), e && "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && e.nodeType) {
      var o = n(e);if ("none" == o.display) return i();var a = {};a.width = e.offsetWidth, a.height = e.offsetHeight;for (var c = a.isBorderBox = "border-box" == o.boxSizing, d = 0; d < h; d++) {
        var u = l[d],
            f = o[u],
            p = parseFloat(f);a[u] = isNaN(p) ? 0 : p;
      }var v = a.paddingLeft + a.paddingRight,
          g = a.paddingTop + a.paddingBottom,
          m = a.marginLeft + a.marginRight,
          y = a.marginTop + a.marginBottom,
          S = a.borderLeftWidth + a.borderRightWidth,
          E = a.borderTopWidth + a.borderBottomWidth,
          b = c && r,
          x = t(o.width);x !== !1 && (a.width = x + (b ? 0 : v + S));var C = t(o.height);return C !== !1 && (a.height = C + (b ? 0 : g + E)), a.innerWidth = a.width - (v + S), a.innerHeight = a.height - (g + E), a.outerWidth = a.width + m, a.outerHeight = a.height + y, a;
    }
  }var r,
      a = "undefined" == typeof console ? e : function (t) {
    console.error(t);
  },
      l = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
      h = l.length,
      c = !1;return o;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("desandro-matches-selector/matches-selector", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.matchesSelector = e();
}(window, function () {
  "use strict";
  var t = function () {
    var t = Element.prototype;if (t.matches) return "matches";if (t.matchesSelector) return "matchesSelector";for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
      var n = e[i],
          s = n + "MatchesSelector";if (t[s]) return s;
    }
  }();return function (e, i) {
    return e[t](i);
  };
}), function (t, e) {
  "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["desandro-matches-selector/matches-selector"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.matchesSelector);
}(window, function (t, e) {
  var i = {};i.extend = function (t, e) {
    for (var i in e) {
      t[i] = e[i];
    }return t;
  }, i.modulo = function (t, e) {
    return (t % e + e) % e;
  }, i.makeArray = function (t) {
    var e = [];if (Array.isArray(t)) e = t;else if (t && "number" == typeof t.length) for (var i = 0; i < t.length; i++) {
      e.push(t[i]);
    } else e.push(t);return e;
  }, i.removeFrom = function (t, e) {
    var i = t.indexOf(e);i != -1 && t.splice(i, 1);
  }, i.getParent = function (t, i) {
    for (; t != document.body;) {
      if (t = t.parentNode, e(t, i)) return t;
    }
  }, i.getQueryElement = function (t) {
    return "string" == typeof t ? document.querySelector(t) : t;
  }, i.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, i.filterFindElements = function (t, n) {
    t = i.makeArray(t);var s = [];return t.forEach(function (t) {
      if (t instanceof HTMLElement) {
        if (!n) return void s.push(t);e(t, n) && s.push(t);for (var i = t.querySelectorAll(n), o = 0; o < i.length; o++) {
          s.push(i[o]);
        }
      }
    }), s;
  }, i.debounceMethod = function (t, e, i) {
    var n = t.prototype[e],
        s = e + "Timeout";t.prototype[e] = function () {
      var t = this[s];t && clearTimeout(t);var e = arguments,
          o = this;this[s] = setTimeout(function () {
        n.apply(o, e), delete o[s];
      }, i || 100);
    };
  }, i.docReady = function (t) {
    var e = document.readyState;"complete" == e || "interactive" == e ? setTimeout(t) : document.addEventListener("DOMContentLoaded", t);
  }, i.toDashed = function (t) {
    return t.replace(/(.)([A-Z])/g, function (t, e, i) {
      return e + "-" + i;
    }).toLowerCase();
  };var n = t.console;return i.htmlInit = function (e, s) {
    i.docReady(function () {
      var o = i.toDashed(s),
          r = "data-" + o,
          a = document.querySelectorAll("[" + r + "]"),
          l = document.querySelectorAll(".js-" + o),
          h = i.makeArray(a).concat(i.makeArray(l)),
          c = r + "-options",
          d = t.jQuery;h.forEach(function (t) {
        var i,
            o = t.getAttribute(r) || t.getAttribute(c);try {
          i = o && JSON.parse(o);
        } catch (a) {
          return void (n && n.error("Error parsing " + r + " on " + t.className + ": " + a));
        }var l = new e(t, i);d && d.data(t, s, l);
      });
    });
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/cell", ["get-size/get-size"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("get-size")) : (t.Flickity = t.Flickity || {}, t.Flickity.Cell = e(t, t.getSize));
}(window, function (t, e) {
  function i(t, e) {
    this.element = t, this.parent = e, this.create();
  }var n = i.prototype;return n.create = function () {
    this.element.style.position = "absolute", this.x = 0, this.shift = 0;
  }, n.destroy = function () {
    this.element.style.position = "";var t = this.parent.originSide;this.element.style[t] = "";
  }, n.getSize = function () {
    this.size = e(this.element);
  }, n.setPosition = function (t) {
    this.x = t, this.updateTarget(), this.renderPosition(t);
  }, n.updateTarget = n.setDefaultTarget = function () {
    var t = "left" == this.parent.originSide ? "marginLeft" : "marginRight";this.target = this.x + this.size[t] + this.size.width * this.parent.cellAlign;
  }, n.renderPosition = function (t) {
    var e = this.parent.originSide;this.element.style[e] = this.parent.getPositionValue(t);
  }, n.wrapShift = function (t) {
    this.shift = t, this.renderPosition(this.x + this.parent.slideableWidth * t);
  }, n.remove = function () {
    this.element.parentNode.removeChild(this.element);
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/slide", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : (t.Flickity = t.Flickity || {}, t.Flickity.Slide = e());
}(window, function () {
  "use strict";
  function t(t) {
    this.parent = t, this.isOriginLeft = "left" == t.originSide, this.cells = [], this.outerWidth = 0, this.height = 0;
  }var e = t.prototype;return e.addCell = function (t) {
    if (this.cells.push(t), this.outerWidth += t.size.outerWidth, this.height = Math.max(t.size.outerHeight, this.height), 1 == this.cells.length) {
      this.x = t.x;var e = this.isOriginLeft ? "marginLeft" : "marginRight";this.firstMargin = t.size[e];
    }
  }, e.updateTarget = function () {
    var t = this.isOriginLeft ? "marginRight" : "marginLeft",
        e = this.getLastCell(),
        i = e ? e.size[t] : 0,
        n = this.outerWidth - (this.firstMargin + i);this.target = this.x + this.firstMargin + n * this.parent.cellAlign;
  }, e.getLastCell = function () {
    return this.cells[this.cells.length - 1];
  }, e.select = function () {
    this.changeSelectedClass("add");
  }, e.unselect = function () {
    this.changeSelectedClass("remove");
  }, e.changeSelectedClass = function (t) {
    this.cells.forEach(function (e) {
      e.element.classList[t]("is-selected");
    });
  }, e.getCellElements = function () {
    return this.cells.map(function (t) {
      return t.element;
    });
  }, t;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/animate", ["fizzy-ui-utils/utils"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("fizzy-ui-utils")) : (t.Flickity = t.Flickity || {}, t.Flickity.animatePrototype = e(t, t.fizzyUIUtils));
}(window, function (t, e) {
  var i = t.requestAnimationFrame || t.webkitRequestAnimationFrame,
      n = 0;i || (i = function i(t) {
    var e = new Date().getTime(),
        i = Math.max(0, 16 - (e - n)),
        s = setTimeout(t, i);return n = e + i, s;
  });var s = {};s.startAnimation = function () {
    this.isAnimating || (this.isAnimating = !0, this.restingFrames = 0, this.animate());
  }, s.animate = function () {
    this.applyDragForce(), this.applySelectedAttraction();var t = this.x;if (this.integratePhysics(), this.positionSlider(), this.settle(t), this.isAnimating) {
      var e = this;i(function () {
        e.animate();
      });
    }
  };var o = function () {
    var t = document.documentElement.style;return "string" == typeof t.transform ? "transform" : "WebkitTransform";
  }();return s.positionSlider = function () {
    var t = this.x;this.options.wrapAround && this.cells.length > 1 && (t = e.modulo(t, this.slideableWidth), t -= this.slideableWidth, this.shiftWrapCells(t)), t += this.cursorPosition, t = this.options.rightToLeft && o ? -t : t;var i = this.getPositionValue(t);this.slider.style[o] = this.isAnimating ? "translate3d(" + i + ",0,0)" : "translateX(" + i + ")";var n = this.slides[0];if (n) {
      var s = -this.x - n.target,
          r = s / this.slidesWidth;this.dispatchEvent("scroll", null, [r, s]);
    }
  }, s.positionSliderAtSelected = function () {
    this.cells.length && (this.x = -this.selectedSlide.target, this.positionSlider());
  }, s.getPositionValue = function (t) {
    return this.options.percentPosition ? .01 * Math.round(t / this.size.innerWidth * 1e4) + "%" : Math.round(t) + "px";
  }, s.settle = function (t) {
    this.isPointerDown || Math.round(100 * this.x) != Math.round(100 * t) || this.restingFrames++, this.restingFrames > 2 && (this.isAnimating = !1, delete this.isFreeScrolling, this.positionSlider(), this.dispatchEvent("settle"));
  }, s.shiftWrapCells = function (t) {
    var e = this.cursorPosition + t;this._shiftCells(this.beforeShiftCells, e, -1);var i = this.size.innerWidth - (t + this.slideableWidth + this.cursorPosition);this._shiftCells(this.afterShiftCells, i, 1);
  }, s._shiftCells = function (t, e, i) {
    for (var n = 0; n < t.length; n++) {
      var s = t[n],
          o = e > 0 ? i : 0;s.wrapShift(o), e -= s.size.outerWidth;
    }
  }, s._unshiftCells = function (t) {
    if (t && t.length) for (var e = 0; e < t.length; e++) {
      t[e].wrapShift(0);
    }
  }, s.integratePhysics = function () {
    this.x += this.velocity, this.velocity *= this.getFrictionFactor();
  }, s.applyForce = function (t) {
    this.velocity += t;
  }, s.getFrictionFactor = function () {
    return 1 - this.options[this.isFreeScrolling ? "freeScrollFriction" : "friction"];
  }, s.getRestingPosition = function () {
    return this.x + this.velocity / (1 - this.getFrictionFactor());
  }, s.applyDragForce = function () {
    if (this.isPointerDown) {
      var t = this.dragX - this.x,
          e = t - this.velocity;this.applyForce(e);
    }
  }, s.applySelectedAttraction = function () {
    if (!this.isPointerDown && !this.isFreeScrolling && this.cells.length) {
      var t = this.selectedSlide.target * -1 - this.x,
          e = t * this.options.selectedAttraction;this.applyForce(e);
    }
  }, s;
}), function (t, e) {
  if ("function" == typeof define && define.amd) define("flickity/js/flickity", ["ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./cell", "./slide", "./animate"], function (i, n, s, o, r, a) {
    return e(t, i, n, s, o, r, a);
  });else if ("object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports) module.exports = e(t, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./cell"), require("./slide"), require("./animate"));else {
    var i = t.Flickity;t.Flickity = e(t, t.EvEmitter, t.getSize, t.fizzyUIUtils, i.Cell, i.Slide, i.animatePrototype);
  }
}(window, function (t, e, i, n, s, o, r) {
  function a(t, e) {
    for (t = n.makeArray(t); t.length;) {
      e.appendChild(t.shift());
    }
  }function l(t, e) {
    var i = n.getQueryElement(t);if (!i) return void (d && d.error("Bad element for Flickity: " + (i || t)));if (this.element = i, this.element.flickityGUID) {
      var s = f[this.element.flickityGUID];return s.option(e), s;
    }h && (this.$element = h(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e), this._create();
  }var h = t.jQuery,
      c = t.getComputedStyle,
      d = t.console,
      u = 0,
      f = {};l.defaults = { accessibility: !0, cellAlign: "center", freeScrollFriction: .075, friction: .28, namespaceJQueryEvents: !0, percentPosition: !0, resize: !0, selectedAttraction: .025, setGallerySize: !0 }, l.createMethods = [];var p = l.prototype;n.extend(p, e.prototype), p._create = function () {
    var e = this.guid = ++u;this.element.flickityGUID = e, f[e] = this, this.selectedIndex = 0, this.restingFrames = 0, this.x = 0, this.velocity = 0, this.originSide = this.options.rightToLeft ? "right" : "left", this.viewport = document.createElement("div"), this.viewport.className = "flickity-viewport", this._createSlider(), (this.options.resize || this.options.watchCSS) && t.addEventListener("resize", this), l.createMethods.forEach(function (t) {
      this[t]();
    }, this), this.options.watchCSS ? this.watchCSS() : this.activate();
  }, p.option = function (t) {
    n.extend(this.options, t);
  }, p.activate = function () {
    if (!this.isActive) {
      this.isActive = !0, this.element.classList.add("flickity-enabled"), this.options.rightToLeft && this.element.classList.add("flickity-rtl"), this.getSize();var t = this._filterFindCellElements(this.element.children);a(t, this.slider), this.viewport.appendChild(this.slider), this.element.appendChild(this.viewport), this.reloadCells(), this.options.accessibility && (this.element.tabIndex = 0, this.element.addEventListener("keydown", this)), this.emitEvent("activate");var e,
          i = this.options.initialIndex;e = this.isInitActivated ? this.selectedIndex : void 0 !== i && this.cells[i] ? i : 0, this.select(e, !1, !0), this.isInitActivated = !0;
    }
  }, p._createSlider = function () {
    var t = document.createElement("div");t.className = "flickity-slider", t.style[this.originSide] = 0, this.slider = t;
  }, p._filterFindCellElements = function (t) {
    return n.filterFindElements(t, this.options.cellSelector);
  }, p.reloadCells = function () {
    this.cells = this._makeCells(this.slider.children), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize();
  }, p._makeCells = function (t) {
    var e = this._filterFindCellElements(t),
        i = e.map(function (t) {
      return new s(t, this);
    }, this);return i;
  }, p.getLastCell = function () {
    return this.cells[this.cells.length - 1];
  }, p.getLastSlide = function () {
    return this.slides[this.slides.length - 1];
  }, p.positionCells = function () {
    this._sizeCells(this.cells), this._positionCells(0);
  }, p._positionCells = function (t) {
    t = t || 0, this.maxCellHeight = t ? this.maxCellHeight || 0 : 0;var e = 0;if (t > 0) {
      var i = this.cells[t - 1];e = i.x + i.size.outerWidth;
    }for (var n = this.cells.length, s = t; s < n; s++) {
      var o = this.cells[s];o.setPosition(e), e += o.size.outerWidth, this.maxCellHeight = Math.max(o.size.outerHeight, this.maxCellHeight);
    }this.slideableWidth = e, this.updateSlides(), this._containSlides(), this.slidesWidth = n ? this.getLastSlide().target - this.slides[0].target : 0;
  }, p._sizeCells = function (t) {
    t.forEach(function (t) {
      t.getSize();
    });
  }, p.updateSlides = function () {
    if (this.slides = [], this.cells.length) {
      var t = new o(this);this.slides.push(t);var e = "left" == this.originSide,
          i = e ? "marginRight" : "marginLeft",
          n = this._getCanCellFit();this.cells.forEach(function (e, s) {
        if (!t.cells.length) return void t.addCell(e);var r = t.outerWidth - t.firstMargin + (e.size.outerWidth - e.size[i]);n.call(this, s, r) ? t.addCell(e) : (t.updateTarget(), t = new o(this), this.slides.push(t), t.addCell(e));
      }, this), t.updateTarget(), this.updateSelectedSlide();
    }
  }, p._getCanCellFit = function () {
    var t = this.options.groupCells;if (!t) return function () {
      return !1;
    };if ("number" == typeof t) {
      var e = parseInt(t, 10);return function (t) {
        return t % e !== 0;
      };
    }var i = "string" == typeof t && t.match(/^(\d+)%$/),
        n = i ? parseInt(i[1], 10) / 100 : 1;return function (t, e) {
      return e <= (this.size.innerWidth + 1) * n;
    };
  }, p._init = p.reposition = function () {
    this.positionCells(), this.positionSliderAtSelected();
  }, p.getSize = function () {
    this.size = i(this.element), this.setCellAlign(), this.cursorPosition = this.size.innerWidth * this.cellAlign;
  };var v = { center: { left: .5, right: .5 }, left: { left: 0, right: 1 }, right: { right: 0, left: 1 } };return p.setCellAlign = function () {
    var t = v[this.options.cellAlign];this.cellAlign = t ? t[this.originSide] : this.options.cellAlign;
  }, p.setGallerySize = function () {
    if (this.options.setGallerySize) {
      var t = this.options.adaptiveHeight && this.selectedSlide ? this.selectedSlide.height : this.maxCellHeight;this.viewport.style.height = t + "px";
    }
  }, p._getWrapShiftCells = function () {
    if (this.options.wrapAround) {
      this._unshiftCells(this.beforeShiftCells), this._unshiftCells(this.afterShiftCells);var t = this.cursorPosition,
          e = this.cells.length - 1;this.beforeShiftCells = this._getGapCells(t, e, -1), t = this.size.innerWidth - this.cursorPosition, this.afterShiftCells = this._getGapCells(t, 0, 1);
    }
  }, p._getGapCells = function (t, e, i) {
    for (var n = []; t > 0;) {
      var s = this.cells[e];if (!s) break;n.push(s), e += i, t -= s.size.outerWidth;
    }return n;
  }, p._containSlides = function () {
    if (this.options.contain && !this.options.wrapAround && this.cells.length) {
      var t = this.options.rightToLeft,
          e = t ? "marginRight" : "marginLeft",
          i = t ? "marginLeft" : "marginRight",
          n = this.slideableWidth - this.getLastCell().size[i],
          s = n < this.size.innerWidth,
          o = this.cursorPosition + this.cells[0].size[e],
          r = n - this.size.innerWidth * (1 - this.cellAlign);this.slides.forEach(function (t) {
        s ? t.target = n * this.cellAlign : (t.target = Math.max(t.target, o), t.target = Math.min(t.target, r));
      }, this);
    }
  }, p.dispatchEvent = function (t, e, i) {
    var n = e ? [e].concat(i) : i;if (this.emitEvent(t, n), h && this.$element) {
      t += this.options.namespaceJQueryEvents ? ".flickity" : "";var s = t;if (e) {
        var o = h.Event(e);o.type = t, s = o;
      }this.$element.trigger(s, i);
    }
  }, p.select = function (t, e, i) {
    this.isActive && (t = parseInt(t, 10), this._wrapSelect(t), (this.options.wrapAround || e) && (t = n.modulo(t, this.slides.length)), this.slides[t] && (this.selectedIndex = t, this.updateSelectedSlide(), i ? this.positionSliderAtSelected() : this.startAnimation(), this.options.adaptiveHeight && this.setGallerySize(), this.dispatchEvent("select"), this.dispatchEvent("cellSelect")));
  }, p._wrapSelect = function (t) {
    var e = this.slides.length,
        i = this.options.wrapAround && e > 1;if (!i) return t;var s = n.modulo(t, e),
        o = Math.abs(s - this.selectedIndex),
        r = Math.abs(s + e - this.selectedIndex),
        a = Math.abs(s - e - this.selectedIndex);!this.isDragSelect && r < o ? t += e : !this.isDragSelect && a < o && (t -= e), t < 0 ? this.x -= this.slideableWidth : t >= e && (this.x += this.slideableWidth);
  }, p.previous = function (t, e) {
    this.select(this.selectedIndex - 1, t, e);
  }, p.next = function (t, e) {
    this.select(this.selectedIndex + 1, t, e);
  }, p.updateSelectedSlide = function () {
    var t = this.slides[this.selectedIndex];t && (this.unselectSelectedSlide(), this.selectedSlide = t, t.select(), this.selectedCells = t.cells, this.selectedElements = t.getCellElements(), this.selectedCell = t.cells[0], this.selectedElement = this.selectedElements[0]);
  }, p.unselectSelectedSlide = function () {
    this.selectedSlide && this.selectedSlide.unselect();
  }, p.selectCell = function (t, e, i) {
    var n;"number" == typeof t ? n = this.cells[t] : ("string" == typeof t && (t = this.element.querySelector(t)), n = this.getCell(t));for (var s = 0; n && s < this.slides.length; s++) {
      var o = this.slides[s],
          r = o.cells.indexOf(n);if (r != -1) return void this.select(s, e, i);
    }
  }, p.getCell = function (t) {
    for (var e = 0; e < this.cells.length; e++) {
      var i = this.cells[e];if (i.element == t) return i;
    }
  }, p.getCells = function (t) {
    t = n.makeArray(t);var e = [];return t.forEach(function (t) {
      var i = this.getCell(t);i && e.push(i);
    }, this), e;
  }, p.getCellElements = function () {
    return this.cells.map(function (t) {
      return t.element;
    });
  }, p.getParentCell = function (t) {
    var e = this.getCell(t);return e ? e : (t = n.getParent(t, ".flickity-slider > *"), this.getCell(t));
  }, p.getAdjacentCellElements = function (t, e) {
    if (!t) return this.selectedSlide.getCellElements();e = void 0 === e ? this.selectedIndex : e;var i = this.slides.length;if (1 + 2 * t >= i) return this.getCellElements();for (var s = [], o = e - t; o <= e + t; o++) {
      var r = this.options.wrapAround ? n.modulo(o, i) : o,
          a = this.slides[r];a && (s = s.concat(a.getCellElements()));
    }return s;
  }, p.uiChange = function () {
    this.emitEvent("uiChange");
  }, p.childUIPointerDown = function (t) {
    this.emitEvent("childUIPointerDown", [t]);
  }, p.onresize = function () {
    this.watchCSS(), this.resize();
  }, n.debounceMethod(l, "onresize", 150), p.resize = function () {
    if (this.isActive) {
      this.getSize(), this.options.wrapAround && (this.x = n.modulo(this.x, this.slideableWidth)), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("resize");var t = this.selectedElements && this.selectedElements[0];this.selectCell(t, !1, !0);
    }
  }, p.watchCSS = function () {
    var t = this.options.watchCSS;if (t) {
      var e = c(this.element, ":after").content;e.indexOf("flickity") != -1 ? this.activate() : this.deactivate();
    }
  }, p.onkeydown = function (t) {
    if (this.options.accessibility && (!document.activeElement || document.activeElement == this.element)) if (37 == t.keyCode) {
      var e = this.options.rightToLeft ? "next" : "previous";this.uiChange(), this[e]();
    } else if (39 == t.keyCode) {
      var i = this.options.rightToLeft ? "previous" : "next";this.uiChange(), this[i]();
    }
  }, p.deactivate = function () {
    this.isActive && (this.element.classList.remove("flickity-enabled"), this.element.classList.remove("flickity-rtl"), this.cells.forEach(function (t) {
      t.destroy();
    }), this.unselectSelectedSlide(), this.element.removeChild(this.viewport), a(this.slider.children, this.element), this.options.accessibility && (this.element.removeAttribute("tabIndex"), this.element.removeEventListener("keydown", this)), this.isActive = !1, this.emitEvent("deactivate"));
  }, p.destroy = function () {
    this.deactivate(), t.removeEventListener("resize", this), this.emitEvent("destroy"), h && this.$element && h.removeData(this.element, "flickity"), delete this.element.flickityGUID, delete f[this.guid];
  }, n.extend(p, r), l.data = function (t) {
    t = n.getQueryElement(t);var e = t && t.flickityGUID;return e && f[e];
  }, n.htmlInit(l, "flickity"), h && h.bridget && h.bridget("flickity", l), l.Cell = s, l;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("unipointer/unipointer", ["ev-emitter/ev-emitter"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("ev-emitter")) : t.Unipointer = e(t, t.EvEmitter);
}(window, function (t, e) {
  function i() {}function n() {}var s = n.prototype = Object.create(e.prototype);s.bindStartEvent = function (t) {
    this._bindStartEvent(t, !0);
  }, s.unbindStartEvent = function (t) {
    this._bindStartEvent(t, !1);
  }, s._bindStartEvent = function (e, i) {
    i = void 0 === i || !!i;var n = i ? "addEventListener" : "removeEventListener";t.navigator.pointerEnabled ? e[n]("pointerdown", this) : t.navigator.msPointerEnabled ? e[n]("MSPointerDown", this) : (e[n]("mousedown", this), e[n]("touchstart", this));
  }, s.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, s.getTouch = function (t) {
    for (var e = 0; e < t.length; e++) {
      var i = t[e];if (i.identifier == this.pointerIdentifier) return i;
    }
  }, s.onmousedown = function (t) {
    var e = t.button;e && 0 !== e && 1 !== e || this._pointerDown(t, t);
  }, s.ontouchstart = function (t) {
    this._pointerDown(t, t.changedTouches[0]);
  }, s.onMSPointerDown = s.onpointerdown = function (t) {
    this._pointerDown(t, t);
  }, s._pointerDown = function (t, e) {
    this.isPointerDown || (this.isPointerDown = !0, this.pointerIdentifier = void 0 !== e.pointerId ? e.pointerId : e.identifier, this.pointerDown(t, e));
  }, s.pointerDown = function (t, e) {
    this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e]);
  };var o = { mousedown: ["mousemove", "mouseup"], touchstart: ["touchmove", "touchend", "touchcancel"], pointerdown: ["pointermove", "pointerup", "pointercancel"], MSPointerDown: ["MSPointerMove", "MSPointerUp", "MSPointerCancel"] };return s._bindPostStartEvents = function (e) {
    if (e) {
      var i = o[e.type];i.forEach(function (e) {
        t.addEventListener(e, this);
      }, this), this._boundPointerEvents = i;
    }
  }, s._unbindPostStartEvents = function () {
    this._boundPointerEvents && (this._boundPointerEvents.forEach(function (e) {
      t.removeEventListener(e, this);
    }, this), delete this._boundPointerEvents);
  }, s.onmousemove = function (t) {
    this._pointerMove(t, t);
  }, s.onMSPointerMove = s.onpointermove = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerMove(t, t);
  }, s.ontouchmove = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerMove(t, e);
  }, s._pointerMove = function (t, e) {
    this.pointerMove(t, e);
  }, s.pointerMove = function (t, e) {
    this.emitEvent("pointerMove", [t, e]);
  }, s.onmouseup = function (t) {
    this._pointerUp(t, t);
  }, s.onMSPointerUp = s.onpointerup = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerUp(t, t);
  }, s.ontouchend = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerUp(t, e);
  }, s._pointerUp = function (t, e) {
    this._pointerDone(), this.pointerUp(t, e);
  }, s.pointerUp = function (t, e) {
    this.emitEvent("pointerUp", [t, e]);
  }, s._pointerDone = function () {
    this.isPointerDown = !1, delete this.pointerIdentifier, this._unbindPostStartEvents(), this.pointerDone();
  }, s.pointerDone = i, s.onMSPointerCancel = s.onpointercancel = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerCancel(t, t);
  }, s.ontouchcancel = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerCancel(t, e);
  }, s._pointerCancel = function (t, e) {
    this._pointerDone(), this.pointerCancel(t, e);
  }, s.pointerCancel = function (t, e) {
    this.emitEvent("pointerCancel", [t, e]);
  }, n.getPointerPoint = function (t) {
    return { x: t.pageX, y: t.pageY };
  }, n;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("unidragger/unidragger", ["unipointer/unipointer"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("unipointer")) : t.Unidragger = e(t, t.Unipointer);
}(window, function (t, e) {
  function i() {}function n() {}var s = n.prototype = Object.create(e.prototype);s.bindHandles = function () {
    this._bindHandles(!0);
  }, s.unbindHandles = function () {
    this._bindHandles(!1);
  };var o = t.navigator;return s._bindHandles = function (t) {
    t = void 0 === t || !!t;var e;e = o.pointerEnabled ? function (e) {
      e.style.touchAction = t ? "none" : "";
    } : o.msPointerEnabled ? function (e) {
      e.style.msTouchAction = t ? "none" : "";
    } : i;for (var n = t ? "addEventListener" : "removeEventListener", s = 0; s < this.handles.length; s++) {
      var r = this.handles[s];this._bindStartEvent(r, t), e(r), r[n]("click", this);
    }
  }, s.pointerDown = function (t, e) {
    if ("INPUT" == t.target.nodeName && "range" == t.target.type) return this.isPointerDown = !1, void delete this.pointerIdentifier;this._dragPointerDown(t, e);var i = document.activeElement;i && i.blur && i.blur(), this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e]);
  }, s._dragPointerDown = function (t, i) {
    this.pointerDownPoint = e.getPointerPoint(i);var n = this.canPreventDefaultOnPointerDown(t, i);n && t.preventDefault();
  }, s.canPreventDefaultOnPointerDown = function (t) {
    return "SELECT" != t.target.nodeName;
  }, s.pointerMove = function (t, e) {
    var i = this._dragPointerMove(t, e);this.emitEvent("pointerMove", [t, e, i]), this._dragMove(t, e, i);
  }, s._dragPointerMove = function (t, i) {
    var n = e.getPointerPoint(i),
        s = { x: n.x - this.pointerDownPoint.x, y: n.y - this.pointerDownPoint.y };return !this.isDragging && this.hasDragStarted(s) && this._dragStart(t, i), s;
  }, s.hasDragStarted = function (t) {
    return Math.abs(t.x) > 3 || Math.abs(t.y) > 3;
  }, s.pointerUp = function (t, e) {
    this.emitEvent("pointerUp", [t, e]), this._dragPointerUp(t, e);
  }, s._dragPointerUp = function (t, e) {
    this.isDragging ? this._dragEnd(t, e) : this._staticClick(t, e);
  }, s._dragStart = function (t, i) {
    this.isDragging = !0, this.dragStartPoint = e.getPointerPoint(i), this.isPreventingClicks = !0, this.dragStart(t, i);
  }, s.dragStart = function (t, e) {
    this.emitEvent("dragStart", [t, e]);
  }, s._dragMove = function (t, e, i) {
    this.isDragging && this.dragMove(t, e, i);
  }, s.dragMove = function (t, e, i) {
    t.preventDefault(), this.emitEvent("dragMove", [t, e, i]);
  }, s._dragEnd = function (t, e) {
    this.isDragging = !1, setTimeout(function () {
      delete this.isPreventingClicks;
    }.bind(this)), this.dragEnd(t, e);
  }, s.dragEnd = function (t, e) {
    this.emitEvent("dragEnd", [t, e]);
  }, s.onclick = function (t) {
    this.isPreventingClicks && t.preventDefault();
  }, s._staticClick = function (t, e) {
    if (!this.isIgnoringMouseUp || "mouseup" != t.type) {
      var i = t.target.nodeName;"INPUT" != i && "TEXTAREA" != i || t.target.focus(), this.staticClick(t, e), "mouseup" != t.type && (this.isIgnoringMouseUp = !0, setTimeout(function () {
        delete this.isIgnoringMouseUp;
      }.bind(this), 400));
    }
  }, s.staticClick = function (t, e) {
    this.emitEvent("staticClick", [t, e]);
  }, n.getPointerPoint = e.getPointerPoint, n;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/drag", ["./flickity", "unidragger/unidragger", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("unidragger"), require("fizzy-ui-utils")) : t.Flickity = e(t, t.Flickity, t.Unidragger, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  function s() {
    return { x: t.pageXOffset, y: t.pageYOffset };
  }n.extend(e.defaults, { draggable: !0, dragThreshold: 3 }), e.createMethods.push("_createDrag");var o = e.prototype;n.extend(o, i.prototype);var r = "createTouch" in document,
      a = !1;o._createDrag = function () {
    this.on("activate", this.bindDrag), this.on("uiChange", this._uiChangeDrag), this.on("childUIPointerDown", this._childUIPointerDownDrag), this.on("deactivate", this.unbindDrag), r && !a && (t.addEventListener("touchmove", function () {}), a = !0);
  }, o.bindDrag = function () {
    this.options.draggable && !this.isDragBound && (this.element.classList.add("is-draggable"), this.handles = [this.viewport], this.bindHandles(), this.isDragBound = !0);
  }, o.unbindDrag = function () {
    this.isDragBound && (this.element.classList.remove("is-draggable"), this.unbindHandles(), delete this.isDragBound);
  }, o._uiChangeDrag = function () {
    delete this.isFreeScrolling;
  }, o._childUIPointerDownDrag = function (t) {
    t.preventDefault(), this.pointerDownFocus(t);
  };var l = { TEXTAREA: !0, INPUT: !0, OPTION: !0 },
      h = { radio: !0, checkbox: !0, button: !0, submit: !0, image: !0, file: !0 };o.pointerDown = function (e, i) {
    var n = l[e.target.nodeName] && !h[e.target.type];if (n) return this.isPointerDown = !1, void delete this.pointerIdentifier;this._dragPointerDown(e, i);var o = document.activeElement;o && o.blur && o != this.element && o != document.body && o.blur(), this.pointerDownFocus(e), this.dragX = this.x, this.viewport.classList.add("is-pointer-down"), this._bindPostStartEvents(e), this.pointerDownScroll = s(), t.addEventListener("scroll", this), this.dispatchEvent("pointerDown", e, [i]);
  };var c = { touchstart: !0, MSPointerDown: !0 },
      d = { INPUT: !0, SELECT: !0 };return o.pointerDownFocus = function (e) {
    if (this.options.accessibility && !c[e.type] && !d[e.target.nodeName]) {
      var i = t.pageYOffset;this.element.focus(), t.pageYOffset != i && t.scrollTo(t.pageXOffset, i);
    }
  }, o.canPreventDefaultOnPointerDown = function (t) {
    var e = "touchstart" == t.type,
        i = t.target.nodeName;return !e && "SELECT" != i;
  }, o.hasDragStarted = function (t) {
    return Math.abs(t.x) > this.options.dragThreshold;
  }, o.pointerUp = function (t, e) {
    delete this.isTouchScrolling, this.viewport.classList.remove("is-pointer-down"), this.dispatchEvent("pointerUp", t, [e]), this._dragPointerUp(t, e);
  }, o.pointerDone = function () {
    t.removeEventListener("scroll", this), delete this.pointerDownScroll;
  }, o.dragStart = function (e, i) {
    this.dragStartPosition = this.x, this.startAnimation(), t.removeEventListener("scroll", this), this.dispatchEvent("dragStart", e, [i]);
  }, o.pointerMove = function (t, e) {
    var i = this._dragPointerMove(t, e);this.dispatchEvent("pointerMove", t, [e, i]), this._dragMove(t, e, i);
  }, o.dragMove = function (t, e, i) {
    t.preventDefault(), this.previousDragX = this.dragX;var n = this.options.rightToLeft ? -1 : 1,
        s = this.dragStartPosition + i.x * n;if (!this.options.wrapAround && this.slides.length) {
      var o = Math.max(-this.slides[0].target, this.dragStartPosition);s = s > o ? .5 * (s + o) : s;var r = Math.min(-this.getLastSlide().target, this.dragStartPosition);s = s < r ? .5 * (s + r) : s;
    }this.dragX = s, this.dragMoveTime = new Date(), this.dispatchEvent("dragMove", t, [e, i]);
  }, o.dragEnd = function (t, e) {
    this.options.freeScroll && (this.isFreeScrolling = !0);var i = this.dragEndRestingSelect();if (this.options.freeScroll && !this.options.wrapAround) {
      var n = this.getRestingPosition();this.isFreeScrolling = -n > this.slides[0].target && -n < this.getLastSlide().target;
    } else this.options.freeScroll || i != this.selectedIndex || (i += this.dragEndBoostSelect());delete this.previousDragX, this.isDragSelect = this.options.wrapAround, this.select(i), delete this.isDragSelect, this.dispatchEvent("dragEnd", t, [e]);
  }, o.dragEndRestingSelect = function () {
    var t = this.getRestingPosition(),
        e = Math.abs(this.getSlideDistance(-t, this.selectedIndex)),
        i = this._getClosestResting(t, e, 1),
        n = this._getClosestResting(t, e, -1),
        s = i.distance < n.distance ? i.index : n.index;return s;
  }, o._getClosestResting = function (t, e, i) {
    for (var n = this.selectedIndex, s = 1 / 0, o = this.options.contain && !this.options.wrapAround ? function (t, e) {
      return t <= e;
    } : function (t, e) {
      return t < e;
    }; o(e, s) && (n += i, s = e, e = this.getSlideDistance(-t, n), null !== e);) {
      e = Math.abs(e);
    }return { distance: s, index: n - i };
  }, o.getSlideDistance = function (t, e) {
    var i = this.slides.length,
        s = this.options.wrapAround && i > 1,
        o = s ? n.modulo(e, i) : e,
        r = this.slides[o];if (!r) return null;var a = s ? this.slideableWidth * Math.floor(e / i) : 0;return t - (r.target + a);
  }, o.dragEndBoostSelect = function () {
    if (void 0 === this.previousDragX || !this.dragMoveTime || new Date() - this.dragMoveTime > 100) return 0;var t = this.getSlideDistance(-this.dragX, this.selectedIndex),
        e = this.previousDragX - this.dragX;return t > 0 && e > 0 ? 1 : t < 0 && e < 0 ? -1 : 0;
  }, o.staticClick = function (t, e) {
    var i = this.getParentCell(t.target),
        n = i && i.element,
        s = i && this.cells.indexOf(i);this.dispatchEvent("staticClick", t, [e, n, s]);
  }, o.onscroll = function () {
    var t = s(),
        e = this.pointerDownScroll.x - t.x,
        i = this.pointerDownScroll.y - t.y;(Math.abs(e) > 3 || Math.abs(i) > 3) && this._pointerDone();
  }, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("tap-listener/tap-listener", ["unipointer/unipointer"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("unipointer")) : t.TapListener = e(t, t.Unipointer);
}(window, function (t, e) {
  function i(t) {
    this.bindTap(t);
  }var n = i.prototype = Object.create(e.prototype);return n.bindTap = function (t) {
    t && (this.unbindTap(), this.tapElement = t, this._bindStartEvent(t, !0));
  }, n.unbindTap = function () {
    this.tapElement && (this._bindStartEvent(this.tapElement, !0), delete this.tapElement);
  }, n.pointerUp = function (i, n) {
    if (!this.isIgnoringMouseUp || "mouseup" != i.type) {
      var s = e.getPointerPoint(n),
          o = this.tapElement.getBoundingClientRect(),
          r = t.pageXOffset,
          a = t.pageYOffset,
          l = s.x >= o.left + r && s.x <= o.right + r && s.y >= o.top + a && s.y <= o.bottom + a;if (l && this.emitEvent("tap", [i, n]), "mouseup" != i.type) {
        this.isIgnoringMouseUp = !0;var h = this;setTimeout(function () {
          delete h.isIgnoringMouseUp;
        }, 400);
      }
    }
  }, n.destroy = function () {
    this.pointerDone(), this.unbindTap();
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/prev-next-button", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  "use strict";
  function s(t, e) {
    this.direction = t, this.parent = e, this._create();
  }function o(t) {
    return "string" == typeof t ? t : "M " + t.x0 + ",50 L " + t.x1 + "," + (t.y1 + 50) + " L " + t.x2 + "," + (t.y2 + 50) + " L " + t.x3 + ",50  L " + t.x2 + "," + (50 - t.y2) + " L " + t.x1 + "," + (50 - t.y1) + " Z";
  }var r = "http://www.w3.org/2000/svg";s.prototype = new i(), s.prototype._create = function () {
    this.isEnabled = !0, this.isPrevious = this.direction == -1;var t = this.parent.options.rightToLeft ? 1 : -1;this.isLeft = this.direction == t;var e = this.element = document.createElement("button");e.className = "flickity-prev-next-button", e.className += this.isPrevious ? " previous" : " next", e.setAttribute("type", "button"), this.disable(), e.setAttribute("aria-label", this.isPrevious ? "previous" : "next");var i = this.createSVG();e.appendChild(i), this.on("tap", this.onTap), this.parent.on("select", this.update.bind(this)), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
  }, s.prototype.activate = function () {
    this.bindTap(this.element), this.element.addEventListener("click", this), this.parent.element.appendChild(this.element);
  }, s.prototype.deactivate = function () {
    this.parent.element.removeChild(this.element), i.prototype.destroy.call(this), this.element.removeEventListener("click", this);
  }, s.prototype.createSVG = function () {
    var t = document.createElementNS(r, "svg");t.setAttribute("viewBox", "0 0 100 100");var e = document.createElementNS(r, "path"),
        i = o(this.parent.options.arrowShape);return e.setAttribute("d", i), e.setAttribute("class", "arrow"), this.isLeft || e.setAttribute("transform", "translate(100, 100) rotate(180) "), t.appendChild(e), t;
  }, s.prototype.onTap = function () {
    if (this.isEnabled) {
      this.parent.uiChange();var t = this.isPrevious ? "previous" : "next";this.parent[t]();
    }
  }, s.prototype.handleEvent = n.handleEvent, s.prototype.onclick = function () {
    var t = document.activeElement;t && t == this.element && this.onTap();
  }, s.prototype.enable = function () {
    this.isEnabled || (this.element.disabled = !1, this.isEnabled = !0);
  }, s.prototype.disable = function () {
    this.isEnabled && (this.element.disabled = !0, this.isEnabled = !1);
  }, s.prototype.update = function () {
    var t = this.parent.slides;if (this.parent.options.wrapAround && t.length > 1) return void this.enable();var e = t.length ? t.length - 1 : 0,
        i = this.isPrevious ? 0 : e,
        n = this.parent.selectedIndex == i ? "disable" : "enable";this[n]();
  }, s.prototype.destroy = function () {
    this.deactivate();
  }, n.extend(e.defaults, { prevNextButtons: !0, arrowShape: { x0: 10, x1: 60, y1: 50, x2: 70, y2: 40, x3: 30 } }), e.createMethods.push("_createPrevNextButtons");var a = e.prototype;return a._createPrevNextButtons = function () {
    this.options.prevNextButtons && (this.prevButton = new s(-1, this), this.nextButton = new s(1, this), this.on("activate", this.activatePrevNextButtons));
  }, a.activatePrevNextButtons = function () {
    this.prevButton.activate(), this.nextButton.activate(), this.on("deactivate", this.deactivatePrevNextButtons);
  }, a.deactivatePrevNextButtons = function () {
    this.prevButton.deactivate(), this.nextButton.deactivate(), this.off("deactivate", this.deactivatePrevNextButtons);
  }, e.PrevNextButton = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/page-dots", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  function s(t) {
    this.parent = t, this._create();
  }s.prototype = new i(), s.prototype._create = function () {
    this.holder = document.createElement("ol"), this.holder.className = "flickity-page-dots", this.dots = [], this.on("tap", this.onTap), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
  }, s.prototype.activate = function () {
    this.setDots(), this.bindTap(this.holder), this.parent.element.appendChild(this.holder);
  }, s.prototype.deactivate = function () {
    this.parent.element.removeChild(this.holder), i.prototype.destroy.call(this);
  }, s.prototype.setDots = function () {
    var t = this.parent.slides.length - this.dots.length;t > 0 ? this.addDots(t) : t < 0 && this.removeDots(-t);
  }, s.prototype.addDots = function (t) {
    for (var e = document.createDocumentFragment(), i = []; t;) {
      var n = document.createElement("li");n.className = "dot", e.appendChild(n), i.push(n), t--;
    }this.holder.appendChild(e), this.dots = this.dots.concat(i);
  }, s.prototype.removeDots = function (t) {
    var e = this.dots.splice(this.dots.length - t, t);e.forEach(function (t) {
      this.holder.removeChild(t);
    }, this);
  }, s.prototype.updateSelected = function () {
    this.selectedDot && (this.selectedDot.className = "dot"), this.dots.length && (this.selectedDot = this.dots[this.parent.selectedIndex], this.selectedDot.className = "dot is-selected");
  }, s.prototype.onTap = function (t) {
    var e = t.target;if ("LI" == e.nodeName) {
      this.parent.uiChange();var i = this.dots.indexOf(e);this.parent.select(i);
    }
  }, s.prototype.destroy = function () {
    this.deactivate();
  }, e.PageDots = s, n.extend(e.defaults, { pageDots: !0 }), e.createMethods.push("_createPageDots");var o = e.prototype;return o._createPageDots = function () {
    this.options.pageDots && (this.pageDots = new s(this), this.on("activate", this.activatePageDots), this.on("select", this.updateSelectedPageDots), this.on("cellChange", this.updatePageDots), this.on("resize", this.updatePageDots), this.on("deactivate", this.deactivatePageDots));
  }, o.activatePageDots = function () {
    this.pageDots.activate();
  }, o.updateSelectedPageDots = function () {
    this.pageDots.updateSelected();
  }, o.updatePageDots = function () {
    this.pageDots.setDots();
  }, o.deactivatePageDots = function () {
    this.pageDots.deactivate();
  }, e.PageDots = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/player", ["ev-emitter/ev-emitter", "fizzy-ui-utils/utils", "./flickity"], function (t, i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(require("ev-emitter"), require("fizzy-ui-utils"), require("./flickity")) : e(t.EvEmitter, t.fizzyUIUtils, t.Flickity);
}(window, function (t, e, i) {
  function n(t) {
    this.parent = t, this.state = "stopped", o && (this.onVisibilityChange = function () {
      this.visibilityChange();
    }.bind(this), this.onVisibilityPlay = function () {
      this.visibilityPlay();
    }.bind(this));
  }var s, o;"hidden" in document ? (s = "hidden", o = "visibilitychange") : "webkitHidden" in document && (s = "webkitHidden", o = "webkitvisibilitychange"), n.prototype = Object.create(t.prototype), n.prototype.play = function () {
    if ("playing" != this.state) {
      var t = document[s];if (o && t) return void document.addEventListener(o, this.onVisibilityPlay);this.state = "playing", o && document.addEventListener(o, this.onVisibilityChange), this.tick();
    }
  }, n.prototype.tick = function () {
    if ("playing" == this.state) {
      var t = this.parent.options.autoPlay;t = "number" == typeof t ? t : 3e3;var e = this;this.clear(), this.timeout = setTimeout(function () {
        e.parent.next(!0), e.tick();
      }, t);
    }
  }, n.prototype.stop = function () {
    this.state = "stopped", this.clear(), o && document.removeEventListener(o, this.onVisibilityChange);
  }, n.prototype.clear = function () {
    clearTimeout(this.timeout);
  }, n.prototype.pause = function () {
    "playing" == this.state && (this.state = "paused", this.clear());
  }, n.prototype.unpause = function () {
    "paused" == this.state && this.play();
  }, n.prototype.visibilityChange = function () {
    var t = document[s];this[t ? "pause" : "unpause"]();
  }, n.prototype.visibilityPlay = function () {
    this.play(), document.removeEventListener(o, this.onVisibilityPlay);
  }, e.extend(i.defaults, { pauseAutoPlayOnHover: !0 }), i.createMethods.push("_createPlayer");var r = i.prototype;return r._createPlayer = function () {
    this.player = new n(this), this.on("activate", this.activatePlayer), this.on("uiChange", this.stopPlayer), this.on("pointerDown", this.stopPlayer), this.on("deactivate", this.deactivatePlayer);
  }, r.activatePlayer = function () {
    this.options.autoPlay && (this.player.play(), this.element.addEventListener("mouseenter", this));
  }, r.playPlayer = function () {
    this.player.play();
  }, r.stopPlayer = function () {
    this.player.stop();
  }, r.pausePlayer = function () {
    this.player.pause();
  }, r.unpausePlayer = function () {
    this.player.unpause();
  }, r.deactivatePlayer = function () {
    this.player.stop(), this.element.removeEventListener("mouseenter", this);
  }, r.onmouseenter = function () {
    this.options.pauseAutoPlayOnHover && (this.player.pause(), this.element.addEventListener("mouseleave", this));
  }, r.onmouseleave = function () {
    this.player.unpause(), this.element.removeEventListener("mouseleave", this);
  }, i.Player = n, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/add-remove-cell", ["./flickity", "fizzy-ui-utils/utils"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils);
}(window, function (t, e, i) {
  function n(t) {
    var e = document.createDocumentFragment();return t.forEach(function (t) {
      e.appendChild(t.element);
    }), e;
  }var s = e.prototype;return s.insert = function (t, e) {
    var i = this._makeCells(t);if (i && i.length) {
      var s = this.cells.length;e = void 0 === e ? s : e;var o = n(i),
          r = e == s;if (r) this.slider.appendChild(o);else {
        var a = this.cells[e].element;this.slider.insertBefore(o, a);
      }if (0 === e) this.cells = i.concat(this.cells);else if (r) this.cells = this.cells.concat(i);else {
        var l = this.cells.splice(e, s - e);this.cells = this.cells.concat(i).concat(l);
      }this._sizeCells(i);var h = e > this.selectedIndex ? 0 : i.length;this._cellAddedRemoved(e, h);
    }
  }, s.append = function (t) {
    this.insert(t, this.cells.length);
  }, s.prepend = function (t) {
    this.insert(t, 0);
  }, s.remove = function (t) {
    var e,
        n,
        s = this.getCells(t),
        o = 0,
        r = s.length;for (e = 0; e < r; e++) {
      n = s[e];var a = this.cells.indexOf(n) < this.selectedIndex;o -= a ? 1 : 0;
    }for (e = 0; e < r; e++) {
      n = s[e], n.remove(), i.removeFrom(this.cells, n);
    }s.length && this._cellAddedRemoved(0, o);
  }, s._cellAddedRemoved = function (t, e) {
    e = e || 0, this.selectedIndex += e, this.selectedIndex = Math.max(0, Math.min(this.slides.length - 1, this.selectedIndex)), this.cellChange(t, !0), this.emitEvent("cellAddedRemoved", [t, e]);
  }, s.cellSizeChange = function (t) {
    var e = this.getCell(t);if (e) {
      e.getSize();var i = this.cells.indexOf(e);this.cellChange(i);
    }
  }, s.cellChange = function (t, e) {
    var i = this.slideableWidth;if (this._positionCells(t), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("cellChange", [t]), this.options.freeScroll) {
      var n = i - this.slideableWidth;this.x += n * this.cellAlign, this.positionSlider();
    } else e && this.positionSliderAtSelected(), this.select(this.selectedIndex);
  }, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/lazyload", ["./flickity", "fizzy-ui-utils/utils"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils);
}(window, function (t, e, i) {
  "use strict";
  function n(t) {
    if ("IMG" == t.nodeName && t.getAttribute("data-flickity-lazyload")) return [t];var e = t.querySelectorAll("img[data-flickity-lazyload]");return i.makeArray(e);
  }function s(t, e) {
    this.img = t, this.flickity = e, this.load();
  }e.createMethods.push("_createLazyload");var o = e.prototype;return o._createLazyload = function () {
    this.on("select", this.lazyLoad);
  }, o.lazyLoad = function () {
    var t = this.options.lazyLoad;if (t) {
      var e = "number" == typeof t ? t : 0,
          i = this.getAdjacentCellElements(e),
          o = [];i.forEach(function (t) {
        var e = n(t);o = o.concat(e);
      }), o.forEach(function (t) {
        new s(t, this);
      }, this);
    }
  }, s.prototype.handleEvent = i.handleEvent, s.prototype.load = function () {
    this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.img.getAttribute("data-flickity-lazyload"), this.img.removeAttribute("data-flickity-lazyload");
  }, s.prototype.onload = function (t) {
    this.complete(t, "flickity-lazyloaded");
  }, s.prototype.onerror = function (t) {
    this.complete(t, "flickity-lazyerror");
  }, s.prototype.complete = function (t, e) {
    this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);var i = this.flickity.getParentCell(this.img),
        n = i && i.element;this.flickity.cellSizeChange(n), this.img.classList.add(e), this.flickity.dispatchEvent("lazyLoad", t, n);
  }, e.LazyLoader = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/index", ["./flickity", "./drag", "./prev-next-button", "./page-dots", "./player", "./add-remove-cell", "./lazyload"], e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports && (module.exports = e(require("./flickity"), require("./drag"), require("./prev-next-button"), require("./page-dots"), require("./player"), require("./add-remove-cell"), require("./lazyload")));
}(window, function (t) {
  return t;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity-as-nav-for/as-nav-for", ["flickity/js/index", "fizzy-ui-utils/utils"], e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(require("flickity"), require("fizzy-ui-utils")) : t.Flickity = e(t.Flickity, t.fizzyUIUtils);
}(window, function (t, e) {
  function i(t, e, i) {
    return (e - t) * i + t;
  }t.createMethods.push("_createAsNavFor");var n = t.prototype;return n._createAsNavFor = function () {
    this.on("activate", this.activateAsNavFor), this.on("deactivate", this.deactivateAsNavFor), this.on("destroy", this.destroyAsNavFor);var t = this.options.asNavFor;if (t) {
      var e = this;setTimeout(function () {
        e.setNavCompanion(t);
      });
    }
  }, n.setNavCompanion = function (i) {
    i = e.getQueryElement(i);var n = t.data(i);if (n && n != this) {
      this.navCompanion = n;var s = this;this.onNavCompanionSelect = function () {
        s.navCompanionSelect();
      }, n.on("select", this.onNavCompanionSelect), this.on("staticClick", this.onNavStaticClick), this.navCompanionSelect(!0);
    }
  }, n.navCompanionSelect = function (t) {
    if (this.navCompanion) {
      var e = this.navCompanion.selectedCells[0],
          n = this.navCompanion.cells.indexOf(e),
          s = n + this.navCompanion.selectedCells.length - 1,
          o = Math.floor(i(n, s, this.navCompanion.cellAlign));if (this.selectCell(o, !1, t), this.removeNavSelectedElements(), !(o >= this.cells.length)) {
        var r = this.cells.slice(n, s + 1);this.navSelectedElements = r.map(function (t) {
          return t.element;
        }), this.changeNavSelectedClass("add");
      }
    }
  }, n.changeNavSelectedClass = function (t) {
    this.navSelectedElements.forEach(function (e) {
      e.classList[t]("is-nav-selected");
    });
  }, n.activateAsNavFor = function () {
    this.navCompanionSelect(!0);
  }, n.removeNavSelectedElements = function () {
    this.navSelectedElements && (this.changeNavSelectedClass("remove"), delete this.navSelectedElements);
  }, n.onNavStaticClick = function (t, e, i, n) {
    "number" == typeof n && this.navCompanion.selectCell(n);
  }, n.deactivateAsNavFor = function () {
    this.removeNavSelectedElements();
  }, n.destroyAsNavFor = function () {
    this.navCompanion && (this.navCompanion.off("select", this.onNavCompanionSelect), this.off("staticClick", this.onNavStaticClick), delete this.navCompanion);
  }, t;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("imagesloaded/imagesloaded", ["ev-emitter/ev-emitter"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("ev-emitter")) : t.imagesLoaded = e(t, t.EvEmitter);
}(window, function (t, e) {
  function i(t, e) {
    for (var i in e) {
      t[i] = e[i];
    }return t;
  }function n(t) {
    var e = [];if (Array.isArray(t)) e = t;else if ("number" == typeof t.length) for (var i = 0; i < t.length; i++) {
      e.push(t[i]);
    } else e.push(t);return e;
  }function s(t, e, o) {
    return this instanceof s ? ("string" == typeof t && (t = document.querySelectorAll(t)), this.elements = n(t), this.options = i({}, this.options), "function" == typeof e ? o = e : i(this.options, e), o && this.on("always", o), this.getImages(), a && (this.jqDeferred = new a.Deferred()), void setTimeout(function () {
      this.check();
    }.bind(this))) : new s(t, e, o);
  }function o(t) {
    this.img = t;
  }function r(t, e) {
    this.url = t, this.element = e, this.img = new Image();
  }var a = t.jQuery,
      l = t.console;s.prototype = Object.create(e.prototype), s.prototype.options = {}, s.prototype.getImages = function () {
    this.images = [], this.elements.forEach(this.addElementImages, this);
  }, s.prototype.addElementImages = function (t) {
    "IMG" == t.nodeName && this.addImage(t), this.options.background === !0 && this.addElementBackgroundImages(t);var e = t.nodeType;if (e && h[e]) {
      for (var i = t.querySelectorAll("img"), n = 0; n < i.length; n++) {
        var s = i[n];this.addImage(s);
      }if ("string" == typeof this.options.background) {
        var o = t.querySelectorAll(this.options.background);for (n = 0; n < o.length; n++) {
          var r = o[n];this.addElementBackgroundImages(r);
        }
      }
    }
  };var h = { 1: !0, 9: !0, 11: !0 };return s.prototype.addElementBackgroundImages = function (t) {
    var e = getComputedStyle(t);if (e) for (var i = /url\((['"])?(.*?)\1\)/gi, n = i.exec(e.backgroundImage); null !== n;) {
      var s = n && n[2];s && this.addBackground(s, t), n = i.exec(e.backgroundImage);
    }
  }, s.prototype.addImage = function (t) {
    var e = new o(t);this.images.push(e);
  }, s.prototype.addBackground = function (t, e) {
    var i = new r(t, e);this.images.push(i);
  }, s.prototype.check = function () {
    function t(t, i, n) {
      setTimeout(function () {
        e.progress(t, i, n);
      });
    }var e = this;return this.progressedCount = 0, this.hasAnyBroken = !1, this.images.length ? void this.images.forEach(function (e) {
      e.once("progress", t), e.check();
    }) : void this.complete();
  }, s.prototype.progress = function (t, e, i) {
    this.progressedCount++, this.hasAnyBroken = this.hasAnyBroken || !t.isLoaded, this.emitEvent("progress", [this, t, e]), this.jqDeferred && this.jqDeferred.notify && this.jqDeferred.notify(this, t), this.progressedCount == this.images.length && this.complete(), this.options.debug && l && l.log("progress: " + i, t, e);
  }, s.prototype.complete = function () {
    var t = this.hasAnyBroken ? "fail" : "done";if (this.isComplete = !0, this.emitEvent(t, [this]), this.emitEvent("always", [this]), this.jqDeferred) {
      var e = this.hasAnyBroken ? "reject" : "resolve";this.jqDeferred[e](this);
    }
  }, o.prototype = Object.create(e.prototype), o.prototype.check = function () {
    var t = this.getIsImageComplete();return t ? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth") : (this.proxyImage = new Image(), this.proxyImage.addEventListener("load", this), this.proxyImage.addEventListener("error", this), this.img.addEventListener("load", this), this.img.addEventListener("error", this), void (this.proxyImage.src = this.img.src));
  }, o.prototype.getIsImageComplete = function () {
    return this.img.complete && void 0 !== this.img.naturalWidth;
  }, o.prototype.confirm = function (t, e) {
    this.isLoaded = t, this.emitEvent("progress", [this, this.img, e]);
  }, o.prototype.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, o.prototype.onload = function () {
    this.confirm(!0, "onload"), this.unbindEvents();
  }, o.prototype.onerror = function () {
    this.confirm(!1, "onerror"), this.unbindEvents();
  }, o.prototype.unbindEvents = function () {
    this.proxyImage.removeEventListener("load", this), this.proxyImage.removeEventListener("error", this), this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
  }, r.prototype = Object.create(o.prototype), r.prototype.check = function () {
    this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.url;var t = this.getIsImageComplete();t && (this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), this.unbindEvents());
  }, r.prototype.unbindEvents = function () {
    this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
  }, r.prototype.confirm = function (t, e) {
    this.isLoaded = t, this.emitEvent("progress", [this, this.element, e]);
  }, s.makeJQueryPlugin = function (e) {
    e = e || t.jQuery, e && (a = e, a.fn.imagesLoaded = function (t, e) {
      var i = new s(this, t, e);return i.jqDeferred.promise(a(this));
    });
  }, s.makeJQueryPlugin(), s;
}), function (t, e) {
  "function" == typeof define && define.amd ? define(["flickity/js/index", "imagesloaded/imagesloaded"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("flickity"), require("imagesloaded")) : t.Flickity = e(t, t.Flickity, t.imagesLoaded);
}(window, function (t, e, i) {
  "use strict";
  e.createMethods.push("_createImagesLoaded");var n = e.prototype;return n._createImagesLoaded = function () {
    this.on("activate", this.imagesLoaded);
  }, n.imagesLoaded = function () {
    function t(t, i) {
      var n = e.getParentCell(i.img);e.cellSizeChange(n && n.element), e.options.freeScroll || e.positionSliderAtSelected();
    }if (this.options.imagesLoaded) {
      var e = this;i(this.slider).on("progress", t);
    }
  }, e;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Flickity background lazyload v1.0.0
 * lazyload background cell images
 */

/*jshint browser: true, unused: true, undef: true */

(function (window, factory) {
  // universal module definition
  /*globals define, module, require */
  if (typeof define == 'function' && define.amd) {
    // AMD
    define(['flickity/js/index', 'fizzy-ui-utils/utils'], factory);
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('flickity'), require('fizzy-ui-utils'));
  } else {
    // browser global
    factory(window.Flickity, window.fizzyUIUtils);
  }
})(window, function factory(Flickity, utils) {
  /*jshint strict: true */
  'use strict';

  Flickity.createMethods.push('_createBgLazyLoad');

  var proto = Flickity.prototype;

  proto._createBgLazyLoad = function () {
    this.on('select', this.bgLazyLoad);
  };

  proto.bgLazyLoad = function () {
    var lazyLoad = this.options.bgLazyLoad;
    if (!lazyLoad) {
      return;
    }

    // get adjacent cells, use lazyLoad option for adjacent count
    var adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
    var cellElems = this.getAdjacentCellElements(adjCount);

    for (var i = 0; i < cellElems.length; i++) {
      var cellElem = cellElems[i];
      this.bgLazyLoadElem(cellElem);
      // select lazy elems in cell
      var children = cellElem.querySelectorAll('[data-flickity-bg-lazyload]');
      for (var j = 0; j < children.length; j++) {
        this.bgLazyLoadElem(children[j]);
      }
    }
  };

  proto.bgLazyLoadElem = function (elem) {
    var attr = elem.getAttribute('data-flickity-bg-lazyload');
    if (attr) {
      new BgLazyLoader(elem, attr, this);
    }
  };

  // -------------------------- LazyBGLoader -------------------------- //

  /**
   * class to handle loading images
   */
  function BgLazyLoader(elem, url, flickity) {
    this.element = elem;
    this.url = url;
    this.img = new Image();
    this.flickity = flickity;
    this.load();
  }

  BgLazyLoader.prototype.handleEvent = utils.handleEvent;

  BgLazyLoader.prototype.load = function () {
    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    // load image
    this.img.src = this.url;
    // remove attr
    this.element.removeAttribute('data-flickity-bg-lazyload');
  };

  BgLazyLoader.prototype.onload = function (event) {
    this.element.style.backgroundImage = 'url(' + this.url + ')';
    this.complete(event, 'flickity-bg-lazyloaded');
  };

  BgLazyLoader.prototype.onerror = function (event) {
    this.complete(event, 'flickity-bg-lazyerror');
  };

  BgLazyLoader.prototype.complete = function (event, className) {
    // unbind events
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);

    this.element.classList.add(className);
    this.flickity.dispatchEvent('bgLazyLoad', event, this.element);
  };

  // -----  ----- //

  Flickity.BgLazyLoader = BgLazyLoader;

  return Flickity;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
*  Ajax Autocomplete for jQuery, version 1.2.27
*  (c) 2015 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, single: true, this: true, multivar: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var utils = function () {
        return {
            escapeRegExChars: function escapeRegExChars(value) {
                return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
            },
            createNode: function createNode(containerClass) {
                var div = document.createElement('div');
                div.className = containerClass;
                div.style.position = 'absolute';
                div.style.display = 'none';
                return div;
            }
        };
    }(),
        keys = {
        ESC: 27,
        TAB: 9,
        RETURN: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };

    function Autocomplete(el, options) {
        var noop = $.noop,
            that = this,
            defaults = {
            ajaxSettings: {},
            autoSelectFirst: false,
            appendTo: document.body,
            serviceUrl: null,
            lookup: null,
            onSelect: null,
            width: 'auto',
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            params: {},
            formatResult: Autocomplete.formatResult,
            delimiter: null,
            zIndex: 9999,
            type: 'GET',
            noCache: false,
            onSearchStart: noop,
            onSearchComplete: noop,
            onSearchError: noop,
            preserveInput: false,
            containerClass: 'autocomplete-suggestions',
            tabDisabled: false,
            dataType: 'text',
            currentRequest: null,
            triggerSelectOnValidInput: true,
            preventBadQueries: true,
            lookupFilter: function lookupFilter(suggestion, originalQuery, queryLowerCase) {
                return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
            },
            paramName: 'query',
            transformResult: function transformResult(response) {
                return typeof response === 'string' ? $.parseJSON(response) : response;
            },
            showNoSuggestionNotice: false,
            noSuggestionNotice: 'No results',
            orientation: 'bottom',
            forceFixPosition: false
        };

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.intervalId = 0;
        that.cachedResponse = {};
        that.onChangeInterval = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.formatResult = function (suggestion, currentValue) {
        // Do not replace anything if there current value is empty
        if (!currentValue) {
            return suggestion.value;
        }

        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    Autocomplete.prototype = {

        killerFn: null,

        initialize: function initialize() {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            that.killerFn = function (e) {
                if (!$(e.target).closest('.' + that.options.containerClass).length) {
                    that.killSuggestions();
                    that.disableKillerFn();
                }
            };

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>').html(this.options.noSuggestionNotice).get(0);

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo);

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.css('width', options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });

            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
                return false;
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) {
                that.onKeyPress(e);
            });
            that.el.on('keyup.autocomplete', function (e) {
                that.onKeyUp(e);
            });
            that.el.on('blur.autocomplete', function () {
                that.onBlur();
            });
            that.el.on('focus.autocomplete', function () {
                that.onFocus();
            });
            that.el.on('change.autocomplete', function (e) {
                that.onKeyUp(e);
            });
            that.el.on('input.autocomplete', function (e) {
                that.onKeyUp(e);
            });
        },

        onFocus: function onFocus() {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function onBlur() {
            this.enableKillerFn();
        },

        abortAjax: function abortAjax() {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function setOptions(suppliedOptions) {
            var that = this,
                options = that.options;

            $.extend(options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });
        },

        clearCache: function clearCache() {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function clear() {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function disable() {
            var that = this;
            that.disabled = true;
            clearInterval(that.onChangeInterval);
            that.abortAjax();
        },

        enable: function enable() {
            this.disabled = false;
        },

        fixPosition: function fixPosition() {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }
            var siteSearchDiv = $('.site-search');
            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = siteSearchDiv.outerHeight(),
                offset = siteSearchDiv.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = Math.max(topOverflow, bottomOverflow) === topOverflow ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if (containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                if (!that.visible) {
                    $container.css('opacity', 0).show();
                }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible) {
                    $container.css('opacity', opacity).hide();
                }
            }

            if (that.options.width === 'auto') {
                styles.width = siteSearchDiv.outerWidth() + 'px';
            }

            $container.css(styles);
        },

        enableKillerFn: function enableKillerFn() {
            var that = this;
            $(document).on('click.autocomplete', that.killerFn);
        },

        disableKillerFn: function disableKillerFn() {
            var that = this;
            $(document).off('click.autocomplete', that.killerFn);
        },

        killSuggestions: function killSuggestions() {
            var that = this;
            that.stopKillSuggestions();
            that.intervalId = window.setInterval(function () {
                if (that.visible) {
                    // No need to restore value when 
                    // preserveInput === true, 
                    // because we did not change it
                    if (!that.options.preserveInput) {
                        that.el.val(that.currentValue);
                    }

                    that.hide();
                }

                that.stopKillSuggestions();
            }, 50);
        },

        stopKillSuggestions: function stopKillSuggestions() {
            window.clearInterval(this.intervalId);
        },

        isCursorAtEnd: function isCursorAtEnd() {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function onKeyPress(e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function onKeyUp(e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearInterval(that.onChangeInterval);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeInterval = setInterval(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function onValueChange() {
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearInterval(that.onChangeInterval);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function isExactMatch(query) {
            var suggestions = this.suggestions;

            return suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase();
        },

        getQuery: function getQuery(value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function getSuggestionsLocal(query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function getSuggestions(q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            params = options.ignoreParams ? null : options.params;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            if ($.isFunction(options.lookup)) {
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function isBadQuery(q) {
            if (!this.options.preventBadQueries) {
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function hide() {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearInterval(that.onChangeInterval);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function suggest() {
            if (!this.suggestions.length) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function formatGroup(suggestion, index) {
                var currentCategory = suggestion.data[groupBy];

                if (category === currentCategory) {
                    return '';
                }

                category = currentCategory;

                return '<div class="autocomplete-group"><strong>' + category + '</strong></div>';
            };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy) {
                    html += formatGroup(suggestion, value, i);
                }

                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value, i) + '</div>';
            });

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function noSuggestions() {
            var that = this,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer);

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function adjustContainerWidth() {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (options.width === 'auto') {
                width = that.el.outerWidth();
                container.css('width', width > 0 ? width : 300);
            }
        },

        findBestHint: function findBestHint() {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function signalHint(suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function verifySuggestionsFormat(suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function validateOrientation(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if ($.inArray(orientation, ['auto', 'bottom', 'top']) === -1) {
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function processResponse(result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && !result.suggestions.length) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function activate(index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function selectHint() {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function select(i) {
            var that = this;
            that.hide();
            that.onSelect(i);
            that.disableKillerFn();
        },

        moveUp: function moveUp() {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function moveDown() {
            var that = this;

            if (that.selectedIndex === that.suggestions.length - 1) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function adjustScroll(index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function onSelect(index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function getValue(value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function dispose() {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            that.disableKillerFn();
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.autocomplete = $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (!arguments.length) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
});
'use strict';

var _$$flickity;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

$(document).foundation();

var bases = document.getElementsByTagName('base');
var baseHref = null;

if (bases.length > 0) {
	baseHref = bases[0].href;
}
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Lazy Loading Images:
/*-------------------------------------------------*/
/*-------------------------------------------------*/
var myLazyLoad = new LazyLoad({
	// example of options object -> see options section
	elements_selector: ".dp-lazy"
	// throttle: 200,
	// data_src: "src",
	// data_srcset: "srcset",
	// callback_set: function() { /* ... */ }
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Big Carousel (Home Page):
/*-------------------------------------------------*/
/*-------------------------------------------------*/

var $carousel = $('.carousel').flickity((_$$flickity = {
	imagesLoaded: true,
	percentPosition: false,
	selectedAttraction: 0.015,
	friction: 0.3,
	prevNextButtons: false,
	draggable: true,
	autoPlay: true
}, _defineProperty(_$$flickity, 'autoPlay', 8000), _defineProperty(_$$flickity, 'pauseAutoPlayOnHover', false), _defineProperty(_$$flickity, 'bgLazyLoad', true), _defineProperty(_$$flickity, 'pageDots', true), _$$flickity));

var $imgs = $carousel.find('.carousel-cell .cell-bg');
// get transform property
var docStyle = document.documentElement.style;
var transformProp = typeof docStyle.transform == 'string' ? 'transform' : 'WebkitTransform';
// get Flickity instance
var flkty = $carousel.data('flickity');

$carousel.on('scroll.flickity', function () {
	flkty.slides.forEach(function (slide, i) {
		var img = $imgs[i];
		var x = (slide.target + flkty.x) * -1 / 3;
		img.style[transformProp] = 'translateX(' + x + 'px)';
	});
});

$('.carousel-nav-cell').click(function () {
	flkty.stopPlayer();
});

var $gallery = $('.carousel').flickity();

function onLoadeddata(event) {
	var cell = $gallery.flickity('getParentCell', event.target);
	$gallery.flickity('cellSizeChange', cell && cell.element);
}

$gallery.find('video').each(function (i, video) {
	video.play();
	$(video).on('loadeddata', onLoadeddata);
});
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Slideshow block (in content):
/*-------------------------------------------------*/
/*-------------------------------------------------*/
var $slideshow = $('.slideshow').flickity({
	//adaptiveHeight: true,
	imagesLoaded: true,
	lazyLoad: true
});

var slideshowflk = $slideshow.data('flickity');

$slideshow.on('select.flickity', function () {
	console.log('Flickity select ' + slideshowflk.selectedIndex);
	//slideshowflk.reloadCells();
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Start Foundation Orbit Slider:
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// var sliderOptions = {
// 	containerClass: 'slider__slides',
// 	slideClass: 'slider__slide',
// 	nextClass: 'slider__nav--next',
// 	prevClass: 'slider__nav--previous',

// };


// var slider = new Foundation.Orbit($('.slider'), sliderOptions);

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Wrap every iframe in a flex video class to prevent layout breakage
/*-------------------------------------------------*/
/*-------------------------------------------------*/
$('iframe').each(function () {
	$(this).wrap("<div class='flex-video widescreen'></div>");
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Distinguish dropdowns on mobile/desktop:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

$('.nav__item--parent').click(function (event) {
	if (whatInput.ask() === 'touch') {
		// do touch input things
		if (!$(this).hasClass('nav__item--is-hovered')) {
			event.preventDefault();
			$('.nav__item--parent').removeClass('nav__item--is-hovered');
			$(this).toggleClass('nav__item--is-hovered');
		}
	} else if (whatInput.ask() === 'mouse') {
		// do mouse things
	}
});

//If anything in the main content container is clicked, remove faux hover class.
$('#main-content__container').click(function () {
	$('.nav__item').removeClass('nav__item--is-hovered');
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Site Search:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function toggleSearchClasses() {
	$("body").toggleClass("body--search-active");
	$('.nav-collapse').removeClass('open');
	$('.nav__menu-icon').removeClass('is-clicked');
	$("#nav__menu-icon").removeClass("nav__menu-icon--menu-is-active");
	$("#site-search__form").toggleClass("site-search__form--is-inactive site-search__form--is-active");
	$("#site-search").toggleClass("site-search--is-inactive site-search--is-active");
	$(".header__screen").toggleClass("header__screen--grayscale");
	$(".main-content__container").toggleClass("main-content__container--grayscale");
	$(".nav__wrapper").toggleClass("nav__wrapper--grayscale");
	$(".nav__link--search").toggleClass("nav__link--search-is-active");

	//HACK: wait for 5ms before changing focus. I don't think I need this anymore actually..
	setTimeout(function () {
		$(".nav__wrapper").toggleClass("nav__wrapper--search-is-active");
	}, 5);

	$(".nav").toggleClass("nav--search-is-active");
}

$(".nav__link--search").click(function () {
	toggleSearchClasses();
	if ($("#mobile-nav__wrapper").hasClass("mobile-nav__wrapper--mobile-menu-is-active")) {
		toggleMobileMenuClasses();
		$("#site-search").appendTo('#header').addClass('site-search--mobile');
	}
	document.getElementById("site-search__input").focus();
});

$(".nav__link--search-cancel").click(function () {
	toggleSearchClasses();
	document.getElementById("site-search__input").blur();
});

//When search form is out of focus, deactivate it.
$("#site-search__form").focusout(function () {
	if ($("#site-search__form").hasClass("site-search__form--is-active")) {
		//Comment out the following line if you need to use WebKit/Blink inspector tool on the search (so it doesn't lose focus):
		//toggleSearchClasses();
	}
});

$('input[name="Search"]').autocomplete({
	serviceUrl: baseHref + '/home/autoComplete',
	deferRequestBy: 100,
	triggerSelectOnValidInput: false,
	minChars: 2,
	autoSelectFirst: true,
	type: 'post',
	onSelect: function onSelect(suggestion) {
		$('#site-search__form').submit();
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Mobile Search:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

if (Foundation.MediaQuery.atLeast('medium')) {
	// True if medium or large
	// False if small
	$("#site-search").addClass("site-search--desktop");
} else {
	$("#site-search").addClass("site-search--mobile");
}

$(".nav__toggle--search").click(function () {
	toggleSearchClasses();

	//append our site search div to the header.
	$("#site-search").appendTo('#header').addClass('site-search--mobile');
	document.getElementById("site-search__input").focus();
});

//If we're resizing from mobile to anything else, toggle the mobile search if it's active.
$(window).on('changed.zf.mediaquery', function (event, newSize, oldSize) {

	if (newSize == "medium") {
		//alert('hey');
		$("#site-search").removeClass("site-search--mobile");
		$("#site-search").addClass("site-search--desktop");

		$("#site-search").appendTo("#nav");

		if ($("#site-search").hasClass("site-search--is-active")) {
			// toggleSearchClasses();
		}
	} else if (newSize == "mobile") {
		$("#site-search").appendTo('#header');
		$("#site-search").removeClass("site-search--desktop");
		$("#site-search").addClass("site-search--mobile");
		if ($("#site-search").hasClass("site-search--is-active")) {
			// toggleSearchClasses();
		}
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Mobile Nav:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

/* new stuff added my Brandon - lazy coding */
$('.nav__toggle--menu').on('click', function () {
	$('.nav__menu-icon').toggleClass('is-clicked');
	$("#nav__menu-icon").toggleClass("nav__menu-icon--menu-is-active");
	$('.nav-collapse').toggleClass('open');
});

$('.second-level--open').click(function () {
	$(this).parent().toggleClass('nav__item--opened');
	if ($(this).next().attr('aria-hidden') == 'true') {
		$(this).next().attr('aria-hidden', 'false');
	} else {
		$(this).next().attr('aria-hidden', 'true');
	}

	if ($(this).attr('aria-expanded') == 'false') {
		$(this).attr('aria-expanded', 'true');
	} else {
		$(this).next().attr('aria-expanded', 'false');
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Background Video
/*-------------------------------------------------*/
/*-------------------------------------------------*/
$('.backgroundvideo__link').click(function (e) {
	var that = $(this);
	var video = that.data('video');
	var width = $('img', that).width();
	var height = $('img', that).height();
	that.parent().addClass('on');
	that.parent().prepend('<div class="flex-video widescreen"><iframe src="https://www.youtube.com/embed/' + video + '?rel=0&autoplay=1" width="' + width + '" height="' + height + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div>');
	that.hide();
	e.preventDefault();
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Automatic full height silder, not working yet..
/*-------------------------------------------------*/
/*-------------------------------------------------*/

// function setDimensions(){
//    var windowsHeight = $(window).height();

//    $('.orbit-container').css('height', windowsHeight + 'px');
//   // $('.orbit-container').css('max-height', windowsHeight + 'px');

//    $('.orbit-slide').css('height', windowsHeight + 'px');
//    $('.orbit-slide').css('max-height', windowsHeight + 'px');
// }

// $(window).resize(function() {
//     setDimensions();
// });

// setDimensions();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24udGFicy5qcyIsImxhenlsb2FkLnRyYW5zcGlsZWQuanMiLCJmbGlja2l0eS5wa2dkLm1pbi5qcyIsImZsaWNraXR5YmctbGF6eWxvYWQuanMiLCJqcXVlcnktYXV0b2NvbXBsZXRlLmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIiQiLCJGT1VOREFUSU9OX1ZFUlNJT04iLCJGb3VuZGF0aW9uIiwidmVyc2lvbiIsIl9wbHVnaW5zIiwiX3V1aWRzIiwicnRsIiwiYXR0ciIsInBsdWdpbiIsIm5hbWUiLCJjbGFzc05hbWUiLCJmdW5jdGlvbk5hbWUiLCJhdHRyTmFtZSIsImh5cGhlbmF0ZSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luTmFtZSIsImNvbnN0cnVjdG9yIiwidG9Mb3dlckNhc2UiLCJ1dWlkIiwiR2V0WW9EaWdpdHMiLCIkZWxlbWVudCIsImRhdGEiLCJ0cmlnZ2VyIiwicHVzaCIsInVucmVnaXN0ZXJQbHVnaW4iLCJzcGxpY2UiLCJpbmRleE9mIiwicmVtb3ZlQXR0ciIsInJlbW92ZURhdGEiLCJwcm9wIiwicmVJbml0IiwicGx1Z2lucyIsImlzSlEiLCJlYWNoIiwiX2luaXQiLCJ0eXBlIiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm9yRWFjaCIsInAiLCJmb3VuZGF0aW9uIiwiT2JqZWN0Iiwia2V5cyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImxlbmd0aCIsIm5hbWVzcGFjZSIsIk1hdGgiLCJyb3VuZCIsInBvdyIsInJhbmRvbSIsInRvU3RyaW5nIiwic2xpY2UiLCJyZWZsb3ciLCJlbGVtIiwiaSIsIiRlbGVtIiwiZmluZCIsImFkZEJhY2siLCIkZWwiLCJvcHRzIiwid2FybiIsInRoaW5nIiwic3BsaXQiLCJlIiwib3B0IiwibWFwIiwiZWwiLCJ0cmltIiwicGFyc2VWYWx1ZSIsImVyIiwiZ2V0Rm5OYW1lIiwidHJhbnNpdGlvbmVuZCIsInRyYW5zaXRpb25zIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZW5kIiwidCIsInN0eWxlIiwic2V0VGltZW91dCIsInRyaWdnZXJIYW5kbGVyIiwidXRpbCIsInRocm90dGxlIiwiZnVuYyIsImRlbGF5IiwidGltZXIiLCJjb250ZXh0IiwiYXJncyIsImFyZ3VtZW50cyIsImFwcGx5IiwibWV0aG9kIiwiJG1ldGEiLCIkbm9KUyIsImFwcGVuZFRvIiwiaGVhZCIsInJlbW92ZUNsYXNzIiwiTWVkaWFRdWVyeSIsIkFycmF5IiwicHJvdG90eXBlIiwiY2FsbCIsInBsdWdDbGFzcyIsInVuZGVmaW5lZCIsIlJlZmVyZW5jZUVycm9yIiwiVHlwZUVycm9yIiwid2luZG93IiwiZm4iLCJEYXRlIiwibm93IiwiZ2V0VGltZSIsInZlbmRvcnMiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ2cCIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImxhc3RUaW1lIiwiY2FsbGJhY2siLCJuZXh0VGltZSIsIm1heCIsImNsZWFyVGltZW91dCIsInBlcmZvcm1hbmNlIiwic3RhcnQiLCJGdW5jdGlvbiIsImJpbmQiLCJvVGhpcyIsImFBcmdzIiwiZlRvQmluZCIsImZOT1AiLCJmQm91bmQiLCJjb25jYXQiLCJmdW5jTmFtZVJlZ2V4IiwicmVzdWx0cyIsImV4ZWMiLCJzdHIiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwialF1ZXJ5IiwiQm94IiwiSW1Ob3RUb3VjaGluZ1lvdSIsIkdldERpbWVuc2lvbnMiLCJHZXRPZmZzZXRzIiwiZWxlbWVudCIsInBhcmVudCIsImxyT25seSIsInRiT25seSIsImVsZURpbXMiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJwYXJEaW1zIiwib2Zmc2V0IiwiaGVpZ2h0Iiwid2lkdGgiLCJ3aW5kb3dEaW1zIiwiYWxsRGlycyIsIkVycm9yIiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInBhclJlY3QiLCJwYXJlbnROb2RlIiwid2luUmVjdCIsImJvZHkiLCJ3aW5ZIiwicGFnZVlPZmZzZXQiLCJ3aW5YIiwicGFnZVhPZmZzZXQiLCJwYXJlbnREaW1zIiwiYW5jaG9yIiwicG9zaXRpb24iLCJ2T2Zmc2V0IiwiaE9mZnNldCIsImlzT3ZlcmZsb3ciLCIkZWxlRGltcyIsIiRhbmNob3JEaW1zIiwia2V5Q29kZXMiLCJjb21tYW5kcyIsIktleWJvYXJkIiwiZ2V0S2V5Q29kZXMiLCJwYXJzZUtleSIsImV2ZW50Iiwia2V5Iiwid2hpY2giLCJrZXlDb2RlIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwidG9VcHBlckNhc2UiLCJzaGlmdEtleSIsImN0cmxLZXkiLCJhbHRLZXkiLCJoYW5kbGVLZXkiLCJjb21wb25lbnQiLCJmdW5jdGlvbnMiLCJjb21tYW5kTGlzdCIsImNtZHMiLCJjb21tYW5kIiwibHRyIiwiZXh0ZW5kIiwicmV0dXJuVmFsdWUiLCJoYW5kbGVkIiwidW5oYW5kbGVkIiwiZmluZEZvY3VzYWJsZSIsImZpbHRlciIsImlzIiwicmVnaXN0ZXIiLCJjb21wb25lbnROYW1lIiwidHJhcEZvY3VzIiwiJGZvY3VzYWJsZSIsIiRmaXJzdEZvY3VzYWJsZSIsImVxIiwiJGxhc3RGb2N1c2FibGUiLCJvbiIsInRhcmdldCIsInByZXZlbnREZWZhdWx0IiwiZm9jdXMiLCJyZWxlYXNlRm9jdXMiLCJvZmYiLCJrY3MiLCJrIiwia2MiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwiY3NzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCJ2YWx1ZSIsIl9nZXRDdXJyZW50U2l6ZSIsIl93YXRjaGVyIiwiYXRMZWFzdCIsInNpemUiLCJxdWVyeSIsImdldCIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwibWF0Y2hlZCIsIm5ld1NpemUiLCJjdXJyZW50U2l6ZSIsInN0eWxlTWVkaWEiLCJtZWRpYSIsInNjcmlwdCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiaW5mbyIsImlkIiwiaW5zZXJ0QmVmb3JlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImN1cnJlbnRTdHlsZSIsIm1hdGNoTWVkaXVtIiwidGV4dCIsInN0eWxlU2hlZXQiLCJjc3NUZXh0IiwidGV4dENvbnRlbnQiLCJzdHlsZU9iamVjdCIsInJlZHVjZSIsInJldCIsInBhcmFtIiwicGFydHMiLCJ2YWwiLCJkZWNvZGVVUklDb21wb25lbnQiLCJpc0FycmF5IiwiaW5pdENsYXNzZXMiLCJhY3RpdmVDbGFzc2VzIiwiTW90aW9uIiwiYW5pbWF0ZUluIiwiYW5pbWF0aW9uIiwiY2IiLCJhbmltYXRlIiwiYW5pbWF0ZU91dCIsIk1vdmUiLCJkdXJhdGlvbiIsImFuaW0iLCJwcm9nIiwibW92ZSIsInRzIiwiaXNJbiIsImluaXRDbGFzcyIsImFjdGl2ZUNsYXNzIiwicmVzZXQiLCJhZGRDbGFzcyIsInNob3ciLCJvZmZzZXRXaWR0aCIsIm9uZSIsImZpbmlzaCIsImhpZGUiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJOZXN0IiwiRmVhdGhlciIsIm1lbnUiLCJpdGVtcyIsInN1Yk1lbnVDbGFzcyIsInN1Ykl0ZW1DbGFzcyIsImhhc1N1YkNsYXNzIiwiJGl0ZW0iLCIkc3ViIiwiY2hpbGRyZW4iLCJCdXJuIiwiVGltZXIiLCJvcHRpb25zIiwibmFtZVNwYWNlIiwicmVtYWluIiwiaXNQYXVzZWQiLCJyZXN0YXJ0IiwiaW5maW5pdGUiLCJwYXVzZSIsIm9uSW1hZ2VzTG9hZGVkIiwiaW1hZ2VzIiwidW5sb2FkZWQiLCJjb21wbGV0ZSIsInJlYWR5U3RhdGUiLCJzaW5nbGVJbWFnZUxvYWRlZCIsInNyYyIsInNwb3RTd2lwZSIsImVuYWJsZWQiLCJkb2N1bWVudEVsZW1lbnQiLCJtb3ZlVGhyZXNob2xkIiwidGltZVRocmVzaG9sZCIsInN0YXJ0UG9zWCIsInN0YXJ0UG9zWSIsInN0YXJ0VGltZSIsImVsYXBzZWRUaW1lIiwiaXNNb3ZpbmciLCJvblRvdWNoRW5kIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9uVG91Y2hNb3ZlIiwieCIsInRvdWNoZXMiLCJwYWdlWCIsInkiLCJwYWdlWSIsImR4IiwiZHkiLCJkaXIiLCJhYnMiLCJvblRvdWNoU3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdCIsInRlYXJkb3duIiwic3BlY2lhbCIsInN3aXBlIiwic2V0dXAiLCJub29wIiwiYWRkVG91Y2giLCJoYW5kbGVUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwiZmlyc3QiLCJldmVudFR5cGVzIiwidG91Y2hzdGFydCIsInRvdWNobW92ZSIsInRvdWNoZW5kIiwic2ltdWxhdGVkRXZlbnQiLCJNb3VzZUV2ZW50Iiwic2NyZWVuWCIsInNjcmVlblkiLCJjbGllbnRYIiwiY2xpZW50WSIsImNyZWF0ZUV2ZW50IiwiaW5pdE1vdXNlRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiTXV0YXRpb25PYnNlcnZlciIsInByZWZpeGVzIiwidHJpZ2dlcnMiLCJzdG9wUHJvcGFnYXRpb24iLCJmYWRlT3V0IiwiY2hlY2tMaXN0ZW5lcnMiLCJldmVudHNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwic2Nyb2xsTGlzdGVuZXIiLCJjbG9zZW1lTGlzdGVuZXIiLCJ5ZXRpQm94ZXMiLCJwbHVnTmFtZXMiLCJsaXN0ZW5lcnMiLCJqb2luIiwicGx1Z2luSWQiLCJub3QiLCJkZWJvdW5jZSIsIiRub2RlcyIsIm5vZGVzIiwicXVlcnlTZWxlY3RvckFsbCIsImxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24iLCJtdXRhdGlvblJlY29yZHNMaXN0IiwiJHRhcmdldCIsImF0dHJpYnV0ZU5hbWUiLCJjbG9zZXN0IiwiZWxlbWVudE9ic2VydmVyIiwib2JzZXJ2ZSIsImF0dHJpYnV0ZXMiLCJjaGlsZExpc3QiLCJjaGFyYWN0ZXJEYXRhIiwic3VidHJlZSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiQWNjb3JkaW9uIiwiZGVmYXVsdHMiLCIkdGFicyIsImlkeCIsIiRjb250ZW50IiwibGlua0lkIiwiJGluaXRBY3RpdmUiLCJmaXJzdFRpbWVJbml0IiwiZG93biIsIl9jaGVja0RlZXBMaW5rIiwibG9jYXRpb24iLCJoYXNoIiwiJGxpbmsiLCIkYW5jaG9yIiwiaGFzQ2xhc3MiLCJkZWVwTGlua1NtdWRnZSIsImxvYWQiLCJzY3JvbGxUb3AiLCJkZWVwTGlua1NtdWRnZURlbGF5IiwiZGVlcExpbmsiLCJfZXZlbnRzIiwiJHRhYkNvbnRlbnQiLCJ0b2dnbGUiLCJuZXh0IiwiJGEiLCJtdWx0aUV4cGFuZCIsInByZXZpb3VzIiwicHJldiIsInVwIiwidXBkYXRlSGlzdG9yeSIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJyZXBsYWNlU3RhdGUiLCJmaXJzdFRpbWUiLCIkY3VycmVudEFjdGl2ZSIsInNsaWRlRG93biIsInNsaWRlU3BlZWQiLCIkYXVudHMiLCJzaWJsaW5ncyIsImFsbG93QWxsQ2xvc2VkIiwic2xpZGVVcCIsInN0b3AiLCJJbnRlcmNoYW5nZSIsInJ1bGVzIiwiY3VycmVudFBhdGgiLCJfYWRkQnJlYWtwb2ludHMiLCJfZ2VuZXJhdGVSdWxlcyIsIl9yZWZsb3ciLCJtYXRjaCIsInJ1bGUiLCJwYXRoIiwiU1BFQ0lBTF9RVUVSSUVTIiwicnVsZXNMaXN0Iiwibm9kZU5hbWUiLCJyZXNwb25zZSIsImh0bWwiLCJUYWJzIiwiJHRhYlRpdGxlcyIsImxpbmtDbGFzcyIsImlzQWN0aXZlIiwibGlua0FjdGl2ZUNsYXNzIiwiYXV0b0ZvY3VzIiwibWF0Y2hIZWlnaHQiLCIkaW1hZ2VzIiwiX3NldEhlaWdodCIsInNlbGVjdFRhYiIsIl9hZGRLZXlIYW5kbGVyIiwiX2FkZENsaWNrSGFuZGxlciIsIl9zZXRIZWlnaHRNcUhhbmRsZXIiLCJfaGFuZGxlVGFiQ2hhbmdlIiwiJGVsZW1lbnRzIiwiJHByZXZFbGVtZW50IiwiJG5leHRFbGVtZW50Iiwid3JhcE9uS2V5cyIsImxhc3QiLCJtaW4iLCJvcGVuIiwiaGlzdG9yeUhhbmRsZWQiLCJhY3RpdmVDb2xsYXBzZSIsIl9jb2xsYXBzZVRhYiIsIiRvbGRUYWIiLCIkdGFiTGluayIsIiR0YXJnZXRDb250ZW50IiwiX29wZW5UYWIiLCJwYW5lbEFjdGl2ZUNsYXNzIiwiJHRhcmdldF9hbmNob3IiLCJpZFN0ciIsInBhbmVsQ2xhc3MiLCJwYW5lbCIsInRlbXAiLCJkZWZpbmUiLCJhbWQiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVxdWlyZSIsImpRdWVyeUJyaWRnZXQiLCJvIiwiYSIsImwiLCJuIiwicyIsImgiLCJyIiwiYyIsImNoYXJBdCIsImQiLCJvcHRpb24iLCJpc1BsYWluT2JqZWN0IiwiYnJpZGdldCIsIkV2RW1pdHRlciIsIm9uY2UiLCJfb25jZUV2ZW50cyIsImVtaXRFdmVudCIsImdldFNpemUiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJvdXRlcldpZHRoIiwib3V0ZXJIZWlnaHQiLCJwYWRkaW5nIiwiYm9yZGVyU3R5bGUiLCJib3JkZXJXaWR0aCIsImJveFNpemluZyIsImFwcGVuZENoaWxkIiwiaXNCb3hTaXplT3V0ZXIiLCJyZW1vdmVDaGlsZCIsInF1ZXJ5U2VsZWN0b3IiLCJub2RlVHlwZSIsImRpc3BsYXkiLCJvZmZzZXRIZWlnaHQiLCJpc0JvcmRlckJveCIsInUiLCJmIiwidiIsInBhZGRpbmdMZWZ0IiwicGFkZGluZ1JpZ2h0IiwiZyIsInBhZGRpbmdUb3AiLCJwYWRkaW5nQm90dG9tIiwibSIsIm1hcmdpbkxlZnQiLCJtYXJnaW5SaWdodCIsIm1hcmdpblRvcCIsIm1hcmdpbkJvdHRvbSIsIlMiLCJib3JkZXJMZWZ0V2lkdGgiLCJib3JkZXJSaWdodFdpZHRoIiwiRSIsImJvcmRlclRvcFdpZHRoIiwiYm9yZGVyQm90dG9tV2lkdGgiLCJiIiwiQyIsIm1hdGNoZXNTZWxlY3RvciIsIkVsZW1lbnQiLCJmaXp6eVVJVXRpbHMiLCJtb2R1bG8iLCJtYWtlQXJyYXkiLCJyZW1vdmVGcm9tIiwiZ2V0UGFyZW50IiwiZ2V0UXVlcnlFbGVtZW50IiwiaGFuZGxlRXZlbnQiLCJmaWx0ZXJGaW5kRWxlbWVudHMiLCJIVE1MRWxlbWVudCIsImRlYm91bmNlTWV0aG9kIiwiZG9jUmVhZHkiLCJ0b0Rhc2hlZCIsImh0bWxJbml0IiwiZ2V0QXR0cmlidXRlIiwiSlNPTiIsInBhcnNlIiwiRmxpY2tpdHkiLCJDZWxsIiwiY3JlYXRlIiwic2hpZnQiLCJkZXN0cm95Iiwib3JpZ2luU2lkZSIsInNldFBvc2l0aW9uIiwidXBkYXRlVGFyZ2V0IiwicmVuZGVyUG9zaXRpb24iLCJzZXREZWZhdWx0VGFyZ2V0IiwiY2VsbEFsaWduIiwiZ2V0UG9zaXRpb25WYWx1ZSIsIndyYXBTaGlmdCIsInNsaWRlYWJsZVdpZHRoIiwicmVtb3ZlIiwiU2xpZGUiLCJpc09yaWdpbkxlZnQiLCJjZWxscyIsImFkZENlbGwiLCJmaXJzdE1hcmdpbiIsImdldExhc3RDZWxsIiwic2VsZWN0IiwiY2hhbmdlU2VsZWN0ZWRDbGFzcyIsInVuc2VsZWN0IiwiY2xhc3NMaXN0IiwiZ2V0Q2VsbEVsZW1lbnRzIiwiYW5pbWF0ZVByb3RvdHlwZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsInN0YXJ0QW5pbWF0aW9uIiwiaXNBbmltYXRpbmciLCJyZXN0aW5nRnJhbWVzIiwiYXBwbHlEcmFnRm9yY2UiLCJhcHBseVNlbGVjdGVkQXR0cmFjdGlvbiIsImludGVncmF0ZVBoeXNpY3MiLCJwb3NpdGlvblNsaWRlciIsInNldHRsZSIsInRyYW5zZm9ybSIsIndyYXBBcm91bmQiLCJzaGlmdFdyYXBDZWxscyIsImN1cnNvclBvc2l0aW9uIiwicmlnaHRUb0xlZnQiLCJzbGlkZXIiLCJzbGlkZXMiLCJzbGlkZXNXaWR0aCIsInBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCIsInNlbGVjdGVkU2xpZGUiLCJwZXJjZW50UG9zaXRpb24iLCJpc1BvaW50ZXJEb3duIiwiaXNGcmVlU2Nyb2xsaW5nIiwiX3NoaWZ0Q2VsbHMiLCJiZWZvcmVTaGlmdENlbGxzIiwiYWZ0ZXJTaGlmdENlbGxzIiwiX3Vuc2hpZnRDZWxscyIsInZlbG9jaXR5IiwiZ2V0RnJpY3Rpb25GYWN0b3IiLCJhcHBseUZvcmNlIiwiZ2V0UmVzdGluZ1Bvc2l0aW9uIiwiZHJhZ1giLCJzZWxlY3RlZEF0dHJhY3Rpb24iLCJmbGlja2l0eUdVSUQiLCJfY3JlYXRlIiwiYWNjZXNzaWJpbGl0eSIsImZyZWVTY3JvbGxGcmljdGlvbiIsImZyaWN0aW9uIiwibmFtZXNwYWNlSlF1ZXJ5RXZlbnRzIiwicmVzaXplIiwic2V0R2FsbGVyeVNpemUiLCJjcmVhdGVNZXRob2RzIiwiZ3VpZCIsInNlbGVjdGVkSW5kZXgiLCJ2aWV3cG9ydCIsIl9jcmVhdGVTbGlkZXIiLCJ3YXRjaENTUyIsImFjdGl2YXRlIiwiYWRkIiwiX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMiLCJyZWxvYWRDZWxscyIsInRhYkluZGV4IiwiaW5pdGlhbEluZGV4IiwiaXNJbml0QWN0aXZhdGVkIiwiY2VsbFNlbGVjdG9yIiwiX21ha2VDZWxscyIsInBvc2l0aW9uQ2VsbHMiLCJfZ2V0V3JhcFNoaWZ0Q2VsbHMiLCJnZXRMYXN0U2xpZGUiLCJfc2l6ZUNlbGxzIiwiX3Bvc2l0aW9uQ2VsbHMiLCJtYXhDZWxsSGVpZ2h0IiwidXBkYXRlU2xpZGVzIiwiX2NvbnRhaW5TbGlkZXMiLCJfZ2V0Q2FuQ2VsbEZpdCIsInVwZGF0ZVNlbGVjdGVkU2xpZGUiLCJncm91cENlbGxzIiwicGFyc2VJbnQiLCJyZXBvc2l0aW9uIiwic2V0Q2VsbEFsaWduIiwiY2VudGVyIiwiYWRhcHRpdmVIZWlnaHQiLCJfZ2V0R2FwQ2VsbHMiLCJjb250YWluIiwiRXZlbnQiLCJfd3JhcFNlbGVjdCIsImlzRHJhZ1NlbGVjdCIsInVuc2VsZWN0U2VsZWN0ZWRTbGlkZSIsInNlbGVjdGVkQ2VsbHMiLCJzZWxlY3RlZEVsZW1lbnRzIiwic2VsZWN0ZWRDZWxsIiwic2VsZWN0ZWRFbGVtZW50Iiwic2VsZWN0Q2VsbCIsImdldENlbGwiLCJnZXRDZWxscyIsImdldFBhcmVudENlbGwiLCJnZXRBZGphY2VudENlbGxFbGVtZW50cyIsInVpQ2hhbmdlIiwiY2hpbGRVSVBvaW50ZXJEb3duIiwib25yZXNpemUiLCJjb250ZW50IiwiZGVhY3RpdmF0ZSIsIm9ua2V5ZG93biIsImFjdGl2ZUVsZW1lbnQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJVbmlwb2ludGVyIiwiYmluZFN0YXJ0RXZlbnQiLCJfYmluZFN0YXJ0RXZlbnQiLCJ1bmJpbmRTdGFydEV2ZW50IiwicG9pbnRlckVuYWJsZWQiLCJtc1BvaW50ZXJFbmFibGVkIiwiZ2V0VG91Y2giLCJpZGVudGlmaWVyIiwicG9pbnRlcklkZW50aWZpZXIiLCJvbm1vdXNlZG93biIsImJ1dHRvbiIsIl9wb2ludGVyRG93biIsIm9udG91Y2hzdGFydCIsIm9uTVNQb2ludGVyRG93biIsIm9ucG9pbnRlcmRvd24iLCJwb2ludGVySWQiLCJwb2ludGVyRG93biIsIl9iaW5kUG9zdFN0YXJ0RXZlbnRzIiwibW91c2Vkb3duIiwicG9pbnRlcmRvd24iLCJNU1BvaW50ZXJEb3duIiwiX2JvdW5kUG9pbnRlckV2ZW50cyIsIl91bmJpbmRQb3N0U3RhcnRFdmVudHMiLCJvbm1vdXNlbW92ZSIsIl9wb2ludGVyTW92ZSIsIm9uTVNQb2ludGVyTW92ZSIsIm9ucG9pbnRlcm1vdmUiLCJvbnRvdWNobW92ZSIsInBvaW50ZXJNb3ZlIiwib25tb3VzZXVwIiwiX3BvaW50ZXJVcCIsIm9uTVNQb2ludGVyVXAiLCJvbnBvaW50ZXJ1cCIsIm9udG91Y2hlbmQiLCJfcG9pbnRlckRvbmUiLCJwb2ludGVyVXAiLCJwb2ludGVyRG9uZSIsIm9uTVNQb2ludGVyQ2FuY2VsIiwib25wb2ludGVyY2FuY2VsIiwiX3BvaW50ZXJDYW5jZWwiLCJvbnRvdWNoY2FuY2VsIiwicG9pbnRlckNhbmNlbCIsImdldFBvaW50ZXJQb2ludCIsIlVuaWRyYWdnZXIiLCJiaW5kSGFuZGxlcyIsIl9iaW5kSGFuZGxlcyIsInVuYmluZEhhbmRsZXMiLCJ0b3VjaEFjdGlvbiIsIm1zVG91Y2hBY3Rpb24iLCJoYW5kbGVzIiwiX2RyYWdQb2ludGVyRG93biIsImJsdXIiLCJwb2ludGVyRG93blBvaW50IiwiY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duIiwiX2RyYWdQb2ludGVyTW92ZSIsIl9kcmFnTW92ZSIsImlzRHJhZ2dpbmciLCJoYXNEcmFnU3RhcnRlZCIsIl9kcmFnU3RhcnQiLCJfZHJhZ1BvaW50ZXJVcCIsIl9kcmFnRW5kIiwiX3N0YXRpY0NsaWNrIiwiZHJhZ1N0YXJ0UG9pbnQiLCJpc1ByZXZlbnRpbmdDbGlja3MiLCJkcmFnU3RhcnQiLCJkcmFnTW92ZSIsImRyYWdFbmQiLCJvbmNsaWNrIiwiaXNJZ25vcmluZ01vdXNlVXAiLCJzdGF0aWNDbGljayIsImRyYWdnYWJsZSIsImRyYWdUaHJlc2hvbGQiLCJfY3JlYXRlRHJhZyIsImJpbmREcmFnIiwiX3VpQ2hhbmdlRHJhZyIsIl9jaGlsZFVJUG9pbnRlckRvd25EcmFnIiwidW5iaW5kRHJhZyIsImlzRHJhZ0JvdW5kIiwicG9pbnRlckRvd25Gb2N1cyIsIlRFWFRBUkVBIiwiSU5QVVQiLCJPUFRJT04iLCJyYWRpbyIsImNoZWNrYm94Iiwic3VibWl0IiwiaW1hZ2UiLCJmaWxlIiwicG9pbnRlckRvd25TY3JvbGwiLCJTRUxFQ1QiLCJzY3JvbGxUbyIsImlzVG91Y2hTY3JvbGxpbmciLCJkcmFnU3RhcnRQb3NpdGlvbiIsInByZXZpb3VzRHJhZ1giLCJkcmFnTW92ZVRpbWUiLCJmcmVlU2Nyb2xsIiwiZHJhZ0VuZFJlc3RpbmdTZWxlY3QiLCJkcmFnRW5kQm9vc3RTZWxlY3QiLCJnZXRTbGlkZURpc3RhbmNlIiwiX2dldENsb3Nlc3RSZXN0aW5nIiwiZGlzdGFuY2UiLCJpbmRleCIsImZsb29yIiwib25zY3JvbGwiLCJUYXBMaXN0ZW5lciIsImJpbmRUYXAiLCJ1bmJpbmRUYXAiLCJ0YXBFbGVtZW50IiwiZGlyZWN0aW9uIiwieDAiLCJ4MSIsInkxIiwieDIiLCJ5MiIsIngzIiwiaXNFbmFibGVkIiwiaXNQcmV2aW91cyIsImlzTGVmdCIsInNldEF0dHJpYnV0ZSIsImRpc2FibGUiLCJjcmVhdGVTVkciLCJvblRhcCIsInVwZGF0ZSIsImNyZWF0ZUVsZW1lbnROUyIsImFycm93U2hhcGUiLCJlbmFibGUiLCJkaXNhYmxlZCIsInByZXZOZXh0QnV0dG9ucyIsIl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnMiLCJwcmV2QnV0dG9uIiwibmV4dEJ1dHRvbiIsImFjdGl2YXRlUHJldk5leHRCdXR0b25zIiwiZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyIsIlByZXZOZXh0QnV0dG9uIiwiaG9sZGVyIiwiZG90cyIsInNldERvdHMiLCJhZGREb3RzIiwicmVtb3ZlRG90cyIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJ1cGRhdGVTZWxlY3RlZCIsInNlbGVjdGVkRG90IiwiUGFnZURvdHMiLCJwYWdlRG90cyIsIl9jcmVhdGVQYWdlRG90cyIsImFjdGl2YXRlUGFnZURvdHMiLCJ1cGRhdGVTZWxlY3RlZFBhZ2VEb3RzIiwidXBkYXRlUGFnZURvdHMiLCJkZWFjdGl2YXRlUGFnZURvdHMiLCJzdGF0ZSIsIm9uVmlzaWJpbGl0eUNoYW5nZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJvblZpc2liaWxpdHlQbGF5IiwidmlzaWJpbGl0eVBsYXkiLCJwbGF5IiwidGljayIsImF1dG9QbGF5IiwiY2xlYXIiLCJ0aW1lb3V0IiwidW5wYXVzZSIsInBhdXNlQXV0b1BsYXlPbkhvdmVyIiwiX2NyZWF0ZVBsYXllciIsInBsYXllciIsImFjdGl2YXRlUGxheWVyIiwic3RvcFBsYXllciIsImRlYWN0aXZhdGVQbGF5ZXIiLCJwbGF5UGxheWVyIiwicGF1c2VQbGF5ZXIiLCJ1bnBhdXNlUGxheWVyIiwib25tb3VzZWVudGVyIiwib25tb3VzZWxlYXZlIiwiUGxheWVyIiwiaW5zZXJ0IiwiX2NlbGxBZGRlZFJlbW92ZWQiLCJhcHBlbmQiLCJwcmVwZW5kIiwiY2VsbENoYW5nZSIsImNlbGxTaXplQ2hhbmdlIiwiaW1nIiwiZmxpY2tpdHkiLCJfY3JlYXRlTGF6eWxvYWQiLCJsYXp5TG9hZCIsIm9ubG9hZCIsIm9uZXJyb3IiLCJMYXp5TG9hZGVyIiwiX2NyZWF0ZUFzTmF2Rm9yIiwiYWN0aXZhdGVBc05hdkZvciIsImRlYWN0aXZhdGVBc05hdkZvciIsImRlc3Ryb3lBc05hdkZvciIsImFzTmF2Rm9yIiwic2V0TmF2Q29tcGFuaW9uIiwibmF2Q29tcGFuaW9uIiwib25OYXZDb21wYW5pb25TZWxlY3QiLCJuYXZDb21wYW5pb25TZWxlY3QiLCJvbk5hdlN0YXRpY0NsaWNrIiwicmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cyIsIm5hdlNlbGVjdGVkRWxlbWVudHMiLCJjaGFuZ2VOYXZTZWxlY3RlZENsYXNzIiwiaW1hZ2VzTG9hZGVkIiwiZWxlbWVudHMiLCJnZXRJbWFnZXMiLCJqcURlZmVycmVkIiwiRGVmZXJyZWQiLCJjaGVjayIsInVybCIsIkltYWdlIiwiYWRkRWxlbWVudEltYWdlcyIsImFkZEltYWdlIiwiYmFja2dyb3VuZCIsImFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzIiwiYmFja2dyb3VuZEltYWdlIiwiYWRkQmFja2dyb3VuZCIsInByb2dyZXNzIiwicHJvZ3Jlc3NlZENvdW50IiwiaGFzQW55QnJva2VuIiwiaXNMb2FkZWQiLCJub3RpZnkiLCJkZWJ1ZyIsImxvZyIsImlzQ29tcGxldGUiLCJnZXRJc0ltYWdlQ29tcGxldGUiLCJjb25maXJtIiwibmF0dXJhbFdpZHRoIiwicHJveHlJbWFnZSIsInVuYmluZEV2ZW50cyIsIm1ha2VKUXVlcnlQbHVnaW4iLCJwcm9taXNlIiwiX2NyZWF0ZUltYWdlc0xvYWRlZCIsImZhY3RvcnkiLCJ1dGlscyIsInByb3RvIiwiX2NyZWF0ZUJnTGF6eUxvYWQiLCJiZ0xhenlMb2FkIiwiYWRqQ291bnQiLCJjZWxsRWxlbXMiLCJjZWxsRWxlbSIsImJnTGF6eUxvYWRFbGVtIiwiaiIsIkJnTGF6eUxvYWRlciIsImVzY2FwZVJlZ0V4Q2hhcnMiLCJjcmVhdGVOb2RlIiwiY29udGFpbmVyQ2xhc3MiLCJkaXYiLCJFU0MiLCJUQUIiLCJSRVRVUk4iLCJMRUZUIiwiVVAiLCJSSUdIVCIsIkRPV04iLCJBdXRvY29tcGxldGUiLCJ0aGF0IiwiYWpheFNldHRpbmdzIiwiYXV0b1NlbGVjdEZpcnN0Iiwic2VydmljZVVybCIsImxvb2t1cCIsIm9uU2VsZWN0IiwibWluQ2hhcnMiLCJtYXhIZWlnaHQiLCJkZWZlclJlcXVlc3RCeSIsInBhcmFtcyIsImZvcm1hdFJlc3VsdCIsImRlbGltaXRlciIsInpJbmRleCIsIm5vQ2FjaGUiLCJvblNlYXJjaFN0YXJ0Iiwib25TZWFyY2hDb21wbGV0ZSIsIm9uU2VhcmNoRXJyb3IiLCJwcmVzZXJ2ZUlucHV0IiwidGFiRGlzYWJsZWQiLCJkYXRhVHlwZSIsImN1cnJlbnRSZXF1ZXN0IiwidHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCIsInByZXZlbnRCYWRRdWVyaWVzIiwibG9va3VwRmlsdGVyIiwic3VnZ2VzdGlvbiIsIm9yaWdpbmFsUXVlcnkiLCJxdWVyeUxvd2VyQ2FzZSIsInBhcmFtTmFtZSIsInRyYW5zZm9ybVJlc3VsdCIsInBhcnNlSlNPTiIsInNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UiLCJub1N1Z2dlc3Rpb25Ob3RpY2UiLCJvcmllbnRhdGlvbiIsImZvcmNlRml4UG9zaXRpb24iLCJzdWdnZXN0aW9ucyIsImJhZFF1ZXJpZXMiLCJjdXJyZW50VmFsdWUiLCJpbnRlcnZhbElkIiwiY2FjaGVkUmVzcG9uc2UiLCJvbkNoYW5nZUludGVydmFsIiwib25DaGFuZ2UiLCJpc0xvY2FsIiwic3VnZ2VzdGlvbnNDb250YWluZXIiLCJub1N1Z2dlc3Rpb25zQ29udGFpbmVyIiwiY2xhc3NlcyIsInNlbGVjdGVkIiwiaGludCIsImhpbnRWYWx1ZSIsInNlbGVjdGlvbiIsImluaXRpYWxpemUiLCJzZXRPcHRpb25zIiwicGF0dGVybiIsIlJlZ0V4cCIsImtpbGxlckZuIiwic3VnZ2VzdGlvblNlbGVjdG9yIiwiY29udGFpbmVyIiwia2lsbFN1Z2dlc3Rpb25zIiwiZGlzYWJsZUtpbGxlckZuIiwiZml4UG9zaXRpb25DYXB0dXJlIiwidmlzaWJsZSIsImZpeFBvc2l0aW9uIiwib25LZXlQcmVzcyIsIm9uS2V5VXAiLCJvbkJsdXIiLCJvbkZvY3VzIiwib25WYWx1ZUNoYW5nZSIsImVuYWJsZUtpbGxlckZuIiwiYWJvcnRBamF4IiwiYWJvcnQiLCJzdXBwbGllZE9wdGlvbnMiLCJ2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdCIsInZhbGlkYXRlT3JpZW50YXRpb24iLCJjbGVhckNhY2hlIiwiY2xlYXJJbnRlcnZhbCIsIiRjb250YWluZXIiLCJjb250YWluZXJQYXJlbnQiLCJzaXRlU2VhcmNoRGl2IiwiY29udGFpbmVySGVpZ2h0Iiwic3R5bGVzIiwidmlld1BvcnRIZWlnaHQiLCJ0b3BPdmVyZmxvdyIsImJvdHRvbU92ZXJmbG93Iiwib3BhY2l0eSIsInBhcmVudE9mZnNldERpZmYiLCJvZmZzZXRQYXJlbnQiLCJzdG9wS2lsbFN1Z2dlc3Rpb25zIiwic2V0SW50ZXJ2YWwiLCJpc0N1cnNvckF0RW5kIiwidmFsTGVuZ3RoIiwic2VsZWN0aW9uU3RhcnQiLCJyYW5nZSIsImNyZWF0ZVJhbmdlIiwibW92ZVN0YXJ0Iiwic3VnZ2VzdCIsIm9uSGludCIsInNlbGVjdEhpbnQiLCJtb3ZlVXAiLCJtb3ZlRG93biIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsImZpbmRCZXN0SGludCIsImdldFF1ZXJ5Iiwib25JbnZhbGlkYXRlU2VsZWN0aW9uIiwiaXNFeGFjdE1hdGNoIiwiZ2V0U3VnZ2VzdGlvbnMiLCJnZXRTdWdnZXN0aW9uc0xvY2FsIiwibGltaXQiLCJsb29rdXBMaW1pdCIsImdyZXAiLCJxIiwiY2FjaGVLZXkiLCJpZ25vcmVQYXJhbXMiLCJpc0Z1bmN0aW9uIiwiaXNCYWRRdWVyeSIsImFqYXgiLCJkb25lIiwicmVzdWx0IiwicHJvY2Vzc1Jlc3BvbnNlIiwiZmFpbCIsImpxWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwib25IaWRlIiwic2lnbmFsSGludCIsIm5vU3VnZ2VzdGlvbnMiLCJncm91cEJ5IiwiY2xhc3NTZWxlY3RlZCIsImJlZm9yZVJlbmRlciIsImNhdGVnb3J5IiwiZm9ybWF0R3JvdXAiLCJjdXJyZW50Q2F0ZWdvcnkiLCJhZGp1c3RDb250YWluZXJXaWR0aCIsImRldGFjaCIsImVtcHR5IiwiYmVzdE1hdGNoIiwiZm91bmRNYXRjaCIsInN1YnN0ciIsImZhbGxiYWNrIiwiaW5BcnJheSIsImFjdGl2ZUl0ZW0iLCJhZGp1c3RTY3JvbGwiLCJvZmZzZXRUb3AiLCJ1cHBlckJvdW5kIiwibG93ZXJCb3VuZCIsImhlaWdodERlbHRhIiwiZ2V0VmFsdWUiLCJvblNlbGVjdENhbGxiYWNrIiwiZGlzcG9zZSIsImF1dG9jb21wbGV0ZSIsImRldmJyaWRnZUF1dG9jb21wbGV0ZSIsImRhdGFLZXkiLCJpbnB1dEVsZW1lbnQiLCJpbnN0YW5jZSIsImJhc2VzIiwiYmFzZUhyZWYiLCJocmVmIiwibXlMYXp5TG9hZCIsIkxhenlMb2FkIiwiZWxlbWVudHNfc2VsZWN0b3IiLCIkY2Fyb3VzZWwiLCIkaW1ncyIsImRvY1N0eWxlIiwidHJhbnNmb3JtUHJvcCIsImZsa3R5Iiwic2xpZGUiLCJjbGljayIsIiRnYWxsZXJ5Iiwib25Mb2FkZWRkYXRhIiwiY2VsbCIsInZpZGVvIiwiJHNsaWRlc2hvdyIsInNsaWRlc2hvd2ZsayIsIndyYXAiLCJ3aGF0SW5wdXQiLCJhc2siLCJ0b2dnbGVDbGFzcyIsInRvZ2dsZVNlYXJjaENsYXNzZXMiLCJ0b2dnbGVNb2JpbGVNZW51Q2xhc3NlcyIsImdldEVsZW1lbnRCeUlkIiwiZm9jdXNvdXQiLCJvbGRTaXplIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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YXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiB3aGF0LWlucHV0IC0gQSBnbG9iYWwgdXRpbGl0eSBmb3IgdHJhY2tpbmcgdGhlIGN1cnJlbnQgaW5wdXQgbWV0aG9kIChtb3VzZSwga2V5Ym9hcmQgb3IgdG91Y2gpLlxuICogQHZlcnNpb24gdjQuMC42XG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vdGVuMXNldmVuL3doYXQtaW5wdXRcbiAqIEBsaWNlbnNlIE1JVFxuICovXG4oZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcIndoYXRJbnB1dFwiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge30sXG4vKioqKioqLyBcdFx0XHRpZDogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4vKioqKioqLyBcdFx0fTtcblxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cblxuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdG1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgVmFyaWFibGVzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgLy8gY2FjaGUgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cdCAgdmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgdHlwZVxuXHQgIHZhciBjdXJyZW50SW5wdXQgPSAnaW5pdGlhbCc7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgaW50ZW50XG5cdCAgdmFyIGN1cnJlbnRJbnRlbnQgPSBudWxsO1xuXG5cdCAgLy8gZm9ybSBpbnB1dCB0eXBlc1xuXHQgIHZhciBmb3JtSW5wdXRzID0gW1xuXHQgICAgJ2lucHV0Jyxcblx0ICAgICdzZWxlY3QnLFxuXHQgICAgJ3RleHRhcmVhJ1xuXHQgIF07XG5cblx0ICAvLyBsaXN0IG9mIG1vZGlmaWVyIGtleXMgY29tbW9ubHkgdXNlZCB3aXRoIHRoZSBtb3VzZSBhbmRcblx0ICAvLyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgdG8gcHJldmVudCBmYWxzZSBrZXlib2FyZCBkZXRlY3Rpb25cblx0ICB2YXIgaWdub3JlTWFwID0gW1xuXHQgICAgMTYsIC8vIHNoaWZ0XG5cdCAgICAxNywgLy8gY29udHJvbFxuXHQgICAgMTgsIC8vIGFsdFxuXHQgICAgOTEsIC8vIFdpbmRvd3Mga2V5IC8gbGVmdCBBcHBsZSBjbWRcblx0ICAgIDkzICAvLyBXaW5kb3dzIG1lbnUgLyByaWdodCBBcHBsZSBjbWRcblx0ICBdO1xuXG5cdCAgLy8gbWFwcGluZyBvZiBldmVudHMgdG8gaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRNYXAgPSB7XG5cdCAgICAna2V5dXAnOiAna2V5Ym9hcmQnLFxuXHQgICAgJ21vdXNlZG93bic6ICdtb3VzZScsXG5cdCAgICAnbW91c2Vtb3ZlJzogJ21vdXNlJyxcblx0ICAgICdNU1BvaW50ZXJEb3duJzogJ3BvaW50ZXInLFxuXHQgICAgJ01TUG9pbnRlck1vdmUnOiAncG9pbnRlcicsXG5cdCAgICAncG9pbnRlcmRvd24nOiAncG9pbnRlcicsXG5cdCAgICAncG9pbnRlcm1vdmUnOiAncG9pbnRlcicsXG5cdCAgICAndG91Y2hzdGFydCc6ICd0b3VjaCdcblx0ICB9O1xuXG5cdCAgLy8gYXJyYXkgb2YgYWxsIHVzZWQgaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRUeXBlcyA9IFtdO1xuXG5cdCAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0b3VjaCBidWZmZXIgdGltZXIgaXMgcnVubmluZ1xuXHQgIHZhciBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXG5cdCAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXG5cdCAgdmFyIHBvaW50ZXJNYXAgPSB7XG5cdCAgICAyOiAndG91Y2gnLFxuXHQgICAgMzogJ3RvdWNoJywgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgIDQ6ICdtb3VzZSdcblx0ICB9O1xuXG5cdCAgLy8gdG91Y2ggYnVmZmVyIHRpbWVyXG5cdCAgdmFyIHRvdWNoVGltZXIgPSBudWxsO1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBTZXQgdXBcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgc2V0VXAgPSBmdW5jdGlvbigpIHtcblxuXHQgICAgLy8gYWRkIGNvcnJlY3QgbW91c2Ugd2hlZWwgZXZlbnQgbWFwcGluZyB0byBgaW5wdXRNYXBgXG5cdCAgICBpbnB1dE1hcFtkZXRlY3RXaGVlbCgpXSA9ICdtb3VzZSc7XG5cblx0ICAgIGFkZExpc3RlbmVycygpO1xuXHQgICAgc2V0SW5wdXQoKTtcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBFdmVudHNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG5cblx0ICAgIC8vIGBwb2ludGVybW92ZWAsIGBNU1BvaW50ZXJNb3ZlYCwgYG1vdXNlbW92ZWAgYW5kIG1vdXNlIHdoZWVsIGV2ZW50IGJpbmRpbmdcblx0ICAgIC8vIGNhbiBvbmx5IGRlbW9uc3RyYXRlIHBvdGVudGlhbCwgYnV0IG5vdCBhY3R1YWwsIGludGVyYWN0aW9uXG5cdCAgICAvLyBhbmQgYXJlIHRyZWF0ZWQgc2VwYXJhdGVseVxuXG5cdCAgICAvLyBwb2ludGVyIGV2ZW50cyAobW91c2UsIHBlbiwgdG91Y2gpXG5cdCAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cblx0ICAgICAgLy8gbW91c2UgZXZlbnRzXG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHNldEludGVudCk7XG5cblx0ICAgICAgLy8gdG91Y2ggZXZlbnRzXG5cdCAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcblx0ICAgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaEJ1ZmZlcik7XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gbW91c2Ugd2hlZWxcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcihkZXRlY3RXaGVlbCgpLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAvLyBrZXlib2FyZCBldmVudHNcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGVJbnB1dCk7XG5cdCAgfTtcblxuXHQgIC8vIGNoZWNrcyBjb25kaXRpb25zIGJlZm9yZSB1cGRhdGluZyBuZXcgaW5wdXRcblx0ICB2YXIgdXBkYXRlSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciBldmVudEtleSA9IGV2ZW50LndoaWNoO1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChcblx0ICAgICAgICBjdXJyZW50SW5wdXQgIT09IHZhbHVlIHx8XG5cdCAgICAgICAgY3VycmVudEludGVudCAhPT0gdmFsdWVcblx0ICAgICAgKSB7XG5cblx0ICAgICAgICB2YXIgYWN0aXZlRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdCAgICAgICAgdmFyIGFjdGl2ZUlucHV0ID0gKFxuXHQgICAgICAgICAgYWN0aXZlRWxlbSAmJlxuXHQgICAgICAgICAgYWN0aXZlRWxlbS5ub2RlTmFtZSAmJlxuXHQgICAgICAgICAgZm9ybUlucHV0cy5pbmRleE9mKGFjdGl2ZUVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkgPT09IC0xXG5cdCAgICAgICAgKSA/IHRydWUgOiBmYWxzZTtcblxuXHQgICAgICAgIGlmIChcblx0ICAgICAgICAgIHZhbHVlID09PSAndG91Y2gnIHx8XG5cblx0ICAgICAgICAgIC8vIGlnbm9yZSBtb3VzZSBtb2RpZmllciBrZXlzXG5cdCAgICAgICAgICAodmFsdWUgPT09ICdtb3VzZScgJiYgaWdub3JlTWFwLmluZGV4T2YoZXZlbnRLZXkpID09PSAtMSkgfHxcblxuXHQgICAgICAgICAgLy8gZG9uJ3Qgc3dpdGNoIGlmIHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgYSBmb3JtIGlucHV0XG5cdCAgICAgICAgICAodmFsdWUgPT09ICdrZXlib2FyZCcgJiYgYWN0aXZlSW5wdXQpXG5cdCAgICAgICAgKSB7XG5cblx0ICAgICAgICAgIC8vIHNldCB0aGUgY3VycmVudCBhbmQgY2F0Y2gtYWxsIHZhcmlhYmxlXG5cdCAgICAgICAgICBjdXJyZW50SW5wdXQgPSBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICAgIHNldElucHV0KCk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgdGhlIGRvYyBhbmQgYGlucHV0VHlwZXNgIGFycmF5IHdpdGggbmV3IGlucHV0XG5cdCAgdmFyIHNldElucHV0ID0gZnVuY3Rpb24oKSB7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQnLCBjdXJyZW50SW5wdXQpO1xuXHQgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnB1dCk7XG5cblx0ICAgIGlmIChpbnB1dFR5cGVzLmluZGV4T2YoY3VycmVudElucHV0KSA9PT0gLTEpIHtcblx0ICAgICAgaW5wdXRUeXBlcy5wdXNoKGN1cnJlbnRJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uY2xhc3NOYW1lICs9ICcgd2hhdGlucHV0LXR5cGVzLScgKyBjdXJyZW50SW5wdXQ7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgaW5wdXQgaW50ZW50IGZvciBgbW91c2Vtb3ZlYCBhbmQgYHBvaW50ZXJtb3ZlYFxuXHQgIHZhciBzZXRJbnRlbnQgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgICAgY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGJ1ZmZlcnMgdG91Y2ggZXZlbnRzIGJlY2F1c2UgdGhleSBmcmVxdWVudGx5IGFsc28gZmlyZSBtb3VzZSBldmVudHNcblx0ICB2YXIgdG91Y2hCdWZmZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBjbGVhciB0aGUgdGltZXIgaWYgaXQgaGFwcGVucyB0byBiZSBydW5uaW5nXG5cdCAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRvdWNoVGltZXIpO1xuXG5cdCAgICAvLyBzZXQgdGhlIGN1cnJlbnQgaW5wdXRcblx0ICAgIHVwZGF0ZUlucHV0KGV2ZW50KTtcblxuXHQgICAgLy8gc2V0IHRoZSBpc0J1ZmZlcmluZyB0byBgdHJ1ZWBcblx0ICAgIGlzQnVmZmVyaW5nID0gdHJ1ZTtcblxuXHQgICAgLy8gcnVuIHRoZSB0aW1lclxuXHQgICAgdG91Y2hUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG5cdCAgICAgIC8vIGlmIHRoZSB0aW1lciBydW5zIG91dCwgc2V0IGlzQnVmZmVyaW5nIGJhY2sgdG8gYGZhbHNlYFxuXHQgICAgICBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXHQgICAgfSwgMjAwKTtcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBVdGlsaXRpZXNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgcG9pbnRlclR5cGUgPSBmdW5jdGlvbihldmVudCkge1xuXHQgICBpZiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykge1xuXHQgICAgICByZXR1cm4gcG9pbnRlck1hcFtldmVudC5wb2ludGVyVHlwZV07XG5cdCAgIH0gZWxzZSB7XG5cdCAgICAgIHJldHVybiAoZXZlbnQucG9pbnRlclR5cGUgPT09ICdwZW4nKSA/ICd0b3VjaCcgOiBldmVudC5wb2ludGVyVHlwZTsgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgfVxuXHQgIH07XG5cblx0ICAvLyBkZXRlY3QgdmVyc2lvbiBvZiBtb3VzZSB3aGVlbCBldmVudCB0byB1c2Vcblx0ICAvLyB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG5cdCAgdmFyIGRldGVjdFdoZWVsID0gZnVuY3Rpb24oKSB7XG5cdCAgICByZXR1cm4gJ29ud2hlZWwnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpID9cblx0ICAgICAgJ3doZWVsJyA6IC8vIE1vZGVybiBicm93c2VycyBzdXBwb3J0IFwid2hlZWxcIlxuXG5cdCAgICAgIGRvY3VtZW50Lm9ubW91c2V3aGVlbCAhPT0gdW5kZWZpbmVkID9cblx0ICAgICAgICAnbW91c2V3aGVlbCcgOiAvLyBXZWJraXQgYW5kIElFIHN1cHBvcnQgYXQgbGVhc3QgXCJtb3VzZXdoZWVsXCJcblx0ICAgICAgICAnRE9NTW91c2VTY3JvbGwnOyAvLyBsZXQncyBhc3N1bWUgdGhhdCByZW1haW5pbmcgYnJvd3NlcnMgYXJlIG9sZGVyIEZpcmVmb3hcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBJbml0XG5cblx0ICAgIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkXG5cdCAgICAoYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkKVxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIGlmIChcblx0ICAgICdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiZcblx0ICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG5cdCAgKSB7XG5cdCAgICBzZXRVcCgpO1xuXHQgIH1cblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgQVBJXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgcmV0dXJuIHtcblxuXHQgICAgLy8gcmV0dXJucyBzdHJpbmc6IHRoZSBjdXJyZW50IGlucHV0IHR5cGVcblx0ICAgIC8vIG9wdDogJ2xvb3NlJ3wnc3RyaWN0J1xuXHQgICAgLy8gJ3N0cmljdCcgKGRlZmF1bHQpOiByZXR1cm5zIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBgZGF0YS13aGF0aW5wdXRgIGF0dHJpYnV0ZVxuXHQgICAgLy8gJ2xvb3NlJzogaW5jbHVkZXMgYGRhdGEtd2hhdGludGVudGAgdmFsdWUgaWYgaXQncyBtb3JlIGN1cnJlbnQgdGhhbiBgZGF0YS13aGF0aW5wdXRgXG5cdCAgICBhc2s6IGZ1bmN0aW9uKG9wdCkgeyByZXR1cm4gKG9wdCA9PT0gJ2xvb3NlJykgPyBjdXJyZW50SW50ZW50IDogY3VycmVudElucHV0OyB9LFxuXG5cdCAgICAvLyByZXR1cm5zIGFycmF5OiBhbGwgdGhlIGRldGVjdGVkIGlucHV0IHR5cGVzXG5cdCAgICB0eXBlczogZnVuY3Rpb24oKSB7IHJldHVybiBpbnB1dFR5cGVzOyB9XG5cblx0ICB9O1xuXG5cdH0oKSk7XG5cblxuLyoqKi8gfVxuLyoqKioqKi8gXSlcbn0pO1xuOyIsIiFmdW5jdGlvbigkKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMy4xJztcblxuLy8gR2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4vLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG52YXIgRm91bmRhdGlvbiA9IHtcbiAgdmVyc2lvbjogRk9VTkRBVElPTl9WRVJTSU9OLFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICovXG4gIF9wbHVnaW5zOiB7fSxcblxuICAvKipcbiAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAqL1xuICBfdXVpZHM6IFtdLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICovXG4gIHJ0bDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgfSxcbiAgLyoqXG4gICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHBsdWdpbi5cbiAgICovXG4gIHBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKSB7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gICAgLy8gRXhhbXBsZXM6IEZvdW5kYXRpb24uUmV2ZWFsLCBGb3VuZGF0aW9uLk9mZkNhbnZhc1xuICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICB2YXIgYXR0ck5hbWUgID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG5cbiAgICAvLyBBZGQgdG8gdGhlIEZvdW5kYXRpb24gb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICogQWRkcyB0aGUgYHpmUGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikuZm91bmRhdGlvbihtZXRob2QpIGNhbGxzLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgKi9cbiAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSl7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApKXsgcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWAsIHBsdWdpbi51dWlkKTsgfVxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKSl7IHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHBsdWdpbik7IH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICAgICAqL1xuICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKGBpbml0LnpmLiR7cGx1Z2luTmFtZX1gKTtcblxuICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFJlbW92ZXMgdGhlIHBsdWdpbnMgdXVpZCBmcm9tIHRoZSBfdXVpZHMgYXJyYXkuXG4gICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgICAgICovXG4gICAgICAgICAgLnRyaWdnZXIoYGRlc3Ryb3llZC56Zi4ke3BsdWdpbk5hbWV9YCk7XG4gICAgZm9yKHZhciBwcm9wIGluIHBsdWdpbil7XG4gICAgICBwbHVnaW5bcHJvcF0gPSBudWxsOy8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICovXG4gICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xuICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICB0cnl7XG4gICAgICAgaWYoaXNKUSl7XG4gICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgJCh0aGlzKS5kYXRhKCd6ZlBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICB9KTtcbiAgICAgICB9ZWxzZXtcbiAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICdvYmplY3QnOiBmdW5jdGlvbihwbGdzKXtcbiAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24ocCl7XG4gICAgICAgICAgICAgICBwID0gaHlwaGVuYXRlKHApO1xuICAgICAgICAgICAgICAgJCgnW2RhdGEtJysgcCArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAnc3RyaW5nJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICBwbHVnaW5zID0gaHlwaGVuYXRlKHBsdWdpbnMpO1xuICAgICAgICAgICAgICQoJ1tkYXRhLScrIHBsdWdpbnMgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgfTtcbiAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICB9XG4gICAgIH1jYXRjaChlcnIpe1xuICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgfWZpbmFsbHl7XG4gICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgIH1cbiAgIH0sXG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgKi9cbiAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uKGxlbmd0aCwgbmFtZXNwYWNlKXtcbiAgICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKSkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/IGAtJHtuYW1lc3BhY2V9YCA6ICcnKTtcbiAgfSxcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgKi9cbiAgcmVmbG93OiBmdW5jdGlvbihlbGVtLCBwbHVnaW5zKSB7XG5cbiAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwbHVnaW5zID0gT2JqZWN0LmtleXModGhpcy5fcGx1Z2lucyk7XG4gICAgfVxuICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgIGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJykge1xuICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcblxuICAgICAgLy8gTG9jYWxpemUgdGhlIHNlYXJjaCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIGVsZW0sIGFzIHdlbGwgYXMgZWxlbSBpdHNlbGYsIHVubGVzcyBlbGVtID09PSBkb2N1bWVudFxuICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nK25hbWUrJ10nKS5hZGRCYWNrKCdbZGF0YS0nK25hbWUrJ10nKTtcblxuICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWRpcCBvbiBwbHVnaW5zXG4gICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIrbmFtZStcIiBvbiBhbiBlbGVtZW50IHRoYXQgYWxyZWFkeSBoYXMgYSBGb3VuZGF0aW9uIHBsdWdpbi5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKXtcbiAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGkpe1xuICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24oZWwpeyByZXR1cm4gZWwudHJpbSgpOyB9KTtcbiAgICAgICAgICAgIGlmKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgfWNhdGNoKGVyKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyKTtcbiAgICAgICAgfWZpbmFsbHl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uKCRlbGVtKXtcbiAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgfTtcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICBlbmQ7XG5cbiAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoZW5kKXtcbiAgICAgIHJldHVybiBlbmQ7XG4gICAgfWVsc2V7XG4gICAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICB9LCAxKTtcbiAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgfVxuICB9XG59O1xuXG5Gb3VuZGF0aW9uLnV0aWwgPSB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAqL1xuICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4vLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbi8qKlxuICogVGhlIEZvdW5kYXRpb24galF1ZXJ5IG1ldGhvZC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICovXG52YXIgZm91bmRhdGlvbiA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAkbWV0YSA9ICQoJ21ldGEuZm91bmRhdGlvbi1tcScpLFxuICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcblxuICBpZighJG1ldGEubGVuZ3RoKXtcbiAgICAkKCc8bWV0YSBjbGFzcz1cImZvdW5kYXRpb24tbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgfVxuICBpZigkbm9KUy5sZW5ndGgpe1xuICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICB9XG5cbiAgaWYodHlwZSA9PT0gJ3VuZGVmaW5lZCcpey8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVmbG93KHRoaXMpO1xuICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7Ly9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3pmUGx1Z2luJyk7Ly9kZXRlcm1pbmUgdGhlIGNsYXNzIG9mIHBsdWdpblxuXG4gICAgaWYocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCl7Ly9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgaWYodGhpcy5sZW5ndGggPT09IDEpey8vaWYgdGhlcmUncyBvbmx5IG9uZSwgY2FsbCBpdCBkaXJlY3RseS5cbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBlbCl7Ly9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3pmUGx1Z2luJyksIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9ZWxzZXsvL2Vycm9yIGZvciBubyBjbGFzcyBvciBubyBtZXRob2RcbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICB9XG4gIH1lbHNley8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFdlJ3JlIHNvcnJ5LCAke3R5cGV9IGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS5gKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbndpbmRvdy5Gb3VuZGF0aW9uID0gRm91bmRhdGlvbjtcbiQuZm4uZm91bmRhdGlvbiA9IGZvdW5kYXRpb247XG5cbi8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbihmdW5jdGlvbigpIHtcbiAgaWYgKCFEYXRlLm5vdyB8fCAhd2luZG93LkRhdGUubm93KVxuICAgIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgIHZhciB2cCA9IHZlbmRvcnNbaV07XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbdnArJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2cCsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10pO1xuICB9XG4gIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgfHwgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUaW1lIC0gbm93KTtcbiAgICB9O1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgfVxuICAvKipcbiAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAqL1xuICBpZighd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KXtcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKXsgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0OyB9XG4gICAgfTtcbiAgfVxufSkoKTtcbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihvVGhpcykge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgIH1cblxuICAgIHZhciBhQXJncyAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgIGZOT1AgICAgPSBmdW5jdGlvbigpIHt9LFxuICAgICAgICBmQm91bmQgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1BcbiAgICAgICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICAgICAgIDogb1RoaXMsXG4gICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG5cbiAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICB9XG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICByZXR1cm4gZkJvdW5kO1xuICB9O1xufVxuLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG5mdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgIHZhciByZXN1bHRzID0gKGZ1bmNOYW1lUmVnZXgpLmV4ZWMoKGZuKS50b1N0cmluZygpKTtcbiAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgfVxuICBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBmbi5wcm90b3R5cGUuY29uc3RydWN0b3IubmFtZTtcbiAgfVxufVxuZnVuY3Rpb24gcGFyc2VWYWx1ZShzdHIpe1xuICBpZiAoJ3RydWUnID09PSBzdHIpIHJldHVybiB0cnVlO1xuICBlbHNlIGlmICgnZmFsc2UnID09PSBzdHIpIHJldHVybiBmYWxzZTtcbiAgZWxzZSBpZiAoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICByZXR1cm4gc3RyO1xufVxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuRm91bmRhdGlvbi5Cb3ggPSB7XG4gIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXG4gIEdldE9mZnNldHM6IEdldE9mZnNldHNcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxuICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gSW1Ob3RUb3VjaGluZ1lvdShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KSB7XG4gIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodDtcblxuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCArIHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICB9XG4gIGVsc2Uge1xuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aCk7XG4gIH1cblxuICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gIH1cblxuICBpZiAodGJPbmx5KSB7XG4gICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufTtcblxuLyoqXG4gKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KXtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogKCgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAoJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgfVxuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCAtICRlbGVEaW1zLndpZHRoLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICB9XG59XG5cbn0oalF1ZXJ5KTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcbiAqIFBsZWFzZSB0aGFuayBNYXJpdXMgb24gR2l0SHViIC9vd2xiZXJ0eiAqXG4gKiBvciB0aGUgd2ViIGh0dHA6Ly93d3cubWFyaXVzb2xiZXJ0ei5kZS8gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3Qga2V5Q29kZXMgPSB7XG4gIDk6ICdUQUInLFxuICAxMzogJ0VOVEVSJyxcbiAgMjc6ICdFU0NBUEUnLFxuICAzMjogJ1NQQUNFJyxcbiAgMzc6ICdBUlJPV19MRUZUJyxcbiAgMzg6ICdBUlJPV19VUCcsXG4gIDM5OiAnQVJST1dfUklHSFQnLFxuICA0MDogJ0FSUk9XX0RPV04nXG59XG5cbnZhciBjb21tYW5kcyA9IHt9XG5cbnZhciBLZXlib2FyZCA9IHtcbiAga2V5czogZ2V0S2V5Q29kZXMoa2V5Q29kZXMpLFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIChrZXlib2FyZCkgZXZlbnQgYW5kIHJldHVybnMgYSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGl0cyBrZXlcbiAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcmV0dXJuIFN0cmluZyBrZXkgLSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBrZXkgcHJlc3NlZFxuICAgKi9cbiAgcGFyc2VLZXkoZXZlbnQpIHtcbiAgICB2YXIga2V5ID0ga2V5Q29kZXNbZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCkudG9VcHBlckNhc2UoKTtcblxuICAgIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxXKy8sICcnKTtcblxuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gYFNISUZUXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9IGBDVFJMXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gYEFMVF8ke2tleX1gO1xuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHVuZGVyc2NvcmUsIGluIGNhc2Ugb25seSBtb2RpZmllcnMgd2VyZSB1c2VkIChlLmcuIG9ubHkgYENUUkxfQUxUYClcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgICByZXR1cm4ga2V5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBnaXZlbiAoa2V5Ym9hcmQpIGV2ZW50XG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQncyBuYW1lLCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHBhcmFtIHtPYmplY3RzfSBmdW5jdGlvbnMgLSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBleGVjdXRlZFxuICAgKi9cbiAgaGFuZGxlS2V5KGV2ZW50LCBjb21wb25lbnQsIGZ1bmN0aW9ucykge1xuICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXG4gICAgICBrZXlDb2RlID0gdGhpcy5wYXJzZUtleShldmVudCksXG4gICAgICBjbWRzLFxuICAgICAgY29tbWFuZCxcbiAgICAgIGZuO1xuXG4gICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7IC8vIHRoaXMgY29tcG9uZW50IGRvZXMgbm90IGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsdHIgYW5kIHJ0bFxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XG4gICAgfSBlbHNlIHsgLy8gbWVyZ2UgbHRyIGFuZCBydGw6IGlmIGRvY3VtZW50IGlzIHJ0bCwgcnRsIG92ZXJ3cml0ZXMgbHRyIGFuZCB2aWNlIHZlcnNhXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0Lmx0ciwgY29tbWFuZExpc3QucnRsKTtcblxuICAgICAgICBlbHNlIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QucnRsLCBjb21tYW5kTGlzdC5sdHIpO1xuICAgIH1cbiAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcblxuICAgIGZuID0gZnVuY3Rpb25zW2NvbW1hbmRdO1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiAgaWYgZXhpc3RzXG4gICAgICB2YXIgcmV0dXJuVmFsdWUgPSBmbi5hcHBseSgpO1xuICAgICAgaWYgKGZ1bmN0aW9ucy5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgKi9cbiAgZmluZEZvY3VzYWJsZSgkZWxlbWVudCkge1xuICAgIGlmKCEkZWxlbWVudCkge3JldHVybiBmYWxzZTsgfVxuICAgIHJldHVybiAkZWxlbWVudC5maW5kKCdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHsgcmV0dXJuIGZhbHNlOyB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxuICAgKi9cblxuICByZWdpc3Rlcihjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICB9LCAgXG5cbiAgLyoqXG4gICAqIFRyYXBzIHRoZSBmb2N1cyBpbiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byB0cmFwIHRoZSBmb3VjcyBpbnRvLlxuICAgKi9cbiAgdHJhcEZvY3VzKCRlbGVtZW50KSB7XG4gICAgdmFyICRmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoJGVsZW1lbnQpLFxuICAgICAgICAkZmlyc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICAkbGFzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgJGVsZW1lbnQub24oJ2tleWRvd24uemYudHJhcGZvY3VzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgPT09ICRsYXN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkZmlyc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnU0hJRlRfVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkbGFzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogUmVsZWFzZXMgdGhlIHRyYXBwZWQgZm9jdXMgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAqL1xuICByZWxlYXNlRm9jdXMoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24uemYudHJhcGZvY3VzJyk7XG4gIH1cbn1cblxuLypcbiAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICovXG5mdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgdmFyIGsgPSB7fTtcbiAgZm9yICh2YXIga2MgaW4ga2NzKSBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgcmV0dXJuIGs7XG59XG5cbkZvdW5kYXRpb24uS2V5Ym9hcmQgPSBLZXlib2FyZDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG5jb25zdCBkZWZhdWx0UXVlcmllcyA9IHtcbiAgJ2RlZmF1bHQnIDogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlIDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICByZXRpbmEgOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxudmFyIE1lZGlhUXVlcnkgPSB7XG4gIHF1ZXJpZXM6IFtdLFxuXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBpZihuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgIHZhbHVlOiBgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICR7bmFtZWRRdWVyaWVzW2tleV19KWBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgIHRoaXMuX3dhdGNoZXIoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAqL1xuICBhdExlYXN0KHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gbWF0Y2hlcyB0byBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2ssIGVpdGhlciAnc21hbGwgb25seScgb3IgJ3NtYWxsJy4gT21pdHRpbmcgJ29ubHknIGZhbGxzIGJhY2sgdG8gdXNpbmcgYXRMZWFzdCgpIG1ldGhvZC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0IGRvZXMgbm90LlxuICAgKi9cbiAgaXMoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmKHNpemUubGVuZ3RoID4gMSAmJiBzaXplWzFdID09PSAnb25seScpIHtcbiAgICAgIGlmKHNpemVbMF0gPT09IHRoaXMuX2dldEN1cnJlbnRTaXplKCkpIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hdExlYXN0KHNpemVbMF0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgZ2V0KHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgaWYodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXIoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsICgpID0+IHtcbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSwgY3VycmVudFNpemUgPSB0aGlzLmN1cnJlbnQ7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBjdXJyZW50U2l6ZSkge1xuICAgICAgICAvLyBDaGFuZ2UgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnlcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0ICYmIHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgIG1hdGNoTWVkaXVtKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gYEBtZWRpYSAke21lZGlhfXsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9YDtcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfVxufSgpKTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24ocmV0LCBwYXJhbSkge1xuICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgdmFyIGtleSA9IHBhcnRzWzBdO1xuICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG4gICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgaWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgcmV0W2tleV0ucHVzaCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSwge30pO1xuXG4gIHJldHVybiBzdHlsZU9iamVjdDtcbn1cblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE1vdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gKi9cblxuY29uc3QgaW5pdENsYXNzZXMgICA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuY29uc3QgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbmNvbnN0IE1vdGlvbiA9IHtcbiAgYW5pbWF0ZUluOiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfSxcblxuICBhbmltYXRlT3V0OiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW92ZShkdXJhdGlvbiwgZWxlbSwgZm4pe1xuICB2YXIgYW5pbSwgcHJvZywgc3RhcnQgPSBudWxsO1xuICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG4gICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZSh0cyl7XG4gICAgaWYoIXN0YXJ0KSBzdGFydCA9IHRzO1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG5cbiAgICBpZihwcm9nIDwgZHVyYXRpb24peyBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTsgfVxuICAgIGVsc2V7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICB9XG4gIH1cbiAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG59XG5cbi8qKlxuICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAqIEBmdW5jdGlvblxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbiAtIENTUyBjbGFzcyB0byB1c2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XG4gIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICByZXNldCgpO1xuXG4gIGVsZW1lbnRcbiAgICAuYWRkQ2xhc3MoYW5pbWF0aW9uKVxuICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgfSk7XG5cbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgZWxlbWVudFxuICAgICAgLmNzcygndHJhbnNpdGlvbicsICcnKVxuICAgICAgLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgfSk7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgIHJlc2V0KCk7XG4gICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhgJHtpbml0Q2xhc3N9ICR7YWN0aXZlQ2xhc3N9ICR7YW5pbWF0aW9ufWApO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XG5Gb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBOZXN0ID0ge1xuICBGZWF0aGVyKG1lbnUsIHR5cGUgPSAnemYnKSB7XG4gICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsncm9sZSc6ICdtZW51aXRlbSd9KSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgaXRlbXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW1cbiAgICAgICAgICAuYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiAkaXRlbS5jaGlsZHJlbignYTpmaXJzdCcpLnRleHQoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIE5vdGU6ICBEcmlsbGRvd25zIGJlaGF2ZSBkaWZmZXJlbnRseSBpbiBob3cgdGhleSBoaWRlLCBhbmQgc28gbmVlZFxuICAgICAgICAgIC8vIGFkZGl0aW9uYWwgYXR0cmlidXRlcy4gIFdlIHNob3VsZCBsb29rIGlmIHRoaXMgcG9zc2libHkgb3Zlci1nZW5lcmFsaXplZFxuICAgICAgICAgIC8vIHV0aWxpdHkgKE5lc3QpIGlzIGFwcHJvcHJpYXRlIHdoZW4gd2UgcmV3b3JrIG1lbnVzIGluIDYuNFxuICAgICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IGZhbHNlfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICRzdWJcbiAgICAgICAgICAuYWRkQ2xhc3MoYHN1Ym1lbnUgJHtzdWJNZW51Q2xhc3N9YClcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICRzdWIuYXR0cih7J2FyaWEtaGlkZGVuJzogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtLmFkZENsYXNzKGBpcy1zdWJtZW51LWl0ZW0gJHtzdWJJdGVtQ2xhc3N9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgQnVybihtZW51LCB0eXBlKSB7XG4gICAgdmFyIC8vaXRlbXMgPSBtZW51LmZpbmQoJ2xpJyksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIG1lbnVcbiAgICAgIC5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJylcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHtzdWJNZW51Q2xhc3N9ICR7c3ViSXRlbUNsYXNzfSAke2hhc1N1YkNsYXNzfSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVgKVxuICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgaGFzLXN1Ym1lbnUgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUnKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAvLyAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgLy8gICB9XG4gICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdoYXMtc3VibWVudScpO1xuICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiwvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICByZW1haW4gPSAtMSxcbiAgICAgIHN0YXJ0LFxuICAgICAgdGltZXI7XG5cbiAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJlbWFpbiA9IC0xO1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgaWYob3B0aW9ucy5pbmZpbml0ZSl7XG4gICAgICAgIF90aGlzLnJlc3RhcnQoKTsvL3JlcnVuIHRoZSB0aW1lci5cbiAgICAgIH1cbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnN0YXJ0LnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG5cbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVycGF1c2VkLnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGltYWdlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIC8vIENoZWNrIGlmIGltYWdlIGlzIGxvYWRlZFxuICAgIGlmICh0aGlzLmNvbXBsZXRlIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpKSB7XG4gICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgIH1cbiAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgIGVsc2Uge1xuICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgdmFyIHNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAkKHRoaXMpLmF0dHIoJ3NyYycsIHNyYyArIChzcmMuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7XG4gICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICB1bmxvYWRlZC0tO1xuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cblxuRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xuXG59KGpRdWVyeSk7XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24oJCkge1xuXG4gICQuc3BvdFN3aXBlID0ge1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICBtb3ZlVGhyZXNob2xkOiA3NSxcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcbiAgfTtcblxuICB2YXIgICBzdGFydFBvc1gsXG4gICAgICAgIHN0YXJ0UG9zWSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbGFwc2VkVGltZSxcbiAgICAgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAgIC8vICBhbGVydCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgaXNNb3ZpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgaWYoaXNNb3ZpbmcpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuICAgICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICAgIHZhciBkaXI7XG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgICBkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG4gICAgICAvLyB9XG4gICAgICBpZihkaXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoYHN3aXBlJHtkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICBpc01vdmluZyA9IHRydWU7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgJC5ldmVudC5zcGVjaWFsW2Bzd2lwZSR7dGhpc31gXSA9IHsgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgfSB9O1xuICB9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24oJCl7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLGVsKXtcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xuICAgICAgICAvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcbiAgICAgICAgLy9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuICAgICAgICAgIGV2ZW50VHlwZXMgPSB7XG4gICAgICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgICB0b3VjaGVuZDogJ21vdXNldXAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudFxuICAgICAgICA7XG5cbiAgICAgIGlmKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlLFxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcbiAgICAgICAgICAnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgJ2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMC8qbGVmdCovLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgICB9O1xuICB9O1xufShqUXVlcnkpO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKkZyb20gdGhlIGpRdWVyeSBNb2JpbGUgTGlicmFyeSoqXG4vLyoqbmVlZCB0byByZWNyZWF0ZSBmdW5jdGlvbmFsaXR5Kipcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XG5cblx0dmFyICRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICksXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcblx0XHR0b3VjaFN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hzdGFydFwiIDogXCJtb3VzZWRvd25cIixcblx0XHR0b3VjaFN0b3BFdmVudCA9ICd0b3VjaGVuZCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLFxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xuXG5cdC8vIHNldHVwIG5ldyBldmVudCBzaG9ydGN1dHNcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xuXHRcdFwic3dpcGUgc3dpcGVsZWZ0IHN3aXBlcmlnaHRcIiApLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdHJldHVybiBmbiA/IHRoaXMuYmluZCggbmFtZSwgZm4gKSA6IHRoaXMudHJpZ2dlciggbmFtZSApO1xuXHRcdH07XG5cblx0XHQvLyBqUXVlcnkgPCAxLjhcblx0XHRpZiAoICQuYXR0ckZuICkge1xuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQoIG9iaiwgZXZlbnRUeXBlLCBldmVudCwgYnViYmxlICkge1xuXHRcdHZhciBvcmlnaW5hbFR5cGUgPSBldmVudC50eXBlO1xuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIGV2ZW50LCB1bmRlZmluZWQsIG9iaiApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV2ZW50LmRpc3BhdGNoLmNhbGwoIG9iaiwgZXZlbnQgKTtcblx0XHR9XG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcblx0fVxuXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXG5cblx0Ly8gQWxzbyBoYW5kbGVzIHN3aXBlbGVmdCwgc3dpcGVyaWdodFxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XG5cblx0XHQvLyBNb3JlIHRoYW4gdGhpcyBob3Jpem9udGFsIGRpc3BsYWNlbWVudCwgYW5kIHdlIHdpbGwgc3VwcHJlc3Mgc2Nyb2xsaW5nLlxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxuXG5cdFx0Ly8gTW9yZSB0aW1lIHRoYW4gdGhpcywgYW5kIGl0IGlzbid0IGEgc3dpcGUuXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXG5cblx0XHQvLyBTd2lwZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBtdXN0IGJlIG1vcmUgdGhhbiB0aGlzLlxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHQvLyBTd2lwZSB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBsZXNzIHRoYW4gdGhpcy5cblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdGdldExvY2F0aW9uOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxuXHRcdFx0XHR3aW5QYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcblx0XHRcdFx0eCA9IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnBhZ2VZID09PSAwICYmIE1hdGguZmxvb3IoIHkgKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VZICkgfHxcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBpT1M0IGNsaWVudFgvY2xpZW50WSBoYXZlIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcblx0XHRcdFx0eCA9IHggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IHkgLSB3aW5QYWdlWTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBTb21lIEFuZHJvaWQgYnJvd3NlcnMgaGF2ZSB0b3RhbGx5IGJvZ3VzIHZhbHVlcyBmb3IgY2xpZW50WC9ZXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxuXHRcdFx0XHQvLyBzaG91bGQgbmV2ZXIgYmUgc21hbGxlciB0aGFuIHBhZ2VYL3BhZ2VZIG1pbnVzIHBhZ2Ugc2Nyb2xsXG5cdFx0XHRcdHggPSBldmVudC5wYWdlWCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXG5cdFx0XHRcdFx0XHRvcmlnaW46ICQoIGV2ZW50LnRhcmdldCApXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XG5cdFx0XHRpZiAoIHN0b3AudGltZSAtIHN0YXJ0LnRpbWUgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZHVyYXRpb25UaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IHN0YXJ0LmNvb3Jkc1swXSA+IHN0b3AuY29vcmRzWyAwIF0gPyBcInN3aXBlbGVmdFwiIDogXCJzd2lwZXJpZ2h0XCI7XG5cblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBkaXJlY3Rpb24sJC5FdmVudCggZGlyZWN0aW9uLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9ICksIHRydWUgKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXG5cdFx0Ly8gVGhpcyBzZXJ2ZXMgYXMgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IGF0IG1vc3Qgb25lIHN3aXBlIGV2ZW50IGV2ZW50IGlzXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxuXHRcdGV2ZW50SW5Qcm9ncmVzczogZmFsc2UsXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLFxuXHRcdFx0XHR0aGlzT2JqZWN0ID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXG5cdFx0XHRcdGNvbnRleHQgPSB7fTtcblxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCAhZXZlbnRzICkge1xuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xuXHRcdFx0XHQkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiLCBldmVudHMgKTtcblx0XHRcdH1cblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcblx0XHRcdGV2ZW50cy5zd2lwZSA9IGNvbnRleHQ7XG5cblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRcdFx0Ly8gQmFpbCBpZiB3ZSdyZSBhbHJlYWR5IHdvcmtpbmcgb24gYSBzd2lwZSBldmVudFxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciBzdG9wLFxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxuXHRcdFx0XHRcdG9yaWdUYXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHRcdFx0ZW1pdHRlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGNvbnRleHQubW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoICFzdGFydCB8fCBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XG5cdFx0XHRcdFx0aWYgKCAhZW1pdHRlZCApIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaGFuZGxlU3dpcGUoIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICk7XG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXG5cdFx0XHRcdFx0Lm9uZSggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0fTtcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHR9LFxuXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cywgY29udGV4dDtcblxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRcdGNvbnRleHQgPSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGV2ZW50cy5sZW5ndGgtLTtcblx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNvbnRleHQgKSB7XG5cdFx0XHRcdGlmICggY29udGV4dC5zdGFydCApIHtcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQubW92ZSApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0b3AgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQkLmVhY2goe1xuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXG5cdFx0c3dpcGVyaWdodDogXCJzd2lwZS5yaWdodFwiXG5cdH0sIGZ1bmN0aW9uKCBldmVudCwgc291cmNlRXZlbnQgKSB7XG5cblx0XHQkLmV2ZW50LnNwZWNpYWxbIGV2ZW50IF0gPSB7XG5cdFx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XG5cdFx0XHR9LFxuXHRcdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xufSkoIGpRdWVyeSwgdGhpcyApO1xuKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYCBpbiB3aW5kb3cpIHtcbiAgICAgIHJldHVybiB3aW5kb3dbYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KCkpO1xuXG5jb25zdCB0cmlnZ2VycyA9IChlbCwgdHlwZSkgPT4ge1xuICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChpZCA9PiB7XG4gICAgJChgIyR7aWR9YClbIHR5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXShgJHt0eXBlfS56Zi50cmlnZ2VyYCwgW2VsXSk7XG4gIH0pO1xufTtcbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uKCkge1xuICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4vLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZV0gd2lsbCB0b2dnbGUgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICd0b2dnbGUnKTtcbiAgfSBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4kKGRvY3VtZW50KS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbihlKXtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgbGV0IGFuaW1hdGlvbiA9ICQodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICBpZihhbmltYXRpb24gIT09ICcnKXtcbiAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCQodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH0pO1xuICB9ZWxzZXtcbiAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICQoYCMke2lkfWApLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG59KTtcblxuLyoqXG4qIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiogQGZ1bmN0aW9uXG4qIEBwcml2YXRlXG4qL1xuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCkgPT4ge1xuICBjaGVja0xpc3RlbmVycygpO1xufSk7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXJzKCkge1xuICBldmVudHNMaXN0ZW5lcigpO1xuICByZXNpemVMaXN0ZW5lcigpO1xuICBzY3JvbGxMaXN0ZW5lcigpO1xuICBjbG9zZW1lTGlzdGVuZXIoKTtcbn1cblxuLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgdmFyIHlldGlCb3hlcyA9ICQoJ1tkYXRhLXlldGktYm94XScpLFxuICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gIGlmKHBsdWdpbk5hbWUpe1xuICAgIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZSBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICB9XG4gIGlmKHlldGlCb3hlcy5sZW5ndGgpe1xuICAgIGxldCBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICByZXR1cm4gYGNsb3NlbWUuemYuJHtuYW1lfWA7XG4gICAgfSkuam9pbignICcpO1xuXG4gICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24oZSwgcGx1Z2luSWQpe1xuICAgICAgbGV0IHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgICBsZXQgcGx1Z2lucyA9ICQoYFtkYXRhLSR7cGx1Z2lufV1gKS5ub3QoYFtkYXRhLXlldGktYm94PVwiJHtwbHVnaW5JZH1cIl1gKTtcblxuICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBfdGhpcyA9ICQodGhpcyk7XG5cbiAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpXG4gICAgLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2Nyb2xsTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZih0aW1lcil7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudHNMaXN0ZW5lcigpIHtcbiAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpeyByZXR1cm4gZmFsc2U7IH1cbiAgbGV0IG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xuXG4gIC8vZWxlbWVudCBjYWxsYmFja1xuICB2YXIgbGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiA9IGZ1bmN0aW9uIChtdXRhdGlvblJlY29yZHNMaXN0KSB7XG4gICAgICB2YXIgJHRhcmdldCA9ICQobXV0YXRpb25SZWNvcmRzTGlzdFswXS50YXJnZXQpO1xuXG5cdCAgLy90cmlnZ2VyIHRoZSBldmVudCBoYW5kbGVyIGZvciB0aGUgZWxlbWVudCBkZXBlbmRpbmcgb24gdHlwZVxuICAgICAgc3dpdGNoIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnR5cGUpIHtcblxuICAgICAgICBjYXNlIFwiYXR0cmlidXRlc1wiOlxuICAgICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJzY3JvbGxcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQsIHdpbmRvdy5wYWdlWU9mZnNldF0pO1xuXHRcdCAgfVxuXHRcdCAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInJlc2l6ZVwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldF0pO1xuXHRcdCAgIH1cblx0XHQgIGlmIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwic3R5bGVcIikge1xuXHRcdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcblx0XHQgIH1cblx0XHQgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJjaGlsZExpc3RcIjpcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy9ub3RoaW5nXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIC8vZm9yIGVhY2ggZWxlbWVudCB0aGF0IG5lZWRzIHRvIGxpc3RlbiBmb3IgcmVzaXppbmcsIHNjcm9sbGluZywgb3IgbXV0YXRpb24gYWRkIGEgc2luZ2xlIG9ic2VydmVyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBub2Rlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdmFyIGVsZW1lbnRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24pO1xuICAgICAgICBlbGVtZW50T2JzZXJ2ZXIub2JzZXJ2ZShub2Rlc1tpXSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6IFtcImRhdGEtZXZlbnRzXCIsIFwic3R5bGVcIl0gfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBbUEhdXG4vLyBGb3VuZGF0aW9uLkNoZWNrV2F0Y2hlcnMgPSBjaGVja1dhdGNoZXJzO1xuRm91bmRhdGlvbi5JSGVhcllvdSA9IGNoZWNrTGlzdGVuZXJzO1xuLy8gRm91bmRhdGlvbi5JU2VlWW91ID0gc2Nyb2xsTGlzdGVuZXI7XG4vLyBGb3VuZGF0aW9uLklGZWVsWW91ID0gY2xvc2VtZUxpc3RlbmVyO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWNjb3JkaW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5hY2NvcmRpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEFjY29yZGlvbiNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIGEgcGxhaW4gb2JqZWN0IHdpdGggc2V0dGluZ3MgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdBY2NvcmRpb24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdBY2NvcmRpb24nLCB7XG4gICAgICAnRU5URVInOiAndG9nZ2xlJyxcbiAgICAgICdTUEFDRSc6ICd0b2dnbGUnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY29yZGlvbiBieSBhbmltYXRpbmcgdGhlIHByZXNldCBhY3RpdmUgcGFuZShzKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cigncm9sZScsICd0YWJsaXN0Jyk7XG4gICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKGlkeCwgZWwpIHtcbiAgICAgIHZhciAkZWwgPSAkKGVsKSxcbiAgICAgICAgICAkY29udGVudCA9ICRlbC5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyksXG4gICAgICAgICAgaWQgPSAkY29udGVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdhY2NvcmRpb24nKSxcbiAgICAgICAgICBsaW5rSWQgPSBlbC5pZCB8fCBgJHtpZH0tbGFiZWxgO1xuXG4gICAgICAkZWwuZmluZCgnYTpmaXJzdCcpLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IGlkLFxuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnaWQnOiBsaW5rSWQsXG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICAkY29udGVudC5hdHRyKHsncm9sZSc6ICd0YWJwYW5lbCcsICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWQsICdhcmlhLWhpZGRlbic6IHRydWUsICdpZCc6IGlkfSk7XG4gICAgfSk7XG4gICAgdmFyICRpbml0QWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IHRydWU7XG4gICAgaWYoJGluaXRBY3RpdmUubGVuZ3RoKXtcbiAgICAgIHRoaXMuZG93bigkaW5pdEFjdGl2ZSwgdGhpcy5maXJzdFRpbWVJbml0KTtcbiAgICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuX2NoZWNrRGVlcExpbmsgPSAoKSA9PiB7XG4gICAgICB2YXIgYW5jaG9yID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAvL25lZWQgYSBoYXNoIGFuZCBhIHJlbGV2YW50IGFuY2hvciBpbiB0aGlzIHRhYnNldFxuICAgICAgaWYoYW5jaG9yLmxlbmd0aCkge1xuICAgICAgICB2YXIgJGxpbmsgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tocmVmJD1cIicrYW5jaG9yKydcIl0nKSxcbiAgICAgICAgJGFuY2hvciA9ICQoYW5jaG9yKTtcblxuICAgICAgICBpZiAoJGxpbmsubGVuZ3RoICYmICRhbmNob3IpIHtcbiAgICAgICAgICBpZiAoISRsaW5rLnBhcmVudCgnW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJykuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgICB0aGlzLmRvd24oJGFuY2hvciwgdGhpcy5maXJzdFRpbWVJbml0KTtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IGZhbHNlO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvL3JvbGwgdXAgYSBsaXR0bGUgdG8gc2hvdyB0aGUgdGl0bGVzXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gX3RoaXMuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBvZmZzZXQudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgZGVlcGxpbmtlZCBhdCBwYWdlbG9hZFxuICAgICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI2RlZXBsaW5rXG4gICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZGVlcGxpbmsuemYuYWNjb3JkaW9uJywgWyRsaW5rLCAkYW5jaG9yXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3VzZSBicm93c2VyIHRvIG9wZW4gYSB0YWIsIGlmIGl0IGV4aXN0cyBpbiB0aGlzIHRhYnNldFxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHRoaXMuX2NoZWNrRGVlcExpbmsoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIGFjY29yZGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyk7XG4gICAgICB2YXIgJHRhYkNvbnRlbnQgPSAkZWxlbS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJHRhYkNvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICRlbGVtLmNoaWxkcmVuKCdhJykub2ZmKCdjbGljay56Zi5hY2NvcmRpb24ga2V5ZG93bi56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICAgLm9uKCdjbGljay56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XG4gICAgICAgIH0pLm9uKCdrZXlkb3duLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdBY2NvcmRpb24nLCB7XG4gICAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgJGEgPSAkZWxlbS5uZXh0KCkuZmluZCgnYScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCkge1xuICAgICAgICAgICAgICAgICRhLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkYSA9ICRlbGVtLnByZXYoKS5maW5kKCdhJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgJGEudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBzZWxlY3RlZCBjb250ZW50IHBhbmUncyBvcGVuL2Nsb3NlIHN0YXRlLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIGpRdWVyeSBvYmplY3Qgb2YgdGhlIHBhbmUgdG8gdG9nZ2xlIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdG9nZ2xlKCR0YXJnZXQpIHtcbiAgICBpZigkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgdGhpcy51cCgkdGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb3duKCR0YXJnZXQpO1xuICAgIH1cbiAgICAvL2VpdGhlciByZXBsYWNlIG9yIHVwZGF0ZSBicm93c2VyIGhpc3RvcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5wcmV2KCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgYWNjb3JkaW9uIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gcGFuZSB0byBvcGVuIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZmlyc3RUaW1lIC0gZmxhZyB0byBkZXRlcm1pbmUgaWYgcmVmbG93IHNob3VsZCBoYXBwZW4uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZG93blxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRvd24oJHRhcmdldCwgZmlyc3RUaW1lKSB7XG4gICAgJHRhcmdldFxuICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgZmFsc2UpXG4gICAgICAucGFyZW50KCdbZGF0YS10YWItY29udGVudF0nKVxuICAgICAgLmFkZEJhY2soKVxuICAgICAgLnBhcmVudCgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kICYmICFmaXJzdFRpbWUpIHtcbiAgICAgIHZhciAkY3VycmVudEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJGN1cnJlbnRBY3RpdmUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMudXAoJGN1cnJlbnRBY3RpdmUubm90KCR0YXJnZXQpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkdGFyZ2V0LnNsaWRlRG93bih0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgKCkgPT4ge1xuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBvcGVuaW5nLlxuICAgICAgICogQGV2ZW50IEFjY29yZGlvbiNkb3duXG4gICAgICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZG93bi56Zi5hY2NvcmRpb24nLCBbJHRhcmdldF0pO1xuICAgIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogdHJ1ZSxcbiAgICAgICdhcmlhLXNlbGVjdGVkJzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIEFjY29yZGlvbiB0YWIgdG8gY2xvc2UgKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQGZpcmVzIEFjY29yZGlvbiN1cFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHVwKCR0YXJnZXQpIHtcbiAgICB2YXIgJGF1bnRzID0gJHRhcmdldC5wYXJlbnQoKS5zaWJsaW5ncygpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZigoIXRoaXMub3B0aW9ucy5hbGxvd0FsbENsb3NlZCAmJiAhJGF1bnRzLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkgfHwgISR0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xuICAgICAgJHRhcmdldC5zbGlkZVVwKF90aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgY29sbGFwc2luZyB1cC5cbiAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiN1cFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndXAuemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICAgIH0pO1xuICAgIC8vIH0pO1xuXG4gICAgJHRhcmdldC5hdHRyKCdhcmlhLWhpZGRlbicsIHRydWUpXG4gICAgICAgICAgIC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAkKGAjJHskdGFyZ2V0LmF0dHIoJ2FyaWEtbGFiZWxsZWRieScpfWApLmF0dHIoe1xuICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZGVzdHJveWVkXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXRhYi1jb250ZW50XScpLnN0b3AodHJ1ZSkuc2xpZGVVcCgwKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdhJykub2ZmKCcuemYuYWNjb3JkaW9uJyk7XG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5BY2NvcmRpb24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBhbmltYXRlIHRoZSBvcGVuaW5nIG9mIGFuIGFjY29yZGlvbiBwYW5lLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDI1MFxuICAgKi9cbiAgc2xpZGVTcGVlZDogMjUwLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBoYXZlIG11bHRpcGxlIG9wZW4gcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtdWx0aUV4cGFuZDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGNsb3NlIGFsbCBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGFsbG93QWxsQ2xvc2VkOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIHBhbmUgc3BlY2lmaWVkIGJ5IGhhc2ggYW5jaG9yXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGluazogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFkanVzdCB0aGUgZGVlcCBsaW5rIHNjcm9sbCB0byBtYWtlIHN1cmUgdGhlIHRvcCBvZiB0aGUgYWNjb3JkaW9uIHBhbmVsIGlzIHZpc2libGVcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlOiBmYWxzZSxcblxuICAvKipcbiAgICogQW5pbWF0aW9uIHRpbWUgKG1zKSBmb3IgdGhlIGRlZXAgbGluayBhZGp1c3RtZW50XG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMzAwXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZURlbGF5OiAzMDAsXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYnJvd3NlciBoaXN0b3J5IHdpdGggdGhlIG9wZW4gYWNjb3JkaW9uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB1cGRhdGVIaXN0b3J5OiBmYWxzZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEFjY29yZGlvbiwgJ0FjY29yZGlvbicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogSW50ZXJjaGFuZ2UgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmludGVyY2hhbmdlXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlclxuICovXG5cbmNsYXNzIEludGVyY2hhbmdlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgSW50ZXJjaGFuZ2UuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgSW50ZXJjaGFuZ2UjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEludGVyY2hhbmdlLmRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICB0aGlzLnJ1bGVzID0gW107XG4gICAgdGhpcy5jdXJyZW50UGF0aCA9ICcnO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnSW50ZXJjaGFuZ2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgSW50ZXJjaGFuZ2UgcGx1Z2luIGFuZCBjYWxscyBmdW5jdGlvbnMgdG8gZ2V0IGludGVyY2hhbmdlIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy5fYWRkQnJlYWtwb2ludHMoKTtcbiAgICB0aGlzLl9nZW5lcmF0ZVJ1bGVzKCk7XG4gICAgdGhpcy5fcmVmbG93KCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBJbnRlcmNoYW5nZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLmludGVyY2hhbmdlJywgRm91bmRhdGlvbi51dGlsLnRocm90dGxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3JlZmxvdygpO1xuICAgIH0sIDUwKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgSW50ZXJjaGFuZ2UgdXBvbiBET00gY2hhbmdlXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlZmxvdygpIHtcbiAgICB2YXIgbWF0Y2g7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBydWxlLCBidXQgb25seSBzYXZlIHRoZSBsYXN0IG1hdGNoXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnJ1bGVzKSB7XG4gICAgICBpZih0aGlzLnJ1bGVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBydWxlID0gdGhpcy5ydWxlc1tpXTtcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHJ1bGUucXVlcnkpLm1hdGNoZXMpIHtcbiAgICAgICAgICBtYXRjaCA9IHJ1bGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHRoaXMucmVwbGFjZShtYXRjaC5wYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgRm91bmRhdGlvbiBicmVha3BvaW50cyBhbmQgYWRkcyB0aGVtIHRvIHRoZSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgb2JqZWN0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRCcmVha3BvaW50cygpIHtcbiAgICBmb3IgKHZhciBpIGluIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXNbaV07XG4gICAgICAgIEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeS5uYW1lXSA9IHF1ZXJ5LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIEludGVyY2hhbmdlIGVsZW1lbnQgZm9yIHRoZSBwcm92aWRlZCBtZWRpYSBxdWVyeSArIGNvbnRlbnQgcGFpcmluZ3NcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0aGF0IGlzIGFuIEludGVyY2hhbmdlIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtBcnJheX0gc2NlbmFyaW9zIC0gQXJyYXkgb2Ygb2JqZWN0cyB0aGF0IGhhdmUgJ21xJyBhbmQgJ3BhdGgnIGtleXMgd2l0aCBjb3JyZXNwb25kaW5nIGtleXNcbiAgICovXG4gIF9nZW5lcmF0ZVJ1bGVzKGVsZW1lbnQpIHtcbiAgICB2YXIgcnVsZXNMaXN0ID0gW107XG4gICAgdmFyIHJ1bGVzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5ydWxlcykge1xuICAgICAgcnVsZXMgPSB0aGlzLm9wdGlvbnMucnVsZXM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ2ludGVyY2hhbmdlJyk7XG4gICAgfVxuICAgIFxuICAgIHJ1bGVzID0gIHR5cGVvZiBydWxlcyA9PT0gJ3N0cmluZycgPyBydWxlcy5tYXRjaCgvXFxbLio/XFxdL2cpIDogcnVsZXM7XG5cbiAgICBmb3IgKHZhciBpIGluIHJ1bGVzKSB7XG4gICAgICBpZihydWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldLnNsaWNlKDEsIC0xKS5zcGxpdCgnLCAnKTtcbiAgICAgICAgdmFyIHBhdGggPSBydWxlLnNsaWNlKDAsIC0xKS5qb2luKCcnKTtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gcnVsZVtydWxlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGlmIChJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldKSB7XG4gICAgICAgICAgcXVlcnkgPSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldO1xuICAgICAgICB9XG5cbiAgICAgICAgcnVsZXNMaXN0LnB1c2goe1xuICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgcXVlcnk6IHF1ZXJ5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucnVsZXMgPSBydWxlc0xpc3Q7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBgc3JjYCBwcm9wZXJ0eSBvZiBhbiBpbWFnZSwgb3IgY2hhbmdlIHRoZSBIVE1MIG9mIGEgY29udGFpbmVyLCB0byB0aGUgc3BlY2lmaWVkIHBhdGguXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggdG8gdGhlIGltYWdlIG9yIEhUTUwgcGFydGlhbC5cbiAgICogQGZpcmVzIEludGVyY2hhbmdlI3JlcGxhY2VkXG4gICAqL1xuICByZXBsYWNlKHBhdGgpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50UGF0aCA9PT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgdHJpZ2dlciA9ICdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZSc7XG5cbiAgICAvLyBSZXBsYWNpbmcgaW1hZ2VzXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0ubm9kZU5hbWUgPT09ICdJTUcnKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3NyYycsIHBhdGgpLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pXG4gICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjaW5nIGJhY2tncm91bmQgaW1hZ2VzXG4gICAgZWxzZSBpZiAocGF0aC5tYXRjaCgvXFwuKGdpZnxqcGd8anBlZ3xwbmd8c3ZnfHRpZmYpKFs/I10uKik/L2kpKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmNzcyh7ICdiYWNrZ3JvdW5kLWltYWdlJzogJ3VybCgnK3BhdGgrJyknIH0pXG4gICAgICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgfVxuICAgIC8vIFJlcGxhY2luZyBIVE1MXG4gICAgZWxzZSB7XG4gICAgICAkLmdldChwYXRoLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBfdGhpcy4kZWxlbWVudC5odG1sKHJlc3BvbnNlKVxuICAgICAgICAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgICAgICAkKHJlc3BvbnNlKS5mb3VuZGF0aW9uKCk7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gY29udGVudCBpbiBhbiBJbnRlcmNoYW5nZSBlbGVtZW50IGlzIGRvbmUgYmVpbmcgbG9hZGVkLlxuICAgICAqIEBldmVudCBJbnRlcmNoYW5nZSNyZXBsYWNlZFxuICAgICAqL1xuICAgIC8vIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncmVwbGFjZWQuemYuaW50ZXJjaGFuZ2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBpbnRlcmNoYW5nZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIC8vVE9ETyB0aGlzLlxuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cbkludGVyY2hhbmdlLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogUnVsZXMgdG8gYmUgYXBwbGllZCB0byBJbnRlcmNoYW5nZSBlbGVtZW50cy4gU2V0IHdpdGggdGhlIGBkYXRhLWludGVyY2hhbmdlYCBhcnJheSBub3RhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P2FycmF5fVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICBydWxlczogbnVsbFxufTtcblxuSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTID0ge1xuICAnbGFuZHNjYXBlJzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgJ3BvcnRyYWl0JzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICAncmV0aW5hJzogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksIG9ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihJbnRlcmNoYW5nZSwgJ0ludGVyY2hhbmdlJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBUYWJzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi50YWJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIgaWYgdGFicyBjb250YWluIGltYWdlc1xuICovXG5cbmNsYXNzIFRhYnMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0YWJzLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIFRhYnMjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIHRhYnMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgVGFicy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1RhYnMnKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdUYWJzJywge1xuICAgICAgJ0VOVEVSJzogJ29wZW4nLFxuICAgICAgJ1NQQUNFJzogJ29wZW4nLFxuICAgICAgJ0FSUk9XX1JJR0hUJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX1VQJzogJ3ByZXZpb3VzJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnXG4gICAgICAvLyAnVEFCJzogJ25leHQnLFxuICAgICAgLy8gJ1NISUZUX1RBQic6ICdwcmV2aW91cydcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdGFicyBieSBzaG93aW5nIGFuZCBmb2N1c2luZyAoaWYgYXV0b0ZvY3VzPXRydWUpIHRoZSBwcmVzZXQgYWN0aXZlIHRhYi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoeydyb2xlJzogJ3RhYmxpc3QnfSk7XG4gICAgdGhpcy4kdGFiVGl0bGVzID0gdGhpcy4kZWxlbWVudC5maW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApO1xuICAgIHRoaXMuJHRhYkNvbnRlbnQgPSAkKGBbZGF0YS10YWJzLWNvbnRlbnQ9XCIke3RoaXMuJGVsZW1lbnRbMF0uaWR9XCJdYCk7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRlbGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAkbGluayA9ICRlbGVtLmZpbmQoJ2EnKSxcbiAgICAgICAgICBpc0FjdGl2ZSA9ICRlbGVtLmhhc0NsYXNzKGAke190aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApLFxuICAgICAgICAgIGhhc2ggPSAkbGlua1swXS5oYXNoLnNsaWNlKDEpLFxuICAgICAgICAgIGxpbmtJZCA9ICRsaW5rWzBdLmlkID8gJGxpbmtbMF0uaWQgOiBgJHtoYXNofS1sYWJlbGAsXG4gICAgICAgICAgJHRhYkNvbnRlbnQgPSAkKGAjJHtoYXNofWApO1xuXG4gICAgICAkZWxlbS5hdHRyKHsncm9sZSc6ICdwcmVzZW50YXRpb24nfSk7XG5cbiAgICAgICRsaW5rLmF0dHIoe1xuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnYXJpYS1jb250cm9scyc6IGhhc2gsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogaXNBY3RpdmUsXG4gICAgICAgICdpZCc6IGxpbmtJZFxuICAgICAgfSk7XG5cbiAgICAgICR0YWJDb250ZW50LmF0dHIoe1xuICAgICAgICAncm9sZSc6ICd0YWJwYW5lbCcsXG4gICAgICAgICdhcmlhLWhpZGRlbic6ICFpc0FjdGl2ZSxcbiAgICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6IGxpbmtJZFxuICAgICAgfSk7XG5cbiAgICAgIGlmKGlzQWN0aXZlICYmIF90aGlzLm9wdGlvbnMuYXV0b0ZvY3VzKXtcbiAgICAgICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6ICRlbGVtLm9mZnNldCgpLnRvcCB9LCBfdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXksICgpID0+IHtcbiAgICAgICAgICAgICRsaW5rLmZvY3VzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgdmFyICRpbWFnZXMgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoJ2ltZycpO1xuXG4gICAgICBpZiAoJGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCgkaW1hZ2VzLCB0aGlzLl9zZXRIZWlnaHQuYmluZCh0aGlzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZXRIZWlnaHQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAgLy9jdXJyZW50IGNvbnRleHQtYm91bmQgZnVuY3Rpb24gdG8gb3BlbiB0YWJzIG9uIHBhZ2UgbG9hZCBvciBoaXN0b3J5IHBvcHN0YXRlXG4gICAgdGhpcy5fY2hlY2tEZWVwTGluayA9ICgpID0+IHtcbiAgICAgIHZhciBhbmNob3IgPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgIC8vbmVlZCBhIGhhc2ggYW5kIGEgcmVsZXZhbnQgYW5jaG9yIGluIHRoaXMgdGFic2V0XG4gICAgICBpZihhbmNob3IubGVuZ3RoKSB7XG4gICAgICAgIHZhciAkbGluayA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2hyZWYkPVwiJythbmNob3IrJ1wiXScpO1xuICAgICAgICBpZiAoJGxpbmsubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RUYWIoJChhbmNob3IpLCB0cnVlKTtcblxuICAgICAgICAgIC8vcm9sbCB1cCBhIGxpdHRsZSB0byBzaG93IHRoZSB0aXRsZXNcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlKSB7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKTtcbiAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBvZmZzZXQudG9wIH0sIHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZURlbGF5KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgZGVlcGxpbmtlZCBhdCBwYWdlbG9hZFxuICAgICAgICAgICAgKiBAZXZlbnQgVGFicyNkZWVwbGlua1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkZWVwbGluay56Zi50YWJzJywgWyRsaW5rLCAkKGFuY2hvcildKTtcbiAgICAgICAgIH1cbiAgICAgICB9XG4gICAgIH1cblxuICAgIC8vdXNlIGJyb3dzZXIgdG8gb3BlbiBhIHRhYiwgaWYgaXQgZXhpc3RzIGluIHRoaXMgdGFic2V0XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgdGhpcy5fY2hlY2tEZWVwTGluaygpO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy5fYWRkS2V5SGFuZGxlcigpO1xuICAgIHRoaXMuX2FkZENsaWNrSGFuZGxlcigpO1xuICAgIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgPSB0aGlzLl9zZXRIZWlnaHQuYmluZCh0aGlzKTtcblxuICAgICAgJCh3aW5kb3cpLm9uKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIpO1xuICAgIH1cblxuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGNsaWNrIGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkQ2xpY2tIYW5kbGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub2ZmKCdjbGljay56Zi50YWJzJylcbiAgICAgIC5vbignY2xpY2suemYudGFicycsIGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWAsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJCh0aGlzKSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGtleWJvYXJkIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkS2V5SGFuZGxlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kdGFiVGl0bGVzLm9mZigna2V5ZG93bi56Zi50YWJzJykub24oJ2tleWRvd24uemYudGFicycsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYgKGUud2hpY2ggPT09IDkpIHJldHVybjtcblxuXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAkZWxlbWVudHMgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykuY2hpbGRyZW4oJ2xpJyksXG4gICAgICAgICRwcmV2RWxlbWVudCxcbiAgICAgICAgJG5leHRFbGVtZW50O1xuXG4gICAgICAkZWxlbWVudHMuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgIGlmICgkKHRoaXMpLmlzKCRlbGVtZW50KSkge1xuICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLndyYXBPbktleXMpIHtcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9IGkgPT09IDAgPyAkZWxlbWVudHMubGFzdCgpIDogJGVsZW1lbnRzLmVxKGktMSk7XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSBpID09PSAkZWxlbWVudHMubGVuZ3RoIC0xID8gJGVsZW1lbnRzLmZpcnN0KCkgOiAkZWxlbWVudHMuZXEoaSsxKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWF4KDAsIGktMSkpO1xuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdUYWJzJywge1xuICAgICAgICBvcGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkZWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkZWxlbWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJHByZXZFbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJG5leHRFbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRuZXh0RWxlbWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgdGFiIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuIENvbGxhcHNlcyBhY3RpdmUgdGFiLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFRhYiB0byBvcGVuLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhpc3RvcnlIYW5kbGVkIC0gYnJvd3NlciBoYXMgYWxyZWFkeSBoYW5kbGVkIGEgaGlzdG9yeSB1cGRhdGVcbiAgICogQGZpcmVzIFRhYnMjY2hhbmdlXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX2hhbmRsZVRhYkNoYW5nZSgkdGFyZ2V0LCBoaXN0b3J5SGFuZGxlZCkge1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgZm9yIGFjdGl2ZSBjbGFzcyBvbiB0YXJnZXQuIENvbGxhcHNlIGlmIGV4aXN0cy5cbiAgICAgKi9cbiAgICBpZiAoJHRhcmdldC5oYXNDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApKSB7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5hY3RpdmVDb2xsYXBzZSkge1xuICAgICAgICAgICAgdGhpcy5fY29sbGFwc2VUYWIoJHRhcmdldCk7XG5cbiAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIHN1Y2Nlc3NmdWxseSBjb2xsYXBzZWQgdGFicy5cbiAgICAgICAgICAgICogQGV2ZW50IFRhYnMjY29sbGFwc2VcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NvbGxhcHNlLnpmLnRhYnMnLCBbJHRhcmdldF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgJG9sZFRhYiA9IHRoaXMuJGVsZW1lbnQuXG4gICAgICAgICAgZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc30uJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApLFxuICAgICAgICAgICR0YWJMaW5rID0gJHRhcmdldC5maW5kKCdbcm9sZT1cInRhYlwiXScpLFxuICAgICAgICAgIGhhc2ggPSAkdGFiTGlua1swXS5oYXNoLFxuICAgICAgICAgICR0YXJnZXRDb250ZW50ID0gdGhpcy4kdGFiQ29udGVudC5maW5kKGhhc2gpO1xuXG4gICAgLy9jbG9zZSBvbGQgdGFiXG4gICAgdGhpcy5fY29sbGFwc2VUYWIoJG9sZFRhYik7XG5cbiAgICAvL29wZW4gbmV3IHRhYlxuICAgIHRoaXMuX29wZW5UYWIoJHRhcmdldCk7XG5cbiAgICAvL2VpdGhlciByZXBsYWNlIG9yIHVwZGF0ZSBicm93c2VyIGhpc3RvcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rICYmICFoaXN0b3J5SGFuZGxlZCkge1xuICAgICAgdmFyIGFuY2hvciA9ICR0YXJnZXQuZmluZCgnYScpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGRhdGVIaXN0b3J5KSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIHN1Y2Nlc3NmdWxseSBjaGFuZ2VkIHRhYnMuXG4gICAgICogQGV2ZW50IFRhYnMjY2hhbmdlXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjaGFuZ2UuemYudGFicycsIFskdGFyZ2V0LCAkdGFyZ2V0Q29udGVudF0pO1xuXG4gICAgLy9maXJlIHRvIGNoaWxkcmVuIGEgbXV0YXRpb24gZXZlbnRcbiAgICAkdGFyZ2V0Q29udGVudC5maW5kKFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VyKFwibXV0YXRlbWUuemYudHJpZ2dlclwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgdGFiIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIE9wZW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX29wZW5UYWIoJHRhcmdldCkge1xuICAgICAgdmFyICR0YWJMaW5rID0gJHRhcmdldC5maW5kKCdbcm9sZT1cInRhYlwiXScpLFxuICAgICAgICAgIGhhc2ggPSAkdGFiTGlua1swXS5oYXNoLFxuICAgICAgICAgICR0YXJnZXRDb250ZW50ID0gdGhpcy4kdGFiQ29udGVudC5maW5kKGhhc2gpO1xuXG4gICAgICAkdGFyZ2V0LmFkZENsYXNzKGAke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCk7XG5cbiAgICAgICR0YWJMaW5rLmF0dHIoeydhcmlhLXNlbGVjdGVkJzogJ3RydWUnfSk7XG5cbiAgICAgICR0YXJnZXRDb250ZW50XG4gICAgICAgIC5hZGRDbGFzcyhgJHt0aGlzLm9wdGlvbnMucGFuZWxBY3RpdmVDbGFzc31gKVxuICAgICAgICAuYXR0cih7J2FyaWEtaGlkZGVuJzogJ2ZhbHNlJ30pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxhcHNlcyBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFRhYiB0byBPcGVuLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9jb2xsYXBzZVRhYigkdGFyZ2V0KSB7XG4gICAgdmFyICR0YXJnZXRfYW5jaG9yID0gJHRhcmdldFxuICAgICAgLnJlbW92ZUNsYXNzKGAke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YClcbiAgICAgIC5maW5kKCdbcm9sZT1cInRhYlwiXScpXG4gICAgICAuYXR0cih7ICdhcmlhLXNlbGVjdGVkJzogJ2ZhbHNlJyB9KTtcblxuICAgICQoYCMkeyR0YXJnZXRfYW5jaG9yLmF0dHIoJ2FyaWEtY29udHJvbHMnKX1gKVxuICAgICAgLnJlbW92ZUNsYXNzKGAke3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApXG4gICAgICAuYXR0cih7ICdhcmlhLWhpZGRlbic6ICd0cnVlJyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaWMgbWV0aG9kIGZvciBzZWxlY3RpbmcgYSBjb250ZW50IHBhbmUgdG8gZGlzcGxheS5cbiAgICogQHBhcmFtIHtqUXVlcnkgfCBTdHJpbmd9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IG9yIHN0cmluZyBvZiB0aGUgaWQgb2YgdGhlIHBhbmUgdG8gZGlzcGxheS5cbiAgICogQHBhcmFtIHtib29sZWFufSBoaXN0b3J5SGFuZGxlZCAtIGJyb3dzZXIgaGFzIGFscmVhZHkgaGFuZGxlZCBhIGhpc3RvcnkgdXBkYXRlXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgc2VsZWN0VGFiKGVsZW0sIGhpc3RvcnlIYW5kbGVkKSB7XG4gICAgdmFyIGlkU3RyO1xuXG4gICAgaWYgKHR5cGVvZiBlbGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgaWRTdHIgPSBlbGVtWzBdLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZFN0ciA9IGVsZW07XG4gICAgfVxuXG4gICAgaWYgKGlkU3RyLmluZGV4T2YoJyMnKSA8IDApIHtcbiAgICAgIGlkU3RyID0gYCMke2lkU3RyfWA7XG4gICAgfVxuXG4gICAgdmFyICR0YXJnZXQgPSB0aGlzLiR0YWJUaXRsZXMuZmluZChgW2hyZWYkPVwiJHtpZFN0cn1cIl1gKS5wYXJlbnQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCk7XG5cbiAgICB0aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJHRhcmdldCwgaGlzdG9yeUhhbmRsZWQpO1xuICB9O1xuICAvKipcbiAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIGVhY2ggcGFuZWwgdG8gdGhlIGhlaWdodCBvZiB0aGUgdGFsbGVzdCBwYW5lbC5cbiAgICogSWYgZW5hYmxlZCBpbiBvcHRpb25zLCBnZXRzIGNhbGxlZCBvbiBtZWRpYSBxdWVyeSBjaGFuZ2UuXG4gICAqIElmIGxvYWRpbmcgY29udGVudCB2aWEgZXh0ZXJuYWwgc291cmNlLCBjYW4gYmUgY2FsbGVkIGRpcmVjdGx5IG9yIHdpdGggX3JlZmxvdy5cbiAgICogSWYgZW5hYmxlZCB3aXRoIGBkYXRhLW1hdGNoLWhlaWdodD1cInRydWVcImAsIHRhYnMgc2V0cyB0byBlcXVhbCBoZWlnaHRcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0SGVpZ2h0KCkge1xuICAgIHZhciBtYXggPSAwLFxuICAgICAgICBfdGhpcyA9IHRoaXM7IC8vIExvY2sgZG93biB0aGUgYHRoaXNgIHZhbHVlIGZvciB0aGUgcm9vdCB0YWJzIG9iamVjdFxuXG4gICAgdGhpcy4kdGFiQ29udGVudFxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5wYW5lbENsYXNzfWApXG4gICAgICAuY3NzKCdoZWlnaHQnLCAnJylcbiAgICAgIC5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBwYW5lbCA9ICQodGhpcyksXG4gICAgICAgICAgICBpc0FjdGl2ZSA9IHBhbmVsLmhhc0NsYXNzKGAke190aGlzLm9wdGlvbnMucGFuZWxBY3RpdmVDbGFzc31gKTsgLy8gZ2V0IHRoZSBvcHRpb25zIGZyb20gdGhlIHBhcmVudCBpbnN0ZWFkIG9mIHRyeWluZyB0byBnZXQgdGhlbSBmcm9tIHRoZSBjaGlsZFxuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBwYW5lbC5jc3Moeyd2aXNpYmlsaXR5JzogJ2hpZGRlbicsICdkaXNwbGF5JzogJ2Jsb2NrJ30pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRlbXAgPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcblxuICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgcGFuZWwuY3NzKHtcbiAgICAgICAgICAgICd2aXNpYmlsaXR5JzogJycsXG4gICAgICAgICAgICAnZGlzcGxheSc6ICcnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXggPSB0ZW1wID4gbWF4ID8gdGVtcCA6IG1heDtcbiAgICAgIH0pXG4gICAgICAuY3NzKCdoZWlnaHQnLCBgJHttYXh9cHhgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiB0YWJzLlxuICAgKiBAZmlyZXMgVGFicyNkZXN0cm95ZWRcbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YClcbiAgICAgIC5vZmYoJy56Zi50YWJzJykuaGlkZSgpLmVuZCgpXG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5oaWRlKCk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICBpZiAodGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyICE9IG51bGwpIHtcbiAgICAgICAgICQod2luZG93KS5vZmYoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9mZigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuVGFicy5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIHBhbmUgc3BlY2lmaWVkIGJ5IGhhc2ggYW5jaG9yXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGluazogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFkanVzdCB0aGUgZGVlcCBsaW5rIHNjcm9sbCB0byBtYWtlIHN1cmUgdGhlIHRvcCBvZiB0aGUgdGFiIHBhbmVsIGlzIHZpc2libGVcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlOiBmYWxzZSxcblxuICAvKipcbiAgICogQW5pbWF0aW9uIHRpbWUgKG1zKSBmb3IgdGhlIGRlZXAgbGluayBhZGp1c3RtZW50XG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMzAwXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZURlbGF5OiAzMDAsXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYnJvd3NlciBoaXN0b3J5IHdpdGggdGhlIG9wZW4gdGFiXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB1cGRhdGVIaXN0b3J5OiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgYWN0aXZlIHBhbmUgb24gbG9hZCBpZiBzZXQgdG8gdHJ1ZS5cbiAgICogTm90IHJlY29tbWVuZGVkIGlmIG1vcmUgdGhhbiBvbmUgdGFiIHBhbmVsIHBlciBwYWdlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0ZvY3VzOiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIGtleWJvYXJkIGlucHV0IHRvICd3cmFwJyBhcm91bmQgdGhlIHRhYiBsaW5rcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgd3JhcE9uS2V5czogdHJ1ZSxcblxuICAvKipcbiAgICogQWxsb3dzIHRoZSB0YWIgY29udGVudCBwYW5lcyB0byBtYXRjaCBoZWlnaHRzIGlmIHNldCB0byB0cnVlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbWF0Y2hIZWlnaHQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgYWN0aXZlIHRhYnMgdG8gY29sbGFwc2Ugd2hlbiBjbGlja2VkLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYWN0aXZlQ29sbGFwc2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIGBsaWAncyBpbiB0YWIgbGluayBsaXN0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICd0YWJzLXRpdGxlJ1xuICAgKi9cbiAgbGlua0NsYXNzOiAndGFicy10aXRsZScsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGFjdGl2ZSBgbGlgIGluIHRhYiBsaW5rIGxpc3QuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2lzLWFjdGl2ZSdcbiAgICovXG4gIGxpbmtBY3RpdmVDbGFzczogJ2lzLWFjdGl2ZScsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGNvbnRlbnQgY29udGFpbmVycy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAndGFicy1wYW5lbCdcbiAgICovXG4gIHBhbmVsQ2xhc3M6ICd0YWJzLXBhbmVsJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYWN0aXZlIGNvbnRlbnQgY29udGFpbmVyLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICdpcy1hY3RpdmUnXG4gICAqL1xuICBwYW5lbEFjdGl2ZUNsYXNzOiAnaXMtYWN0aXZlJ1xufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKFRhYnMsICdUYWJzJyk7XG5cbn0oalF1ZXJ5KTtcbiIsInZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICAodHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGV4cG9ydHMpKSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6IHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6IGdsb2JhbC5MYXp5TG9hZCA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgZGVmYXVsdFNldHRpbmdzID0ge1xuICAgICAgICBlbGVtZW50c19zZWxlY3RvcjogXCJpbWdcIixcbiAgICAgICAgY29udGFpbmVyOiB3aW5kb3csXG4gICAgICAgIHRocmVzaG9sZDogMzAwLFxuICAgICAgICB0aHJvdHRsZTogMTUwLFxuICAgICAgICBkYXRhX3NyYzogXCJvcmlnaW5hbFwiLFxuICAgICAgICBkYXRhX3NyY3NldDogXCJvcmlnaW5hbFNldFwiLFxuICAgICAgICBjbGFzc19sb2FkaW5nOiBcImxvYWRpbmdcIixcbiAgICAgICAgY2xhc3NfbG9hZGVkOiBcImxvYWRlZFwiLFxuICAgICAgICBjbGFzc19lcnJvcjogXCJlcnJvclwiLFxuICAgICAgICBjbGFzc19pbml0aWFsOiBcImluaXRpYWxcIixcbiAgICAgICAgc2tpcF9pbnZpc2libGU6IHRydWUsXG4gICAgICAgIGNhbGxiYWNrX2xvYWQ6IG51bGwsXG4gICAgICAgIGNhbGxiYWNrX2Vycm9yOiBudWxsLFxuICAgICAgICBjYWxsYmFja19zZXQ6IG51bGwsXG4gICAgICAgIGNhbGxiYWNrX3Byb2Nlc3NlZDogbnVsbFxuICAgIH07XG5cbiAgICB2YXIgaXNCb3QgPSAhKFwib25zY3JvbGxcIiBpbiB3aW5kb3cpIHx8IC9nbGVib3QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgICB2YXIgY2FsbENhbGxiYWNrID0gZnVuY3Rpb24gY2FsbENhbGxiYWNrKGNhbGxiYWNrLCBhcmd1bWVudCkge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGFyZ3VtZW50KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZ2V0VG9wT2Zmc2V0ID0gZnVuY3Rpb24gZ2V0VG9wT2Zmc2V0KGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgd2luZG93LnBhZ2VZT2Zmc2V0IC0gZWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRUb3A7XG4gICAgfTtcblxuICAgIHZhciBpc0JlbG93Vmlld3BvcnQgPSBmdW5jdGlvbiBpc0JlbG93Vmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IHdpbmRvdy5pbm5lckhlaWdodCArIHdpbmRvdy5wYWdlWU9mZnNldCA6IGdldFRvcE9mZnNldChjb250YWluZXIpICsgY29udGFpbmVyLm9mZnNldEhlaWdodDtcbiAgICAgICAgcmV0dXJuIGZvbGQgPD0gZ2V0VG9wT2Zmc2V0KGVsZW1lbnQpIC0gdGhyZXNob2xkO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0TGVmdE9mZnNldCA9IGZ1bmN0aW9uIGdldExlZnRPZmZzZXQoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0IC0gZWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRMZWZ0O1xuICAgIH07XG5cbiAgICB2YXIgaXNBdFJpZ2h0T2ZWaWV3cG9ydCA9IGZ1bmN0aW9uIGlzQXRSaWdodE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGRvY3VtZW50V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IGRvY3VtZW50V2lkdGggKyB3aW5kb3cucGFnZVhPZmZzZXQgOiBnZXRMZWZ0T2Zmc2V0KGNvbnRhaW5lcikgKyBkb2N1bWVudFdpZHRoO1xuICAgICAgICByZXR1cm4gZm9sZCA8PSBnZXRMZWZ0T2Zmc2V0KGVsZW1lbnQpIC0gdGhyZXNob2xkO1xuICAgIH07XG5cbiAgICB2YXIgaXNBYm92ZVZpZXdwb3J0ID0gZnVuY3Rpb24gaXNBYm92ZVZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHZhciBmb2xkID0gY29udGFpbmVyID09PSB3aW5kb3cgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiBnZXRUb3BPZmZzZXQoY29udGFpbmVyKTtcbiAgICAgICAgcmV0dXJuIGZvbGQgPj0gZ2V0VG9wT2Zmc2V0KGVsZW1lbnQpICsgdGhyZXNob2xkICsgZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgfTtcblxuICAgIHZhciBpc0F0TGVmdE9mVmlld3BvcnQgPSBmdW5jdGlvbiBpc0F0TGVmdE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IHdpbmRvdy5wYWdlWE9mZnNldCA6IGdldExlZnRPZmZzZXQoY29udGFpbmVyKTtcbiAgICAgICAgcmV0dXJuIGZvbGQgPj0gZ2V0TGVmdE9mZnNldChlbGVtZW50KSArIHRocmVzaG9sZCArIGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgfTtcblxuICAgIHZhciBpc0luc2lkZVZpZXdwb3J0ID0gZnVuY3Rpb24gaXNJbnNpZGVWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICByZXR1cm4gIWlzQmVsb3dWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkgJiYgIWlzQWJvdmVWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkgJiYgIWlzQXRSaWdodE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpICYmICFpc0F0TGVmdE9mVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpO1xuICAgIH07XG5cbiAgICAvKiBDcmVhdGVzIGluc3RhbmNlIGFuZCBub3RpZmllcyBpdCB0aHJvdWdoIHRoZSB3aW5kb3cgZWxlbWVudCAqL1xuICAgIHZhciBjcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGNsYXNzT2JqLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBjbGFzc09iaihvcHRpb25zKTtcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KFwiTGF6eUxvYWQ6OkluaXRpYWxpemVkXCIsIHsgZGV0YWlsOiB7IGluc3RhbmNlOiBpbnN0YW5jZSB9IH0pO1xuICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfTtcblxuICAgIC8qIEF1dG8gaW5pdGlhbGl6YXRpb24gb2Ygb25lIG9yIG1vcmUgaW5zdGFuY2VzIG9mIGxhenlsb2FkLCBkZXBlbmRpbmcgb24gdGhlIFxuICAgICAgICBvcHRpb25zIHBhc3NlZCBpbiAocGxhaW4gb2JqZWN0IG9yIGFuIGFycmF5KSAqL1xuICAgIHZhciBhdXRvSW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIGF1dG9Jbml0aWFsaXplKGNsYXNzT2JqLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBvcHRzTGVuZ3RoID0gb3B0aW9ucy5sZW5ndGg7XG4gICAgICAgIGlmICghb3B0c0xlbmd0aCkge1xuICAgICAgICAgICAgLy8gUGxhaW4gb2JqZWN0XG4gICAgICAgICAgICBjcmVhdGVJbnN0YW5jZShjbGFzc09iaiwgb3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBcnJheSBvZiBvYmplY3RzXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wdHNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUluc3RhbmNlKGNsYXNzT2JqLCBvcHRpb25zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0U291cmNlc0ZvclBpY3R1cmUgPSBmdW5jdGlvbiBzZXRTb3VyY2VzRm9yUGljdHVyZShlbGVtZW50LCBzcmNzZXREYXRhQXR0cmlidXRlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGlmIChwYXJlbnQudGFnTmFtZSAhPT0gXCJQSUNUVVJFXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBpY3R1cmVDaGlsZCA9IHBhcmVudC5jaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChwaWN0dXJlQ2hpbGQudGFnTmFtZSA9PT0gXCJTT1VSQ0VcIikge1xuICAgICAgICAgICAgICAgIHZhciBzb3VyY2VTcmNzZXQgPSBwaWN0dXJlQ2hpbGQuZGF0YXNldFtzcmNzZXREYXRhQXR0cmlidXRlXTtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlU3Jjc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHBpY3R1cmVDaGlsZC5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIiwgc291cmNlU3Jjc2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldFNvdXJjZXMgPSBmdW5jdGlvbiBzZXRTb3VyY2VzKGVsZW1lbnQsIHNyY3NldERhdGFBdHRyaWJ1dGUsIHNyY0RhdGFBdHRyaWJ1dGUpIHtcbiAgICAgICAgdmFyIHRhZ05hbWUgPSBlbGVtZW50LnRhZ05hbWU7XG4gICAgICAgIHZhciBlbGVtZW50U3JjID0gZWxlbWVudC5kYXRhc2V0W3NyY0RhdGFBdHRyaWJ1dGVdO1xuICAgICAgICBpZiAodGFnTmFtZSA9PT0gXCJJTUdcIikge1xuICAgICAgICAgICAgc2V0U291cmNlc0ZvclBpY3R1cmUoZWxlbWVudCwgc3Jjc2V0RGF0YUF0dHJpYnV0ZSk7XG4gICAgICAgICAgICB2YXIgaW1nU3Jjc2V0ID0gZWxlbWVudC5kYXRhc2V0W3NyY3NldERhdGFBdHRyaWJ1dGVdO1xuICAgICAgICAgICAgaWYgKGltZ1NyY3NldCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsIGltZ1NyY3NldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNyYykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIGVsZW1lbnRTcmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWdOYW1lID09PSBcIklGUkFNRVwiKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudFNyYykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIGVsZW1lbnRTcmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50U3JjKSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgZWxlbWVudFNyYyArIFwiKVwiO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKi9cblxuICAgIHZhciBMYXp5TG9hZCA9IGZ1bmN0aW9uIExhenlMb2FkKGluc3RhbmNlU2V0dGluZ3MpIHtcbiAgICAgICAgdGhpcy5fc2V0dGluZ3MgPSBfZXh0ZW5kcyh7fSwgZGVmYXVsdFNldHRpbmdzLCBpbnN0YW5jZVNldHRpbmdzKTtcbiAgICAgICAgdGhpcy5fcXVlcnlPcmlnaW5Ob2RlID0gdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyID09PSB3aW5kb3cgPyBkb2N1bWVudCA6IHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lcjtcblxuICAgICAgICB0aGlzLl9wcmV2aW91c0xvb3BUaW1lID0gMDtcbiAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCA9IHRoaXMuaGFuZGxlU2Nyb2xsLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5faXNGaXJzdExvb3AgPSB0cnVlO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfTtcblxuICAgIExhenlMb2FkLnByb3RvdHlwZSA9IHtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBQcml2YXRlIG1ldGhvZHNcbiAgICAgICAgICovXG5cbiAgICAgICAgX3JldmVhbDogZnVuY3Rpb24gX3JldmVhbChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLl9zZXR0aW5ncztcblxuICAgICAgICAgICAgdmFyIGVycm9yQ2FsbGJhY2sgPSBmdW5jdGlvbiBlcnJvckNhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgIC8qIEFzIHRoaXMgbWV0aG9kIGlzIGFzeW5jaHJvbm91cywgaXQgbXVzdCBiZSBwcm90ZWN0ZWQgYWdhaW5zdCBleHRlcm5hbCBkZXN0cm95KCkgY2FsbHMgKi9cbiAgICAgICAgICAgICAgICBpZiAoIXNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCBsb2FkQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShzZXR0aW5ncy5jbGFzc19sb2FkaW5nKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3NfZXJyb3IpO1xuICAgICAgICAgICAgICAgIGNhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19lcnJvciwgZWxlbWVudCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgbG9hZENhbGxiYWNrID0gZnVuY3Rpb24gbG9hZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgIC8qIEFzIHRoaXMgbWV0aG9kIGlzIGFzeW5jaHJvbm91cywgaXQgbXVzdCBiZSBwcm90ZWN0ZWQgYWdhaW5zdCBleHRlcm5hbCBkZXN0cm95KCkgY2FsbHMgKi9cbiAgICAgICAgICAgICAgICBpZiAoIXNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHNldHRpbmdzLmNsYXNzX2xvYWRpbmcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc19sb2FkZWQpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAvKiBDYWxsaW5nIExPQUQgY2FsbGJhY2sgKi9cbiAgICAgICAgICAgICAgICBjYWxsQ2FsbGJhY2soc2V0dGluZ3MuY2FsbGJhY2tfbG9hZCwgZWxlbWVudCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSBcIklNR1wiIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gXCJJRlJBTUVcIikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3NfbG9hZGluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldFNvdXJjZXMoZWxlbWVudCwgc2V0dGluZ3MuZGF0YV9zcmNzZXQsIHNldHRpbmdzLmRhdGFfc3JjKTtcbiAgICAgICAgICAgIC8qIENhbGxpbmcgU0VUIGNhbGxiYWNrICovXG4gICAgICAgICAgICBjYWxsQ2FsbGJhY2soc2V0dGluZ3MuY2FsbGJhY2tfc2V0LCBlbGVtZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfbG9vcFRocm91Z2hFbGVtZW50czogZnVuY3Rpb24gX2xvb3BUaHJvdWdoRWxlbWVudHMoKSB7XG4gICAgICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLl9zZXR0aW5ncyxcbiAgICAgICAgICAgICAgICBlbGVtZW50cyA9IHRoaXMuX2VsZW1lbnRzLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzTGVuZ3RoID0gIWVsZW1lbnRzID8gMCA6IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBpID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHByb2Nlc3NlZEluZGV4ZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBmaXJzdExvb3AgPSB0aGlzLl9pc0ZpcnN0TG9vcDtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGVsZW1lbnRzTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgICAgIC8qIElmIG11c3Qgc2tpcF9pbnZpc2libGUgYW5kIGVsZW1lbnQgaXMgaW52aXNpYmxlLCBza2lwIGl0ICovXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNraXBfaW52aXNpYmxlICYmIGVsZW1lbnQub2Zmc2V0UGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpc0JvdCB8fCBpc0luc2lkZVZpZXdwb3J0KGVsZW1lbnQsIHNldHRpbmdzLmNvbnRhaW5lciwgc2V0dGluZ3MudGhyZXNob2xkKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RMb29wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3NfaW5pdGlhbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogU3RhcnQgbG9hZGluZyB0aGUgaW1hZ2UgKi9cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmV2ZWFsKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAvKiBNYXJraW5nIHRoZSBlbGVtZW50IGFzIHByb2Nlc3NlZC4gKi9cbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkSW5kZXhlcy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmRhdGFzZXQud2FzUHJvY2Vzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBSZW1vdmluZyBwcm9jZXNzZWQgZWxlbWVudHMgZnJvbSB0aGlzLl9lbGVtZW50cy4gKi9cbiAgICAgICAgICAgIHdoaWxlIChwcm9jZXNzZWRJbmRleGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5zcGxpY2UocHJvY2Vzc2VkSW5kZXhlcy5wb3AoKSwgMSk7XG4gICAgICAgICAgICAgICAgLyogQ2FsbGluZyB0aGUgZW5kIGxvb3AgY2FsbGJhY2sgKi9cbiAgICAgICAgICAgICAgICBjYWxsQ2FsbGJhY2soc2V0dGluZ3MuY2FsbGJhY2tfcHJvY2Vzc2VkLCBlbGVtZW50cy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogU3RvcCBsaXN0ZW5pbmcgdG8gc2Nyb2xsIGV2ZW50IHdoZW4gMCBlbGVtZW50cyByZW1haW5zICovXG4gICAgICAgICAgICBpZiAoZWxlbWVudHNMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdG9wU2Nyb2xsSGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogU2V0cyBpc0ZpcnN0TG9vcCB0byBmYWxzZSAqL1xuICAgICAgICAgICAgaWYgKGZpcnN0TG9vcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzRmlyc3RMb29wID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3B1cmdlRWxlbWVudHM6IGZ1bmN0aW9uIF9wdXJnZUVsZW1lbnRzKCkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gdGhpcy5fZWxlbWVudHMsXG4gICAgICAgICAgICAgICAgZWxlbWVudHNMZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICBlbGVtZW50c1RvUHVyZ2UgPSBbXTtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGVsZW1lbnRzTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgICAgIC8qIElmIHRoZSBlbGVtZW50IGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkLCBza2lwIGl0ICovXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuZGF0YXNldC53YXNQcm9jZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHNUb1B1cmdlLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogUmVtb3ZpbmcgZWxlbWVudHMgdG8gcHVyZ2UgZnJvbSB0aGlzLl9lbGVtZW50cy4gKi9cbiAgICAgICAgICAgIHdoaWxlIChlbGVtZW50c1RvUHVyZ2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNwbGljZShlbGVtZW50c1RvUHVyZ2UucG9wKCksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zdGFydFNjcm9sbEhhbmRsZXI6IGZ1bmN0aW9uIF9zdGFydFNjcm9sbEhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzSGFuZGxpbmdTY3JvbGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXR0aW5ncy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3N0b3BTY3JvbGxIYW5kbGVyOiBmdW5jdGlvbiBfc3RvcFNjcm9sbEhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNIYW5kbGluZ1Njcm9sbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzSGFuZGxpbmdTY3JvbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXR0aW5ncy5jb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyogXG4gICAgICAgICAqIFB1YmxpYyBtZXRob2RzXG4gICAgICAgICAqL1xuXG4gICAgICAgIGhhbmRsZVNjcm9sbDogZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKCkge1xuICAgICAgICAgICAgdmFyIHRocm90dGxlID0gdGhpcy5fc2V0dGluZ3MudGhyb3R0bGU7XG5cbiAgICAgICAgICAgIGlmICh0aHJvdHRsZSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBnZXRUaW1lID0gZnVuY3Rpb24gZ2V0VGltZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgbm93ID0gZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIHZhciByZW1haW5pbmdUaW1lID0gdGhyb3R0bGUgLSAobm93IC0gdGhpcy5fcHJldmlvdXNMb29wVGltZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ1RpbWUgPD0gMCB8fCByZW1haW5pbmdUaW1lID4gdGhyb3R0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2xvb3BUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fbG9vcFRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZpb3VzTG9vcFRpbWUgPSBub3c7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLl9sb29wVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNMb29wVGltZSA9IGdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCByZW1haW5pbmdUaW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIC8vIENvbnZlcnRzIHRvIGFycmF5IHRoZSBub2Rlc2V0IG9idGFpbmVkIHF1ZXJ5aW5nIHRoZSBET00gZnJvbSBfcXVlcnlPcmlnaW5Ob2RlIHdpdGggZWxlbWVudHNfc2VsZWN0b3JcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fcXVlcnlPcmlnaW5Ob2RlLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fc2V0dGluZ3MuZWxlbWVudHNfc2VsZWN0b3IpKTtcbiAgICAgICAgICAgIHRoaXMuX3B1cmdlRWxlbWVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuX2xvb3BUaHJvdWdoRWxlbWVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0U2Nyb2xsSGFuZGxlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLl9ib3VuZEhhbmRsZVNjcm9sbCk7XG4gICAgICAgICAgICBpZiAodGhpcy5fbG9vcFRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fbG9vcFRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3N0b3BTY3JvbGxIYW5kbGVyKCk7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50cyA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9xdWVyeU9yaWdpbk5vZGUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc2V0dGluZ3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qIEF1dG9tYXRpYyBpbnN0YW5jZXMgY3JlYXRpb24gaWYgcmVxdWlyZWQgKHVzZWZ1bCBmb3IgYXN5bmMgc2NyaXB0IGxvYWRpbmchKSAqL1xuICAgIHZhciBhdXRvSW5pdE9wdGlvbnMgPSB3aW5kb3cubGF6eUxvYWRPcHRpb25zO1xuICAgIGlmIChhdXRvSW5pdE9wdGlvbnMpIHtcbiAgICAgICAgYXV0b0luaXRpYWxpemUoTGF6eUxvYWQsIGF1dG9Jbml0T3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIExhenlMb2FkO1xufSk7XG4iLCIvKiFcbiAqIEZsaWNraXR5IFBBQ0tBR0VEIHYyLjAuNVxuICogVG91Y2gsIHJlc3BvbnNpdmUsIGZsaWNrYWJsZSBjYXJvdXNlbHNcbiAqXG4gKiBMaWNlbnNlZCBHUEx2MyBmb3Igb3BlbiBzb3VyY2UgdXNlXG4gKiBvciBGbGlja2l0eSBDb21tZXJjaWFsIExpY2Vuc2UgZm9yIGNvbW1lcmNpYWwgdXNlXG4gKlxuICogaHR0cDovL2ZsaWNraXR5Lm1ldGFmaXp6eS5jb1xuICogQ29weXJpZ2h0IDIwMTYgTWV0YWZpenp5XG4gKi9cblxuIWZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImpxdWVyeS1icmlkZ2V0L2pxdWVyeS1icmlkZ2V0XCIsW1wianF1ZXJ5XCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImpxdWVyeVwiKSk6dC5qUXVlcnlCcmlkZ2V0PWUodCx0LmpRdWVyeSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGkoaSxvLGEpe2Z1bmN0aW9uIGwodCxlLG4pe3ZhciBzLG89XCIkKCkuXCIraSsnKFwiJytlKydcIiknO3JldHVybiB0LmVhY2goZnVuY3Rpb24odCxsKXt2YXIgaD1hLmRhdGEobCxpKTtpZighaClyZXR1cm4gdm9pZCByKGkrXCIgbm90IGluaXRpYWxpemVkLiBDYW5ub3QgY2FsbCBtZXRob2RzLCBpLmUuIFwiK28pO3ZhciBjPWhbZV07aWYoIWN8fFwiX1wiPT1lLmNoYXJBdCgwKSlyZXR1cm4gdm9pZCByKG8rXCIgaXMgbm90IGEgdmFsaWQgbWV0aG9kXCIpO3ZhciBkPWMuYXBwbHkoaCxuKTtzPXZvaWQgMD09PXM/ZDpzfSksdm9pZCAwIT09cz9zOnR9ZnVuY3Rpb24gaCh0LGUpe3QuZWFjaChmdW5jdGlvbih0LG4pe3ZhciBzPWEuZGF0YShuLGkpO3M/KHMub3B0aW9uKGUpLHMuX2luaXQoKSk6KHM9bmV3IG8obixlKSxhLmRhdGEobixpLHMpKX0pfWE9YXx8ZXx8dC5qUXVlcnksYSYmKG8ucHJvdG90eXBlLm9wdGlvbnx8KG8ucHJvdG90eXBlLm9wdGlvbj1mdW5jdGlvbih0KXthLmlzUGxhaW5PYmplY3QodCkmJih0aGlzLm9wdGlvbnM9YS5leHRlbmQoITAsdGhpcy5vcHRpb25zLHQpKX0pLGEuZm5baV09ZnVuY3Rpb24odCl7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHQpe3ZhciBlPXMuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIGwodGhpcyx0LGUpfXJldHVybiBoKHRoaXMsdCksdGhpc30sbihhKSl9ZnVuY3Rpb24gbih0KXshdHx8dCYmdC5icmlkZ2V0fHwodC5icmlkZ2V0PWkpfXZhciBzPUFycmF5LnByb3RvdHlwZS5zbGljZSxvPXQuY29uc29sZSxyPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBvP2Z1bmN0aW9uKCl7fTpmdW5jdGlvbih0KXtvLmVycm9yKHQpfTtyZXR1cm4gbihlfHx0LmpRdWVyeSksaX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0LkV2RW1pdHRlcj1lKCl9KFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnRoaXMsZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7fXZhciBlPXQucHJvdG90eXBlO3JldHVybiBlLm9uPWZ1bmN0aW9uKHQsZSl7aWYodCYmZSl7dmFyIGk9dGhpcy5fZXZlbnRzPXRoaXMuX2V2ZW50c3x8e30sbj1pW3RdPWlbdF18fFtdO3JldHVybiBuLmluZGV4T2YoZSk9PS0xJiZuLnB1c2goZSksdGhpc319LGUub25jZT1mdW5jdGlvbih0LGUpe2lmKHQmJmUpe3RoaXMub24odCxlKTt2YXIgaT10aGlzLl9vbmNlRXZlbnRzPXRoaXMuX29uY2VFdmVudHN8fHt9LG49aVt0XT1pW3RdfHx7fTtyZXR1cm4gbltlXT0hMCx0aGlzfX0sZS5vZmY9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9ldmVudHMmJnRoaXMuX2V2ZW50c1t0XTtpZihpJiZpLmxlbmd0aCl7dmFyIG49aS5pbmRleE9mKGUpO3JldHVybiBuIT0tMSYmaS5zcGxpY2UobiwxKSx0aGlzfX0sZS5lbWl0RXZlbnQ9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9ldmVudHMmJnRoaXMuX2V2ZW50c1t0XTtpZihpJiZpLmxlbmd0aCl7dmFyIG49MCxzPWlbbl07ZT1lfHxbXTtmb3IodmFyIG89dGhpcy5fb25jZUV2ZW50cyYmdGhpcy5fb25jZUV2ZW50c1t0XTtzOyl7dmFyIHI9byYmb1tzXTtyJiYodGhpcy5vZmYodCxzKSxkZWxldGUgb1tzXSkscy5hcHBseSh0aGlzLGUpLG4rPXI/MDoxLHM9aVtuXX1yZXR1cm4gdGhpc319LHR9KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiLFtdLGZ1bmN0aW9uKCl7cmV0dXJuIGUoKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0LmdldFNpemU9ZSgpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3ZhciBlPXBhcnNlRmxvYXQodCksaT10LmluZGV4T2YoXCIlXCIpPT0tMSYmIWlzTmFOKGUpO3JldHVybiBpJiZlfWZ1bmN0aW9uIGUoKXt9ZnVuY3Rpb24gaSgpe2Zvcih2YXIgdD17d2lkdGg6MCxoZWlnaHQ6MCxpbm5lcldpZHRoOjAsaW5uZXJIZWlnaHQ6MCxvdXRlcldpZHRoOjAsb3V0ZXJIZWlnaHQ6MH0sZT0wO2U8aDtlKyspe3ZhciBpPWxbZV07dFtpXT0wfXJldHVybiB0fWZ1bmN0aW9uIG4odCl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZSh0KTtyZXR1cm4gZXx8YShcIlN0eWxlIHJldHVybmVkIFwiK2UrXCIuIEFyZSB5b3UgcnVubmluZyB0aGlzIGNvZGUgaW4gYSBoaWRkZW4gaWZyYW1lIG9uIEZpcmVmb3g/IFNlZSBodHRwOi8vYml0Lmx5L2dldHNpemVidWcxXCIpLGV9ZnVuY3Rpb24gcygpe2lmKCFjKXtjPSEwO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZS5zdHlsZS53aWR0aD1cIjIwMHB4XCIsZS5zdHlsZS5wYWRkaW5nPVwiMXB4IDJweCAzcHggNHB4XCIsZS5zdHlsZS5ib3JkZXJTdHlsZT1cInNvbGlkXCIsZS5zdHlsZS5ib3JkZXJXaWR0aD1cIjFweCAycHggM3B4IDRweFwiLGUuc3R5bGUuYm94U2l6aW5nPVwiYm9yZGVyLWJveFwiO3ZhciBpPWRvY3VtZW50LmJvZHl8fGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtpLmFwcGVuZENoaWxkKGUpO3ZhciBzPW4oZSk7by5pc0JveFNpemVPdXRlcj1yPTIwMD09dChzLndpZHRoKSxpLnJlbW92ZUNoaWxkKGUpfX1mdW5jdGlvbiBvKGUpe2lmKHMoKSxcInN0cmluZ1wiPT10eXBlb2YgZSYmKGU9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlKSksZSYmXCJvYmplY3RcIj09dHlwZW9mIGUmJmUubm9kZVR5cGUpe3ZhciBvPW4oZSk7aWYoXCJub25lXCI9PW8uZGlzcGxheSlyZXR1cm4gaSgpO3ZhciBhPXt9O2Eud2lkdGg9ZS5vZmZzZXRXaWR0aCxhLmhlaWdodD1lLm9mZnNldEhlaWdodDtmb3IodmFyIGM9YS5pc0JvcmRlckJveD1cImJvcmRlci1ib3hcIj09by5ib3hTaXppbmcsZD0wO2Q8aDtkKyspe3ZhciB1PWxbZF0sZj1vW3VdLHA9cGFyc2VGbG9hdChmKTthW3VdPWlzTmFOKHApPzA6cH12YXIgdj1hLnBhZGRpbmdMZWZ0K2EucGFkZGluZ1JpZ2h0LGc9YS5wYWRkaW5nVG9wK2EucGFkZGluZ0JvdHRvbSxtPWEubWFyZ2luTGVmdCthLm1hcmdpblJpZ2h0LHk9YS5tYXJnaW5Ub3ArYS5tYXJnaW5Cb3R0b20sUz1hLmJvcmRlckxlZnRXaWR0aCthLmJvcmRlclJpZ2h0V2lkdGgsRT1hLmJvcmRlclRvcFdpZHRoK2EuYm9yZGVyQm90dG9tV2lkdGgsYj1jJiZyLHg9dChvLndpZHRoKTt4IT09ITEmJihhLndpZHRoPXgrKGI/MDp2K1MpKTt2YXIgQz10KG8uaGVpZ2h0KTtyZXR1cm4gQyE9PSExJiYoYS5oZWlnaHQ9QysoYj8wOmcrRSkpLGEuaW5uZXJXaWR0aD1hLndpZHRoLSh2K1MpLGEuaW5uZXJIZWlnaHQ9YS5oZWlnaHQtKGcrRSksYS5vdXRlcldpZHRoPWEud2lkdGgrbSxhLm91dGVySGVpZ2h0PWEuaGVpZ2h0K3ksYX19dmFyIHIsYT1cInVuZGVmaW5lZFwiPT10eXBlb2YgY29uc29sZT9lOmZ1bmN0aW9uKHQpe2NvbnNvbGUuZXJyb3IodCl9LGw9W1wicGFkZGluZ0xlZnRcIixcInBhZGRpbmdSaWdodFwiLFwicGFkZGluZ1RvcFwiLFwicGFkZGluZ0JvdHRvbVwiLFwibWFyZ2luTGVmdFwiLFwibWFyZ2luUmlnaHRcIixcIm1hcmdpblRvcFwiLFwibWFyZ2luQm90dG9tXCIsXCJib3JkZXJMZWZ0V2lkdGhcIixcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJCb3R0b21XaWR0aFwiXSxoPWwubGVuZ3RoLGM9ITE7cmV0dXJuIG99KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3JcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5tYXRjaGVzU2VsZWN0b3I9ZSgpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbigpe3ZhciB0PUVsZW1lbnQucHJvdG90eXBlO2lmKHQubWF0Y2hlcylyZXR1cm5cIm1hdGNoZXNcIjtpZih0Lm1hdGNoZXNTZWxlY3RvcilyZXR1cm5cIm1hdGNoZXNTZWxlY3RvclwiO2Zvcih2YXIgZT1bXCJ3ZWJraXRcIixcIm1velwiLFwibXNcIixcIm9cIl0saT0wO2k8ZS5sZW5ndGg7aSsrKXt2YXIgbj1lW2ldLHM9bitcIk1hdGNoZXNTZWxlY3RvclwiO2lmKHRbc10pcmV0dXJuIHN9fSgpO3JldHVybiBmdW5jdGlvbihlLGkpe3JldHVybiBlW3RdKGkpfX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsW1wiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3Rvci9tYXRjaGVzLXNlbGVjdG9yXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3JcIikpOnQuZml6enlVSVV0aWxzPWUodCx0Lm1hdGNoZXNTZWxlY3Rvcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe3ZhciBpPXt9O2kuZXh0ZW5kPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciBpIGluIGUpdFtpXT1lW2ldO3JldHVybiB0fSxpLm1vZHVsbz1mdW5jdGlvbih0LGUpe3JldHVybih0JWUrZSklZX0saS5tYWtlQXJyYXk9ZnVuY3Rpb24odCl7dmFyIGU9W107aWYoQXJyYXkuaXNBcnJheSh0KSllPXQ7ZWxzZSBpZih0JiZcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGgpZm9yKHZhciBpPTA7aTx0Lmxlbmd0aDtpKyspZS5wdXNoKHRbaV0pO2Vsc2UgZS5wdXNoKHQpO3JldHVybiBlfSxpLnJlbW92ZUZyb209ZnVuY3Rpb24odCxlKXt2YXIgaT10LmluZGV4T2YoZSk7aSE9LTEmJnQuc3BsaWNlKGksMSl9LGkuZ2V0UGFyZW50PWZ1bmN0aW9uKHQsaSl7Zm9yKDt0IT1kb2N1bWVudC5ib2R5OylpZih0PXQucGFyZW50Tm9kZSxlKHQsaSkpcmV0dXJuIHR9LGkuZ2V0UXVlcnlFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodCk6dH0saS5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LGkuZmlsdGVyRmluZEVsZW1lbnRzPWZ1bmN0aW9uKHQsbil7dD1pLm1ha2VBcnJheSh0KTt2YXIgcz1bXTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe2lmKHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7aWYoIW4pcmV0dXJuIHZvaWQgcy5wdXNoKHQpO2UodCxuKSYmcy5wdXNoKHQpO2Zvcih2YXIgaT10LnF1ZXJ5U2VsZWN0b3JBbGwobiksbz0wO288aS5sZW5ndGg7bysrKXMucHVzaChpW29dKX19KSxzfSxpLmRlYm91bmNlTWV0aG9kPWZ1bmN0aW9uKHQsZSxpKXt2YXIgbj10LnByb3RvdHlwZVtlXSxzPWUrXCJUaW1lb3V0XCI7dC5wcm90b3R5cGVbZV09ZnVuY3Rpb24oKXt2YXIgdD10aGlzW3NdO3QmJmNsZWFyVGltZW91dCh0KTt2YXIgZT1hcmd1bWVudHMsbz10aGlzO3RoaXNbc109c2V0VGltZW91dChmdW5jdGlvbigpe24uYXBwbHkobyxlKSxkZWxldGUgb1tzXX0saXx8MTAwKX19LGkuZG9jUmVhZHk9ZnVuY3Rpb24odCl7dmFyIGU9ZG9jdW1lbnQucmVhZHlTdGF0ZTtcImNvbXBsZXRlXCI9PWV8fFwiaW50ZXJhY3RpdmVcIj09ZT9zZXRUaW1lb3V0KHQpOmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsdCl9LGkudG9EYXNoZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIHQucmVwbGFjZSgvKC4pKFtBLVpdKS9nLGZ1bmN0aW9uKHQsZSxpKXtyZXR1cm4gZStcIi1cIitpfSkudG9Mb3dlckNhc2UoKX07dmFyIG49dC5jb25zb2xlO3JldHVybiBpLmh0bWxJbml0PWZ1bmN0aW9uKGUscyl7aS5kb2NSZWFkeShmdW5jdGlvbigpe3ZhciBvPWkudG9EYXNoZWQocykscj1cImRhdGEtXCIrbyxhPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbXCIrcitcIl1cIiksbD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLVwiK28pLGg9aS5tYWtlQXJyYXkoYSkuY29uY2F0KGkubWFrZUFycmF5KGwpKSxjPXIrXCItb3B0aW9uc1wiLGQ9dC5qUXVlcnk7aC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBpLG89dC5nZXRBdHRyaWJ1dGUocil8fHQuZ2V0QXR0cmlidXRlKGMpO3RyeXtpPW8mJkpTT04ucGFyc2Uobyl9Y2F0Y2goYSl7cmV0dXJuIHZvaWQobiYmbi5lcnJvcihcIkVycm9yIHBhcnNpbmcgXCIrcitcIiBvbiBcIit0LmNsYXNzTmFtZStcIjogXCIrYSkpfXZhciBsPW5ldyBlKHQsaSk7ZCYmZC5kYXRhKHQscyxsKX0pfSl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9jZWxsXCIsW1wiZ2V0LXNpemUvZ2V0LXNpemVcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZ2V0LXNpemVcIikpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuQ2VsbD1lKHQsdC5nZXRTaXplKSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlKXt0aGlzLmVsZW1lbnQ9dCx0aGlzLnBhcmVudD1lLHRoaXMuY3JlYXRlKCl9dmFyIG49aS5wcm90b3R5cGU7cmV0dXJuIG4uY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uPVwiYWJzb2x1dGVcIix0aGlzLng9MCx0aGlzLnNoaWZ0PTB9LG4uZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbj1cIlwiO3ZhciB0PXRoaXMucGFyZW50Lm9yaWdpblNpZGU7dGhpcy5lbGVtZW50LnN0eWxlW3RdPVwiXCJ9LG4uZ2V0U2l6ZT1mdW5jdGlvbigpe3RoaXMuc2l6ZT1lKHRoaXMuZWxlbWVudCl9LG4uc2V0UG9zaXRpb249ZnVuY3Rpb24odCl7dGhpcy54PXQsdGhpcy51cGRhdGVUYXJnZXQoKSx0aGlzLnJlbmRlclBvc2l0aW9uKHQpfSxuLnVwZGF0ZVRhcmdldD1uLnNldERlZmF1bHRUYXJnZXQ9ZnVuY3Rpb24oKXt2YXIgdD1cImxlZnRcIj09dGhpcy5wYXJlbnQub3JpZ2luU2lkZT9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCI7dGhpcy50YXJnZXQ9dGhpcy54K3RoaXMuc2l6ZVt0XSt0aGlzLnNpemUud2lkdGgqdGhpcy5wYXJlbnQuY2VsbEFsaWdufSxuLnJlbmRlclBvc2l0aW9uPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMucGFyZW50Lm9yaWdpblNpZGU7dGhpcy5lbGVtZW50LnN0eWxlW2VdPXRoaXMucGFyZW50LmdldFBvc2l0aW9uVmFsdWUodCl9LG4ud3JhcFNoaWZ0PWZ1bmN0aW9uKHQpe3RoaXMuc2hpZnQ9dCx0aGlzLnJlbmRlclBvc2l0aW9uKHRoaXMueCt0aGlzLnBhcmVudC5zbGlkZWFibGVXaWR0aCp0KX0sbi5yZW1vdmU9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvc2xpZGVcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5TbGlkZT1lKCkpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3RoaXMucGFyZW50PXQsdGhpcy5pc09yaWdpbkxlZnQ9XCJsZWZ0XCI9PXQub3JpZ2luU2lkZSx0aGlzLmNlbGxzPVtdLHRoaXMub3V0ZXJXaWR0aD0wLHRoaXMuaGVpZ2h0PTB9dmFyIGU9dC5wcm90b3R5cGU7cmV0dXJuIGUuYWRkQ2VsbD1mdW5jdGlvbih0KXtpZih0aGlzLmNlbGxzLnB1c2godCksdGhpcy5vdXRlcldpZHRoKz10LnNpemUub3V0ZXJXaWR0aCx0aGlzLmhlaWdodD1NYXRoLm1heCh0LnNpemUub3V0ZXJIZWlnaHQsdGhpcy5oZWlnaHQpLDE9PXRoaXMuY2VsbHMubGVuZ3RoKXt0aGlzLng9dC54O3ZhciBlPXRoaXMuaXNPcmlnaW5MZWZ0P1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIjt0aGlzLmZpcnN0TWFyZ2luPXQuc2l6ZVtlXX19LGUudXBkYXRlVGFyZ2V0PWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5pc09yaWdpbkxlZnQ/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLGU9dGhpcy5nZXRMYXN0Q2VsbCgpLGk9ZT9lLnNpemVbdF06MCxuPXRoaXMub3V0ZXJXaWR0aC0odGhpcy5maXJzdE1hcmdpbitpKTt0aGlzLnRhcmdldD10aGlzLngrdGhpcy5maXJzdE1hcmdpbituKnRoaXMucGFyZW50LmNlbGxBbGlnbn0sZS5nZXRMYXN0Q2VsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzW3RoaXMuY2VsbHMubGVuZ3RoLTFdfSxlLnNlbGVjdD1mdW5jdGlvbigpe3RoaXMuY2hhbmdlU2VsZWN0ZWRDbGFzcyhcImFkZFwiKX0sZS51bnNlbGVjdD1mdW5jdGlvbigpe3RoaXMuY2hhbmdlU2VsZWN0ZWRDbGFzcyhcInJlbW92ZVwiKX0sZS5jaGFuZ2VTZWxlY3RlZENsYXNzPWZ1bmN0aW9uKHQpe3RoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbihlKXtlLmVsZW1lbnQuY2xhc3NMaXN0W3RdKFwiaXMtc2VsZWN0ZWRcIil9KX0sZS5nZXRDZWxsRWxlbWVudHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pfSx0fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvYW5pbWF0ZVwiLFtcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LmFuaW1hdGVQcm90b3R5cGU9ZSh0LHQuZml6enlVSVV0aWxzKSl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe3ZhciBpPXQucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHx0LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSxuPTA7aXx8KGk9ZnVuY3Rpb24odCl7dmFyIGU9KG5ldyBEYXRlKS5nZXRUaW1lKCksaT1NYXRoLm1heCgwLDE2LShlLW4pKSxzPXNldFRpbWVvdXQodCxpKTtyZXR1cm4gbj1lK2ksc30pO3ZhciBzPXt9O3Muc3RhcnRBbmltYXRpb249ZnVuY3Rpb24oKXt0aGlzLmlzQW5pbWF0aW5nfHwodGhpcy5pc0FuaW1hdGluZz0hMCx0aGlzLnJlc3RpbmdGcmFtZXM9MCx0aGlzLmFuaW1hdGUoKSl9LHMuYW5pbWF0ZT1mdW5jdGlvbigpe3RoaXMuYXBwbHlEcmFnRm9yY2UoKSx0aGlzLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uKCk7dmFyIHQ9dGhpcy54O2lmKHRoaXMuaW50ZWdyYXRlUGh5c2ljcygpLHRoaXMucG9zaXRpb25TbGlkZXIoKSx0aGlzLnNldHRsZSh0KSx0aGlzLmlzQW5pbWF0aW5nKXt2YXIgZT10aGlzO2koZnVuY3Rpb24oKXtlLmFuaW1hdGUoKX0pfX07dmFyIG89ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQudHJhbnNmb3JtP1widHJhbnNmb3JtXCI6XCJXZWJraXRUcmFuc2Zvcm1cIn0oKTtyZXR1cm4gcy5wb3NpdGlvblNsaWRlcj1mdW5jdGlvbigpe3ZhciB0PXRoaXMueDt0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5jZWxscy5sZW5ndGg+MSYmKHQ9ZS5tb2R1bG8odCx0aGlzLnNsaWRlYWJsZVdpZHRoKSx0LT10aGlzLnNsaWRlYWJsZVdpZHRoLHRoaXMuc2hpZnRXcmFwQ2VsbHModCkpLHQrPXRoaXMuY3Vyc29yUG9zaXRpb24sdD10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQmJm8/LXQ6dDt2YXIgaT10aGlzLmdldFBvc2l0aW9uVmFsdWUodCk7dGhpcy5zbGlkZXIuc3R5bGVbb109dGhpcy5pc0FuaW1hdGluZz9cInRyYW5zbGF0ZTNkKFwiK2krXCIsMCwwKVwiOlwidHJhbnNsYXRlWChcIitpK1wiKVwiO3ZhciBuPXRoaXMuc2xpZGVzWzBdO2lmKG4pe3ZhciBzPS10aGlzLngtbi50YXJnZXQscj1zL3RoaXMuc2xpZGVzV2lkdGg7dGhpcy5kaXNwYXRjaEV2ZW50KFwic2Nyb2xsXCIsbnVsbCxbcixzXSl9fSxzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZD1mdW5jdGlvbigpe3RoaXMuY2VsbHMubGVuZ3RoJiYodGhpcy54PS10aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0LHRoaXMucG9zaXRpb25TbGlkZXIoKSl9LHMuZ2V0UG9zaXRpb25WYWx1ZT1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5vcHRpb25zLnBlcmNlbnRQb3NpdGlvbj8uMDEqTWF0aC5yb3VuZCh0L3RoaXMuc2l6ZS5pbm5lcldpZHRoKjFlNCkrXCIlXCI6TWF0aC5yb3VuZCh0KStcInB4XCJ9LHMuc2V0dGxlPWZ1bmN0aW9uKHQpe3RoaXMuaXNQb2ludGVyRG93bnx8TWF0aC5yb3VuZCgxMDAqdGhpcy54KSE9TWF0aC5yb3VuZCgxMDAqdCl8fHRoaXMucmVzdGluZ0ZyYW1lcysrLHRoaXMucmVzdGluZ0ZyYW1lcz4yJiYodGhpcy5pc0FuaW1hdGluZz0hMSxkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmcsdGhpcy5wb3NpdGlvblNsaWRlcigpLHRoaXMuZGlzcGF0Y2hFdmVudChcInNldHRsZVwiKSl9LHMuc2hpZnRXcmFwQ2VsbHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5jdXJzb3JQb3NpdGlvbit0O3RoaXMuX3NoaWZ0Q2VsbHModGhpcy5iZWZvcmVTaGlmdENlbGxzLGUsLTEpO3ZhciBpPXRoaXMuc2l6ZS5pbm5lcldpZHRoLSh0K3RoaXMuc2xpZGVhYmxlV2lkdGgrdGhpcy5jdXJzb3JQb3NpdGlvbik7dGhpcy5fc2hpZnRDZWxscyh0aGlzLmFmdGVyU2hpZnRDZWxscyxpLDEpfSxzLl9zaGlmdENlbGxzPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHM9dFtuXSxvPWU+MD9pOjA7cy53cmFwU2hpZnQobyksZS09cy5zaXplLm91dGVyV2lkdGh9fSxzLl91bnNoaWZ0Q2VsbHM9ZnVuY3Rpb24odCl7aWYodCYmdC5sZW5ndGgpZm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspdFtlXS53cmFwU2hpZnQoMCl9LHMuaW50ZWdyYXRlUGh5c2ljcz1mdW5jdGlvbigpe3RoaXMueCs9dGhpcy52ZWxvY2l0eSx0aGlzLnZlbG9jaXR5Kj10aGlzLmdldEZyaWN0aW9uRmFjdG9yKCl9LHMuYXBwbHlGb3JjZT1mdW5jdGlvbih0KXt0aGlzLnZlbG9jaXR5Kz10fSxzLmdldEZyaWN0aW9uRmFjdG9yPWZ1bmN0aW9uKCl7cmV0dXJuIDEtdGhpcy5vcHRpb25zW3RoaXMuaXNGcmVlU2Nyb2xsaW5nP1wiZnJlZVNjcm9sbEZyaWN0aW9uXCI6XCJmcmljdGlvblwiXX0scy5nZXRSZXN0aW5nUG9zaXRpb249ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy54K3RoaXMudmVsb2NpdHkvKDEtdGhpcy5nZXRGcmljdGlvbkZhY3RvcigpKX0scy5hcHBseURyYWdGb3JjZT1mdW5jdGlvbigpe2lmKHRoaXMuaXNQb2ludGVyRG93bil7dmFyIHQ9dGhpcy5kcmFnWC10aGlzLngsZT10LXRoaXMudmVsb2NpdHk7dGhpcy5hcHBseUZvcmNlKGUpfX0scy5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbj1mdW5jdGlvbigpe2lmKCF0aGlzLmlzUG9pbnRlckRvd24mJiF0aGlzLmlzRnJlZVNjcm9sbGluZyYmdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PXRoaXMuc2VsZWN0ZWRTbGlkZS50YXJnZXQqLTEtdGhpcy54LGU9dCp0aGlzLm9wdGlvbnMuc2VsZWN0ZWRBdHRyYWN0aW9uO3RoaXMuYXBwbHlGb3JjZShlKX19LHN9KSxmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoXCJmbGlja2l0eS9qcy9mbGlja2l0eVwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLFwiZ2V0LXNpemUvZ2V0LXNpemVcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsXCIuL2NlbGxcIixcIi4vc2xpZGVcIixcIi4vYW5pbWF0ZVwiXSxmdW5jdGlvbihpLG4scyxvLHIsYSl7cmV0dXJuIGUodCxpLG4scyxvLHIsYSl9KTtlbHNlIGlmKFwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzKW1vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSxyZXF1aXJlKFwiZ2V0LXNpemVcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpLHJlcXVpcmUoXCIuL2NlbGxcIikscmVxdWlyZShcIi4vc2xpZGVcIikscmVxdWlyZShcIi4vYW5pbWF0ZVwiKSk7ZWxzZXt2YXIgaT10LkZsaWNraXR5O3QuRmxpY2tpdHk9ZSh0LHQuRXZFbWl0dGVyLHQuZ2V0U2l6ZSx0LmZpenp5VUlVdGlscyxpLkNlbGwsaS5TbGlkZSxpLmFuaW1hdGVQcm90b3R5cGUpfX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4scyxvLHIpe2Z1bmN0aW9uIGEodCxlKXtmb3IodD1uLm1ha2VBcnJheSh0KTt0Lmxlbmd0aDspZS5hcHBlbmRDaGlsZCh0LnNoaWZ0KCkpfWZ1bmN0aW9uIGwodCxlKXt2YXIgaT1uLmdldFF1ZXJ5RWxlbWVudCh0KTtpZighaSlyZXR1cm4gdm9pZChkJiZkLmVycm9yKFwiQmFkIGVsZW1lbnQgZm9yIEZsaWNraXR5OiBcIisoaXx8dCkpKTtpZih0aGlzLmVsZW1lbnQ9aSx0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEKXt2YXIgcz1mW3RoaXMuZWxlbWVudC5mbGlja2l0eUdVSURdO3JldHVybiBzLm9wdGlvbihlKSxzfWgmJih0aGlzLiRlbGVtZW50PWgodGhpcy5lbGVtZW50KSksdGhpcy5vcHRpb25zPW4uZXh0ZW5kKHt9LHRoaXMuY29uc3RydWN0b3IuZGVmYXVsdHMpLHRoaXMub3B0aW9uKGUpLHRoaXMuX2NyZWF0ZSgpfXZhciBoPXQualF1ZXJ5LGM9dC5nZXRDb21wdXRlZFN0eWxlLGQ9dC5jb25zb2xlLHU9MCxmPXt9O2wuZGVmYXVsdHM9e2FjY2Vzc2liaWxpdHk6ITAsY2VsbEFsaWduOlwiY2VudGVyXCIsZnJlZVNjcm9sbEZyaWN0aW9uOi4wNzUsZnJpY3Rpb246LjI4LG5hbWVzcGFjZUpRdWVyeUV2ZW50czohMCxwZXJjZW50UG9zaXRpb246ITAscmVzaXplOiEwLHNlbGVjdGVkQXR0cmFjdGlvbjouMDI1LHNldEdhbGxlcnlTaXplOiEwfSxsLmNyZWF0ZU1ldGhvZHM9W107dmFyIHA9bC5wcm90b3R5cGU7bi5leHRlbmQocCxlLnByb3RvdHlwZSkscC5fY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5ndWlkPSsrdTt0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEPWUsZltlXT10aGlzLHRoaXMuc2VsZWN0ZWRJbmRleD0wLHRoaXMucmVzdGluZ0ZyYW1lcz0wLHRoaXMueD0wLHRoaXMudmVsb2NpdHk9MCx0aGlzLm9yaWdpblNpZGU9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wicmlnaHRcIjpcImxlZnRcIix0aGlzLnZpZXdwb3J0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy52aWV3cG9ydC5jbGFzc05hbWU9XCJmbGlja2l0eS12aWV3cG9ydFwiLHRoaXMuX2NyZWF0ZVNsaWRlcigpLCh0aGlzLm9wdGlvbnMucmVzaXplfHx0aGlzLm9wdGlvbnMud2F0Y2hDU1MpJiZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzKSxsLmNyZWF0ZU1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbih0KXt0aGlzW3RdKCl9LHRoaXMpLHRoaXMub3B0aW9ucy53YXRjaENTUz90aGlzLndhdGNoQ1NTKCk6dGhpcy5hY3RpdmF0ZSgpfSxwLm9wdGlvbj1mdW5jdGlvbih0KXtuLmV4dGVuZCh0aGlzLm9wdGlvbnMsdCl9LHAuYWN0aXZhdGU9ZnVuY3Rpb24oKXtpZighdGhpcy5pc0FjdGl2ZSl7dGhpcy5pc0FjdGl2ZT0hMCx0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZsaWNraXR5LWVuYWJsZWRcIiksdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0JiZ0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImZsaWNraXR5LXJ0bFwiKSx0aGlzLmdldFNpemUoKTt2YXIgdD10aGlzLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzKHRoaXMuZWxlbWVudC5jaGlsZHJlbik7YSh0LHRoaXMuc2xpZGVyKSx0aGlzLnZpZXdwb3J0LmFwcGVuZENoaWxkKHRoaXMuc2xpZGVyKSx0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy52aWV3cG9ydCksdGhpcy5yZWxvYWRDZWxscygpLHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYodGhpcy5lbGVtZW50LnRhYkluZGV4PTAsdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcykpLHRoaXMuZW1pdEV2ZW50KFwiYWN0aXZhdGVcIik7dmFyIGUsaT10aGlzLm9wdGlvbnMuaW5pdGlhbEluZGV4O2U9dGhpcy5pc0luaXRBY3RpdmF0ZWQ/dGhpcy5zZWxlY3RlZEluZGV4OnZvaWQgMCE9PWkmJnRoaXMuY2VsbHNbaV0/aTowLHRoaXMuc2VsZWN0KGUsITEsITApLHRoaXMuaXNJbml0QWN0aXZhdGVkPSEwfX0scC5fY3JlYXRlU2xpZGVyPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTt0LmNsYXNzTmFtZT1cImZsaWNraXR5LXNsaWRlclwiLHQuc3R5bGVbdGhpcy5vcmlnaW5TaWRlXT0wLHRoaXMuc2xpZGVyPXR9LHAuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHM9ZnVuY3Rpb24odCl7cmV0dXJuIG4uZmlsdGVyRmluZEVsZW1lbnRzKHQsdGhpcy5vcHRpb25zLmNlbGxTZWxlY3Rvcil9LHAucmVsb2FkQ2VsbHM9ZnVuY3Rpb24oKXt0aGlzLmNlbGxzPXRoaXMuX21ha2VDZWxscyh0aGlzLnNsaWRlci5jaGlsZHJlbiksdGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCl9LHAuX21ha2VDZWxscz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzKHQpLGk9ZS5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIG5ldyBzKHQsdGhpcyl9LHRoaXMpO3JldHVybiBpfSxwLmdldExhc3RDZWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHNbdGhpcy5jZWxscy5sZW5ndGgtMV19LHAuZ2V0TGFzdFNsaWRlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2xpZGVzW3RoaXMuc2xpZGVzLmxlbmd0aC0xXX0scC5wb3NpdGlvbkNlbGxzPWZ1bmN0aW9uKCl7dGhpcy5fc2l6ZUNlbGxzKHRoaXMuY2VsbHMpLHRoaXMuX3Bvc2l0aW9uQ2VsbHMoMCl9LHAuX3Bvc2l0aW9uQ2VsbHM9ZnVuY3Rpb24odCl7dD10fHwwLHRoaXMubWF4Q2VsbEhlaWdodD10P3RoaXMubWF4Q2VsbEhlaWdodHx8MDowO3ZhciBlPTA7aWYodD4wKXt2YXIgaT10aGlzLmNlbGxzW3QtMV07ZT1pLngraS5zaXplLm91dGVyV2lkdGh9Zm9yKHZhciBuPXRoaXMuY2VsbHMubGVuZ3RoLHM9dDtzPG47cysrKXt2YXIgbz10aGlzLmNlbGxzW3NdO28uc2V0UG9zaXRpb24oZSksZSs9by5zaXplLm91dGVyV2lkdGgsdGhpcy5tYXhDZWxsSGVpZ2h0PU1hdGgubWF4KG8uc2l6ZS5vdXRlckhlaWdodCx0aGlzLm1heENlbGxIZWlnaHQpfXRoaXMuc2xpZGVhYmxlV2lkdGg9ZSx0aGlzLnVwZGF0ZVNsaWRlcygpLHRoaXMuX2NvbnRhaW5TbGlkZXMoKSx0aGlzLnNsaWRlc1dpZHRoPW4/dGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQtdGhpcy5zbGlkZXNbMF0udGFyZ2V0OjB9LHAuX3NpemVDZWxscz1mdW5jdGlvbih0KXt0LmZvckVhY2goZnVuY3Rpb24odCl7dC5nZXRTaXplKCl9KX0scC51cGRhdGVTbGlkZXM9ZnVuY3Rpb24oKXtpZih0aGlzLnNsaWRlcz1bXSx0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9bmV3IG8odGhpcyk7dGhpcy5zbGlkZXMucHVzaCh0KTt2YXIgZT1cImxlZnRcIj09dGhpcy5vcmlnaW5TaWRlLGk9ZT9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsbj10aGlzLl9nZXRDYW5DZWxsRml0KCk7dGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKGUscyl7aWYoIXQuY2VsbHMubGVuZ3RoKXJldHVybiB2b2lkIHQuYWRkQ2VsbChlKTt2YXIgcj10Lm91dGVyV2lkdGgtdC5maXJzdE1hcmdpbisoZS5zaXplLm91dGVyV2lkdGgtZS5zaXplW2ldKTtuLmNhbGwodGhpcyxzLHIpP3QuYWRkQ2VsbChlKToodC51cGRhdGVUYXJnZXQoKSx0PW5ldyBvKHRoaXMpLHRoaXMuc2xpZGVzLnB1c2godCksdC5hZGRDZWxsKGUpKX0sdGhpcyksdC51cGRhdGVUYXJnZXQoKSx0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKX19LHAuX2dldENhbkNlbGxGaXQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMuZ3JvdXBDZWxscztpZighdClyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4hMX07aWYoXCJudW1iZXJcIj09dHlwZW9mIHQpe3ZhciBlPXBhcnNlSW50KHQsMTApO3JldHVybiBmdW5jdGlvbih0KXtyZXR1cm4gdCVlIT09MH19dmFyIGk9XCJzdHJpbmdcIj09dHlwZW9mIHQmJnQubWF0Y2goL14oXFxkKyklJC8pLG49aT9wYXJzZUludChpWzFdLDEwKS8xMDA6MTtyZXR1cm4gZnVuY3Rpb24odCxlKXtyZXR1cm4gZTw9KHRoaXMuc2l6ZS5pbm5lcldpZHRoKzEpKm59fSxwLl9pbml0PXAucmVwb3NpdGlvbj1mdW5jdGlvbigpe3RoaXMucG9zaXRpb25DZWxscygpLHRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCl9LHAuZ2V0U2l6ZT1mdW5jdGlvbigpe3RoaXMuc2l6ZT1pKHRoaXMuZWxlbWVudCksdGhpcy5zZXRDZWxsQWxpZ24oKSx0aGlzLmN1cnNvclBvc2l0aW9uPXRoaXMuc2l6ZS5pbm5lcldpZHRoKnRoaXMuY2VsbEFsaWdufTt2YXIgdj17Y2VudGVyOntsZWZ0Oi41LHJpZ2h0Oi41fSxsZWZ0OntsZWZ0OjAscmlnaHQ6MX0scmlnaHQ6e3JpZ2h0OjAsbGVmdDoxfX07cmV0dXJuIHAuc2V0Q2VsbEFsaWduPWZ1bmN0aW9uKCl7dmFyIHQ9dlt0aGlzLm9wdGlvbnMuY2VsbEFsaWduXTt0aGlzLmNlbGxBbGlnbj10P3RbdGhpcy5vcmlnaW5TaWRlXTp0aGlzLm9wdGlvbnMuY2VsbEFsaWdufSxwLnNldEdhbGxlcnlTaXplPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLnNldEdhbGxlcnlTaXplKXt2YXIgdD10aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQmJnRoaXMuc2VsZWN0ZWRTbGlkZT90aGlzLnNlbGVjdGVkU2xpZGUuaGVpZ2h0OnRoaXMubWF4Q2VsbEhlaWdodDt0aGlzLnZpZXdwb3J0LnN0eWxlLmhlaWdodD10K1wicHhcIn19LHAuX2dldFdyYXBTaGlmdENlbGxzPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLndyYXBBcm91bmQpe3RoaXMuX3Vuc2hpZnRDZWxscyh0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMpLHRoaXMuX3Vuc2hpZnRDZWxscyh0aGlzLmFmdGVyU2hpZnRDZWxscyk7dmFyIHQ9dGhpcy5jdXJzb3JQb3NpdGlvbixlPXRoaXMuY2VsbHMubGVuZ3RoLTE7dGhpcy5iZWZvcmVTaGlmdENlbGxzPXRoaXMuX2dldEdhcENlbGxzKHQsZSwtMSksdD10aGlzLnNpemUuaW5uZXJXaWR0aC10aGlzLmN1cnNvclBvc2l0aW9uLHRoaXMuYWZ0ZXJTaGlmdENlbGxzPXRoaXMuX2dldEdhcENlbGxzKHQsMCwxKX19LHAuX2dldEdhcENlbGxzPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49W107dD4wOyl7dmFyIHM9dGhpcy5jZWxsc1tlXTtpZighcylicmVhaztuLnB1c2gocyksZSs9aSx0LT1zLnNpemUub3V0ZXJXaWR0aH1yZXR1cm4gbn0scC5fY29udGFpblNsaWRlcz1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5jb250YWluJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQsZT10P1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixpPXQ/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiLG49dGhpcy5zbGlkZWFibGVXaWR0aC10aGlzLmdldExhc3RDZWxsKCkuc2l6ZVtpXSxzPW48dGhpcy5zaXplLmlubmVyV2lkdGgsbz10aGlzLmN1cnNvclBvc2l0aW9uK3RoaXMuY2VsbHNbMF0uc2l6ZVtlXSxyPW4tdGhpcy5zaXplLmlubmVyV2lkdGgqKDEtdGhpcy5jZWxsQWxpZ24pO3RoaXMuc2xpZGVzLmZvckVhY2goZnVuY3Rpb24odCl7cz90LnRhcmdldD1uKnRoaXMuY2VsbEFsaWduOih0LnRhcmdldD1NYXRoLm1heCh0LnRhcmdldCxvKSx0LnRhcmdldD1NYXRoLm1pbih0LnRhcmdldCxyKSl9LHRoaXMpfX0scC5kaXNwYXRjaEV2ZW50PWZ1bmN0aW9uKHQsZSxpKXt2YXIgbj1lP1tlXS5jb25jYXQoaSk6aTtpZih0aGlzLmVtaXRFdmVudCh0LG4pLGgmJnRoaXMuJGVsZW1lbnQpe3QrPXRoaXMub3B0aW9ucy5uYW1lc3BhY2VKUXVlcnlFdmVudHM/XCIuZmxpY2tpdHlcIjpcIlwiO3ZhciBzPXQ7aWYoZSl7dmFyIG89aC5FdmVudChlKTtvLnR5cGU9dCxzPW99dGhpcy4kZWxlbWVudC50cmlnZ2VyKHMsaSl9fSxwLnNlbGVjdD1mdW5jdGlvbih0LGUsaSl7dGhpcy5pc0FjdGl2ZSYmKHQ9cGFyc2VJbnQodCwxMCksdGhpcy5fd3JhcFNlbGVjdCh0KSwodGhpcy5vcHRpb25zLndyYXBBcm91bmR8fGUpJiYodD1uLm1vZHVsbyh0LHRoaXMuc2xpZGVzLmxlbmd0aCkpLHRoaXMuc2xpZGVzW3RdJiYodGhpcy5zZWxlY3RlZEluZGV4PXQsdGhpcy51cGRhdGVTZWxlY3RlZFNsaWRlKCksaT90aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpOnRoaXMuc3RhcnRBbmltYXRpb24oKSx0aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQmJnRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJzZWxlY3RcIiksdGhpcy5kaXNwYXRjaEV2ZW50KFwiY2VsbFNlbGVjdFwiKSkpfSxwLl93cmFwU2VsZWN0PWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuc2xpZGVzLmxlbmd0aCxpPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZlPjE7aWYoIWkpcmV0dXJuIHQ7dmFyIHM9bi5tb2R1bG8odCxlKSxvPU1hdGguYWJzKHMtdGhpcy5zZWxlY3RlZEluZGV4KSxyPU1hdGguYWJzKHMrZS10aGlzLnNlbGVjdGVkSW5kZXgpLGE9TWF0aC5hYnMocy1lLXRoaXMuc2VsZWN0ZWRJbmRleCk7IXRoaXMuaXNEcmFnU2VsZWN0JiZyPG8/dCs9ZTohdGhpcy5pc0RyYWdTZWxlY3QmJmE8byYmKHQtPWUpLHQ8MD90aGlzLngtPXRoaXMuc2xpZGVhYmxlV2lkdGg6dD49ZSYmKHRoaXMueCs9dGhpcy5zbGlkZWFibGVXaWR0aCl9LHAucHJldmlvdXM9ZnVuY3Rpb24odCxlKXt0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgtMSx0LGUpfSxwLm5leHQ9ZnVuY3Rpb24odCxlKXt0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgrMSx0LGUpfSxwLnVwZGF0ZVNlbGVjdGVkU2xpZGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnNsaWRlc1t0aGlzLnNlbGVjdGVkSW5kZXhdO3QmJih0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpLHRoaXMuc2VsZWN0ZWRTbGlkZT10LHQuc2VsZWN0KCksdGhpcy5zZWxlY3RlZENlbGxzPXQuY2VsbHMsdGhpcy5zZWxlY3RlZEVsZW1lbnRzPXQuZ2V0Q2VsbEVsZW1lbnRzKCksdGhpcy5zZWxlY3RlZENlbGw9dC5jZWxsc1swXSx0aGlzLnNlbGVjdGVkRWxlbWVudD10aGlzLnNlbGVjdGVkRWxlbWVudHNbMF0pfSxwLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZT1mdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWRTbGlkZSYmdGhpcy5zZWxlY3RlZFNsaWRlLnVuc2VsZWN0KCl9LHAuc2VsZWN0Q2VsbD1mdW5jdGlvbih0LGUsaSl7dmFyIG47XCJudW1iZXJcIj09dHlwZW9mIHQ/bj10aGlzLmNlbGxzW3RdOihcInN0cmluZ1wiPT10eXBlb2YgdCYmKHQ9dGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IodCkpLG49dGhpcy5nZXRDZWxsKHQpKTtmb3IodmFyIHM9MDtuJiZzPHRoaXMuc2xpZGVzLmxlbmd0aDtzKyspe3ZhciBvPXRoaXMuc2xpZGVzW3NdLHI9by5jZWxscy5pbmRleE9mKG4pO2lmKHIhPS0xKXJldHVybiB2b2lkIHRoaXMuc2VsZWN0KHMsZSxpKX19LHAuZ2V0Q2VsbD1mdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHRoaXMuY2VsbHMubGVuZ3RoO2UrKyl7dmFyIGk9dGhpcy5jZWxsc1tlXTtpZihpLmVsZW1lbnQ9PXQpcmV0dXJuIGl9fSxwLmdldENlbGxzPWZ1bmN0aW9uKHQpe3Q9bi5tYWtlQXJyYXkodCk7dmFyIGU9W107cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgaT10aGlzLmdldENlbGwodCk7aSYmZS5wdXNoKGkpfSx0aGlzKSxlfSxwLmdldENlbGxFbGVtZW50cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSl9LHAuZ2V0UGFyZW50Q2VsbD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldENlbGwodCk7cmV0dXJuIGU/ZToodD1uLmdldFBhcmVudCh0LFwiLmZsaWNraXR5LXNsaWRlciA+ICpcIiksdGhpcy5nZXRDZWxsKHQpKX0scC5nZXRBZGphY2VudENlbGxFbGVtZW50cz1mdW5jdGlvbih0LGUpe2lmKCF0KXJldHVybiB0aGlzLnNlbGVjdGVkU2xpZGUuZ2V0Q2VsbEVsZW1lbnRzKCk7ZT12b2lkIDA9PT1lP3RoaXMuc2VsZWN0ZWRJbmRleDplO3ZhciBpPXRoaXMuc2xpZGVzLmxlbmd0aDtpZigxKzIqdD49aSlyZXR1cm4gdGhpcy5nZXRDZWxsRWxlbWVudHMoKTtmb3IodmFyIHM9W10sbz1lLXQ7bzw9ZSt0O28rKyl7dmFyIHI9dGhpcy5vcHRpb25zLndyYXBBcm91bmQ/bi5tb2R1bG8obyxpKTpvLGE9dGhpcy5zbGlkZXNbcl07YSYmKHM9cy5jb25jYXQoYS5nZXRDZWxsRWxlbWVudHMoKSkpfXJldHVybiBzfSxwLnVpQ2hhbmdlPWZ1bmN0aW9uKCl7dGhpcy5lbWl0RXZlbnQoXCJ1aUNoYW5nZVwiKX0scC5jaGlsZFVJUG9pbnRlckRvd249ZnVuY3Rpb24odCl7dGhpcy5lbWl0RXZlbnQoXCJjaGlsZFVJUG9pbnRlckRvd25cIixbdF0pfSxwLm9ucmVzaXplPWZ1bmN0aW9uKCl7dGhpcy53YXRjaENTUygpLHRoaXMucmVzaXplKCl9LG4uZGVib3VuY2VNZXRob2QobCxcIm9ucmVzaXplXCIsMTUwKSxwLnJlc2l6ZT1mdW5jdGlvbigpe2lmKHRoaXMuaXNBY3RpdmUpe3RoaXMuZ2V0U2l6ZSgpLHRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiYodGhpcy54PW4ubW9kdWxvKHRoaXMueCx0aGlzLnNsaWRlYWJsZVdpZHRoKSksdGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5lbWl0RXZlbnQoXCJyZXNpemVcIik7dmFyIHQ9dGhpcy5zZWxlY3RlZEVsZW1lbnRzJiZ0aGlzLnNlbGVjdGVkRWxlbWVudHNbMF07dGhpcy5zZWxlY3RDZWxsKHQsITEsITApfX0scC53YXRjaENTUz1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy53YXRjaENTUztpZih0KXt2YXIgZT1jKHRoaXMuZWxlbWVudCxcIjphZnRlclwiKS5jb250ZW50O2UuaW5kZXhPZihcImZsaWNraXR5XCIpIT0tMT90aGlzLmFjdGl2YXRlKCk6dGhpcy5kZWFjdGl2YXRlKCl9fSxwLm9ua2V5ZG93bj1mdW5jdGlvbih0KXtpZih0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKCFkb2N1bWVudC5hY3RpdmVFbGVtZW50fHxkb2N1bWVudC5hY3RpdmVFbGVtZW50PT10aGlzLmVsZW1lbnQpKWlmKDM3PT10LmtleUNvZGUpe3ZhciBlPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cIm5leHRcIjpcInByZXZpb3VzXCI7dGhpcy51aUNoYW5nZSgpLHRoaXNbZV0oKX1lbHNlIGlmKDM5PT10LmtleUNvZGUpe3ZhciBpPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cInByZXZpb3VzXCI6XCJuZXh0XCI7dGhpcy51aUNoYW5nZSgpLHRoaXNbaV0oKX19LHAuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuaXNBY3RpdmUmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZsaWNraXR5LWVuYWJsZWRcIiksdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlja2l0eS1ydGxcIiksdGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QuZGVzdHJveSgpfSksdGhpcy51bnNlbGVjdFNlbGVjdGVkU2xpZGUoKSx0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy52aWV3cG9ydCksYSh0aGlzLnNsaWRlci5jaGlsZHJlbix0aGlzLmVsZW1lbnQpLHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYodGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShcInRhYkluZGV4XCIpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMpKSx0aGlzLmlzQWN0aXZlPSExLHRoaXMuZW1pdEV2ZW50KFwiZGVhY3RpdmF0ZVwiKSl9LHAuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpLHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMpLHRoaXMuZW1pdEV2ZW50KFwiZGVzdHJveVwiKSxoJiZ0aGlzLiRlbGVtZW50JiZoLnJlbW92ZURhdGEodGhpcy5lbGVtZW50LFwiZmxpY2tpdHlcIiksZGVsZXRlIHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQsZGVsZXRlIGZbdGhpcy5ndWlkXX0sbi5leHRlbmQocCxyKSxsLmRhdGE9ZnVuY3Rpb24odCl7dD1uLmdldFF1ZXJ5RWxlbWVudCh0KTt2YXIgZT10JiZ0LmZsaWNraXR5R1VJRDtyZXR1cm4gZSYmZltlXX0sbi5odG1sSW5pdChsLFwiZmxpY2tpdHlcIiksaCYmaC5icmlkZ2V0JiZoLmJyaWRnZXQoXCJmbGlja2l0eVwiLGwpLGwuQ2VsbD1zLGx9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSk6dC5Vbmlwb2ludGVyPWUodCx0LkV2RW1pdHRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkoKXt9ZnVuY3Rpb24gbigpe312YXIgcz1uLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtzLmJpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKHQpe3RoaXMuX2JpbmRTdGFydEV2ZW50KHQsITApfSxzLnVuYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24odCl7dGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMSl9LHMuX2JpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKGUsaSl7aT12b2lkIDA9PT1pfHwhIWk7dmFyIG49aT9cImFkZEV2ZW50TGlzdGVuZXJcIjpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIjt0Lm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZD9lW25dKFwicG9pbnRlcmRvd25cIix0aGlzKTp0Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkP2Vbbl0oXCJNU1BvaW50ZXJEb3duXCIsdGhpcyk6KGVbbl0oXCJtb3VzZWRvd25cIix0aGlzKSxlW25dKFwidG91Y2hzdGFydFwiLHRoaXMpKX0scy5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LHMuZ2V0VG91Y2g9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspe3ZhciBpPXRbZV07aWYoaS5pZGVudGlmaWVyPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyKXJldHVybiBpfX0scy5vbm1vdXNlZG93bj1mdW5jdGlvbih0KXt2YXIgZT10LmJ1dHRvbjtlJiYwIT09ZSYmMSE9PWV8fHRoaXMuX3BvaW50ZXJEb3duKHQsdCl9LHMub250b3VjaHN0YXJ0PWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJEb3duKHQsdC5jaGFuZ2VkVG91Y2hlc1swXSl9LHMub25NU1BvaW50ZXJEb3duPXMub25wb2ludGVyZG93bj1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyRG93bih0LHQpfSxzLl9wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe3RoaXMuaXNQb2ludGVyRG93bnx8KHRoaXMuaXNQb2ludGVyRG93bj0hMCx0aGlzLnBvaW50ZXJJZGVudGlmaWVyPXZvaWQgMCE9PWUucG9pbnRlcklkP2UucG9pbnRlcklkOmUuaWRlbnRpZmllcix0aGlzLnBvaW50ZXJEb3duKHQsZSkpfSxzLnBvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7dGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyh0KSx0aGlzLmVtaXRFdmVudChcInBvaW50ZXJEb3duXCIsW3QsZV0pfTt2YXIgbz17bW91c2Vkb3duOltcIm1vdXNlbW92ZVwiLFwibW91c2V1cFwiXSx0b3VjaHN0YXJ0OltcInRvdWNobW92ZVwiLFwidG91Y2hlbmRcIixcInRvdWNoY2FuY2VsXCJdLHBvaW50ZXJkb3duOltcInBvaW50ZXJtb3ZlXCIsXCJwb2ludGVydXBcIixcInBvaW50ZXJjYW5jZWxcIl0sTVNQb2ludGVyRG93bjpbXCJNU1BvaW50ZXJNb3ZlXCIsXCJNU1BvaW50ZXJVcFwiLFwiTVNQb2ludGVyQ2FuY2VsXCJdfTtyZXR1cm4gcy5fYmluZFBvc3RTdGFydEV2ZW50cz1mdW5jdGlvbihlKXtpZihlKXt2YXIgaT1vW2UudHlwZV07aS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuYWRkRXZlbnRMaXN0ZW5lcihlLHRoaXMpfSx0aGlzKSx0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHM9aX19LHMuX3VuYmluZFBvc3RTdGFydEV2ZW50cz1mdW5jdGlvbigpe3RoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyYmKHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLHRoaXMpfSx0aGlzKSxkZWxldGUgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzKX0scy5vbm1vdXNlbW92ZT1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyTW92ZSh0LHQpfSxzLm9uTVNQb2ludGVyTW92ZT1zLm9ucG9pbnRlcm1vdmU9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJNb3ZlKHQsdCl9LHMub250b3VjaG1vdmU9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyTW92ZSh0LGUpfSxzLl9wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3RoaXMucG9pbnRlck1vdmUodCxlKX0scy5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlck1vdmVcIixbdCxlXSl9LHMub25tb3VzZXVwPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJVcCh0LHQpfSxzLm9uTVNQb2ludGVyVXA9cy5vbnBvaW50ZXJ1cD1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlclVwKHQsdCl9LHMub250b3VjaGVuZD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJVcCh0LGUpfSxzLl9wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLl9wb2ludGVyRG9uZSgpLHRoaXMucG9pbnRlclVwKHQsZSl9LHMucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyVXBcIixbdCxlXSl9LHMuX3BvaW50ZXJEb25lPWZ1bmN0aW9uKCl7dGhpcy5pc1BvaW50ZXJEb3duPSExLGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyLHRoaXMuX3VuYmluZFBvc3RTdGFydEV2ZW50cygpLHRoaXMucG9pbnRlckRvbmUoKX0scy5wb2ludGVyRG9uZT1pLHMub25NU1BvaW50ZXJDYW5jZWw9cy5vbnBvaW50ZXJjYW5jZWw9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJDYW5jZWwodCx0KX0scy5vbnRvdWNoY2FuY2VsPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlckNhbmNlbCh0LGUpfSxzLl9wb2ludGVyQ2FuY2VsPWZ1bmN0aW9uKHQsZSl7dGhpcy5fcG9pbnRlckRvbmUoKSx0aGlzLnBvaW50ZXJDYW5jZWwodCxlKX0scy5wb2ludGVyQ2FuY2VsPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyQ2FuY2VsXCIsW3QsZV0pfSxuLmdldFBvaW50ZXJQb2ludD1mdW5jdGlvbih0KXtyZXR1cm57eDp0LnBhZ2VYLHk6dC5wYWdlWX19LG59KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ1bmlkcmFnZ2VyL3VuaWRyYWdnZXJcIixbXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwidW5pcG9pbnRlclwiKSk6dC5VbmlkcmFnZ2VyPWUodCx0LlVuaXBvaW50ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7fWZ1bmN0aW9uIG4oKXt9dmFyIHM9bi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cy5iaW5kSGFuZGxlcz1mdW5jdGlvbigpe3RoaXMuX2JpbmRIYW5kbGVzKCEwKX0scy51bmJpbmRIYW5kbGVzPWZ1bmN0aW9uKCl7dGhpcy5fYmluZEhhbmRsZXMoITEpfTt2YXIgbz10Lm5hdmlnYXRvcjtyZXR1cm4gcy5fYmluZEhhbmRsZXM9ZnVuY3Rpb24odCl7dD12b2lkIDA9PT10fHwhIXQ7dmFyIGU7ZT1vLnBvaW50ZXJFbmFibGVkP2Z1bmN0aW9uKGUpe2Uuc3R5bGUudG91Y2hBY3Rpb249dD9cIm5vbmVcIjpcIlwifTpvLm1zUG9pbnRlckVuYWJsZWQ/ZnVuY3Rpb24oZSl7ZS5zdHlsZS5tc1RvdWNoQWN0aW9uPXQ/XCJub25lXCI6XCJcIn06aTtmb3IodmFyIG49dD9cImFkZEV2ZW50TGlzdGVuZXJcIjpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIixzPTA7czx0aGlzLmhhbmRsZXMubGVuZ3RoO3MrKyl7dmFyIHI9dGhpcy5oYW5kbGVzW3NdO3RoaXMuX2JpbmRTdGFydEV2ZW50KHIsdCksZShyKSxyW25dKFwiY2xpY2tcIix0aGlzKX19LHMucG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXtpZihcIklOUFVUXCI9PXQudGFyZ2V0Lm5vZGVOYW1lJiZcInJhbmdlXCI9PXQudGFyZ2V0LnR5cGUpcmV0dXJuIHRoaXMuaXNQb2ludGVyRG93bj0hMSx2b2lkIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO3RoaXMuX2RyYWdQb2ludGVyRG93bih0LGUpO3ZhciBpPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7aSYmaS5ibHVyJiZpLmJsdXIoKSx0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKHQpLHRoaXMuZW1pdEV2ZW50KFwicG9pbnRlckRvd25cIixbdCxlXSl9LHMuX2RyYWdQb2ludGVyRG93bj1mdW5jdGlvbih0LGkpe3RoaXMucG9pbnRlckRvd25Qb2ludD1lLmdldFBvaW50ZXJQb2ludChpKTt2YXIgbj10aGlzLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bih0LGkpO24mJnQucHJldmVudERlZmF1bHQoKX0scy5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd249ZnVuY3Rpb24odCl7cmV0dXJuXCJTRUxFQ1RcIiE9dC50YXJnZXQubm9kZU5hbWV9LHMucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9kcmFnUG9pbnRlck1vdmUodCxlKTt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJNb3ZlXCIsW3QsZSxpXSksdGhpcy5fZHJhZ01vdmUodCxlLGkpfSxzLl9kcmFnUG9pbnRlck1vdmU9ZnVuY3Rpb24odCxpKXt2YXIgbj1lLmdldFBvaW50ZXJQb2ludChpKSxzPXt4Om4ueC10aGlzLnBvaW50ZXJEb3duUG9pbnQueCx5Om4ueS10aGlzLnBvaW50ZXJEb3duUG9pbnQueX07cmV0dXJuIXRoaXMuaXNEcmFnZ2luZyYmdGhpcy5oYXNEcmFnU3RhcnRlZChzKSYmdGhpcy5fZHJhZ1N0YXJ0KHQsaSksc30scy5oYXNEcmFnU3RhcnRlZD1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5hYnModC54KT4zfHxNYXRoLmFicyh0LnkpPjN9LHMucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyVXBcIixbdCxlXSksdGhpcy5fZHJhZ1BvaW50ZXJVcCh0LGUpfSxzLl9kcmFnUG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0RyYWdnaW5nP3RoaXMuX2RyYWdFbmQodCxlKTp0aGlzLl9zdGF0aWNDbGljayh0LGUpfSxzLl9kcmFnU3RhcnQ9ZnVuY3Rpb24odCxpKXt0aGlzLmlzRHJhZ2dpbmc9ITAsdGhpcy5kcmFnU3RhcnRQb2ludD1lLmdldFBvaW50ZXJQb2ludChpKSx0aGlzLmlzUHJldmVudGluZ0NsaWNrcz0hMCx0aGlzLmRyYWdTdGFydCh0LGkpfSxzLmRyYWdTdGFydD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwiZHJhZ1N0YXJ0XCIsW3QsZV0pfSxzLl9kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dGhpcy5pc0RyYWdnaW5nJiZ0aGlzLmRyYWdNb3ZlKHQsZSxpKX0scy5kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMuZW1pdEV2ZW50KFwiZHJhZ01vdmVcIixbdCxlLGldKX0scy5fZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMuaXNEcmFnZ2luZz0hMSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzfS5iaW5kKHRoaXMpKSx0aGlzLmRyYWdFbmQodCxlKX0scy5kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJkcmFnRW5kXCIsW3QsZV0pfSxzLm9uY2xpY2s9ZnVuY3Rpb24odCl7dGhpcy5pc1ByZXZlbnRpbmdDbGlja3MmJnQucHJldmVudERlZmF1bHQoKX0scy5fc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXtpZighdGhpcy5pc0lnbm9yaW5nTW91c2VVcHx8XCJtb3VzZXVwXCIhPXQudHlwZSl7dmFyIGk9dC50YXJnZXQubm9kZU5hbWU7XCJJTlBVVFwiIT1pJiZcIlRFWFRBUkVBXCIhPWl8fHQudGFyZ2V0LmZvY3VzKCksdGhpcy5zdGF0aWNDbGljayh0LGUpLFwibW91c2V1cFwiIT10LnR5cGUmJih0aGlzLmlzSWdub3JpbmdNb3VzZVVwPSEwLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc0lnbm9yaW5nTW91c2VVcH0uYmluZCh0aGlzKSw0MDApKX19LHMuc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInN0YXRpY0NsaWNrXCIsW3QsZV0pfSxuLmdldFBvaW50ZXJQb2ludD1lLmdldFBvaW50ZXJQb2ludCxufSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvZHJhZ1wiLFtcIi4vZmxpY2tpdHlcIixcInVuaWRyYWdnZXIvdW5pZHJhZ2dlclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ1bmlkcmFnZ2VyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6dC5GbGlja2l0eT1lKHQsdC5GbGlja2l0eSx0LlVuaWRyYWdnZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7ZnVuY3Rpb24gcygpe3JldHVybnt4OnQucGFnZVhPZmZzZXQseTp0LnBhZ2VZT2Zmc2V0fX1uLmV4dGVuZChlLmRlZmF1bHRzLHtkcmFnZ2FibGU6ITAsZHJhZ1RocmVzaG9sZDozfSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlRHJhZ1wiKTt2YXIgbz1lLnByb3RvdHlwZTtuLmV4dGVuZChvLGkucHJvdG90eXBlKTt2YXIgcj1cImNyZWF0ZVRvdWNoXCJpbiBkb2N1bWVudCxhPSExO28uX2NyZWF0ZURyYWc9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmJpbmREcmFnKSx0aGlzLm9uKFwidWlDaGFuZ2VcIix0aGlzLl91aUNoYW5nZURyYWcpLHRoaXMub24oXCJjaGlsZFVJUG9pbnRlckRvd25cIix0aGlzLl9jaGlsZFVJUG9pbnRlckRvd25EcmFnKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMudW5iaW5kRHJhZyksciYmIWEmJih0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixmdW5jdGlvbigpe30pLGE9ITApfSxvLmJpbmREcmFnPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmRyYWdnYWJsZSYmIXRoaXMuaXNEcmFnQm91bmQmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImlzLWRyYWdnYWJsZVwiKSx0aGlzLmhhbmRsZXM9W3RoaXMudmlld3BvcnRdLHRoaXMuYmluZEhhbmRsZXMoKSx0aGlzLmlzRHJhZ0JvdW5kPSEwKX0sby51bmJpbmREcmFnPWZ1bmN0aW9uKCl7dGhpcy5pc0RyYWdCb3VuZCYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtZHJhZ2dhYmxlXCIpLHRoaXMudW5iaW5kSGFuZGxlcygpLGRlbGV0ZSB0aGlzLmlzRHJhZ0JvdW5kKX0sby5fdWlDaGFuZ2VEcmFnPWZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nfSxvLl9jaGlsZFVJUG9pbnRlckRvd25EcmFnPWZ1bmN0aW9uKHQpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLnBvaW50ZXJEb3duRm9jdXModCl9O3ZhciBsPXtURVhUQVJFQTohMCxJTlBVVDohMCxPUFRJT046ITB9LGg9e3JhZGlvOiEwLGNoZWNrYm94OiEwLGJ1dHRvbjohMCxzdWJtaXQ6ITAsaW1hZ2U6ITAsZmlsZTohMH07by5wb2ludGVyRG93bj1mdW5jdGlvbihlLGkpe3ZhciBuPWxbZS50YXJnZXQubm9kZU5hbWVdJiYhaFtlLnRhcmdldC50eXBlXTtpZihuKXJldHVybiB0aGlzLmlzUG9pbnRlckRvd249ITEsdm9pZCBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjt0aGlzLl9kcmFnUG9pbnRlckRvd24oZSxpKTt2YXIgbz1kb2N1bWVudC5hY3RpdmVFbGVtZW50O28mJm8uYmx1ciYmbyE9dGhpcy5lbGVtZW50JiZvIT1kb2N1bWVudC5ib2R5JiZvLmJsdXIoKSx0aGlzLnBvaW50ZXJEb3duRm9jdXMoZSksdGhpcy5kcmFnWD10aGlzLngsdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QuYWRkKFwiaXMtcG9pbnRlci1kb3duXCIpLHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoZSksdGhpcy5wb2ludGVyRG93blNjcm9sbD1zKCksdC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksdGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlckRvd25cIixlLFtpXSl9O3ZhciBjPXt0b3VjaHN0YXJ0OiEwLE1TUG9pbnRlckRvd246ITB9LGQ9e0lOUFVUOiEwLFNFTEVDVDohMH07cmV0dXJuIG8ucG9pbnRlckRvd25Gb2N1cz1mdW5jdGlvbihlKXtpZih0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmIWNbZS50eXBlXSYmIWRbZS50YXJnZXQubm9kZU5hbWVdKXt2YXIgaT10LnBhZ2VZT2Zmc2V0O3RoaXMuZWxlbWVudC5mb2N1cygpLHQucGFnZVlPZmZzZXQhPWkmJnQuc2Nyb2xsVG8odC5wYWdlWE9mZnNldCxpKX19LG8uY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3ZhciBlPVwidG91Y2hzdGFydFwiPT10LnR5cGUsaT10LnRhcmdldC5ub2RlTmFtZTtyZXR1cm4hZSYmXCJTRUxFQ1RcIiE9aX0sby5oYXNEcmFnU3RhcnRlZD1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5hYnModC54KT50aGlzLm9wdGlvbnMuZHJhZ1RocmVzaG9sZH0sby5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXtkZWxldGUgdGhpcy5pc1RvdWNoU2Nyb2xsaW5nLHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LnJlbW92ZShcImlzLXBvaW50ZXItZG93blwiKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyVXBcIix0LFtlXSksdGhpcy5fZHJhZ1BvaW50ZXJVcCh0LGUpfSxvLnBvaW50ZXJEb25lPWZ1bmN0aW9uKCl7dC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksZGVsZXRlIHRoaXMucG9pbnRlckRvd25TY3JvbGx9LG8uZHJhZ1N0YXJ0PWZ1bmN0aW9uKGUsaSl7dGhpcy5kcmFnU3RhcnRQb3NpdGlvbj10aGlzLngsdGhpcy5zdGFydEFuaW1hdGlvbigpLHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdTdGFydFwiLGUsW2ldKX0sby5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2RyYWdQb2ludGVyTW92ZSh0LGUpO3RoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJNb3ZlXCIsdCxbZSxpXSksdGhpcy5fZHJhZ01vdmUodCxlLGkpfSxvLmRyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wcmV2aW91c0RyYWdYPXRoaXMuZHJhZ1g7dmFyIG49dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0Py0xOjEscz10aGlzLmRyYWdTdGFydFBvc2l0aW9uK2kueCpuO2lmKCF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5zbGlkZXMubGVuZ3RoKXt2YXIgbz1NYXRoLm1heCgtdGhpcy5zbGlkZXNbMF0udGFyZ2V0LHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24pO3M9cz5vPy41KihzK28pOnM7dmFyIHI9TWF0aC5taW4oLXRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0LHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24pO3M9czxyPy41KihzK3IpOnN9dGhpcy5kcmFnWD1zLHRoaXMuZHJhZ01vdmVUaW1lPW5ldyBEYXRlLHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdNb3ZlXCIsdCxbZSxpXSl9LG8uZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMub3B0aW9ucy5mcmVlU2Nyb2xsJiYodGhpcy5pc0ZyZWVTY3JvbGxpbmc9ITApO3ZhciBpPXRoaXMuZHJhZ0VuZFJlc3RpbmdTZWxlY3QoKTtpZih0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kKXt2YXIgbj10aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpO3RoaXMuaXNGcmVlU2Nyb2xsaW5nPS1uPnRoaXMuc2xpZGVzWzBdLnRhcmdldCYmLW48dGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXR9ZWxzZSB0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbHx8aSE9dGhpcy5zZWxlY3RlZEluZGV4fHwoaSs9dGhpcy5kcmFnRW5kQm9vc3RTZWxlY3QoKSk7ZGVsZXRlIHRoaXMucHJldmlvdXNEcmFnWCx0aGlzLmlzRHJhZ1NlbGVjdD10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCx0aGlzLnNlbGVjdChpKSxkZWxldGUgdGhpcy5pc0RyYWdTZWxlY3QsdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ0VuZFwiLHQsW2VdKX0sby5kcmFnRW5kUmVzdGluZ1NlbGVjdD1mdW5jdGlvbigpe1xudmFyIHQ9dGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKSxlPU1hdGguYWJzKHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdCx0aGlzLnNlbGVjdGVkSW5kZXgpKSxpPXRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKHQsZSwxKSxuPXRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKHQsZSwtMSkscz1pLmRpc3RhbmNlPG4uZGlzdGFuY2U/aS5pbmRleDpuLmluZGV4O3JldHVybiBzfSxvLl9nZXRDbG9zZXN0UmVzdGluZz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPXRoaXMuc2VsZWN0ZWRJbmRleCxzPTEvMCxvPXRoaXMub3B0aW9ucy5jb250YWluJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQ/ZnVuY3Rpb24odCxlKXtyZXR1cm4gdDw9ZX06ZnVuY3Rpb24odCxlKXtyZXR1cm4gdDxlfTtvKGUscykmJihuKz1pLHM9ZSxlPXRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdCxuKSxudWxsIT09ZSk7KWU9TWF0aC5hYnMoZSk7cmV0dXJue2Rpc3RhbmNlOnMsaW5kZXg6bi1pfX0sby5nZXRTbGlkZURpc3RhbmNlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5zbGlkZXMubGVuZ3RoLHM9dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJmk+MSxvPXM/bi5tb2R1bG8oZSxpKTplLHI9dGhpcy5zbGlkZXNbb107aWYoIXIpcmV0dXJuIG51bGw7dmFyIGE9cz90aGlzLnNsaWRlYWJsZVdpZHRoKk1hdGguZmxvb3IoZS9pKTowO3JldHVybiB0LShyLnRhcmdldCthKX0sby5kcmFnRW5kQm9vc3RTZWxlY3Q9ZnVuY3Rpb24oKXtpZih2b2lkIDA9PT10aGlzLnByZXZpb3VzRHJhZ1h8fCF0aGlzLmRyYWdNb3ZlVGltZXx8bmV3IERhdGUtdGhpcy5kcmFnTW92ZVRpbWU+MTAwKXJldHVybiAwO3ZhciB0PXRoaXMuZ2V0U2xpZGVEaXN0YW5jZSgtdGhpcy5kcmFnWCx0aGlzLnNlbGVjdGVkSW5kZXgpLGU9dGhpcy5wcmV2aW91c0RyYWdYLXRoaXMuZHJhZ1g7cmV0dXJuIHQ+MCYmZT4wPzE6dDwwJiZlPDA/LTE6MH0sby5zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuZ2V0UGFyZW50Q2VsbCh0LnRhcmdldCksbj1pJiZpLmVsZW1lbnQscz1pJiZ0aGlzLmNlbGxzLmluZGV4T2YoaSk7dGhpcy5kaXNwYXRjaEV2ZW50KFwic3RhdGljQ2xpY2tcIix0LFtlLG4sc10pfSxvLm9uc2Nyb2xsPWZ1bmN0aW9uKCl7dmFyIHQ9cygpLGU9dGhpcy5wb2ludGVyRG93blNjcm9sbC54LXQueCxpPXRoaXMucG9pbnRlckRvd25TY3JvbGwueS10Lnk7KE1hdGguYWJzKGUpPjN8fE1hdGguYWJzKGkpPjMpJiZ0aGlzLl9wb2ludGVyRG9uZSgpfSxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFtcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJ1bmlwb2ludGVyXCIpKTp0LlRhcExpc3RlbmVyPWUodCx0LlVuaXBvaW50ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQpe3RoaXMuYmluZFRhcCh0KX12YXIgbj1pLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtyZXR1cm4gbi5iaW5kVGFwPWZ1bmN0aW9uKHQpe3QmJih0aGlzLnVuYmluZFRhcCgpLHRoaXMudGFwRWxlbWVudD10LHRoaXMuX2JpbmRTdGFydEV2ZW50KHQsITApKX0sbi51bmJpbmRUYXA9ZnVuY3Rpb24oKXt0aGlzLnRhcEVsZW1lbnQmJih0aGlzLl9iaW5kU3RhcnRFdmVudCh0aGlzLnRhcEVsZW1lbnQsITApLGRlbGV0ZSB0aGlzLnRhcEVsZW1lbnQpfSxuLnBvaW50ZXJVcD1mdW5jdGlvbihpLG4pe2lmKCF0aGlzLmlzSWdub3JpbmdNb3VzZVVwfHxcIm1vdXNldXBcIiE9aS50eXBlKXt2YXIgcz1lLmdldFBvaW50ZXJQb2ludChuKSxvPXRoaXMudGFwRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxyPXQucGFnZVhPZmZzZXQsYT10LnBhZ2VZT2Zmc2V0LGw9cy54Pj1vLmxlZnQrciYmcy54PD1vLnJpZ2h0K3ImJnMueT49by50b3ArYSYmcy55PD1vLmJvdHRvbSthO2lmKGwmJnRoaXMuZW1pdEV2ZW50KFwidGFwXCIsW2ksbl0pLFwibW91c2V1cFwiIT1pLnR5cGUpe3RoaXMuaXNJZ25vcmluZ01vdXNlVXA9ITA7dmFyIGg9dGhpcztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIGguaXNJZ25vcmluZ01vdXNlVXB9LDQwMCl9fX0sbi5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5wb2ludGVyRG9uZSgpLHRoaXMudW5iaW5kVGFwKCl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wcmV2LW5leHQtYnV0dG9uXCIsW1wiLi9mbGlja2l0eVwiLFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ0YXAtbGlzdGVuZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LlRhcExpc3RlbmVyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHModCxlKXt0aGlzLmRpcmVjdGlvbj10LHRoaXMucGFyZW50PWUsdGhpcy5fY3JlYXRlKCl9ZnVuY3Rpb24gbyh0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdD90OlwiTSBcIit0LngwK1wiLDUwIEwgXCIrdC54MStcIixcIisodC55MSs1MCkrXCIgTCBcIit0LngyK1wiLFwiKyh0LnkyKzUwKStcIiBMIFwiK3QueDMrXCIsNTAgIEwgXCIrdC54MitcIixcIisoNTAtdC55MikrXCIgTCBcIit0LngxK1wiLFwiKyg1MC10LnkxKStcIiBaXCJ9dmFyIHI9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO3MucHJvdG90eXBlPW5ldyBpLHMucHJvdG90eXBlLl9jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZD0hMCx0aGlzLmlzUHJldmlvdXM9dGhpcy5kaXJlY3Rpb249PS0xO3ZhciB0PXRoaXMucGFyZW50Lm9wdGlvbnMucmlnaHRUb0xlZnQ/MTotMTt0aGlzLmlzTGVmdD10aGlzLmRpcmVjdGlvbj09dDt2YXIgZT10aGlzLmVsZW1lbnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtlLmNsYXNzTmFtZT1cImZsaWNraXR5LXByZXYtbmV4dC1idXR0b25cIixlLmNsYXNzTmFtZSs9dGhpcy5pc1ByZXZpb3VzP1wiIHByZXZpb3VzXCI6XCIgbmV4dFwiLGUuc2V0QXR0cmlidXRlKFwidHlwZVwiLFwiYnV0dG9uXCIpLHRoaXMuZGlzYWJsZSgpLGUuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLHRoaXMuaXNQcmV2aW91cz9cInByZXZpb3VzXCI6XCJuZXh0XCIpO3ZhciBpPXRoaXMuY3JlYXRlU1ZHKCk7ZS5hcHBlbmRDaGlsZChpKSx0aGlzLm9uKFwidGFwXCIsdGhpcy5vblRhcCksdGhpcy5wYXJlbnQub24oXCJzZWxlY3RcIix0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCh0aGlzLnBhcmVudCkpfSxzLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuYmluZFRhcCh0aGlzLmVsZW1lbnQpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzKSx0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCl9LHMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnBhcmVudC5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCksaS5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIix0aGlzKX0scy5wcm90b3R5cGUuY3JlYXRlU1ZHPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHIsXCJzdmdcIik7dC5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsXCIwIDAgMTAwIDEwMFwiKTt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMocixcInBhdGhcIiksaT1vKHRoaXMucGFyZW50Lm9wdGlvbnMuYXJyb3dTaGFwZSk7cmV0dXJuIGUuc2V0QXR0cmlidXRlKFwiZFwiLGkpLGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIixcImFycm93XCIpLHRoaXMuaXNMZWZ0fHxlLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLFwidHJhbnNsYXRlKDEwMCwgMTAwKSByb3RhdGUoMTgwKSBcIiksdC5hcHBlbmRDaGlsZChlKSx0fSxzLnByb3RvdHlwZS5vblRhcD1mdW5jdGlvbigpe2lmKHRoaXMuaXNFbmFibGVkKXt0aGlzLnBhcmVudC51aUNoYW5nZSgpO3ZhciB0PXRoaXMuaXNQcmV2aW91cz9cInByZXZpb3VzXCI6XCJuZXh0XCI7dGhpcy5wYXJlbnRbdF0oKX19LHMucHJvdG90eXBlLmhhbmRsZUV2ZW50PW4uaGFuZGxlRXZlbnQscy5wcm90b3R5cGUub25jbGljaz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7dCYmdD09dGhpcy5lbGVtZW50JiZ0aGlzLm9uVGFwKCl9LHMucHJvdG90eXBlLmVuYWJsZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkfHwodGhpcy5lbGVtZW50LmRpc2FibGVkPSExLHRoaXMuaXNFbmFibGVkPSEwKX0scy5wcm90b3R5cGUuZGlzYWJsZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkJiYodGhpcy5lbGVtZW50LmRpc2FibGVkPSEwLHRoaXMuaXNFbmFibGVkPSExKX0scy5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5wYXJlbnQuc2xpZGVzO2lmKHRoaXMucGFyZW50Lm9wdGlvbnMud3JhcEFyb3VuZCYmdC5sZW5ndGg+MSlyZXR1cm4gdm9pZCB0aGlzLmVuYWJsZSgpO3ZhciBlPXQubGVuZ3RoP3QubGVuZ3RoLTE6MCxpPXRoaXMuaXNQcmV2aW91cz8wOmUsbj10aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4PT1pP1wiZGlzYWJsZVwiOlwiZW5hYmxlXCI7dGhpc1tuXSgpfSxzLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCl9LG4uZXh0ZW5kKGUuZGVmYXVsdHMse3ByZXZOZXh0QnV0dG9uczohMCxhcnJvd1NoYXBlOnt4MDoxMCx4MTo2MCx5MTo1MCx4Mjo3MCx5Mjo0MCx4MzozMH19KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnNcIik7dmFyIGE9ZS5wcm90b3R5cGU7cmV0dXJuIGEuX2NyZWF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wcmV2TmV4dEJ1dHRvbnMmJih0aGlzLnByZXZCdXR0b249bmV3IHMoKC0xKSx0aGlzKSx0aGlzLm5leHRCdXR0b249bmV3IHMoMSx0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUHJldk5leHRCdXR0b25zKSl9LGEuYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLnByZXZCdXR0b24uYWN0aXZhdGUoKSx0aGlzLm5leHRCdXR0b24uYWN0aXZhdGUoKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyl9LGEuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMucHJldkJ1dHRvbi5kZWFjdGl2YXRlKCksdGhpcy5uZXh0QnV0dG9uLmRlYWN0aXZhdGUoKSx0aGlzLm9mZihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpfSxlLlByZXZOZXh0QnV0dG9uPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3BhZ2UtZG90c1wiLFtcIi4vZmxpY2tpdHlcIixcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidGFwLWxpc3RlbmVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5UYXBMaXN0ZW5lcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtmdW5jdGlvbiBzKHQpe3RoaXMucGFyZW50PXQsdGhpcy5fY3JlYXRlKCl9cy5wcm90b3R5cGU9bmV3IGkscy5wcm90b3R5cGUuX2NyZWF0ZT1mdW5jdGlvbigpe3RoaXMuaG9sZGVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvbFwiKSx0aGlzLmhvbGRlci5jbGFzc05hbWU9XCJmbGlja2l0eS1wYWdlLWRvdHNcIix0aGlzLmRvdHM9W10sdGhpcy5vbihcInRhcFwiLHRoaXMub25UYXApLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKHRoaXMucGFyZW50KSl9LHMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5zZXREb3RzKCksdGhpcy5iaW5kVGFwKHRoaXMuaG9sZGVyKSx0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaG9sZGVyKX0scy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5ob2xkZXIpLGkucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKX0scy5wcm90b3R5cGUuc2V0RG90cz1mdW5jdGlvbigpe3ZhciB0PXRoaXMucGFyZW50LnNsaWRlcy5sZW5ndGgtdGhpcy5kb3RzLmxlbmd0aDt0PjA/dGhpcy5hZGREb3RzKHQpOnQ8MCYmdGhpcy5yZW1vdmVEb3RzKC10KX0scy5wcm90b3R5cGUuYWRkRG90cz1mdW5jdGlvbih0KXtmb3IodmFyIGU9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLGk9W107dDspe3ZhciBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtuLmNsYXNzTmFtZT1cImRvdFwiLGUuYXBwZW5kQ2hpbGQobiksaS5wdXNoKG4pLHQtLX10aGlzLmhvbGRlci5hcHBlbmRDaGlsZChlKSx0aGlzLmRvdHM9dGhpcy5kb3RzLmNvbmNhdChpKX0scy5wcm90b3R5cGUucmVtb3ZlRG90cz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmRvdHMuc3BsaWNlKHRoaXMuZG90cy5sZW5ndGgtdCx0KTtlLmZvckVhY2goZnVuY3Rpb24odCl7dGhpcy5ob2xkZXIucmVtb3ZlQ2hpbGQodCl9LHRoaXMpfSxzLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZD1mdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWREb3QmJih0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZT1cImRvdFwiKSx0aGlzLmRvdHMubGVuZ3RoJiYodGhpcy5zZWxlY3RlZERvdD10aGlzLmRvdHNbdGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleF0sdGhpcy5zZWxlY3RlZERvdC5jbGFzc05hbWU9XCJkb3QgaXMtc2VsZWN0ZWRcIil9LHMucHJvdG90eXBlLm9uVGFwPWZ1bmN0aW9uKHQpe3ZhciBlPXQudGFyZ2V0O2lmKFwiTElcIj09ZS5ub2RlTmFtZSl7dGhpcy5wYXJlbnQudWlDaGFuZ2UoKTt2YXIgaT10aGlzLmRvdHMuaW5kZXhPZihlKTt0aGlzLnBhcmVudC5zZWxlY3QoaSl9fSxzLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCl9LGUuUGFnZURvdHM9cyxuLmV4dGVuZChlLmRlZmF1bHRzLHtwYWdlRG90czohMH0pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVBhZ2VEb3RzXCIpO3ZhciBvPWUucHJvdG90eXBlO3JldHVybiBvLl9jcmVhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wYWdlRG90cyYmKHRoaXMucGFnZURvdHM9bmV3IHModGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwic2VsZWN0XCIsdGhpcy51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzKSx0aGlzLm9uKFwiY2VsbENoYW5nZVwiLHRoaXMudXBkYXRlUGFnZURvdHMpLHRoaXMub24oXCJyZXNpemVcIix0aGlzLnVwZGF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVBhZ2VEb3RzKSl9LG8uYWN0aXZhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuYWN0aXZhdGUoKX0sby51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy51cGRhdGVTZWxlY3RlZCgpfSxvLnVwZGF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5zZXREb3RzKCl9LG8uZGVhY3RpdmF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5kZWFjdGl2YXRlKCl9LGUuUGFnZURvdHM9cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcGxheWVyXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFwiLi9mbGlja2l0eVwiXSxmdW5jdGlvbih0LGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikscmVxdWlyZShcIi4vZmxpY2tpdHlcIikpOmUodC5FdkVtaXR0ZXIsdC5maXp6eVVJVXRpbHMsdC5GbGlja2l0eSl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7ZnVuY3Rpb24gbih0KXt0aGlzLnBhcmVudD10LHRoaXMuc3RhdGU9XCJzdG9wcGVkXCIsbyYmKHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlPWZ1bmN0aW9uKCl7dGhpcy52aXNpYmlsaXR5Q2hhbmdlKCl9LmJpbmQodGhpcyksdGhpcy5vblZpc2liaWxpdHlQbGF5PWZ1bmN0aW9uKCl7dGhpcy52aXNpYmlsaXR5UGxheSgpfS5iaW5kKHRoaXMpKX12YXIgcyxvO1wiaGlkZGVuXCJpbiBkb2N1bWVudD8ocz1cImhpZGRlblwiLG89XCJ2aXNpYmlsaXR5Y2hhbmdlXCIpOlwid2Via2l0SGlkZGVuXCJpbiBkb2N1bWVudCYmKHM9XCJ3ZWJraXRIaWRkZW5cIixvPVwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiKSxuLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQucHJvdG90eXBlKSxuLnByb3RvdHlwZS5wbGF5PWZ1bmN0aW9uKCl7aWYoXCJwbGF5aW5nXCIhPXRoaXMuc3RhdGUpe3ZhciB0PWRvY3VtZW50W3NdO2lmKG8mJnQpcmV0dXJuIHZvaWQgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5UGxheSk7dGhpcy5zdGF0ZT1cInBsYXlpbmdcIixvJiZkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UpLHRoaXMudGljaygpfX0sbi5wcm90b3R5cGUudGljaz1mdW5jdGlvbigpe2lmKFwicGxheWluZ1wiPT10aGlzLnN0YXRlKXt2YXIgdD10aGlzLnBhcmVudC5vcHRpb25zLmF1dG9QbGF5O3Q9XCJudW1iZXJcIj09dHlwZW9mIHQ/dDozZTM7dmFyIGU9dGhpczt0aGlzLmNsZWFyKCksdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnBhcmVudC5uZXh0KCEwKSxlLnRpY2soKX0sdCl9fSxuLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7dGhpcy5zdGF0ZT1cInN0b3BwZWRcIix0aGlzLmNsZWFyKCksbyYmZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlKX0sbi5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KX0sbi5wcm90b3R5cGUucGF1c2U9ZnVuY3Rpb24oKXtcInBsYXlpbmdcIj09dGhpcy5zdGF0ZSYmKHRoaXMuc3RhdGU9XCJwYXVzZWRcIix0aGlzLmNsZWFyKCkpfSxuLnByb3RvdHlwZS51bnBhdXNlPWZ1bmN0aW9uKCl7XCJwYXVzZWRcIj09dGhpcy5zdGF0ZSYmdGhpcy5wbGF5KCl9LG4ucHJvdG90eXBlLnZpc2liaWxpdHlDaGFuZ2U9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudFtzXTt0aGlzW3Q/XCJwYXVzZVwiOlwidW5wYXVzZVwiXSgpfSxuLnByb3RvdHlwZS52aXNpYmlsaXR5UGxheT1mdW5jdGlvbigpe3RoaXMucGxheSgpLGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eVBsYXkpfSxlLmV4dGVuZChpLmRlZmF1bHRzLHtwYXVzZUF1dG9QbGF5T25Ib3ZlcjohMH0pLGkuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVBsYXllclwiKTt2YXIgcj1pLnByb3RvdHlwZTtyZXR1cm4gci5fY3JlYXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXI9bmV3IG4odGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVBsYXllciksdGhpcy5vbihcInVpQ2hhbmdlXCIsdGhpcy5zdG9wUGxheWVyKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnN0b3BQbGF5ZXIpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUGxheWVyKX0sci5hY3RpdmF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5hdXRvUGxheSYmKHRoaXMucGxheWVyLnBsYXkoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIix0aGlzKSl9LHIucGxheVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnBsYXkoKX0sci5zdG9wUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIuc3RvcCgpfSxyLnBhdXNlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIucGF1c2UoKX0sci51bnBhdXNlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIudW5wYXVzZSgpfSxyLmRlYWN0aXZhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5zdG9wKCksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsdGhpcyl9LHIub25tb3VzZWVudGVyPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnBhdXNlQXV0b1BsYXlPbkhvdmVyJiYodGhpcy5wbGF5ZXIucGF1c2UoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIix0aGlzKSl9LHIub25tb3VzZWxlYXZlPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIudW5wYXVzZSgpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLHRoaXMpfSxpLlBsYXllcj1uLGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9hZGQtcmVtb3ZlLWNlbGxcIixbXCIuL2ZsaWNraXR5XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe2UuYXBwZW5kQ2hpbGQodC5lbGVtZW50KX0pLGV9dmFyIHM9ZS5wcm90b3R5cGU7cmV0dXJuIHMuaW5zZXJ0PWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fbWFrZUNlbGxzKHQpO2lmKGkmJmkubGVuZ3RoKXt2YXIgcz10aGlzLmNlbGxzLmxlbmd0aDtlPXZvaWQgMD09PWU/czplO3ZhciBvPW4oaSkscj1lPT1zO2lmKHIpdGhpcy5zbGlkZXIuYXBwZW5kQ2hpbGQobyk7ZWxzZXt2YXIgYT10aGlzLmNlbGxzW2VdLmVsZW1lbnQ7dGhpcy5zbGlkZXIuaW5zZXJ0QmVmb3JlKG8sYSl9aWYoMD09PWUpdGhpcy5jZWxscz1pLmNvbmNhdCh0aGlzLmNlbGxzKTtlbHNlIGlmKHIpdGhpcy5jZWxscz10aGlzLmNlbGxzLmNvbmNhdChpKTtlbHNle3ZhciBsPXRoaXMuY2VsbHMuc3BsaWNlKGUscy1lKTt0aGlzLmNlbGxzPXRoaXMuY2VsbHMuY29uY2F0KGkpLmNvbmNhdChsKX10aGlzLl9zaXplQ2VsbHMoaSk7dmFyIGg9ZT50aGlzLnNlbGVjdGVkSW5kZXg/MDppLmxlbmd0aDt0aGlzLl9jZWxsQWRkZWRSZW1vdmVkKGUsaCl9fSxzLmFwcGVuZD1mdW5jdGlvbih0KXt0aGlzLmluc2VydCh0LHRoaXMuY2VsbHMubGVuZ3RoKX0scy5wcmVwZW5kPWZ1bmN0aW9uKHQpe3RoaXMuaW5zZXJ0KHQsMCl9LHMucmVtb3ZlPWZ1bmN0aW9uKHQpe3ZhciBlLG4scz10aGlzLmdldENlbGxzKHQpLG89MCxyPXMubGVuZ3RoO2ZvcihlPTA7ZTxyO2UrKyl7bj1zW2VdO3ZhciBhPXRoaXMuY2VsbHMuaW5kZXhPZihuKTx0aGlzLnNlbGVjdGVkSW5kZXg7by09YT8xOjB9Zm9yKGU9MDtlPHI7ZSsrKW49c1tlXSxuLnJlbW92ZSgpLGkucmVtb3ZlRnJvbSh0aGlzLmNlbGxzLG4pO3MubGVuZ3RoJiZ0aGlzLl9jZWxsQWRkZWRSZW1vdmVkKDAsbyl9LHMuX2NlbGxBZGRlZFJlbW92ZWQ9ZnVuY3Rpb24odCxlKXtlPWV8fDAsdGhpcy5zZWxlY3RlZEluZGV4Kz1lLHRoaXMuc2VsZWN0ZWRJbmRleD1NYXRoLm1heCgwLE1hdGgubWluKHRoaXMuc2xpZGVzLmxlbmd0aC0xLHRoaXMuc2VsZWN0ZWRJbmRleCkpLHRoaXMuY2VsbENoYW5nZSh0LCEwKSx0aGlzLmVtaXRFdmVudChcImNlbGxBZGRlZFJlbW92ZWRcIixbdCxlXSl9LHMuY2VsbFNpemVDaGFuZ2U9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRDZWxsKHQpO2lmKGUpe2UuZ2V0U2l6ZSgpO3ZhciBpPXRoaXMuY2VsbHMuaW5kZXhPZihlKTt0aGlzLmNlbGxDaGFuZ2UoaSl9fSxzLmNlbGxDaGFuZ2U9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLnNsaWRlYWJsZVdpZHRoO2lmKHRoaXMuX3Bvc2l0aW9uQ2VsbHModCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5lbWl0RXZlbnQoXCJjZWxsQ2hhbmdlXCIsW3RdKSx0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCl7dmFyIG49aS10aGlzLnNsaWRlYWJsZVdpZHRoO3RoaXMueCs9bip0aGlzLmNlbGxBbGlnbix0aGlzLnBvc2l0aW9uU2xpZGVyKCl9ZWxzZSBlJiZ0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpLHRoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleCl9LGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9sYXp5bG9hZFwiLFtcIi4vZmxpY2tpdHlcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7aWYoXCJJTUdcIj09dC5ub2RlTmFtZSYmdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpKXJldHVyblt0XTt2YXIgZT10LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbWdbZGF0YS1mbGlja2l0eS1sYXp5bG9hZF1cIik7cmV0dXJuIGkubWFrZUFycmF5KGUpfWZ1bmN0aW9uIHModCxlKXt0aGlzLmltZz10LHRoaXMuZmxpY2tpdHk9ZSx0aGlzLmxvYWQoKX1lLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVMYXp5bG9hZFwiKTt2YXIgbz1lLnByb3RvdHlwZTtyZXR1cm4gby5fY3JlYXRlTGF6eWxvYWQ9ZnVuY3Rpb24oKXt0aGlzLm9uKFwic2VsZWN0XCIsdGhpcy5sYXp5TG9hZCl9LG8ubGF6eUxvYWQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMubGF6eUxvYWQ7aWYodCl7dmFyIGU9XCJudW1iZXJcIj09dHlwZW9mIHQ/dDowLGk9dGhpcy5nZXRBZGphY2VudENlbGxFbGVtZW50cyhlKSxvPVtdO2kuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgZT1uKHQpO289by5jb25jYXQoZSl9KSxvLmZvckVhY2goZnVuY3Rpb24odCl7bmV3IHModCx0aGlzKX0sdGhpcyl9fSxzLnByb3RvdHlwZS5oYW5kbGVFdmVudD1pLmhhbmRsZUV2ZW50LHMucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnNyYz10aGlzLmltZy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpLHRoaXMuaW1nLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIil9LHMucHJvdG90eXBlLm9ubG9hZD1mdW5jdGlvbih0KXt0aGlzLmNvbXBsZXRlKHQsXCJmbGlja2l0eS1sYXp5bG9hZGVkXCIpfSxzLnByb3RvdHlwZS5vbmVycm9yPWZ1bmN0aW9uKHQpe3RoaXMuY29tcGxldGUodCxcImZsaWNraXR5LWxhenllcnJvclwiKX0scy5wcm90b3R5cGUuY29tcGxldGU9ZnVuY3Rpb24odCxlKXt0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpO3ZhciBpPXRoaXMuZmxpY2tpdHkuZ2V0UGFyZW50Q2VsbCh0aGlzLmltZyksbj1pJiZpLmVsZW1lbnQ7dGhpcy5mbGlja2l0eS5jZWxsU2l6ZUNoYW5nZShuKSx0aGlzLmltZy5jbGFzc0xpc3QuYWRkKGUpLHRoaXMuZmxpY2tpdHkuZGlzcGF0Y2hFdmVudChcImxhenlMb2FkXCIsdCxuKX0sZS5MYXp5TG9hZGVyPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2luZGV4XCIsW1wiLi9mbGlja2l0eVwiLFwiLi9kcmFnXCIsXCIuL3ByZXYtbmV4dC1idXR0b25cIixcIi4vcGFnZS1kb3RzXCIsXCIuL3BsYXllclwiLFwiLi9hZGQtcmVtb3ZlLWNlbGxcIixcIi4vbGF6eWxvYWRcIl0sZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCIuL2RyYWdcIikscmVxdWlyZShcIi4vcHJldi1uZXh0LWJ1dHRvblwiKSxyZXF1aXJlKFwiLi9wYWdlLWRvdHNcIikscmVxdWlyZShcIi4vcGxheWVyXCIpLHJlcXVpcmUoXCIuL2FkZC1yZW1vdmUtY2VsbFwiKSxyZXF1aXJlKFwiLi9sYXp5bG9hZFwiKSkpfSh3aW5kb3csZnVuY3Rpb24odCl7cmV0dXJuIHR9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS1hcy1uYXYtZm9yL2FzLW5hdi1mb3JcIixbXCJmbGlja2l0eS9qcy9pbmRleFwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTp0LkZsaWNraXR5PWUodC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlLGkpe3JldHVybihlLXQpKmkrdH10LmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVBc05hdkZvclwiKTt2YXIgbj10LnByb3RvdHlwZTtyZXR1cm4gbi5fY3JlYXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlQXNOYXZGb3IpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlQXNOYXZGb3IpLHRoaXMub24oXCJkZXN0cm95XCIsdGhpcy5kZXN0cm95QXNOYXZGb3IpO3ZhciB0PXRoaXMub3B0aW9ucy5hc05hdkZvcjtpZih0KXt2YXIgZT10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnNldE5hdkNvbXBhbmlvbih0KX0pfX0sbi5zZXROYXZDb21wYW5pb249ZnVuY3Rpb24oaSl7aT1lLmdldFF1ZXJ5RWxlbWVudChpKTt2YXIgbj10LmRhdGEoaSk7aWYobiYmbiE9dGhpcyl7dGhpcy5uYXZDb21wYW5pb249bjt2YXIgcz10aGlzO3RoaXMub25OYXZDb21wYW5pb25TZWxlY3Q9ZnVuY3Rpb24oKXtzLm5hdkNvbXBhbmlvblNlbGVjdCgpfSxuLm9uKFwic2VsZWN0XCIsdGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdCksdGhpcy5vbihcInN0YXRpY0NsaWNrXCIsdGhpcy5vbk5hdlN0YXRpY0NsaWNrKSx0aGlzLm5hdkNvbXBhbmlvblNlbGVjdCghMCl9fSxuLm5hdkNvbXBhbmlvblNlbGVjdD1mdW5jdGlvbih0KXtpZih0aGlzLm5hdkNvbXBhbmlvbil7dmFyIGU9dGhpcy5uYXZDb21wYW5pb24uc2VsZWN0ZWRDZWxsc1swXSxuPXRoaXMubmF2Q29tcGFuaW9uLmNlbGxzLmluZGV4T2YoZSkscz1uK3RoaXMubmF2Q29tcGFuaW9uLnNlbGVjdGVkQ2VsbHMubGVuZ3RoLTEsbz1NYXRoLmZsb29yKGkobixzLHRoaXMubmF2Q29tcGFuaW9uLmNlbGxBbGlnbikpO2lmKHRoaXMuc2VsZWN0Q2VsbChvLCExLHQpLHRoaXMucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cygpLCEobz49dGhpcy5jZWxscy5sZW5ndGgpKXt2YXIgcj10aGlzLmNlbGxzLnNsaWNlKG4scysxKTt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHM9ci5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pLHRoaXMuY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyhcImFkZFwiKX19fSxuLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3M9ZnVuY3Rpb24odCl7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5jbGFzc0xpc3RbdF0oXCJpcy1uYXYtc2VsZWN0ZWRcIil9KX0sbi5hY3RpdmF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5uYXZDb21wYW5pb25TZWxlY3QoITApfSxuLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHM9ZnVuY3Rpb24oKXt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMmJih0aGlzLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MoXCJyZW1vdmVcIiksZGVsZXRlIHRoaXMubmF2U2VsZWN0ZWRFbGVtZW50cyl9LG4ub25OYXZTdGF0aWNDbGljaz1mdW5jdGlvbih0LGUsaSxuKXtcIm51bWJlclwiPT10eXBlb2YgbiYmdGhpcy5uYXZDb21wYW5pb24uc2VsZWN0Q2VsbChuKX0sbi5kZWFjdGl2YXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMoKX0sbi5kZXN0cm95QXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm5hdkNvbXBhbmlvbiYmKHRoaXMubmF2Q29tcGFuaW9uLm9mZihcInNlbGVjdFwiLHRoaXMub25OYXZDb21wYW5pb25TZWxlY3QpLHRoaXMub2ZmKFwic3RhdGljQ2xpY2tcIix0aGlzLm9uTmF2U3RhdGljQ2xpY2spLGRlbGV0ZSB0aGlzLm5hdkNvbXBhbmlvbil9LHR9KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJpbWFnZXNsb2FkZWQvaW1hZ2VzbG9hZGVkXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikpOnQuaW1hZ2VzTG9hZGVkPWUodCx0LkV2RW1pdHRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlKXtmb3IodmFyIGkgaW4gZSl0W2ldPWVbaV07cmV0dXJuIHR9ZnVuY3Rpb24gbih0KXt2YXIgZT1bXTtpZihBcnJheS5pc0FycmF5KHQpKWU9dDtlbHNlIGlmKFwibnVtYmVyXCI9PXR5cGVvZiB0Lmxlbmd0aClmb3IodmFyIGk9MDtpPHQubGVuZ3RoO2krKyllLnB1c2godFtpXSk7ZWxzZSBlLnB1c2godCk7cmV0dXJuIGV9ZnVuY3Rpb24gcyh0LGUsbyl7cmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBzPyhcInN0cmluZ1wiPT10eXBlb2YgdCYmKHQ9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0KSksdGhpcy5lbGVtZW50cz1uKHQpLHRoaXMub3B0aW9ucz1pKHt9LHRoaXMub3B0aW9ucyksXCJmdW5jdGlvblwiPT10eXBlb2YgZT9vPWU6aSh0aGlzLm9wdGlvbnMsZSksbyYmdGhpcy5vbihcImFsd2F5c1wiLG8pLHRoaXMuZ2V0SW1hZ2VzKCksYSYmKHRoaXMuanFEZWZlcnJlZD1uZXcgYS5EZWZlcnJlZCksdm9pZCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dGhpcy5jaGVjaygpfS5iaW5kKHRoaXMpKSk6bmV3IHModCxlLG8pfWZ1bmN0aW9uIG8odCl7dGhpcy5pbWc9dH1mdW5jdGlvbiByKHQsZSl7dGhpcy51cmw9dCx0aGlzLmVsZW1lbnQ9ZSx0aGlzLmltZz1uZXcgSW1hZ2V9dmFyIGE9dC5qUXVlcnksbD10LmNvbnNvbGU7cy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSkscy5wcm90b3R5cGUub3B0aW9ucz17fSxzLnByb3RvdHlwZS5nZXRJbWFnZXM9ZnVuY3Rpb24oKXt0aGlzLmltYWdlcz1bXSx0aGlzLmVsZW1lbnRzLmZvckVhY2godGhpcy5hZGRFbGVtZW50SW1hZ2VzLHRoaXMpfSxzLnByb3RvdHlwZS5hZGRFbGVtZW50SW1hZ2VzPWZ1bmN0aW9uKHQpe1wiSU1HXCI9PXQubm9kZU5hbWUmJnRoaXMuYWRkSW1hZ2UodCksdGhpcy5vcHRpb25zLmJhY2tncm91bmQ9PT0hMCYmdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyh0KTt2YXIgZT10Lm5vZGVUeXBlO2lmKGUmJmhbZV0pe2Zvcih2YXIgaT10LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbWdcIiksbj0wO248aS5sZW5ndGg7bisrKXt2YXIgcz1pW25dO3RoaXMuYWRkSW1hZ2Uocyl9aWYoXCJzdHJpbmdcIj09dHlwZW9mIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kKXt2YXIgbz10LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5vcHRpb25zLmJhY2tncm91bmQpO2ZvcihuPTA7bjxvLmxlbmd0aDtuKyspe3ZhciByPW9bbl07dGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyhyKX19fX07dmFyIGg9ezE6ITAsOTohMCwxMTohMH07cmV0dXJuIHMucHJvdG90eXBlLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzPWZ1bmN0aW9uKHQpe3ZhciBlPWdldENvbXB1dGVkU3R5bGUodCk7aWYoZSlmb3IodmFyIGk9L3VybFxcKChbJ1wiXSk/KC4qPylcXDFcXCkvZ2ksbj1pLmV4ZWMoZS5iYWNrZ3JvdW5kSW1hZ2UpO251bGwhPT1uOyl7dmFyIHM9biYmblsyXTtzJiZ0aGlzLmFkZEJhY2tncm91bmQocyx0KSxuPWkuZXhlYyhlLmJhY2tncm91bmRJbWFnZSl9fSxzLnByb3RvdHlwZS5hZGRJbWFnZT1mdW5jdGlvbih0KXt2YXIgZT1uZXcgbyh0KTt0aGlzLmltYWdlcy5wdXNoKGUpfSxzLnByb3RvdHlwZS5hZGRCYWNrZ3JvdW5kPWZ1bmN0aW9uKHQsZSl7dmFyIGk9bmV3IHIodCxlKTt0aGlzLmltYWdlcy5wdXNoKGkpfSxzLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxpLG4pe3NldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnByb2dyZXNzKHQsaSxuKX0pfXZhciBlPXRoaXM7cmV0dXJuIHRoaXMucHJvZ3Jlc3NlZENvdW50PTAsdGhpcy5oYXNBbnlCcm9rZW49ITEsdGhpcy5pbWFnZXMubGVuZ3RoP3ZvaWQgdGhpcy5pbWFnZXMuZm9yRWFjaChmdW5jdGlvbihlKXtlLm9uY2UoXCJwcm9ncmVzc1wiLHQpLGUuY2hlY2soKX0pOnZvaWQgdGhpcy5jb21wbGV0ZSgpfSxzLnByb3RvdHlwZS5wcm9ncmVzcz1mdW5jdGlvbih0LGUsaSl7dGhpcy5wcm9ncmVzc2VkQ291bnQrKyx0aGlzLmhhc0FueUJyb2tlbj10aGlzLmhhc0FueUJyb2tlbnx8IXQuaXNMb2FkZWQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHQsZV0pLHRoaXMuanFEZWZlcnJlZCYmdGhpcy5qcURlZmVycmVkLm5vdGlmeSYmdGhpcy5qcURlZmVycmVkLm5vdGlmeSh0aGlzLHQpLHRoaXMucHJvZ3Jlc3NlZENvdW50PT10aGlzLmltYWdlcy5sZW5ndGgmJnRoaXMuY29tcGxldGUoKSx0aGlzLm9wdGlvbnMuZGVidWcmJmwmJmwubG9nKFwicHJvZ3Jlc3M6IFwiK2ksdCxlKX0scy5wcm90b3R5cGUuY29tcGxldGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmhhc0FueUJyb2tlbj9cImZhaWxcIjpcImRvbmVcIjtpZih0aGlzLmlzQ29tcGxldGU9ITAsdGhpcy5lbWl0RXZlbnQodCxbdGhpc10pLHRoaXMuZW1pdEV2ZW50KFwiYWx3YXlzXCIsW3RoaXNdKSx0aGlzLmpxRGVmZXJyZWQpe3ZhciBlPXRoaXMuaGFzQW55QnJva2VuP1wicmVqZWN0XCI6XCJyZXNvbHZlXCI7dGhpcy5qcURlZmVycmVkW2VdKHRoaXMpfX0sby5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSksby5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO3JldHVybiB0P3ZvaWQgdGhpcy5jb25maXJtKDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGgsXCJuYXR1cmFsV2lkdGhcIik6KHRoaXMucHJveHlJbWFnZT1uZXcgSW1hZ2UsdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdm9pZCh0aGlzLnByb3h5SW1hZ2Uuc3JjPXRoaXMuaW1nLnNyYykpfSxvLnByb3RvdHlwZS5nZXRJc0ltYWdlQ29tcGxldGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pbWcuY29tcGxldGUmJnZvaWQgMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aH0sby5wcm90b3R5cGUuY29uZmlybT1mdW5jdGlvbih0LGUpe3RoaXMuaXNMb2FkZWQ9dCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdGhpcy5pbWcsZV0pfSxvLnByb3RvdHlwZS5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LG8ucHJvdG90eXBlLm9ubG9hZD1mdW5jdGlvbigpe3RoaXMuY29uZmlybSghMCxcIm9ubG9hZFwiKSx0aGlzLnVuYmluZEV2ZW50cygpfSxvLnByb3RvdHlwZS5vbmVycm9yPWZ1bmN0aW9uKCl7dGhpcy5jb25maXJtKCExLFwib25lcnJvclwiKSx0aGlzLnVuYmluZEV2ZW50cygpfSxvLnByb3RvdHlwZS51bmJpbmRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKX0sci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShvLnByb3RvdHlwZSksci5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXt0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnNyYz10aGlzLnVybDt2YXIgdD10aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO3QmJih0aGlzLmNvbmZpcm0oMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aCxcIm5hdHVyYWxXaWR0aFwiKSx0aGlzLnVuYmluZEV2ZW50cygpKX0sci5wcm90b3R5cGUudW5iaW5kRXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKX0sci5wcm90b3R5cGUuY29uZmlybT1mdW5jdGlvbih0LGUpe3RoaXMuaXNMb2FkZWQ9dCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdGhpcy5lbGVtZW50LGVdKX0scy5tYWtlSlF1ZXJ5UGx1Z2luPWZ1bmN0aW9uKGUpe2U9ZXx8dC5qUXVlcnksZSYmKGE9ZSxhLmZuLmltYWdlc0xvYWRlZD1mdW5jdGlvbih0LGUpe3ZhciBpPW5ldyBzKHRoaXMsdCxlKTtyZXR1cm4gaS5qcURlZmVycmVkLnByb21pc2UoYSh0aGlzKSl9KX0scy5tYWtlSlF1ZXJ5UGx1Z2luKCksc30pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJmbGlja2l0eS9qcy9pbmRleFwiLFwiaW1hZ2VzbG9hZGVkL2ltYWdlc2xvYWRlZFwiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZmxpY2tpdHlcIikscmVxdWlyZShcImltYWdlc2xvYWRlZFwiKSk6dC5GbGlja2l0eT1lKHQsdC5GbGlja2l0eSx0LmltYWdlc0xvYWRlZCl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7XCJ1c2Ugc3RyaWN0XCI7ZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlSW1hZ2VzTG9hZGVkXCIpO3ZhciBuPWUucHJvdG90eXBlO3JldHVybiBuLl9jcmVhdGVJbWFnZXNMb2FkZWQ9ZnVuY3Rpb24oKXt0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmltYWdlc0xvYWRlZCl9LG4uaW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGkpe3ZhciBuPWUuZ2V0UGFyZW50Q2VsbChpLmltZyk7ZS5jZWxsU2l6ZUNoYW5nZShuJiZuLmVsZW1lbnQpLGUub3B0aW9ucy5mcmVlU2Nyb2xsfHxlLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpfWlmKHRoaXMub3B0aW9ucy5pbWFnZXNMb2FkZWQpe3ZhciBlPXRoaXM7aSh0aGlzLnNsaWRlcikub24oXCJwcm9ncmVzc1wiLHQpfX0sZX0pOyIsIi8qKlxuICogRmxpY2tpdHkgYmFja2dyb3VuZCBsYXp5bG9hZCB2MS4wLjBcbiAqIGxhenlsb2FkIGJhY2tncm91bmQgY2VsbCBpbWFnZXNcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2ZsaWNraXR5L2pzL2luZGV4JyxcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscydcbiAgICBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICByZXF1aXJlKCdmbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBGbGlja2l0eSwgdXRpbHMgKSB7XG4vKmpzaGludCBzdHJpY3Q6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlQmdMYXp5TG9hZCcpO1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGVCZ0xhenlMb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub24oICdzZWxlY3QnLCB0aGlzLmJnTGF6eUxvYWQgKTtcbn07XG5cbnByb3RvLmJnTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxhenlMb2FkID0gdGhpcy5vcHRpb25zLmJnTGF6eUxvYWQ7XG4gIGlmICggIWxhenlMb2FkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGdldCBhZGphY2VudCBjZWxscywgdXNlIGxhenlMb2FkIG9wdGlvbiBmb3IgYWRqYWNlbnQgY291bnRcbiAgdmFyIGFkakNvdW50ID0gdHlwZW9mIGxhenlMb2FkID09ICdudW1iZXInID8gbGF6eUxvYWQgOiAwO1xuICB2YXIgY2VsbEVsZW1zID0gdGhpcy5nZXRBZGphY2VudENlbGxFbGVtZW50cyggYWRqQ291bnQgKTtcblxuICBmb3IgKCB2YXIgaT0wOyBpIDwgY2VsbEVsZW1zLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBjZWxsRWxlbSA9IGNlbGxFbGVtc1tpXTtcbiAgICB0aGlzLmJnTGF6eUxvYWRFbGVtKCBjZWxsRWxlbSApO1xuICAgIC8vIHNlbGVjdCBsYXp5IGVsZW1zIGluIGNlbGxcbiAgICB2YXIgY2hpbGRyZW4gPSBjZWxsRWxlbS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZF0nKTtcbiAgICBmb3IgKCB2YXIgaj0wOyBqIDwgY2hpbGRyZW4ubGVuZ3RoOyBqKysgKSB7XG4gICAgICB0aGlzLmJnTGF6eUxvYWRFbGVtKCBjaGlsZHJlbltqXSApO1xuICAgIH1cbiAgfVxufTtcblxucHJvdG8uYmdMYXp5TG9hZEVsZW0gPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdmFyIGF0dHIgPSBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZCcpO1xuICBpZiAoIGF0dHIgKSB7XG4gICAgbmV3IEJnTGF6eUxvYWRlciggZWxlbSwgYXR0ciwgdGhpcyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBMYXp5QkdMb2FkZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBjbGFzcyB0byBoYW5kbGUgbG9hZGluZyBpbWFnZXNcbiAqL1xuZnVuY3Rpb24gQmdMYXp5TG9hZGVyKCBlbGVtLCB1cmwsIGZsaWNraXR5ICkge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5mbGlja2l0eSA9IGZsaWNraXR5O1xuICB0aGlzLmxvYWQoKTtcbn1cblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IHV0aWxzLmhhbmRsZUV2ZW50O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgLy8gbG9hZCBpbWFnZVxuICB0aGlzLmltZy5zcmMgPSB0aGlzLnVybDtcbiAgLy8gcmVtb3ZlIGF0dHJcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1iZy1sYXp5bG9hZCcpO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5vbmxvYWQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyB0aGlzLnVybCArICcpJztcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1iZy1sYXp5bG9hZGVkJyApO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5vbmVycm9yID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLmNvbXBsZXRlKCBldmVudCwgJ2ZsaWNraXR5LWJnLWxhenllcnJvcicgKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiggZXZlbnQsIGNsYXNzTmFtZSApIHtcbiAgLy8gdW5iaW5kIGV2ZW50c1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuXG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCBjbGFzc05hbWUgKTtcbiAgdGhpcy5mbGlja2l0eS5kaXNwYXRjaEV2ZW50KCAnYmdMYXp5TG9hZCcsIGV2ZW50LCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5GbGlja2l0eS5CZ0xhenlMb2FkZXIgPSBCZ0xhenlMb2FkZXI7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLyoqXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5LCB2ZXJzaW9uIDEuMi4yN1xuKiAgKGMpIDIwMTUgVG9tYXMgS2lyZGFcbipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnkgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIGFuIE1JVC1zdHlsZSBsaWNlbnNlLlxuKiAgRm9yIGRldGFpbHMsIHNlZSB0aGUgd2ViIHNpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZicmlkZ2UvalF1ZXJ5LUF1dG9jb21wbGV0ZVxuKi9cblxuLypqc2xpbnQgIGJyb3dzZXI6IHRydWUsIHdoaXRlOiB0cnVlLCBzaW5nbGU6IHRydWUsIHRoaXM6IHRydWUsIG11bHRpdmFyOiB0cnVlICovXG4vKmdsb2JhbCBkZWZpbmUsIHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSwgZXhwb3J0cywgcmVxdWlyZSAqL1xuXG4vLyBFeHBvc2UgcGx1Z2luIGFzIGFuIEFNRCBtb2R1bGUgaWYgQU1EIGxvYWRlciBpcyBwcmVzZW50OlxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBCcm93c2VyaWZ5XG4gICAgICAgIGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgICAgICBmYWN0b3J5KGpRdWVyeSk7XG4gICAgfVxufShmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhclxuICAgICAgICB1dGlscyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVzY2FwZVJlZ0V4Q2hhcnM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvW3xcXFxce30oKVtcXF1eJCsqPy5dL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZTogZnVuY3Rpb24gKGNvbnRhaW5lckNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9IGNvbnRhaW5lckNsYXNzO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KCkpLFxuXG4gICAgICAgIGtleXMgPSB7XG4gICAgICAgICAgICBFU0M6IDI3LFxuICAgICAgICAgICAgVEFCOiA5LFxuICAgICAgICAgICAgUkVUVVJOOiAxMyxcbiAgICAgICAgICAgIExFRlQ6IDM3LFxuICAgICAgICAgICAgVVA6IDM4LFxuICAgICAgICAgICAgUklHSFQ6IDM5LFxuICAgICAgICAgICAgRE9XTjogNDBcbiAgICAgICAgfTtcblxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZShlbCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgbm9vcCA9ICQubm9vcCxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgICAgICBhdXRvU2VsZWN0Rmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBkb2N1bWVudC5ib2R5LFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmw6IG51bGwsXG4gICAgICAgICAgICAgICAgbG9va3VwOiBudWxsLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgbWluQ2hhcnM6IDEsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAzMDAsXG4gICAgICAgICAgICAgICAgZGVmZXJSZXF1ZXN0Qnk6IDAsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQ6IEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICBub0NhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvblNlYXJjaFN0YXJ0OiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoQ29tcGxldGU6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hFcnJvcjogbm9vcCxcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUlucHV0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucycsXG4gICAgICAgICAgICAgICAgdGFiRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgY3VycmVudFJlcXVlc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgdHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwcmV2ZW50QmFkUXVlcmllczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsb29rdXBGaWx0ZXI6IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBvcmlnaW5hbFF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlMb3dlckNhc2UpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogJ3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXN1bHQ6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJlc3BvbnNlID09PSAnc3RyaW5nJyA/ICQucGFyc2VKU09OKHJlc3BvbnNlKSA6IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2hvd05vU3VnZ2VzdGlvbk5vdGljZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uTm90aWNlOiAnTm8gcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb246ICdib3R0b20nLFxuICAgICAgICAgICAgICAgIGZvcmNlRml4UG9zaXRpb246IGZhbHNlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNoYXJlZCB2YXJpYWJsZXM6XG4gICAgICAgIHRoYXQuZWxlbWVudCA9IGVsO1xuICAgICAgICB0aGF0LmVsID0gJChlbCk7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgdGhhdC5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZWxlbWVudC52YWx1ZTtcbiAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gMDtcbiAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGF0Lm9uQ2hhbmdlID0gbnVsbDtcbiAgICAgICAgdGhhdC5pc0xvY2FsID0gZmFsc2U7XG4gICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSBudWxsO1xuICAgICAgICB0aGF0Lm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGF0LmNsYXNzZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RlZDogJ2F1dG9jb21wbGV0ZS1zZWxlY3RlZCcsXG4gICAgICAgICAgICBzdWdnZXN0aW9uOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb24nXG4gICAgICAgIH07XG4gICAgICAgIHRoYXQuaGludCA9IG51bGw7XG4gICAgICAgIHRoYXQuaGludFZhbHVlID0gJyc7XG4gICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgb3B0aW9uczpcbiAgICAgICAgdGhhdC5pbml0aWFsaXplKCk7XG4gICAgICAgIHRoYXQuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBBdXRvY29tcGxldGUudXRpbHMgPSB1dGlscztcblxuICAgICQuQXV0b2NvbXBsZXRlID0gQXV0b2NvbXBsZXRlO1xuXG4gICAgQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgLy8gRG8gbm90IHJlcGxhY2UgYW55dGhpbmcgaWYgdGhlcmUgY3VycmVudCB2YWx1ZSBpcyBlbXB0eVxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBwYXR0ZXJuID0gJygnICsgdXRpbHMuZXNjYXBlUmVnRXhDaGFycyhjdXJyZW50VmFsdWUpICsgJyknO1xuXG4gICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKHBhdHRlcm4sICdnaScpLCAnPHN0cm9uZz4kMTxcXC9zdHJvbmc+JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmx0OyhcXC8/c3Ryb25nKSZndDsvZywgJzwkMT4nKTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBraWxsZXJGbjogbnVsbCxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvblNlbGVjdG9yID0gJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjb250YWluZXI7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBhdXRvY29tcGxldGUgYXR0cmlidXRlIHRvIHByZXZlbnQgbmF0aXZlIHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgdGhhdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXV0b2NvbXBsZXRlJywgJ29mZicpO1xuXG4gICAgICAgICAgICB0aGF0LmtpbGxlckZuID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmNsb3Nlc3QoJy4nICsgdGhhdC5vcHRpb25zLmNvbnRhaW5lckNsYXNzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5raWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBodG1sKCkgZGVhbHMgd2l0aCBtYW55IHR5cGVzOiBodG1sU3RyaW5nIG9yIEVsZW1lbnQgb3IgQXJyYXkgb3IgalF1ZXJ5XG4gICAgICAgICAgICB0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLW5vLXN1Z2dlc3Rpb25cIj48L2Rpdj4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmh0bWwodGhpcy5vcHRpb25zLm5vU3VnZ2VzdGlvbk5vdGljZSkuZ2V0KDApO1xuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gQXV0b2NvbXBsZXRlLnV0aWxzLmNyZWF0ZU5vZGUob3B0aW9ucy5jb250YWluZXJDbGFzcyk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRUbyhvcHRpb25zLmFwcGVuZFRvKTtcblxuICAgICAgICAgICAgLy8gT25seSBzZXQgd2lkdGggaWYgaXQgd2FzIHByb3ZpZGVkOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggIT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jc3MoJ3dpZHRoJywgb3B0aW9ucy53aWR0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgbW91c2Ugb3ZlciBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW92ZXIuYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hY3RpdmF0ZSgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFjdGl2ZSBlbGVtZW50IHdoZW4gbW91c2UgbGVhdmVzIHN1Z2dlc3Rpb25zIGNvbnRhaW5lcjpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIExpc3RlbiBmb3IgY2xpY2sgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgc3VnZ2VzdGlvblNlbGVjdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuXG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXlkb3duLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlQcmVzcyhlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdrZXl1cC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignYmx1ci5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25CbHVyKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignZm9jdXMuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uRm9jdXMoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdjaGFuZ2UuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2lucHV0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmVsLnZhbCgpLmxlbmd0aCA+PSB0aGF0Lm9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGFib3J0QWpheDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gKHN1cHBsaWVkT3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKG9wdGlvbnMsIHN1cHBsaWVkT3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuaXNMb2NhbCA9ICQuaXNBcnJheShvcHRpb25zLmxvb2t1cCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cCA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQob3B0aW9ucy5sb29rdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLm9yaWVudGF0aW9uID0gdGhhdC52YWxpZGF0ZU9yaWVudGF0aW9uKG9wdGlvbnMub3JpZW50YXRpb24sICdib3R0b20nKTtcblxuICAgICAgICAgICAgLy8gQWRqdXN0IGhlaWdodCwgd2lkdGggYW5kIHotaW5kZXg6XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNzcyh7XG4gICAgICAgICAgICAgICAgJ21heC1oZWlnaHQnOiBvcHRpb25zLm1heEhlaWdodCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogb3B0aW9ucy53aWR0aCArICdweCcsXG4gICAgICAgICAgICAgICAgJ3otaW5kZXgnOiBvcHRpb25zLnpJbmRleFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICBjbGVhckNhY2hlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgICAgICB0aGlzLmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBmaXhQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gVXNlIG9ubHkgd2hlbiBjb250YWluZXIgaGFzIGFscmVhZHkgaXRzIGNvbnRlbnRcblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICRjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclBhcmVudCA9ICRjb250YWluZXIucGFyZW50KCkuZ2V0KDApO1xuICAgICAgICAgICAgLy8gRml4IHBvc2l0aW9uIGF1dG9tYXRpY2FsbHkgd2hlbiBhcHBlbmRlZCB0byBib2R5LlxuICAgICAgICAgICAgLy8gSW4gb3RoZXIgY2FzZXMgZm9yY2UgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4uXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5ICYmICF0aGF0Lm9wdGlvbnMuZm9yY2VGaXhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzaXRlU2VhcmNoRGl2ID0gJCgnLnNpdGUtc2VhcmNoJyk7XG4gICAgICAgICAgICAvLyBDaG9vc2Ugb3JpZW50YXRpb25cbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoYXQub3B0aW9ucy5vcmllbnRhdGlvbixcbiAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc2l0ZVNlYXJjaERpdi5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHNpdGVTZWFyY2hEaXYub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgc3R5bGVzID0geyAndG9wJzogb2Zmc2V0LnRvcCwgJ2xlZnQnOiBvZmZzZXQubGVmdCB9O1xuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHZhciB2aWV3UG9ydEhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpLFxuICAgICAgICAgICAgICAgICAgICB0b3BPdmVyZmxvdyA9IC1zY3JvbGxUb3AgKyBvZmZzZXQudG9wIC0gY29udGFpbmVySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBib3R0b21PdmVyZmxvdyA9IHNjcm9sbFRvcCArIHZpZXdQb3J0SGVpZ2h0IC0gKG9mZnNldC50b3AgKyBoZWlnaHQgKyBjb250YWluZXJIZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSAoTWF0aC5tYXgodG9wT3ZlcmZsb3csIGJvdHRvbU92ZXJmbG93KSA9PT0gdG9wT3ZlcmZsb3cpID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndG9wJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gLWNvbnRhaW5lckhlaWdodDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSBoZWlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5lciBpcyBub3QgcG9zaXRpb25lZCB0byBib2R5LFxuICAgICAgICAgICAgLy8gY29ycmVjdCBpdHMgcG9zaXRpb24gdXNpbmcgb2Zmc2V0IHBhcmVudCBvZmZzZXRcbiAgICAgICAgICAgIGlmKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIDApLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0RGlmZiA9ICRjb250YWluZXIub2Zmc2V0UGFyZW50KCkub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCAtPSBwYXJlbnRPZmZzZXREaWZmLnRvcDtcbiAgICAgICAgICAgICAgICBzdHlsZXMubGVmdCAtPSBwYXJlbnRPZmZzZXREaWZmLmxlZnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoYXQudmlzaWJsZSl7XG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5Jywgb3BhY2l0eSkuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLndpZHRoID0gc2l0ZVNlYXJjaERpdi5vdXRlcldpZHRoKCkgKyAncHgnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkY29udGFpbmVyLmNzcyhzdHlsZXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZUtpbGxlckZuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB0aGF0LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gbmVlZCB0byByZXN0b3JlIHZhbHVlIHdoZW4gXG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXNlcnZlSW5wdXQgPT09IHRydWUsIFxuICAgICAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHdlIGRpZCBub3QgY2hhbmdlIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wS2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQ3Vyc29yQXRFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWxMZW5ndGggPSB0aGF0LmVsLnZhbCgpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25TdGFydCA9IHRoYXQuZWxlbWVudC5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgICAgICAgICByYW5nZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uU3RhcnQgPT09IHZhbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLXZhbExlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbExlbmd0aCA9PT0gcmFuZ2UudGV4dC5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBhcmUgaGlkZGVuIGFuZCB1c2VyIHByZXNzZXMgYXJyb3cgZG93biwgZGlzcGxheSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIGlmICghdGhhdC5kaXNhYmxlZCAmJiAhdGhhdC52aXNpYmxlICYmIGUud2hpY2ggPT09IGtleXMuRE9XTiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQgfHwgIXRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkVTQzpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJJR0hUOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQgJiYgdGhhdC5pc0N1cnNvckF0RW5kKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5UQUI6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMudGFiRGlzYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlJFVFVSTjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlVXAoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZURvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYW5jZWwgZXZlbnQgaWYgZnVuY3Rpb24gZGlkIG5vdCByZXR1cm46XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLkRPV046XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERlZmVyIGxvb2t1cCBpbiBjYXNlIHdoZW4gdmFsdWUgY2hhbmdlcyB2ZXJ5IHF1aWNrbHk6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGF0Lm9wdGlvbnMuZGVmZXJSZXF1ZXN0QnkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCksXG4gICAgICAgICAgICAgICAgcXVlcnkgPSB0aGF0LmdldFF1ZXJ5KHZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0aW9uICYmIHRoYXQuY3VycmVudFZhbHVlICE9PSBxdWVyeSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAob3B0aW9ucy5vbkludmFsaWRhdGVTZWxlY3Rpb24gfHwgJC5ub29wKS5jYWxsKHRoYXQuZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3Rpbmcgc3VnZ2VzdGlvbiBmb3IgdGhlIG1hdGNoIGJlZm9yZSBwcm9jZWVkaW5nOlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaChxdWVyeSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGggPCBvcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuZ2V0U3VnZ2VzdGlvbnMocXVlcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzRXhhY3RNYXRjaDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgc3VnZ2VzdGlvbnMgPSB0aGlzLnN1Z2dlc3Rpb25zO1xuXG4gICAgICAgICAgICByZXR1cm4gKHN1Z2dlc3Rpb25zLmxlbmd0aCA9PT0gMSAmJiBzdWdnZXN0aW9uc1swXS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBxdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRRdWVyeTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGVsaW1pdGVyID0gdGhpcy5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG4gICAgICAgICAgICByZXR1cm4gJC50cmltKHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uc0xvY2FsOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHF1ZXJ5TG93ZXJDYXNlID0gcXVlcnkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXIgPSBvcHRpb25zLmxvb2t1cEZpbHRlcixcbiAgICAgICAgICAgICAgICBsaW1pdCA9IHBhcnNlSW50KG9wdGlvbnMubG9va3VwTGltaXQsIDEwKSxcbiAgICAgICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25zOiAkLmdyZXAob3B0aW9ucy5sb29rdXAsIGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIoc3VnZ2VzdGlvbiwgcXVlcnksIHF1ZXJ5TG93ZXJDYXNlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGxpbWl0ICYmIGRhdGEuc3VnZ2VzdGlvbnMubGVuZ3RoID4gbGltaXQpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucy5zbGljZSgwLCBsaW1pdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VydmljZVVybCA9IG9wdGlvbnMuc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICAgICAgY2FjaGVLZXksXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzO1xuXG4gICAgICAgICAgICBvcHRpb25zLnBhcmFtc1tvcHRpb25zLnBhcmFtTmFtZV0gPSBxO1xuICAgICAgICAgICAgcGFyYW1zID0gb3B0aW9ucy5pZ25vcmVQYXJhbXMgPyBudWxsIDogb3B0aW9ucy5wYXJhbXM7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2VhcmNoU3RhcnQuY2FsbCh0aGF0LmVsZW1lbnQsIG9wdGlvbnMucGFyYW1zKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5sb29rdXApKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmxvb2t1cChxLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gZGF0YS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgZGF0YS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmdldFN1Z2dlc3Rpb25zTG9jYWwocSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2VydmljZVVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZVVybCA9IHNlcnZpY2VVcmwuY2FsbCh0aGF0LmVsZW1lbnQsIHEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWNoZUtleSA9IHNlcnZpY2VVcmwgKyAnPycgKyAkLnBhcmFtKHBhcmFtcyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmICQuaXNBcnJheShyZXNwb25zZS5zdWdnZXN0aW9ucykpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzcG9uc2Uuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXNwb25zZS5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGF0LmlzQmFkUXVlcnkocSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuXG4gICAgICAgICAgICAgICAgYWpheFNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogb3B0aW9ucy5kYXRhVHlwZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAkLmV4dGVuZChhamF4U2V0dGluZ3MsIG9wdGlvbnMuYWpheFNldHRpbmdzKTtcblxuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSAkLmFqYXgoYWpheFNldHRpbmdzKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvcHRpb25zLnRyYW5zZm9ybVJlc3VsdChkYXRhLCBxKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wcm9jZXNzUmVzcG9uc2UocmVzdWx0LCBxLCBjYWNoZUtleSk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzdWx0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaEVycm9yLmNhbGwodGhhdC5lbGVtZW50LCBxLCBqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0JhZFF1ZXJ5OiBmdW5jdGlvbiAocSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJhZFF1ZXJpZXMgPSB0aGlzLmJhZFF1ZXJpZXMsXG4gICAgICAgICAgICAgICAgaSA9IGJhZFF1ZXJpZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEuaW5kZXhPZihiYWRRdWVyaWVzW2ldKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0aGF0Lm9wdGlvbnMub25IaWRlKSAmJiB0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0Lm9wdGlvbnMub25IaWRlLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd05vU3VnZ2VzdGlvbk5vdGljZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBncm91cEJ5ID0gb3B0aW9ucy5ncm91cEJ5LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdCA9IG9wdGlvbnMuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSksXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24sXG4gICAgICAgICAgICAgICAgY2xhc3NTZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyID0gb3B0aW9ucy5iZWZvcmVSZW5kZXIsXG4gICAgICAgICAgICAgICAgaHRtbCA9ICcnLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIGZvcm1hdEdyb3VwID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhdGVnb3J5ID0gc3VnZ2VzdGlvbi5kYXRhW2dyb3VwQnldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT09IGN1cnJlbnRDYXRlZ29yeSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGN1cnJlbnRDYXRlZ29yeTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiYXV0b2NvbXBsZXRlLWdyb3VwXCI+PHN0cm9uZz4nICsgY2F0ZWdvcnkgKyAnPC9zdHJvbmc+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCAmJiB0aGF0LmlzRXhhY3RNYXRjaCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHN1Z2dlc3Rpb25zIGlubmVyIEhUTUw6XG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBCeSl7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gZm9ybWF0R3JvdXAoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCInICsgY2xhc3NOYW1lICsgJ1wiIGRhdGEtaW5kZXg9XCInICsgaSArICdcIj4nICsgZm9ybWF0UmVzdWx0KHN1Z2dlc3Rpb24sIHZhbHVlLCBpKSArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGJlZm9yZVJlbmRlcikpIHtcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lciwgdGhhdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vIFNlbGVjdCBmaXJzdCB2YWx1ZSBieSBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXV0b1NlbGVjdEZpcnN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wKDApO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jaGlsZHJlbignLicgKyBjbGFzc05hbWUpLmZpcnN0KCkuYWRkQ2xhc3MoY2xhc3NTZWxlY3RlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5vU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICAvLyBTb21lIGV4cGxpY2l0IHN0ZXBzLiBCZSBjYXJlZnVsIGhlcmUgYXMgaXQgZWFzeSB0byBnZXRcbiAgICAgICAgICAgIC8vIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgcmVtb3ZlZCBmcm9tIERPTSBpZiBub3QgZGV0YWNoZWQgcHJvcGVybHkuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7IC8vIGNsZWFuIHN1Z2dlc3Rpb25zIGlmIGFueVxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChub1N1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RDb250YWluZXJXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICAvLyBJZiB3aWR0aCBpcyBhdXRvLCBhZGp1c3Qgd2lkdGggYmVmb3JlIGRpc3BsYXlpbmcgc3VnZ2VzdGlvbnMsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGlmIGluc3RhbmNlIHdhcyBjcmVhdGVkIGJlZm9yZSBpbnB1dCBoYWQgd2lkdGgsIGl0IHdpbGwgYmUgemVyby5cbiAgICAgICAgICAgIC8vIEFsc28gaXQgYWRqdXN0cyBpZiBpbnB1dCB3aWR0aCBoYXMgY2hhbmdlZC5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IHRoYXQuZWwub3V0ZXJXaWR0aCgpO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jc3MoJ3dpZHRoJywgd2lkdGggPiAwID8gd2lkdGggOiAzMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpbmRCZXN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZE1hdGNoID0gc3VnZ2VzdGlvbi52YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodmFsdWUpID09PSAwO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZE1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaCA9IHN1Z2dlc3Rpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAhZm91bmRNYXRjaDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQoYmVzdE1hdGNoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaWduYWxIaW50OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgdmFyIGhpbnRWYWx1ZSA9ICcnLFxuICAgICAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBoaW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZSArIHN1Z2dlc3Rpb24udmFsdWUuc3Vic3RyKHRoYXQuY3VycmVudFZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhhdC5oaW50VmFsdWUgIT09IGhpbnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuaGludFZhbHVlID0gaGludFZhbHVlO1xuICAgICAgICAgICAgICAgIHRoYXQuaGludCA9IHN1Z2dlc3Rpb247XG4gICAgICAgICAgICAgICAgKHRoaXMub3B0aW9ucy5vbkhpbnQgfHwgJC5ub29wKShoaW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0OiBmdW5jdGlvbiAoc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGlzIHN0cmluZyBhcnJheSwgY29udmVydCB0aGVtIHRvIHN1cHBvcnRlZCBmb3JtYXQ6XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoICYmIHR5cGVvZiBzdWdnZXN0aW9uc1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5tYXAoc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRhdGE6IG51bGwgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlT3JpZW50YXRpb246IGZ1bmN0aW9uKG9yaWVudGF0aW9uLCBmYWxsYmFjaykge1xuICAgICAgICAgICAgb3JpZW50YXRpb24gPSAkLnRyaW0ob3JpZW50YXRpb24gfHwgJycpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIGlmKCQuaW5BcnJheShvcmllbnRhdGlvbiwgWydhdXRvJywgJ2JvdHRvbScsICd0b3AnXSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IGZhbGxiYWNrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3JpZW50YXRpb247XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJvY2Vzc1Jlc3BvbnNlOiBmdW5jdGlvbiAocmVzdWx0LCBvcmlnaW5hbFF1ZXJ5LCBjYWNoZUtleSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnM7XG5cbiAgICAgICAgICAgIHJlc3VsdC5zdWdnZXN0aW9ucyA9IHRoYXQudmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQocmVzdWx0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgLy8gQ2FjaGUgcmVzdWx0cyBpZiBjYWNoZSBpcyBub3QgZGlzYWJsZWQ6XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubm9DYWNoZSkge1xuICAgICAgICAgICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzICYmICFyZXN1bHQuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYmFkUXVlcmllcy5wdXNoKG9yaWdpbmFsUXVlcnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmV0dXJuIGlmIG9yaWdpbmFsUXVlcnkgaXMgbm90IG1hdGNoaW5nIGN1cnJlbnQgcXVlcnk6XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxRdWVyeSAhPT0gdGhhdC5nZXRRdWVyeSh0aGF0LmN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXN1bHQuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuID0gY29udGFpbmVyLmZpbmQoJy4nICsgdGhhdC5jbGFzc2VzLnN1Z2dlc3Rpb24pO1xuXG4gICAgICAgICAgICBjb250YWluZXIuZmluZCgnLicgKyBzZWxlY3RlZCkucmVtb3ZlQ2xhc3Moc2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCAhPT0gLTEgJiYgY2hpbGRyZW4ubGVuZ3RoID4gdGhhdC5zZWxlY3RlZEluZGV4KSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IGNoaWxkcmVuLmdldCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICQoYWN0aXZlSXRlbSkuYWRkQ2xhc3Moc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVJdGVtO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSA9ICQuaW5BcnJheSh0aGF0LmhpbnQsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LnNlbGVjdChpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQub25TZWxlY3QoaSk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVVcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY2hpbGRyZW4oKS5maXJzdCgpLnJlbW92ZUNsYXNzKHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggLSAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAodGhhdC5zdWdnZXN0aW9ucy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4ICsgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gdGhhdC5hY3RpdmF0ZShpbmRleCk7XG5cbiAgICAgICAgICAgIGlmICghYWN0aXZlSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9mZnNldFRvcCxcbiAgICAgICAgICAgICAgICB1cHBlckJvdW5kLFxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmQsXG4gICAgICAgICAgICAgICAgaGVpZ2h0RGVsdGEgPSAkKGFjdGl2ZUl0ZW0pLm91dGVySGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIG9mZnNldFRvcCA9IGFjdGl2ZUl0ZW0ub2Zmc2V0VG9wO1xuICAgICAgICAgICAgdXBwZXJCb3VuZCA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBsb3dlckJvdW5kID0gdXBwZXJCb3VuZCArIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgLSBoZWlnaHREZWx0YTtcblxuICAgICAgICAgICAgaWYgKG9mZnNldFRvcCA8IHVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3ApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRUb3AgPiBsb3dlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wIC0gdGhhdC5vcHRpb25zLm1heEhlaWdodCArIGhlaWdodERlbHRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuZ2V0VmFsdWUodGhhdC5zdWdnZXN0aW9uc1tpbmRleF0udmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjayA9IHRoYXQub3B0aW9ucy5vblNlbGVjdCxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uID0gdGhhdC5zdWdnZXN0aW9uc1tpbmRleF07XG5cbiAgICAgICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5nZXRWYWx1ZShzdWdnZXN0aW9uLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpICYmICF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBzdWdnZXN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9uU2VsZWN0Q2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgb25TZWxlY3RDYWxsYmFjay5jYWxsKHRoYXQuZWxlbWVudCwgc3VnZ2VzdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRlbGltaXRlciA9IHRoYXQub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWU7XG4gICAgICAgICAgICBwYXJ0cyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLnN1YnN0cigwLCBjdXJyZW50VmFsdWUubGVuZ3RoIC0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSArIHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuZWwub2ZmKCcuYXV0b2NvbXBsZXRlJykucmVtb3ZlRGF0YSgnYXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGNoYWluYWJsZSBqUXVlcnkgcGx1Z2luOlxuICAgICQuZm4uYXV0b2NvbXBsZXRlID0gJC5mbi5kZXZicmlkZ2VBdXRvY29tcGxldGUgPSBmdW5jdGlvbiAob3B0aW9ucywgYXJncykge1xuICAgICAgICB2YXIgZGF0YUtleSA9ICdhdXRvY29tcGxldGUnO1xuICAgICAgICAvLyBJZiBmdW5jdGlvbiBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnQgcmV0dXJuXG4gICAgICAgIC8vIGluc3RhbmNlIG9mIHRoZSBmaXJzdCBtYXRjaGVkIGVsZW1lbnQ6XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3QoKS5kYXRhKGRhdGFLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5wdXRFbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXkpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtvcHRpb25zXShhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIGluc3RhbmNlIGFscmVhZHkgZXhpc3RzLCBkZXN0cm95IGl0OlxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiBpbnN0YW5jZS5kaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQXV0b2NvbXBsZXRlKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlucHV0RWxlbWVudC5kYXRhKGRhdGFLZXksIGluc3RhbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0pKTtcbiIsIlxuJChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xuXG52YXIgYmFzZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYmFzZScpO1xudmFyIGJhc2VIcmVmID0gbnVsbDtcblxuaWYgKGJhc2VzLmxlbmd0aCA+IDApIHtcbiAgICBiYXNlSHJlZiA9IGJhc2VzWzBdLmhyZWY7XG59XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIExhenkgTG9hZGluZyBJbWFnZXM6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbnZhciBteUxhenlMb2FkID0gbmV3IExhenlMb2FkKHtcbiAgICAvLyBleGFtcGxlIG9mIG9wdGlvbnMgb2JqZWN0IC0+IHNlZSBvcHRpb25zIHNlY3Rpb25cbiAgICBlbGVtZW50c19zZWxlY3RvcjogXCIuZHAtbGF6eVwiXG4gICAgLy8gdGhyb3R0bGU6IDIwMCxcbiAgICAvLyBkYXRhX3NyYzogXCJzcmNcIixcbiAgICAvLyBkYXRhX3NyY3NldDogXCJzcmNzZXRcIixcbiAgICAvLyBjYWxsYmFja19zZXQ6IGZ1bmN0aW9uKCkgeyAvKiAuLi4gKi8gfVxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gQmlnIENhcm91c2VsIChIb21lIFBhZ2UpOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbnZhciAkY2Fyb3VzZWwgPSAkKCcuY2Fyb3VzZWwnKS5mbGlja2l0eSh7XG5cdGltYWdlc0xvYWRlZDogdHJ1ZSxcblx0cGVyY2VudFBvc2l0aW9uOiBmYWxzZSxcblx0c2VsZWN0ZWRBdHRyYWN0aW9uOiAwLjAxNSxcblx0ZnJpY3Rpb246IDAuMyxcblx0cHJldk5leHRCdXR0b25zOiBmYWxzZSxcblx0ZHJhZ2dhYmxlOiB0cnVlLFxuXHRhdXRvUGxheTogdHJ1ZSxcblx0YXV0b1BsYXk6IDgwMDAsXG5cdHBhdXNlQXV0b1BsYXlPbkhvdmVyOiBmYWxzZSxcblx0YmdMYXp5TG9hZDogdHJ1ZSxcblx0cGFnZURvdHM6IHRydWVcbn0pO1xuXG52YXIgJGltZ3MgPSAkY2Fyb3VzZWwuZmluZCgnLmNhcm91c2VsLWNlbGwgLmNlbGwtYmcnKTtcbi8vIGdldCB0cmFuc2Zvcm0gcHJvcGVydHlcbnZhciBkb2NTdHlsZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtcbnZhciB0cmFuc2Zvcm1Qcm9wID0gdHlwZW9mIGRvY1N0eWxlLnRyYW5zZm9ybSA9PSAnc3RyaW5nJyA/XG4gICd0cmFuc2Zvcm0nIDogJ1dlYmtpdFRyYW5zZm9ybSc7XG4vLyBnZXQgRmxpY2tpdHkgaW5zdGFuY2VcbnZhciBmbGt0eSA9ICRjYXJvdXNlbC5kYXRhKCdmbGlja2l0eScpO1xuXG4kY2Fyb3VzZWwub24oICdzY3JvbGwuZmxpY2tpdHknLCBmdW5jdGlvbigpIHtcbiAgZmxrdHkuc2xpZGVzLmZvckVhY2goIGZ1bmN0aW9uKCBzbGlkZSwgaSApIHtcbiAgICB2YXIgaW1nID0gJGltZ3NbaV07XG4gICAgdmFyIHggPSAoIHNsaWRlLnRhcmdldCArIGZsa3R5LnggKSAqIC0xLzM7XG4gICAgaW1nLnN0eWxlWyB0cmFuc2Zvcm1Qcm9wIF0gPSAndHJhbnNsYXRlWCgnICsgeCAgKyAncHgpJztcbiAgfSk7XG59KTtcblxuJCgnLmNhcm91c2VsLW5hdi1jZWxsJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdGZsa3R5LnN0b3BQbGF5ZXIoKTtcbn0pO1xuXG52YXIgJGdhbGxlcnkgPSAkKCcuY2Fyb3VzZWwnKS5mbGlja2l0eSgpO1xuXG5mdW5jdGlvbiBvbkxvYWRlZGRhdGEoIGV2ZW50ICkge1xuXHR2YXIgY2VsbCA9ICRnYWxsZXJ5LmZsaWNraXR5KCAnZ2V0UGFyZW50Q2VsbCcsIGV2ZW50LnRhcmdldCApO1xuXHQkZ2FsbGVyeS5mbGlja2l0eSggJ2NlbGxTaXplQ2hhbmdlJywgY2VsbCAmJiBjZWxsLmVsZW1lbnQgKTtcbn1cblxuJGdhbGxlcnkuZmluZCgndmlkZW8nKS5lYWNoKCBmdW5jdGlvbiggaSwgdmlkZW8gKSB7XG5cdHZpZGVvLnBsYXkoKTtcblx0JCggdmlkZW8gKS5vbiggJ2xvYWRlZGRhdGEnLCBvbkxvYWRlZGRhdGEgKTtcbn0pO1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyBTbGlkZXNob3cgYmxvY2sgKGluIGNvbnRlbnQpOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG52YXIgJHNsaWRlc2hvdyA9ICQoJy5zbGlkZXNob3cnKS5mbGlja2l0eSh7XG5cdC8vYWRhcHRpdmVIZWlnaHQ6IHRydWUsXG5cdGltYWdlc0xvYWRlZDogdHJ1ZSxcblx0bGF6eUxvYWQ6IHRydWVcbn0pO1xuXG52YXIgc2xpZGVzaG93ZmxrID0gJHNsaWRlc2hvdy5kYXRhKCdmbGlja2l0eScpO1xuXG4kc2xpZGVzaG93Lm9uKCAnc2VsZWN0LmZsaWNraXR5JywgZnVuY3Rpb24oKSB7XG5cdGNvbnNvbGUubG9nKCAnRmxpY2tpdHkgc2VsZWN0ICcgKyBzbGlkZXNob3dmbGsuc2VsZWN0ZWRJbmRleCApO1xuXHQvL3NsaWRlc2hvd2Zsay5yZWxvYWRDZWxscygpO1xuXG59KVxuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vIFN0YXJ0IEZvdW5kYXRpb24gT3JiaXQgU2xpZGVyOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vLyB2YXIgc2xpZGVyT3B0aW9ucyA9IHtcbi8vIFx0Y29udGFpbmVyQ2xhc3M6ICdzbGlkZXJfX3NsaWRlcycsXG4vLyBcdHNsaWRlQ2xhc3M6ICdzbGlkZXJfX3NsaWRlJyxcbi8vIFx0bmV4dENsYXNzOiAnc2xpZGVyX19uYXYtLW5leHQnLFxuLy8gXHRwcmV2Q2xhc3M6ICdzbGlkZXJfX25hdi0tcHJldmlvdXMnLFxuXG4vLyB9O1xuXG5cbi8vIHZhciBzbGlkZXIgPSBuZXcgRm91bmRhdGlvbi5PcmJpdCgkKCcuc2xpZGVyJyksIHNsaWRlck9wdGlvbnMpO1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vV3JhcCBldmVyeSBpZnJhbWUgaW4gYSBmbGV4IHZpZGVvIGNsYXNzIHRvIHByZXZlbnQgbGF5b3V0IGJyZWFrYWdlXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiQoJ2lmcmFtZScpLmVhY2goZnVuY3Rpb24oKXtcblx0JCh0aGlzKS53cmFwKCBcIjxkaXYgY2xhc3M9J2ZsZXgtdmlkZW8gd2lkZXNjcmVlbic+PC9kaXY+XCIgKTtcblxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9EaXN0aW5ndWlzaCBkcm9wZG93bnMgb24gbW9iaWxlL2Rlc2t0b3A6XG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuJCgnLm5hdl9faXRlbS0tcGFyZW50JykuY2xpY2soZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKHdoYXRJbnB1dC5hc2soKSA9PT0gJ3RvdWNoJykge1xuICAgIC8vIGRvIHRvdWNoIGlucHV0IHRoaW5nc1xuICAgIGlmKCEkKHRoaXMpLmhhc0NsYXNzKCduYXZfX2l0ZW0tLWlzLWhvdmVyZWQnKSl7XG5cdCAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHQgICAgJCgnLm5hdl9faXRlbS0tcGFyZW50JykucmVtb3ZlQ2xhc3MoJ25hdl9faXRlbS0taXMtaG92ZXJlZCcpO1xuXHQgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnbmF2X19pdGVtLS1pcy1ob3ZlcmVkJylcbiAgICB9XG4gIH0gZWxzZSBpZiAod2hhdElucHV0LmFzaygpID09PSAnbW91c2UnKSB7XG4gICAgLy8gZG8gbW91c2UgdGhpbmdzXG4gIH1cbn0pO1xuXG4vL0lmIGFueXRoaW5nIGluIHRoZSBtYWluIGNvbnRlbnQgY29udGFpbmVyIGlzIGNsaWNrZWQsIHJlbW92ZSBmYXV4IGhvdmVyIGNsYXNzLlxuJCgnI21haW4tY29udGVudF9fY29udGFpbmVyJykuY2xpY2soZnVuY3Rpb24oKXtcblx0JCgnLm5hdl9faXRlbScpLnJlbW92ZUNsYXNzKCduYXZfX2l0ZW0tLWlzLWhvdmVyZWQnKTtcblxufSk7XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9TaXRlIFNlYXJjaDpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5mdW5jdGlvbiB0b2dnbGVTZWFyY2hDbGFzc2VzKCl7XG5cdCQoXCJib2R5XCIpLnRvZ2dsZUNsYXNzKFwiYm9keS0tc2VhcmNoLWFjdGl2ZVwiKTtcblx0JCgnLm5hdi1jb2xsYXBzZScpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG5cdCQoJy5uYXZfX21lbnUtaWNvbicpLnJlbW92ZUNsYXNzKCdpcy1jbGlja2VkJyk7XG5cdCQoXCIjbmF2X19tZW51LWljb25cIikucmVtb3ZlQ2xhc3MoXCJuYXZfX21lbnUtaWNvbi0tbWVudS1pcy1hY3RpdmVcIik7XG5cdCQoXCIjc2l0ZS1zZWFyY2hfX2Zvcm1cIikudG9nZ2xlQ2xhc3MoXCJzaXRlLXNlYXJjaF9fZm9ybS0taXMtaW5hY3RpdmUgc2l0ZS1zZWFyY2hfX2Zvcm0tLWlzLWFjdGl2ZVwiKTtcblx0JChcIiNzaXRlLXNlYXJjaFwiKS50b2dnbGVDbGFzcyhcInNpdGUtc2VhcmNoLS1pcy1pbmFjdGl2ZSBzaXRlLXNlYXJjaC0taXMtYWN0aXZlXCIpO1xuXHQkKFwiLmhlYWRlcl9fc2NyZWVuXCIpLnRvZ2dsZUNsYXNzKFwiaGVhZGVyX19zY3JlZW4tLWdyYXlzY2FsZVwiKTtcblx0JChcIi5tYWluLWNvbnRlbnRfX2NvbnRhaW5lclwiKS50b2dnbGVDbGFzcyhcIm1haW4tY29udGVudF9fY29udGFpbmVyLS1ncmF5c2NhbGVcIik7XG5cdCQoXCIubmF2X193cmFwcGVyXCIpLnRvZ2dsZUNsYXNzKFwibmF2X193cmFwcGVyLS1ncmF5c2NhbGVcIik7XG5cdCQoXCIubmF2X19saW5rLS1zZWFyY2hcIikudG9nZ2xlQ2xhc3MoXCJuYXZfX2xpbmstLXNlYXJjaC1pcy1hY3RpdmVcIik7XG5cblx0Ly9IQUNLOiB3YWl0IGZvciA1bXMgYmVmb3JlIGNoYW5naW5nIGZvY3VzLiBJIGRvbid0IHRoaW5rIEkgbmVlZCB0aGlzIGFueW1vcmUgYWN0dWFsbHkuLlxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdCAgJChcIi5uYXZfX3dyYXBwZXJcIikudG9nZ2xlQ2xhc3MoXCJuYXZfX3dyYXBwZXItLXNlYXJjaC1pcy1hY3RpdmVcIik7XG5cdH0sIDUpO1xuXG5cdCQoXCIubmF2XCIpLnRvZ2dsZUNsYXNzKFwibmF2LS1zZWFyY2gtaXMtYWN0aXZlXCIpO1xuXG59XG5cbiQoXCIubmF2X19saW5rLS1zZWFyY2hcIikuY2xpY2soZnVuY3Rpb24oKXtcbiAgXHR0b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG4gIFx0aWYoJChcIiNtb2JpbGUtbmF2X193cmFwcGVyXCIpLmhhc0NsYXNzKFwibW9iaWxlLW5hdl9fd3JhcHBlci0tbW9iaWxlLW1lbnUtaXMtYWN0aXZlXCIpKXtcbiAgXHRcdHRvZ2dsZU1vYmlsZU1lbnVDbGFzc2VzKCk7XG4gIFx0XHQkKFwiI3NpdGUtc2VhcmNoXCIpLmFwcGVuZFRvKCcjaGVhZGVyJykuYWRkQ2xhc3MoJ3NpdGUtc2VhcmNoLS1tb2JpbGUnKTtcbiAgXHR9XG4gIFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaXRlLXNlYXJjaF9faW5wdXRcIikuZm9jdXMoKTtcbn0pO1xuXG4kKFwiLm5hdl9fbGluay0tc2VhcmNoLWNhbmNlbFwiKS5jbGljayhmdW5jdGlvbigpe1xuXHR0b2dnbGVTZWFyY2hDbGFzc2VzKCk7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2l0ZS1zZWFyY2hfX2lucHV0XCIpLmJsdXIoKTtcbn0pO1xuXG4vL1doZW4gc2VhcmNoIGZvcm0gaXMgb3V0IG9mIGZvY3VzLCBkZWFjdGl2YXRlIGl0LlxuJChcIiNzaXRlLXNlYXJjaF9fZm9ybVwiKS5mb2N1c291dChmdW5jdGlvbigpe1xuICBcdGlmKCQoXCIjc2l0ZS1zZWFyY2hfX2Zvcm1cIikuaGFzQ2xhc3MoXCJzaXRlLXNlYXJjaF9fZm9ybS0taXMtYWN0aXZlXCIpKXtcbiAgXHRcdC8vQ29tbWVudCBvdXQgdGhlIGZvbGxvd2luZyBsaW5lIGlmIHlvdSBuZWVkIHRvIHVzZSBXZWJLaXQvQmxpbmsgaW5zcGVjdG9yIHRvb2wgb24gdGhlIHNlYXJjaCAoc28gaXQgZG9lc24ndCBsb3NlIGZvY3VzKTpcbiAgXHRcdC8vdG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuICBcdH1cbn0pO1xuXG4kKCdpbnB1dFtuYW1lPVwiU2VhcmNoXCJdJykuYXV0b2NvbXBsZXRlKHtcbiAgICBzZXJ2aWNlVXJsOiBiYXNlSHJlZisnL2hvbWUvYXV0b0NvbXBsZXRlJyxcbiAgICBkZWZlclJlcXVlc3RCeTogMTAwLFxuICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IGZhbHNlLFxuICAgIG1pbkNoYXJzOiAyLFxuICAgIGF1dG9TZWxlY3RGaXJzdDogdHJ1ZSxcbiAgICB0eXBlOiAncG9zdCcsXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICQoJyNzaXRlLXNlYXJjaF9fZm9ybScpLnN1Ym1pdCgpO1xuICAgIH1cbn0pO1xuXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy9Nb2JpbGUgU2VhcmNoOlxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbmlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCgnbWVkaXVtJykpIHtcbiAgLy8gVHJ1ZSBpZiBtZWRpdW0gb3IgbGFyZ2VcbiAgLy8gRmFsc2UgaWYgc21hbGxcbiAgJChcIiNzaXRlLXNlYXJjaFwiKS5hZGRDbGFzcyhcInNpdGUtc2VhcmNoLS1kZXNrdG9wXCIpO1xufWVsc2V7XG5cdCQoXCIjc2l0ZS1zZWFyY2hcIikuYWRkQ2xhc3MoXCJzaXRlLXNlYXJjaC0tbW9iaWxlXCIpO1xufVxuXG5cbiQoXCIubmF2X190b2dnbGUtLXNlYXJjaFwiKS5jbGljayhmdW5jdGlvbigpe1xuICBcdHRvZ2dsZVNlYXJjaENsYXNzZXMoKTtcblxuXG5cbiAgXHQvL2FwcGVuZCBvdXIgc2l0ZSBzZWFyY2ggZGl2IHRvIHRoZSBoZWFkZXIuXG4gIFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hcHBlbmRUbygnI2hlYWRlcicpLmFkZENsYXNzKCdzaXRlLXNlYXJjaC0tbW9iaWxlJyk7XG4gIFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaXRlLXNlYXJjaF9faW5wdXRcIikuZm9jdXMoKTtcbn0pO1xuXG4vL0lmIHdlJ3JlIHJlc2l6aW5nIGZyb20gbW9iaWxlIHRvIGFueXRoaW5nIGVsc2UsIHRvZ2dsZSB0aGUgbW9iaWxlIHNlYXJjaCBpZiBpdCdzIGFjdGl2ZS5cbiQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oZXZlbnQsIG5ld1NpemUsIG9sZFNpemUpIHtcblxuXHQgaWYgKG5ld1NpemUgPT0gXCJtZWRpdW1cIikge1xuXHQgXHQvL2FsZXJ0KCdoZXknKTtcblx0IFx0JChcIiNzaXRlLXNlYXJjaFwiKS5yZW1vdmVDbGFzcyhcInNpdGUtc2VhcmNoLS1tb2JpbGVcIik7XG5cdCBcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYWRkQ2xhc3MoXCJzaXRlLXNlYXJjaC0tZGVza3RvcFwiKTtcblxuXHRcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYXBwZW5kVG8oXCIjbmF2XCIpO1xuXG5cblx0IFx0aWYoJChcIiNzaXRlLXNlYXJjaFwiKS5oYXNDbGFzcyhcInNpdGUtc2VhcmNoLS1pcy1hY3RpdmVcIikpe1xuXHQgXHRcdC8vIHRvZ2dsZVNlYXJjaENsYXNzZXMoKTtcblx0IFx0fVxuXHQgfWVsc2UgaWYobmV3U2l6ZSA9PSBcIm1vYmlsZVwiKXtcblx0IFx0JChcIiNzaXRlLXNlYXJjaFwiKS5hcHBlbmRUbygnI2hlYWRlcicpO1xuIFx0XHQkKFwiI3NpdGUtc2VhcmNoXCIpLnJlbW92ZUNsYXNzKFwic2l0ZS1zZWFyY2gtLWRlc2t0b3BcIik7XG4gXHRcdCQoXCIjc2l0ZS1zZWFyY2hcIikuYWRkQ2xhc3MoXCJzaXRlLXNlYXJjaC0tbW9iaWxlXCIpO1xuXHQgXHRpZigkKFwiI3NpdGUtc2VhcmNoXCIpLmhhc0NsYXNzKFwic2l0ZS1zZWFyY2gtLWlzLWFjdGl2ZVwiKSl7XG5cdCBcdFx0Ly8gdG9nZ2xlU2VhcmNoQ2xhc3NlcygpO1xuXHQgXHR9XG5cdCB9XG5cbn0pO1xuXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8vTW9iaWxlIE5hdjpcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4vKiBuZXcgc3R1ZmYgYWRkZWQgbXkgQnJhbmRvbiAtIGxhenkgY29kaW5nICovXG4kKCcubmF2X190b2dnbGUtLW1lbnUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXHQkKCcubmF2X19tZW51LWljb24nKS50b2dnbGVDbGFzcygnaXMtY2xpY2tlZCcpO1xuXHQkKFwiI25hdl9fbWVudS1pY29uXCIpLnRvZ2dsZUNsYXNzKFwibmF2X19tZW51LWljb24tLW1lbnUtaXMtYWN0aXZlXCIpO1xuXHQkKCcubmF2LWNvbGxhcHNlJykudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbn0pO1xuXG4kKCcuc2Vjb25kLWxldmVsLS1vcGVuJykuY2xpY2soZnVuY3Rpb24oKXtcblx0JCh0aGlzKS5wYXJlbnQoKS50b2dnbGVDbGFzcygnbmF2X19pdGVtLS1vcGVuZWQnKTtcblx0aWYgKCQodGhpcykubmV4dCgpLmF0dHIoJ2FyaWEtaGlkZGVuJykgPT0gJ3RydWUnKSB7XG5cdFx0JCh0aGlzKS5uZXh0KCkuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKVxuXHR9IGVsc2Uge1xuXHRcdCQodGhpcykubmV4dCgpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuXHR9XG5cblx0aWYgKCQodGhpcykuYXR0cignYXJpYS1leHBhbmRlZCcpID09ICdmYWxzZScpIHtcblx0XHQkKHRoaXMpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpXG5cdH0gZWxzZSB7XG5cdFx0JCh0aGlzKS5uZXh0KCkuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXG5cdH1cbn0pO1xuXG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLy8gQmFja2dyb3VuZCBWaWRlb1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4kKCcuYmFja2dyb3VuZHZpZGVvX19saW5rJykuY2xpY2soZnVuY3Rpb24oZSl7XG5cdHZhciB0aGF0ID0gJCh0aGlzKTtcblx0dmFyIHZpZGVvID0gdGhhdC5kYXRhKCd2aWRlbycpO1xuXHR2YXIgd2lkdGggPSAkKCdpbWcnLCB0aGF0KS53aWR0aCgpO1xuXHR2YXIgaGVpZ2h0ID0gJCgnaW1nJywgdGhhdCkuaGVpZ2h0KCk7XG5cdHRoYXQucGFyZW50KCkuYWRkQ2xhc3MoJ29uJyk7XG5cdHRoYXQucGFyZW50KCkucHJlcGVuZCgnPGRpdiBjbGFzcz1cImZsZXgtdmlkZW8gd2lkZXNjcmVlblwiPjxpZnJhbWUgc3JjPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJyArIHZpZGVvICsgJz9yZWw9MCZhdXRvcGxheT0xXCIgd2lkdGg9XCInICsgd2lkdGggKyAnXCIgaGVpZ2h0PVwiJyArIGhlaWdodCArICdcIiBmcmFtZWJvcmRlcj1cIjBcIiB3ZWJraXRBbGxvd0Z1bGxTY3JlZW4gbW96YWxsb3dmdWxsc2NyZWVuIGFsbG93RnVsbFNjcmVlbj48L2lmcmFtZT48L2Rpdj4nKTtcblx0dGhhdC5oaWRlKCk7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xuXG5cblxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4vL0F1dG9tYXRpYyBmdWxsIGhlaWdodCBzaWxkZXIsIG5vdCB3b3JraW5nIHlldC4uXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuLy8gZnVuY3Rpb24gc2V0RGltZW5zaW9ucygpe1xuLy8gICAgdmFyIHdpbmRvd3NIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cbi8vICAgICQoJy5vcmJpdC1jb250YWluZXInKS5jc3MoJ2hlaWdodCcsIHdpbmRvd3NIZWlnaHQgKyAncHgnKTtcbi8vICAgLy8gJCgnLm9yYml0LWNvbnRhaW5lcicpLmNzcygnbWF4LWhlaWdodCcsIHdpbmRvd3NIZWlnaHQgKyAncHgnKTtcblxuLy8gICAgJCgnLm9yYml0LXNsaWRlJykuY3NzKCdoZWlnaHQnLCB3aW5kb3dzSGVpZ2h0ICsgJ3B4Jyk7XG4vLyAgICAkKCcub3JiaXQtc2xpZGUnKS5jc3MoJ21heC1oZWlnaHQnLCB3aW5kb3dzSGVpZ2h0ICsgJ3B4Jyk7XG4vLyB9XG5cbi8vICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4vLyAgICAgc2V0RGltZW5zaW9ucygpO1xuLy8gfSk7XG5cbi8vIHNldERpbWVuc2lvbnMoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
