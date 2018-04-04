'use strict';

var _ = require('lodash');

var en = {
	modifiers: require('../../res/en').modifiers
};
var Types = require('../../lib/types');

var repeatable = {
	repeatable: true
};

var numberBoolean = {
	type: Types.TypeIntersection,
	elements: [
		{
			type: Types.NameExpression,
			name: 'number'
		},
		{
			type: Types.NameExpression,
			name: 'boolean'
		}
	]
};
var numberBooleanRepeatable = _.extend({}, numberBoolean, repeatable);

module.exports = [
	{
		description: 'intersection with 2 types (number and boolean)',
		expression: '(number&boolean)',
		parsed: numberBoolean,
		described: {
			en: {
				simple: '(number and boolean)',
				extended: {
					description: '(number and boolean)',
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'repeatable intersection with 2 types (number and boolean)',
		expression: '...(number&boolean)',
		parsed: numberBooleanRepeatable,
		described: {
			en: {
				simple: 'repeatable (number and boolean)',
				extended: {
					description: '(number and boolean)',
					modifiers: {
						repeatable: en.modifiers.extended.repeatable
					},
					returns: ''
				}
			}
		}
	},
	{
		description: 'intersection with 2 types (Object and undefined)',
		expression: '(Object&undefined)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'Object'
				},
				{
					type: Types.UndefinedLiteral
				}
			]
		},
		described: {
			en: {
				simple: '(Object and undefined)',
				extended: {
					description: '(Object and undefined)',
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'intersection with 3 types (number, Window, and goog.ui.Menu)',
		expression: '(number&Window&goog.ui.Menu)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'number'
				},
				{
					type: Types.NameExpression,
					name: 'Window'
				},
				{
					type: Types.NameExpression,
					name: 'goog.ui.Menu'
				}
			]
		},
		described: {
			en: {
				simple: '(number, Window, and goog.ui.Menu)',
				extended: {
					description: '(number, Window, and goog.ui.Menu)',
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'nullable intersection with 2 types (number and boolean)',
		expression: '?(number&boolean)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'number'
				},
				{
					type: Types.NameExpression,
					name: 'boolean'
				}
			],
			nullable: true
		},
		described: {
			en: {
				simple: 'nullable (number and boolean)',
				extended: {
					description: '(number and boolean)',
					modifiers: {
						nullable: en.modifiers.extended.nullable
					},
					returns: ''
				}
			}
		}
	},
	{
		description: 'non-nullable intersection with 2 types (number and boolean)',
		expression: '!(number&boolean)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'number'
				},
				{
					type: Types.NameExpression,
					name: 'boolean'
				}
			],
			nullable: false
		},
		described: {
			en: {
				simple: 'non-null (number and boolean)',
				extended: {
					description: '(number and boolean)',
					modifiers: {
						nullable: en.modifiers.extended.nonNullable
					},
					returns: ''
				}
			}
		}
	},
	{
		description: 'optional intersection with 2 types (number and boolean)',
		expression: '(number&boolean)=',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'number'
				},
				{
					type: Types.NameExpression,
					name: 'boolean'
				}
			],
			optional: true
		},
		described: {
			en: {
				simple: 'optional (number and boolean)',
				extended: {
					description: '(number and boolean)',
					modifiers: {
						optional: en.modifiers.extended.optional
					},
					returns: ''
				}
			}
		}
	},

	// The following type expressions are adapted from the Closure Compiler test suite:
	// http://goo.gl/vpRTe, http://goo.gl/DVh3f
	{
		description: 'intersection with 2 types (array and object with unknown value type)',
		expression: '(Array&Object.<string, ?>)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'Array'
				},
				{
					type: Types.TypeApplication,
					expression: {
						type: Types.NameExpression,
						name: 'Object'
					},
					applications: [
						{
							type: Types.NameExpression,
							name: 'string'
						},
						{
							type: Types.UnknownLiteral
						}
					]
				}
			]
		},
		described: {
			en: {
				simple: '(Array and Object with unknown properties)',
				extended: {
					description: '(Array and Object with unknown properties)',
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'intersection with 2 type applications',
		expression: '(Array.<string>&Object.<string, ?>)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.TypeApplication,
					expression: {
						type: Types.NameExpression,
						name: 'Array'
					},
					applications: [
						{
							type: Types.NameExpression,
							name: 'string'
						}
					]
				},
				{
					type: Types.TypeApplication,
					expression: {
						type: Types.NameExpression,
						name: 'Object'
					},
					applications: [
						{
							type: Types.NameExpression,
							name: 'string'
						},
						{
							type: Types.UnknownLiteral
						}
					]
				}
			]
		},
		described: {
			en: {
				simple: '(Array of string and Object with unknown properties)',
				extended: {
					description: '(Array of string and Object with unknown properties)',
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'intersection with 2 types (an error, and a function that returns an error)',
		expression: '(Error&function(): Error)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'Error'
				},
				{
					type: Types.FunctionType,
					params: [],
					result: {
						type: Types.NameExpression,
						name: 'Error'
					}
				}
			]
		},
		described: {
			en: {
				simple: '(Error and function() returns Error)',
				extended: {
					description: '(Error and function() returns Error)',
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'type intersection with no enclosing parentheses',
		expression: 'number&string',
		newExpression: '(number&string)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'number'
				},
				{
					type: Types.NameExpression,
					name: 'string'
				}
			]
		},
		described: {
			en: {
				simple: '(number and string)',
				extended: {
					description: '(number and string)',
					modifiers: {},
					returns: ''
				}
			}
		}
	},
	{
		description: 'type intersection with modifiers and no enclosing parentheses',
		expression: '!number&!string',
		newExpression: '(!number&!string)',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'number',
					nullable: false
				},
				{
					type: Types.NameExpression,
					name: 'string',
					nullable: false
				}
			]
		},
		described: {
			en: {
				simple: '(non-null number and non-null string)',
				extended: {
					description: '(non-null number and non-null string)',
					modifiers: {},
					returns: ''
				}
			}
		}
	},

	// The following type expressions are adapted from the Doctrine parser:
	// http://constellation.github.com/doctrine/demo/
	{
		description: 'optional intersection with multiple types',
		expression: '(jQuerySelector&Element&Object&Array.<Element>&jQuery&string&function())=',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'jQuerySelector'
				},
				{
					type: Types.NameExpression,
					name: 'Element'
				},
				{
					type: Types.NameExpression,
					name: 'Object'
				},
				{
					type: Types.TypeApplication,
					expression: {
						type: Types.NameExpression,
						name: 'Array'
					},
					applications: [
						{
							type: Types.NameExpression,
							name: 'Element'
						}
					]
				},
				{
					type: Types.NameExpression,
					name: 'jQuery'
				},
				{
					type: Types.NameExpression,
					name: 'string'
				},
				{
					type: Types.FunctionType,
					params: []
				}
			],
			optional: true
		},
		described: {
			en: {
				simple: 'optional (jQuerySelector, Element, Object, Array of Element, jQuery, ' +
					'string, and function())',
				extended: {
					description: '(jQuerySelector, Element, Object, Array of Element, jQuery, ' +
					'string, and function())',
					modifiers: {
						optional: en.modifiers.extended.optional
					},
					returns: ''
				}
			}
		}
	},
	{
		description: 'optional intersection with multiple types, including a nested union type',
		expression: '(Element&Object&Document&Object.<string, (string&function(!jQuery.event=))>)=',
		parsed: {
			type: Types.TypeIntersection,
			elements: [
				{
					type: Types.NameExpression,
					name: 'Element'
				},
				{
					type: Types.NameExpression,
					name: 'Object'
				},
				{
					type: Types.NameExpression,
					name: 'Document'
				},
				{
					type: Types.TypeApplication,
					expression: {
						type: Types.NameExpression,
						name: 'Object'
					},
					applications: [
						{
							type: Types.NameExpression,
							name: 'string'
						},
						{
							type: Types.TypeIntersection,
							elements: [
								{
									type: Types.NameExpression,
									name: 'string'
								},
								{
									type: Types.FunctionType,
									params: [
										{
											type: Types.NameExpression,
											name: 'jQuery.event',
											optional: true,
											nullable: false
										}
									]
								}
							]
						}
					]
				}
			],
			optional: true
		},
		described: {
			en: {
				simple: 'optional (Element, Object, Document, and Object with ' +
					'(string and function(optional non-null jQuery.event)) properties)',
				extended: {
					description: '(Element, Object, Document, and Object with (string and ' +
					'function(optional non-null jQuery.event)) properties)',
					modifiers: {
						optional: en.modifiers.extended.optional
					},
					returns: ''
				}
			}
		}
	}
];
