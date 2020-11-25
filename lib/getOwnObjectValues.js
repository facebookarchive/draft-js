"use strict";

/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * 
 * @typechecks
 * @format
 */

/**
 * Retrieve an object's own values as an array. If you want the values in the
 * protoype chain, too, use getObjectValuesIncludingPrototype.
 *
 * If you are looking for a function that creates an Array instance based
 * on an "Array-like" object, use createArrayFrom instead.
 *
 * @param {object} obj An object.
 * @return {array}     The object's values.
 */
function getOwnObjectValues(obj) {
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
}

module.exports = getOwnObjectValues;