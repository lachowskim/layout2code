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
  }; // Initialize Portfolio namespace


  window.Portfolio = window.Portfolio || {}; // Expose DOM helpers

  window.Portfolio.dom = {
    $q: $q,
    $$q: $$q,
    on: on
  };

  if (window.Portfolio.debug) {
    console.log('[DOM HELPERS] Module loaded successfully');
  }
})();