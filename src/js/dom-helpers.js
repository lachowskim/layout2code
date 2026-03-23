/**
 * DOM Helper Utilities Module
 * Lightweight wrappers for common DOM operations
 */
(function() {
  'use strict';
  
  // Core DOM query helpers
  const $q = selector => document.querySelector(selector);
  const $$q = selector => document.querySelectorAll(selector);
  
  // Safe event listener helper
  const on = (el, evt, cb) => el && el.addEventListener(evt, cb);
  
  // Initialize Portfolio namespace
  window.Portfolio = window.Portfolio || {};
  
  // Expose DOM helpers
  window.Portfolio.dom = {
    $q,
    $$q,
    on
  };
  
  if (window.Portfolio.debug) {
    console.log('[DOM HELPERS] Module loaded successfully');
  }
})(); 