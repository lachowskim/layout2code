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
  
  // Additional helpers for common operations
  const qsAllArray = selector => Array.from(document.querySelectorAll(selector));
  
  const closestAttr = (element, attribute) => {
    let current = element;
    while (current && current !== document) {
      if (current.hasAttribute && current.hasAttribute(attribute)) {
        return current.getAttribute(attribute);
      }
      current = current.parentElement;
    } 
    return null;
  };
  
  const addClass = (el, className) => el && el.classList.add(className);
  const removeClass = (el, className) => el && el.classList.remove(className);
  const toggleClass = (el, className) => el && el.classList.toggle(className);
  const hasClass = (el, className) => el && el.classList.contains(className);
  
  // Initialize Portfolio namespace
  window.Portfolio = window.Portfolio || {};
  
  // Expose DOM helpers
  window.Portfolio.dom = {
    $q,
    $$q,
    on,
    qsAllArray,
    closestAttr,
    addClass,
    removeClass,
    toggleClass,
    hasClass
  };
  
  if (window.Portfolio.debug) {
    console.log('[DOM HELPERS] Module loaded successfully');
  }
})(); 