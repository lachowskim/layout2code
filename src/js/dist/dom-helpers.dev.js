"use strict";

/**
 * DOM Helper Utilities Module
 * Lightweight wrappers for common DOM operations
 */
(function () {
  'use strict'; // Core DOM query helpers

  var $q = function $q(selector) {
    return document.querySelector(selector);
  };

  var $$q = function $$q(selector) {
    return document.querySelectorAll(selector);
  }; // Safe event listener helper


  var on = function on(el, evt, cb) {
    return el && el.addEventListener(evt, cb);
  }; // Additional helpers for common operations


  var qsAllArray = function qsAllArray(selector) {
    return Array.from(document.querySelectorAll(selector));
  };

  var closestAttr = function closestAttr(element, attribute) {
    var current = element;

    while (current && current !== document) {
      if (current.hasAttribute && current.hasAttribute(attribute)) {
        return current.getAttribute(attribute);
      }

      current = current.parentElement;
    }

    return null;
  };

  var addClass = function addClass(el, className) {
    return el && el.classList.add(className);
  };

  var removeClass = function removeClass(el, className) {
    return el && el.classList.remove(className);
  };

  var toggleClass = function toggleClass(el, className) {
    return el && el.classList.toggle(className);
  };

  var hasClass = function hasClass(el, className) {
    return el && el.classList.contains(className);
  }; // Initialize Portfolio namespace


  window.Portfolio = window.Portfolio || {}; // Expose DOM helpers

  window.Portfolio.dom = {
    $q: $q,
    $$q: $$q,
    on: on,
    qsAllArray: qsAllArray,
    closestAttr: closestAttr,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    hasClass: hasClass
  };

  if (window.Portfolio.debug) {
    console.log('[DOM HELPERS] Module loaded successfully');
  }
})();