'use strict';

/**
 * Module dependencies
 */

var isValidRule = require('./is-valid-rule');

/**
 * Module exports
 */

module.exports = validateCustomProperties;

/**
 * @param {Array} rules
 * @param {String} componentName
 */

function validateCustomProperties(rules, componentName) {
  rules.forEach(function (rule) {
    if (!isValidRule(rule) || rule.selectors[0] !== ':root') return;

    var ruleColumn = rule.position.start.column;
    var ruleLine = rule.position.start.line;
    var ruleSource = rule.position.source;

    var propNames = [];
    rule.declarations.forEach(function (declaration) {
      if (declaration.type !== 'declaration') {
        return;
      }
      var column = declaration.position.start.column;
      var line = declaration.position.start.line;
      var property = declaration.property;

      if (property.indexOf('--') !== 0) {
        throw new Error(
          'Invalid property name "' + property + '" near line ' + line + ':' + column + '. ' +
          'A component\'s `:root` rule must only contain custom properties.'
        );
      }

      var componentNameAlt = componentName.replace(/([A-Z])/g, function($1, i) {
        if (i == 0) {
          return $1.toLowerCase();
        }
        return '-' + $1.toLowerCase();
      });

      if (property.indexOf(componentName) === -1 && property.indexOf(componentNameAlt) === -1) {
        throw new Error(
          'Invalid custom property name "' + property + '" near line ' + line + ':' + column + '. ' +
          'Custom properties must contain the component name.'
        );
      }

      if (property) {
        propNames.push(property);
      }
    });

    var firstHash = propNames.join(',');
    var sortedProps = propNames.sort();
    var secondHash = sortedProps.join(',');

    if (firstHash !== secondHash) {
      throw new Error(
        'Out of order properties in rule near line ' + ruleSource + ':' +
        ruleLine + ':' + ruleColumn + '.\n' +
        'Expected: ' + secondHash + '\n' +
        'Got: ' + firstHash
      );
    }

  });
}
