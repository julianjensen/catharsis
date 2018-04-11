/** ******************************************************************************************************************
 * @file Describe what tracer does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 08-Apr-2018
 *********************************************************************************************************************/
'use strict';

const
    chalk = require( 'chalk' ),
    fs = require( 'fs' ),
    inspect = require( 'util' ).inspect,
    $ = ( o ) => inspect( o, { depth: 10, colors: true, showHidden: false } ),
    parse = require('./lib/parser').parse,
    parseClosure = require('./lib/parser.alt').parse,
    MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

let prev,
    trace = false,
    traceCapture = [];

function RequireObjectCoercible(value, optMessage) {
    if (value == null) { // eslint-disable-line
        throw new TypeError(optMessage || 'Cannot call method on ' + value);
    }
    return value;
}

function toObject(value) {
    RequireObjectCoercible(value);
    return Object(value);
}

function toLength(argument) {
    var len = Number(argument);
    if (len <= 0) { return 0; } // includes converting -0 to +0
    if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
    return len;
}

function toString(argument) {
    if (typeof argument === 'symbol') {
        throw new TypeError('Cannot convert a Symbol value to a string');
    }
    return String(argument);
}

Object.defineProperty(Array.prototype, 'lastItem', {
    enumerable: false,
    configurable: false,
    get() {
        let O = toObject(this);
        let len = toLength(O.length);
        if (len === 0) {
            return undefined;
        } else if (len > 0) {
            len = len - 1;
            let index = toString(len);
            return O[index];
        }
    },
    set(value) {
        let O = toObject(this);
        let len = toLength(O.length);
        if (len > 0) {
            len = len -1;
        }
        let index = toString(len);
        return ( O[index] = value );
    }
});

Object.defineProperty(Array.prototype, 'lastIndex', {
    enumerable: false,
    configurable: false,
    get() {
        let O = toObject(this)
        let len = toLength(O.length)
        if (len > 0) {
            return len - 1;
        }
        return 0;
    }
});

function highlight( lines )
{
    const
        len = lines.length;

    for ( let i = 0; i < len; ++i )
    {
        const other = lines[i].match( /^([0-9:]+)-[0-9:]+\s+rule\.enter(\s+)(\w+)\s*$/ );

        if ( other ) {

            const resRx = new RegExp( other[1] + '-[0-9:]+\\s+rule\\.(match|fail)\\s+\\b' + other[3] + '\\b\\s*' );
            // console.log( resRx );
            for ( let j = i + 1; j < len; ++j )
            {
                const m = lines[j].match( resRx );

                if ( !m ) {
                    continue;
                }

                if ( m[1] === 'match' ) {
                    lines[i] = chalk.green( lines[i] );
                    lines[j] = chalk.green( lines[j] );
                } else {
                    lines[i] = chalk.gray( lines[i] );
                    lines[j] = chalk.gray( lines[j] );
                }
                break;
            }
        }
    }

    return lines;
}

function hook() {
    prev = console.log;
    console.log = str => traceCapture.push( str );
}

function unhook() {
    console.log = prev;
}

const
    filters = [ '_', 'IdentifierPart', 'IdentifierStart', 'ReservedWord', 'FutureReservedWord' ],
    nested = {},
    current = [];

filters.forEach( name => ( nested[name] = [] ) );

function rule( state, production, raw )
{
    /**
     * @return {*}
     */
    function returnLine() {

        if ( !current.length ) {
            return raw;
        }

        const blockName = current.lastItem;

        nested[blockName].lastItem.push( raw );

        return null;
    }

    if ( !filters.includes( production ) ) {
        return returnLine();
    }

    if ( state === 'enter' ) {
        nested[production].push( [ raw ] );
        current.push( production );
    } else if ( state === 'match' ) {
        nested[production].pop();
        current.pop();
    } else {
        const r = nested[production].pop();
        if ( !r.length || !r || typeof r.push !== 'function' ) {
            console.log( `state: ${state}, production: ${production}, raw: ${raw}` );
            console.log( 'nested:', nested );
            console.log( 'r:', r );
        }
        current.pop();
        return raw;
        // return [ r[0], raw ];
    }
}

function show_error( expr, line, col, msg ) {
    expr = expr.split( /\r?\n/ );

    expr.splice( line, 0, ' '.repeat( col - 1 ) + '^', '-'.repeat( col - 1 ) + '┘' );

    expr.push( msg );

    console.log( expr.join( '\n' ) );
}

function parseIt( useThisParser, expr ) {
    let exception,
        result;

    hook();
    try {
        result = useThisParser(expr, { jsdoc: true });
    } catch ( err ) {
        exception = err;
    }
    unhook();

    if ( trace ) {
        traceCapture = traceCapture.reduce((lines, line) => {
            const m = line.match(/rule\.([a-z]+)\s+([^ ]+)\s*$/);

            if (!m) {
                lines.push(line);
            } else {
                const r = rule(m[1], m[2], line);
                if (r) {
                    lines = lines.concat(r);
                }
            }
            return lines;
        }, []);

        console.log( highlight( traceCapture ).join( '\n' ) );
    }

    if ( exception ) {
        const { message, location: loc } = exception;

        if ( loc ) {
            show_error( expr, loc.start.line, loc.start.column, message );
        } else {
            console.error( exception );
        }
        process.exit( 1 );
    }

    return result;
}

let only, fromFile, verbose = false, fileNames = [];

function parse_type( expr ) {

    if ( /^\s*\/\/|^\s*$/g.test( expr ) ) {
        return;
    }

    if ( !trace && verbose ) {
        console.log( `Expression: ${expr}` );
    }

    if ( only ) {
        console.log( `${$( parseIt( only, expr ) )}` );
    } else {
        console.log( ` Parsed:\n${$( parseIt( parse, expr ) )}` );
        console.log( `Closure:\n${$( parseIt( parseClosure, expr ) )}` );
    }

    if ( trace && verbose ) {
        console.log( `Expression: ${expr}` );
    }
}

process.argv.slice( 2 ).forEach( expr => {
    if ( fromFile ) {
        fileNames.push(expr);
        fromFile = false;
    } else if ( expr === '-v' || expr === '--verbose' ) {
        verbose = true;
    } else if ( expr === '-1' ) {
        if ( verbose ) {
            console.log( 'Setting to catharsis grammar' );
        }
        only = parse;
    } else if ( expr === '-2' ) {
        if ( verbose ) {
            console.log('Setting to ES4/Closure grammar');
        }
        only = parseClosure;
    } else if ( expr === '-d' || expr === '-t' ) {
        if ( verbose ) {
            console.log( 'trace enabled...' );
        }
        trace = true;
    } else if ( expr === '-f' ) {
        fromFile = true;
    } else {
        parse_type( expr );
    }
} );

if ( fileNames.length ) {
    fileNames.forEach( fn => {
        const src = fs.readFileSync( fn, 'utf8' );
        src.split( /\s*\r?\n\s*/ ).forEach( parse_type );
    } );
}


