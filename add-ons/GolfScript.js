// GolfScript type definition

var GolfScript = {
	type: "GS",
	prefix: "gs:",
	isLoaded: true,
	wantsExecution: true,
	onlyOperatesOnOwnType: true,
	
	instance: function(s) { // the object's constructor function
		this.type = GolfScript.type;
		this.string = s;
		this.toString = function() { return GolfScript.toString(this); }; // to permit auto-conversion to String in JS
	},
	tokensFromString: function(s) {
		return s.match(/[a-zA-Z_][a-zA-Z0-9_]*|'(?:\\.|[^'])*'?|"(?:\\.|[^"])*"?|-?[0-9]+|#[^\n\r]*|[^ ]/g); //' reg exp as given at http://www.golfscript.com/golfscript/syntax.html, except the ending is different: |[^ ]/g (we're not including spaces)
	},
	
//	toArray: function(obj) { return this.tokensFromString(obj.string); }, // array deconstructor; permits auto-conversion to vector
//	fromArray: function(vec) { return GolfScript.fromComponents(vec); }, // array constructor; permits auto-conversion from vector
	
	subtokenCount: [],
	tokensToRPLTokens: function(tokens, endToken) {
		var map = { // direct mappings to RPL, or re-maps, to avoid RPL operators
			"`": "@toJSON", // re-map to @... to make work with all types
			"!": "isZero", // re-map; factorial in RPL
			"@": "ROT",
			"|": "OR",
			"&": "AND",
			"^": "XOR",
			"\\": "SWAP",
			";": "DROP",
			"?": "pow",
			"=": "==",
			",": "comma", // re-map; element separator in RPL
			".": "DUP",
			"(": "decr",
			")": "incr",
			"print": "alert",
			"p": "alert",
			"n": "\n",
			"if": "IFTE",
			"zip": "TRN"
		};
		var rpl = [];
		if (tokens instanceof Array) for (var i=0; i<tokens.length; i++) {
			var token = tokens[i];
			if (token == "#") { // comment
				while (i<tokens.length && tokens[i] != "\n")
					++i;
			}
			else if (token == "{") { // block start
				var subtokens = arguments.callee(tokens.slice(i+1), "}");
				i += subtokens.length;
				// control structure look-aheads
				var didConcat = false;
				if (i+1 < tokens.length) {
					if (tokens[i+1] == "do") {
						subtokens.pop(); // drop "}"
						rpl.push("DO");
						rpl = rpl.concat(subtokens);
						didConcat = true;
						rpl.push("UNTIL");
						rpl.push("NOT");
						rpl.push("END");
						++i;
					}
					// todo: while, until
				}
				if (!didConcat) {
					subtokens.unshift('\u226a'); // RPL program start delimiter
					subtokens[subtokens.length-1] = '\u226b'; // RPL program end delimiter
					rpl.push(subtokens.join(" "));
				}
			}
			else if (token == "[") { // array start
				var subtokens = arguments.callee(tokens.slice(i+1), "]");
				GolfScript.subtokenCount.push(subtokens.length);
				var sum = 0; for (var k=0; k<GolfScript.subtokenCount.length; k++) sum += GolfScript.subtokenCount[k];
				i += sum; /// subtokens.length;
				// alert("len: " + subtokens.length + "; ff: " + sum + " ( " + GolfScript.subtokenCount.length + "); " + subtokens + "; cont: " + tokens[i]);
				subtokens.unshift(token);
				rpl.push(subtokens.join(" "));
			}
			else if ((token[0] == "'" && token[token.length-1] == "'") || (token[0] == '"' && token[token.length-1] == '"')) { // string start
				var subtokens = arguments.callee(GolfScript.tokensFromString(token.slice(1,-1)));
				rpl.push('"' + subtokens.join(" ") + '"');
			}
			else if (token == ":" && i+1 < tokens.length) // ":" operator
				rpl.push("=:" + tokens[++i]); // glue next token (var name) to RPL+ assign-no-consume "=:" operator
			else {
				rpl.push(token in map ? map[token] : token);
				if (token == endToken)
					break;
			}
		}
		return rpl;
	},
	enableFuncs: function(b) {
		function setFunctionsEnabled(functionCollection, functionMap, b) { // blend in/out a set of functions in a function collection
			for (var name in functionMap) {
				if (b) functionCollection[name + "_ME"] = functionCollection[name]; // save any existing function
				functionCollection[name] = (b ? functionMap[name] : functionCollection[name + "_ME"]); // (re-)assign function
				delete calculator.isFunctionCache[name]; delete calculator.numberOfArgsForFunctionWithNameCache[name]; // delete look-up cache entries
			}
		}

		// scalar
		setFunctionsEnabled(calculator.functions, {
			"~": function(x) { return (calculator.isAnRPLProgram(x) ? this["@eval"](x) : ~x); },
			"@toJSON": function(x) { return calculator.functions["@toString"](JSON.stringify(x)); },
			"isZero": function(x) { return (calculator.isAnRPLProgram(x) ? calculator.RPLProgram.tokenize().length == 0 : !x); },
			"$": function(x) { return (calculator.isAnRPLProgram(x) ? TODO : this["@pick"](x+1)); },
			"+": function(a,b) { if (typeof a == "number" && typeof b == "number") return a+b; else { if (calculator.isAnRPLProgram(a)) a = a.slice(1,-1); if (calculator.isAnRPLProgram(b)) b = b.slice(1,-1); return '\u226a' + a + " " + b + '\u226b'; } },
			"*": function(a,b) { if (typeof a == "number" && typeof b == "number") return a*b; else { if (calculator.isAnRPLProgram(b)) { var tmp = a; a = b; b = tmp; } this["@repeat"](a, b); } },
			"/": function(a,b) { return (calculator.isAnRPLProgram(b) ? TODO : Math.round(a/b)); },
			"%": function(a,b) { return this.mod(a,b); },
			"comma": function(x) { if (calculator.isAnRPLProgram(x)) { return this.vector.MAP(TODO, x); TODOselect } else { var v = []; for (var i=0; i<x; i++) v[i] = i; return v; } },
			///"?": function(a, b) { return this.pow(a, b); },
			"rand": function(x) { return Math.round(this.random() * (x-1)); },
			"base": function(x, radix) { return Number(x).toString(radix).split("").map(function(x){return +x;}); },
		}, b);

		// string
		setFunctionsEnabled(calculator.functions.string, {
			"~": function(x) { this.fromString(x); },
			"isZero": function(x) { return x.length == 2; },
			"$": function(x) { return this.toString(calculator.unquote(x).split("").sort().join("")); },
			"*": function(a,b) { if (calculator.isAnRPLProgram(a)) { var tmp = a; a = b; b = tmp; }
				var vec = calculator.unquote(a).split("").map(function(x) { return x.charCodeAt(0); });
				return calculator.functions.vector.fold(vec, b);
			},
			"==": function(a,b) { if (typeof a == "number") { var tmp = a; a = b; b = tmp; } else if (typeof b != "number") return this["==_ME"](a,b); if (b<0) b = a.length+b; return a[b]; },
		}, b);
		
		// vector
		setFunctionsEnabled(calculator.functions.vector, {
			"~": function(x) { this.eval(x); }, // todo: confirm: or simply "toElements" which doesn't execute any contained blocks?
			"isZero": function(x) { return x.length == 0; },
			"$": function(x) { return this.sort(x); },
			"+": function(a, b) { return a.concat(b); },
			"-": function(a, b) { return this.complement(a,b); },
			"*": function(a,b) { if (calculator.isAnRPLProgram(a)) { var tmp = a; a = b; b = tmp; } this.fold(a, b); },
			"/": function(a,b) { return (calculator.isAnRPLProgram(b) ? this["~"](this["%"](a,b)) : TODO); },
			"%": function(a,b) { if (calculator.isAnRPLProgram(a) || calculator.isAnRPLProgram(b)) { if (calculator.isAnRPLProgram(a)) { var tmp = a; a = b; b = tmp; } calculator.vars.shouldConcatenateMapResults = true; var res = this.MAP(a, b); calculator.vars.shouldConcatenateMapResults = false;	return res; }
							else if (typeof a == "number" || typeof b == "number") { if (typeof a == "number") { var tmp = a; a = b; b = tmp; } if (!b) throw Error("bad arg"); var ret = []; var len = a.length; if (b<0) { for (var i=len-1; i>=0; i+=b) ret.push(a[i]); } else { for (var i=0; i<len; i+=b) ret.push(a[i]); } return ret; }
							else throw Error("wrong type of argument"); },
			"<": function(a,b) { if (typeof a == "number") { var tmp = a; a = b; b = tmp; } else if (typeof b != "number") throw Error("wrong type of argument"); return a.slice(0, b); },
			">": function(a,b) { if (typeof a == "number") { var tmp = a; a = b; b = tmp; } else if (typeof b != "number") throw Error("wrong type of argument"); return a.slice(b); },
			"==": function(a,b) { if (typeof a == "number") { var tmp = a; a = b; b = tmp; } else if (typeof b != "number") return this["==_ME"](a,b); if (b<0) b = a.length+b; return a[b]; },
			"OR": function(a,b) { TODO },
			"AND": function(a,b) { TODO },
			"XOR": function(x) { TODO },
			"comma": function(v) { return this.size(v); },
			"pow": function(a, b) { if (calculator.isAnRPLProgram(b)) { return this.find(a, b); } else { return this.pos(b, a)-1; } }, // todo: should this be "?"
			"decr": function(x) { calculator.stack.push(this.tail(x)); return this.head(x); },
			"incr": function(x) { calculator.stack.push(x.slice(0,-1)); return x[x.length-1]; },
			"base": function(x, radix) { return parseInt(x.join(""), radix); },
		}, b);
	},
	toRPL: function(obj) {
		return this.tokensToRPLTokens(this.tokensFromString(obj.string));
	},

	toString: function(obj) {
		var funcs = calculator.functions;
		return GolfScript.prefix + obj.string;
	},
	toHTML: function(obj) {
		var HTMLforType = obj.string;
		HTMLforType += calculator.HTMLforTypeBadge(obj.type, display.isLarge() ? 30 : 25);
		return HTMLforType;
	},

	isStringRepresentation: function(x) { return (!x.indexOf(GolfScript.prefix)); },
	fromString: function(str) {
		return new GolfScript.instance((str.indexOf(GolfScript.prefix) == 0 ? str.slice(3) : str));
	},
		
	// operators and functions
	"eval": function(obj) {
		GolfScript.enableFuncs(true);
		try {
			calculator.mode.operation.wantsSymbolicMath = false;
			calculator.mode.operation.permitExpressionArgs = true;
			var prg = calculator.RPLProgram.compile(GolfScript.toRPL(obj));
			if (prg)
				calculator.RPLProgram.run(prg);
		}
		catch(e) { throw Error(e); }
		finally {
			// revert to calculator defaults
			calculator.mode.operation.wantsSymbolicMath = true;
			calculator.mode.operation.permitExpressionArgs = false;
			GolfScript.enableFuncs(false);
		}
	},
	// todo: add "debug", "bench"
	"+": function(a, b) { GolfScript.fromString(a.s + b.s); },
	
	onload: function() {
		calculator.functions.string["toGS"] = function(s) { return GolfScript.fromString(calculator.unquote(s)); };
	}
};

calculator.registerType(GolfScript);
