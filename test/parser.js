/* eslint-env mocha */
'use strict';

var _ = require('lodash');
var Ajv = require('ajv');
var fs = require('fs');
var helper = require('./helper');

var useNew = true;
var parserPath = useNew ? '../lib/parser.alt' : '../lib/parser';
var parse = require(parserPath).parse;
var path = require('path');
var schema = require('../lib/schema');
var should = require('should');
var util = require('util');
var fixtures = require('./fixtures/externals.json');
// var fixtures =  [ 'catharsis', 'closure-library', 'jsdoc', 'jsduck', 'ts' ]
//     .map( fn => ( { name: fn, data: fs.readFileSync( path.join( './test/fixtures', fn + '-types' ), 'utf8' ) } ) );
util.inspect.defaultOptions = { depth: 10, colors: false, showHidden: true };


var ajv = new Ajv({
    allErrors:     true,
    ownProperties: true
});
var validate = ajv.compile(schema),
    isObject = o => typeof o === 'object' && o !== null && !Array.isArray(o);

function remove_nullable(obj) {
    if (Array.isArray(obj)) {
        return obj.map(remove_nullable);
    }

    if (!isObject(obj)) {
        return obj;
    }

    if (obj.nullable === false) {
        delete obj.nullable;
    }

    let no    = {},
        descs = Object.getOwnPropertyDescriptors(obj);

    Object.keys(descs).forEach(key => {
        if (obj[key] !== null) {
            if (descs[key].enumerable) {
                no[key] = remove_nullable(obj[key]);
            } else {
                Object.defineProperty(no, key, { enumerable: false, value: remove_nullable(obj[key]) });
            }
        }
    });

    return no;
}

/**
 * @param {object} item
 * @param {object} options
 * @return {*}
 */
function parseIt(item, options) {
    var parsed;

    try {
        // console.log( `parseIt( "${item.newExpression}", ${JSON.stringify( options )} )` );
        parsed = parse(item.newExpression || item.expression, options);
        // console.log( `DONE:`, parsed );
    }
    catch (e) {
        throw new Error( `unable to parse type expression '${item.expression}': ${e.message}` );
    }

    // if (!_.isEqual(parsed, item.parsed)) {
    // 	throw new Error(util.format('parse tree should be "%j", NOT "%j"', item.parsed, parsed));
    // }

    return parsed;
}

function checkTypes(filepath, options) {
    var types = require(filepath);

    var errors = [];
    var parsedType;
    var validationErrors = [];
    var validationResult;

    types.forEach(function(type) {
        try {
            parsedType = parseIt(type, options);
            validationResult = validate(parsedType);
            if (validationResult === false) {
                validationErrors.push({
                    expression: type.expression,
                    errors:     validate.errors.slice(0)
                });
            }
        }
        catch (e) {
            errors.push(e.message);
        }
    });

    errors.should.eql([]);
    validationErrors.should.eql([]);
}

describe('parser', function() {
    describe('parse()', function() {
        var specs = './test/specs';
        var jsdocSpecs = path.join(specs, 'jsdoc');

        function tester(specPath, basename) {
            it('can parse types in the "' + basename + '" spec', function() {
                checkTypes(path.join(specPath, basename), { jsdoc: true });
            });
        }

        function jsdocTester(specPath, basename) {
            it('can parse types in the "' + basename + '" spec when JSDoc type parsing is enabled',
                function() {
                    checkTypes(path.join(specPath, basename), { jsdoc: true });
                });
        }

        helper.testSpecs(specs, tester);
        helper.testSpecs(jsdocSpecs, jsdocTester);
    });

    describe('perse() external types', function() {

        function test_block(testData) {
            let testCount = 0,
                errors    = [];

            it('can parse types from the ' + testData[0].system + ' list', function() {
                let errorInfo;

                testData.forEach(({ expr: expression, ast }) => {
                    try {
                        errorInfo = null;
                        // console.log( `parsing ${expression}` );
                        ast = remove_nullable(ast);
                        let parsed = parseIt({ newExpression: expression }, { jsdoc: true });
                        // console.log( 'parsed:', parsed );
                        testCount++;
                        parsed = remove_nullable(parsed);
                        errorInfo = { ast, parsed, expression };
                        should(ast).eql(parsed);
                    }
                    catch (err) {
                        console.log(`ERROR: "${expression}"`);
                        if (errorInfo) {
                            console.log('   ast:\n', util.inspect(errorInfo.ast, { depth: 10, colors: false, showHidden: true }));
                            console.log('parsed:\n', util.inspect(errorInfo.parsed, { depth: 10, colors: false, showHidden: true }));
                        }
                        else
                            console.log('   ast:\n', util.inspect(ast, { depth: 10, colors: false, showHidden: true }));

                        // console.log( err );
                        console.log('\n');
                        errors.push(err);
                    }
                });

                console.log(`name: ${testData[0].system}, count: ${testCount}, errors: ${errors.length}`);
            });

            return errors;
        }

        const
            sysTypes = new Set(),
            grouped  = {};

        fixtures.forEach(item => {
            if (!grouped[item.system]) {
                grouped[item.system] = [];
            }

            sysTypes.add(item.system);
            grouped[item.system].push(item);
        });


        sysTypes.forEach(function(sysName) {
            const testData = grouped[sysName];

            console.log('running it on ' + sysName + ', data size:', testData.length);

            const e = test_block(testData);

            e.should.have.property('length', 0);
        });

    });
});
