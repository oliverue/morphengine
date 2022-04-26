/* CAS extension using WolframAlpha API */

var CAS = {
	isLoaded: true,
	version: "1.0beta4",

	enableFuncs: function(b) {
		function setFunctionsEnabled(functionCollection, functionMap, b) { // blend in/out a set of functions in a function collection
			for (var name in functionMap) {
				if (name == "clone") continue;
				if (b) functionCollection[name + "_ME"] = functionCollection[name]; // save any existing function
				functionCollection[name] = (b ? functionMap[name] : functionCollection[name + "_ME"]); // (re-)assign function
				delete calculator.isFunctionCache[name]; delete calculator.numberOfArgsForFunctionWithNameCache[name]; // delete look-up cache entries
			}
		}
		
		setFunctionsEnabled(ME.expr, {
			"integrate": function(a, b, x, name) { if (!((typeof a == "number" || calculator.typeOf(a) == "bigfloat") && (typeof b == "number" || calculator.typeOf(b) == "bigfloat"))) throw Error("wrong type of argument");
				name = name || calculator.quote(calculator.independentInExpression(x));
				return this["NIntegrate"](x, [name, a, b]);
			},
			"NIntegrate": function(x, domain) { if (!(calculator.typeOf(x) == "expression or name" && (calculator.typeOf(domain) == "vector" || calculator.typeOf(domain) == "matrix"))) throw Error("wrong type of argument");
				var args = (calculator.typeOf(domain) == "vector" ? [domain] : domain.clone()); // make sure domain is a matrix
				var wantsBigFloat = false;
				for (var i=0; i<args.length; i++) {
					if (args[i].length != 3) throw Error("bad arg");
					var name = args[i][0], a = args[i][1], b = args[i][2];
					var typeOfA = calculator.typeOf(a), typeOfB = calculator.typeOf(b);
					// todo: remove, as we also want expression or name; if (!((typeOfA == "number" || typeOfA == "bigfloat") && (typeOfB == "number" || typeOfB == "bigfloat") && calculator.typeOf(x) == "expression or name" && calculator.typeOf(name) == "expression or name")) throw Error("wrong type of argument");
					wantsBigFloat |= (calculator.typeOf(a) == "bigfloat" || calculator.typeOf(b) == "bigfloat");
				}
				args.unshift(x); // prepend args with integrand
				///var res = calculator.callWA("NIntegrate[", args, { "join": true, "retry": function(URL) { return URL.replace("Result", "Input").replace(/WorkingPrecision->[0-9]+/, "") }, "suffix": ", WorkingPrecision->" + (wantsBigFloat ? BigFloat.precision : 18) });
				///var res = calculator.callWA("NIntegrate[", args, { "join": true, "pod": (wantsBigFloat ? "Result" : "Input"), "suffix": (wantsBigFloat ? ", WorkingPrecision->" + BigFloat.precision : "") });
				var res = calculator.callWA("NIntegrate[", args, { "join": true, "suffix": ", WorkingPrecision->" + (wantsBigFloat ? BigFloat.precision : 18) });
				return (calculator.isADecimalNumber(res) ? (wantsBigFloat ? BigFloat.fromString(res) : parseFloat(res)) : res);
			},
			"INTVX": function(x) { return this["Integrate"](x); },
			"RISCH": function(x, name) { return this["Integrate"](x, name); },
			"Integrate": function(f, x) { x = x || calculator.quote(calculator.independentInExpression(f));
				return calculator.callWA("Integrate[", [f].concat(x), { "join": true, "pod": (typeof x[1] == "number" || typeof x[2] == "number" ? "Input" : "IndefiniteIntegral"), "right": true });
			},
			"DERIVX": function(x) { return this["Derivative"](x); },
			"Derivative": function(x, varnames) { varnames = varnames || calculator.quote(calculator.independentInExpression(x));
				if (!(calculator.isAVector(varnames) || calculator.isALikelyExpressionOrName(varnames))) throw Error("wrong type of argument");
				return calculator.callWA("D[", [x, [varnames]], { "join": true, "pod": "Input", "rright": true, "right": true });
			},
			///"D2": function(x) { return calculator.callWA("second derivative", x, { "pod": "Input" }); },
			"DESOLVE": function(x, toSolveFor) { return this["desolve"](x, toSolveFor); },
			"desolve": function(x, toSolveFor, indep) {
				indep = indep || calculator.quote(calculator.independentInExpression(x));
				if (!(calculator.isALikelyExpressionOrName(x) && calculator.isALikelyExpressionOrName(toSolveFor) && calculator.isALikelyExpressionOrName(indep))) throw Error("wrong type of argument");
				return calculator.callWA("DSolve[", [x, toSolveFor, indep], { "join": true, "vec2elem": true, "right": true/*was: "erase": (calculator.unquote(toSolveFor).replace("(","[").replace(")","]") + "->")*/ });
			},
			"simplify": function(x) { return calculator.callWA("simplify", x, { "expr": true }); },
			"TrigFactor": function(x) { return calculator.callWA("TrigFactor[", x); },
			"TrigExpand": function(x) { return calculator.callWA("TrigExpand[", x); },
			"TrigReduce": function(x) { return calculator.callWA("TrigReduce[", x); },
			"TrigToExp": function(x) { return calculator.callWA("TrigToExp[", x); },
			"ExpToTrig": function(x) { return calculator.callWA("ExpToTrig[", x); },
			"ComplexExpand": function(x) { return calculator.callWA("ComplexExpand[", x); },
			"TSIMP": function(x) { var res = this["simplify"](calculator.callWA("expand", x, { "pod": "ExpandedFormAssumingAllVariablesAreRealAndPositive", "expr": true })); return (res.length > 1 ? res[1] : res[0]); },
			"expand": function(x) { return calculator.callWA("expand", x, { "expr": true }); },
			"EXPAND": function(x) { var res = this["simplify"](x); return (res instanceof Array ? res[0] : res); }, // note, intended mapping to simplify not expand
			"factorize": function(x) { return calculator.callWA("factorize", x); },
			"NSolve": function(x, v) { return calculator.callWA("NSolve[", [x, v], { "join": true, "expr": true, "approx": true }); },
			"asBigFloat": function(name) { return this["N"](name, BigFloat.precision); },
			"N": function(name, n) { if (!(typeof n == "number" && n > 0)) throw Error("bad arg"); return BigFloat.fromString(calculator.callWA("N[", [name, n], { "join": true })); },
			///"CF": function(x) { return calculator.callWA("continued fraction", x); },
			"DIVPC": function(x, y, order) { return this["taylor"](calculator.quote("(" + calculator.unquote(x) + ")/(" +  calculator.unquote(y) + ")"), calculator.quote(calculator.independentInExpression(x)), order); },
			"TAYLOR0": function(x) { return this["taylor"](x, calculator.quote(calculator.independentInExpression(x)), 4); },
			"taylor": function(x, name, order) { return calculator.callWA("taylor series of degree " + order + " for", x, { "pod": "SeriesExpansionAtX = 0", "erase": /[+]O(.|\n)+$/ }); }, // Mathematica syntax: Series[(x^3+4*x+12)/(11*x^11+1), {x, 0, 4}] todo: consider expansion at 1 as fallback; expansion at 0 fails for 'sqrt(x)' 'x' 5
			"Factor": function(x) { return calculator.callWA("Factor[", x, { "pod": "IrreducibleFactorization" }); },
			"roots": function(x) { return calculator.callWA("roots", x); }, //
			"solve": function(x) { return calculator.callWA("solve", x, { "expr": true, "and": true }); },
			"solveFor": function(eq, x) { return calculator.callWA("solve", eq, { "suffix": " for " + calculator.unquote(x), "expr": true, "and": true }); },
			"TCHEBYCHEFF": function(order) { return this["ChebyshevT"](order, "X"); },
			"ChebyshevT": function(order, name) { return ME.vector.orthopoly(ME.string.toString("ChebyshevT"), [order, name]); },
			"ChebyshevU": function(order, name) { return ME.vector.orthopoly(ME.string.toString("ChebyshevU"), [order, name]); },
			"HERMITE": function(order) { return this["HermiteH"](order, "X"); },
			"HermiteH": function(order, name) { return ME.vector.orthopoly(ME.string.toString("HermiteH"), [order, name]); },
			"LEGENDRE": function(order) { return this["LegendreP"](order, "X"); },
			"LAP": function(expr) { return this["LaplaceTransform"](expr); },
			"LaplaceTransform": function(expr, indep) { indep = indep || calculator.independentInExpression(expr);
				return calculator.callWA("LaplaceTransform[", [expr, indep], { "join": true, "expr": true }); },
			"ILAP": function(expr) { return this["InverseLaplaceTransform"](expr); },
			"InverseLaplaceTransform": function(expr, indep) { indep = indep || calculator.independentInExpression(expr);
				return calculator.callWA("InverseLaplaceTransform[", [expr, indep], { "join": true, "expr": true }); },
			"LegendreP": function(order, name) { return ME.vector.orthopoly(ME.string.toString("LegendreP"), [order, name]); },
			"LaguerreL": function(order, name) { return ME.vector.orthopoly(ME.string.toString("LaguerreL"), [order, name]); },
			"DEGREE": function(x) { return this["Exponent"](x); },
			"Exponent": function(x, varname) { return calculator.callWA("Exponent[", [x.replace("=", "+"), (varname || calculator.independentInExpression(x))], { "join": true }); },
			"QUOT": function(x, y) { return this["PolynomialQuotient"](x, y); },
			"PolynomialQuotient": function(x, y, indep) { indep = indep || calculator.independentInExpression(x); return calculator.callWA("PolynomialQuotient[", [x,y,indep], { "join": true, "expr": true }); },
			"REMAINDER": function(x, y) { return this["PolynomialRemainder"](x, y); },
			"PolynomialRemainder": function(x, y, indep) { indep = indep || calculator.independentInExpression(x); return calculator.callWA("PolynomialRemainder[", [x,y,indep], { "join": true, "expr": true }); },
			"DIV2": function(x, y) { return this["PolynomialQuotientRemainder"](x, y); },
			"PolynomialQuotientRemainder": function(x, y, indep) { indep = indep || calculator.independentInExpression(x); return calculator.callWA("PolynomialQuotientRemainder[", [x,y,indep], { "join": true, "expr": true }); },
			"PolynomialReduce": function(x, y, indep) { indep = indep || calculator.independentInExpression(x); return calculator.callWA("PolynomialReduce[", [x,y,indep], { "join": true, "expr": true }); },
			"PolynomialExtendedGCD": function(x, y) { return calculator.callWA("PolynomialExtendedGCD[", [x,y], { "join": true, "expr": true }); }
		}, b);

		setFunctionsEnabled(ME.string, {
			"evalWA": function(x) { return calculator.callWA(" ", calculator.unquote(x), { "expr": true }); },
			"WA": function(args, cmd) { if (!(calculator.typeOf(cmd) == "string")) throw Error("wrong type of argument");
				 return this["WAopt"](args, cmd, { "expr": true }); },
			"WAopt": function(args, cmd, options) { if (!(calculator.typeOf(cmd) == "string" && typeof options == "object")) throw Error("wrong type of argument");
				return calculator.callWA(calculator.unquote(cmd), args, options); }
		}, b);

		setFunctionsEnabled(ME, {
			"@iIntegrate": function(x) { // takes variable args from stack: 'expr' | 'expr' 'integrand' | 'expr' a b | 'expr' 'integrand' a b | 'expr' [integrand a b]
				var typeOfX = calculator.typeOf(x);
				if (typeOfX == "number" || typeOfX == "bigfloat" || typeOfX == "vector" || typeOfX == "matrix") { // wants numerical integration?
					var f;
					if (typeOfX == "vector" || typeOfX == "matrix") {
						if (calculator.stack.length < 1) throw Error("too few arguments on stack");
						f = calculator.pop();
					}
					else {
						if (calculator.stack.length < 2) throw Error("too few arguments on stack");
						var to = x, from = calculator.pop();
						var f = calculator.pop();
						if (f.length == 3) { if (calculator.stack.length < 1) throw Error("too few arguments on stack"); x = f; f = calculator.pop(); } else x = calculator.quote(calculator.independentInExpression(f));
						x = [x, from, to];
					}
					return ME.expr["NIntegrate"](f, x);
				}
				else
					return (x.length == 3 && calculator.stack.length ? ME.expr["Integrate"](calculator.stack.pop(), x) : ME.expr["Integrate"](x));
			},
			"@iDerivative": function(x) { // takes variable arg from stack: 'expr' | 'expr' 'name'
				return ((((typeof x == "string" && x.length == 3) || calculator.typeOf(x) == "vector") && calculator.stack.length) ? ME.expr["Derivative"](calculator.stack.pop(), x) : ME.expr["Derivative"](x));
			},
							
			"IABCUV": function(a, b, c) { var res = calculator.callWA("solve", a + "*a+" + b + "*b=" + c + " for integers", { "right": true }); res.length = 2; return res; },
			"Cyclotomic": function(n) { return calculator.callWA("cyclotomic polynomial", n, { "expr": true }); },
			"nCDFi_lo": function(x) { return parseFloat(calculator.callWA("InverseCDF[NormalDistribution[0, 1], ", Number(x).toPrecision(15))); },
			"li": function(x) { return parseFloat(calculator.callWA("Li[", Number(x).toPrecision(15))); },
			"FresnelS": function(x) { return parseFloat(calculator.callWA("FresnelS[", Number(x).toPrecision(15))); },
			"FresnelC": function(x) { return parseFloat(calculator.callWA("FresnelC[", Number(x).toPrecision(15))); },
			"erfi": function(x) { return parseFloat(calculator.callWA("erfi[", Number(x).toPrecision(15))); },
			"HilbertMatrix": function(n) { return calculator.callWA("HilbertMatrix[", n); },
			"CASversion": function() { return ME.string.toString(CAS.version); }
		}, b);

		setFunctionsEnabled(ME.complex, {
			"li": function(x) { return calculator.callWA("Li[", x); },
			"FresnelS": function(x) { return calculator.callWA("FresnelS[", x); },
			"FresnelC": function(x) { return calculator.callWA("FresnelC[", x); },
			"erfi": function(x) { return calculator.callWA("erfi[", x); },
		}, b);

		setFunctionsEnabled(ME.vector, {
			"ChineseRemainder": function(x) { return calculator.callWA("ChineseRemainder", x); },
			"Curl": function(x) { return calculator.callWA("Curl[", x, { "pod": "VectorAnalysisResult", "rright": true, "erase": /\n.+/ } ); },
			"DIV": function(x, coord) { return this["Div"](x); /*ignore coord arg; todo: enable, once "Div[ {(x^2)*y,(x^2)*y,(y^2)*z},{x,y,z}]" works: calculator.callWA("Div[", [x, coord], { "join": true, "brackets": "{}", "show": true, "pod": "VectorAnalysisResult", "right": true, "rright": true } );*/ },
			"Div": function(x) { return calculator.callWA("Div[", x, { "pod": "VectorAnalysisResult", "right": true, "erase": /\n.+/ } ); },
			"FindRoot": function(x, v) { return calculator.callWA("FindRoot[", [x, v], { "join": true }); },
			"ICHINREM": function(x, y) { return this["ChineseRemainder"](ME.matrix.transpose(ME.vector.augment(x, y))); },
			"HilbertMatrix": function(v) { return calculator.callWA("HilbertMatrix[", v); },
			"orthopoly": function(name, args) { if (!(calculator.isAFirmString(name) && calculator.isAVector(args) && typeof args[0] == "number")) throw Error("wrong type of argument");
				 return calculator.callWA(calculator.unquote(name) + "[", args, { "join": true, "expr": true }); },
			"P2C": function(x) { return calculator.callWA("inverse of permutation", x, { "rright": true }); },
			"plot": function(x, args) { if (!(calculator.isAVector(x) || calculator.isALikelyExpressionOrName(x))) throw Error("wrong type of argument"); if (!((typeof args[1] == "number" || calculator.isALikelyExpressionOrName(args[1])) && (typeof args[2] == "number" || calculator.isALikelyExpressionOrName(args[2])))) throw Error("bad arg");
				var imageURL = calculator.callWA("Plot[", [x, args], { "join": true, "pod": "Plot", "image": true });
				if (imageURL)
					display.showImageFromURL(imageURL);
			},
			"Series": function(x, args) { if (calculator.typeOf(x) != "expression or name") throw Error("wrong type of argument"); if (!(typeof args[1] == "number" && typeof args[2] == "number")) throw Error("bad arg");
				return calculator.callWA("Series[", [x, args], { "join": true, "expr": true, "pod": "SeriesExpansionAtX = " + args[1], "erase": /[+]O.+$/ }); },
		}, b);

		setFunctionsEnabled(ME.matrix, {
			"charpoly": function(x) { return calculator.callWA("Characteristic polynomial", x, { "expr": true }); },
			"Cholesky": function(x) { return calculator.callWA("Cholesky[", x, { "rright": true }); },
			"eigenvalues": function(x) { if (x[0].length != x.length) throw Error("matrix not square"); return calculator.callWA("eigenvalues", x, { "right": true }); },
			"eigenvectors": function(x) { if (x[0].length != x.length) throw Error("matrix not square"); return calculator.callWA("eigenvectors", x, { "rright": true }); },
			"EGV": function(x) { calculator.stack.push(this["eigenvectors"](x)); calculator.stack.push(this["eigenvalues"](x)); },
			"Inverse": function(x) { if (x[0].length != x.length) throw Error("matrix not square"); return calculator.callWA("Inverse[", x); },
		}, b);
		
		// install aliases
		var aliases = {
			"\u222b": "@iIntegrate", "\u2202": "@iDerivative",
			"D": "Derivative", "DERIV": "Derivative", "S": "FresnelS", "C": "FresnelC",
			"COLLECT": "factorize", "CHOLESKY": "Cholesky", "CURL": "Curl", "CYCLOTOMIC": "Cyclotomic",
			"EGCD": "PolynomialExtendedGCD", "EXPAN": "EXPAND", "FACTOR": "Factor", "HILBERT": "HilbertMatrix",
			"LAPL": "LaplaceTransform",
			"SOLVE": "solveFor", "SOLVEVX": "solve",
			"TCOLLECT": "TrigFactor", "TLIN": "expand", "TEXPAND": "EXPAND",
		};
		for (var name in aliases)
			calculator.function_aliases[name] = aliases[name];
	},
	onload: function() {
		CAS.enableFuncs(true);
	}
};

CAS.onload();
