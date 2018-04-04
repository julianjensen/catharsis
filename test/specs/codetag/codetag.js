'use strict';

var util = require('util');

var Types = require('../../../lib/types');

var TAG_OPEN = '<foo class="code-class">';
var TAG_CLOSE = '</foo>';

function addTags(string) {
	var formatParams = [ string ];
	var matches = string.match(/%s/g);

	// tags must be balanced
	if (matches.length % 2 !== 0) {
		throw new Error(util.format('Unable to add tags to %s because the placeholders are not ' +
			'balanced.', string));
	}

	for (var i = 0, l = matches.length / 2; i < l; i++) {
		formatParams.push(TAG_OPEN, TAG_CLOSE);
	}

	return util.format.apply(util, formatParams);
}

module.exports = [
	{
		description: 'type application for an array',
		expression: 'Array.<string>',
		described: {
			en: {
				simple: addTags('%sArray%s of %sstring%s'),
				extended: {
					description: addTags('%sArray%s of %sstring%s'),
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'type application for an object with string keys',
		expression: 'Object.<string, number>',
		described: {
			en: {
				simple: addTags('%sObject%s with %snumber%s properties'),
				extended: {
					description: addTags('%sObject%s with %snumber%s properties'),
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'type application for an object with non-string keys',
		expression: 'Object.<boolean, string>',
		described: {
			en: {
				simple: addTags('%sObject%s with %sboolean%s keys and %sstring%s properties'),
				extended: {
					description: addTags('%sObject%s with %sboolean%s keys and %sstring%s ' +
						'properties'),
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'function type with parameters and new, this, and returns modifiers',
		expression: 'function(new:foo.bar, this: foo.baz, string): boolean',
		described: {
			en: {
				simple: addTags('function(constructs %sfoo.bar%s, %sthis%s = %sfoo.baz%s, ' +
					'%sstring%s) returns %sboolean%s'),
				extended: {
					description: addTags('function(%sstring%s)'),
					modifiers: {
						functionNew: addTags('Returns %sfoo.bar%s when called with %snew%s.'),
						functionThis: addTags('Within the function, %sthis%s refers to ' +
							'%sfoo.baz%s.')
					},
					returns: addTags('Returns %sboolean%s.')
				}
			}
		}
	}
];
