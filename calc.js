/*
 * calc.js
 *
 * Implements the "MorphEngine" calculator engine.
 *
 * Copyright (c) 2009-2013 Oliver Unter Ecker
 * All rights reserved.
 *
 * OpenSourced Apr 2022 under MIT License.
 */

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i];
  } return newObj;
};

function requestURL(url, success, failure) {
	// alert(url);
	var wantsAsync = (typeof success == "function");
	var request = new XMLHttpRequest();
	request.open("GET", url, wantsAsync);
	request.send(null);
	if (wantsAsync)
		request.onreadystatechange = function() {
			if (request.readyState == request.DONE) {
				if (request.status == 200)
					success(request.responseXML ? request.responseXML : request.responseText);
				else if (failure)
					failure("Error: " + request.status + " failed with " + request.statusText);
			}
		}
	else
		return (request.responseXML ? request.responseXML : request.responseText);
}

var dynamicallyLoaded = {};
function require(url, useDOMMethod) {
	var isLocal = (url.indexOf("http://") == -1 && url.indexOf("https://") == -1);
	var idString = (isLocal ? url : url.match(/([A-Za-z_]+)(?=\.js$)/)); // last path component without the (required) .js extension
	if (isLocal && url.indexOf(".js") == -1)
		url = "../Documents/" + url + ".js";

	if (dynamicallyLoaded[idString] == undefined) {
		if (useDOMMethod) { // DOM method; will return false; a re-call of the calling method is scheduled, but this is only good if calling method can do an early return (on receiving false from this method) without harming downstream components; i.e., in calculator it only works if function doesn't return a value
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement('script');
			script.id = idString;
			script.language = "JavaScript";
			script.type = 'text/javascript';
			head.appendChild(script);
			var func = arguments.callee.caller;
			var funcArgs = arguments.callee.caller.arguments;
			script.onload = function() { dynamicallyLoaded[idString] = true; func.apply(calculator, funcArgs); };
			script.src = url; // note, do this last, or else attribute or property may appear to not take; for example, assigning .onload() after .src will make that subsequent loads of calc.html don't seem to call .onload() (because it happens too fast)
			return false;
		}
		else { // XMLHttpRequest method
			var codeText = requestURL(url);
			if (codeText.length) {
				eval(codeText);
				dynamicallyLoaded[idString] = true;
				return true;
			}
			else {
				alert("cannot load " + url);
				return false;
			}
		}
	}
	else
		return true;
}

var FractionType = {
	type: "fraction",
	typeHP: 9,
	isLoaded: false,
	wantsMixedNumberDisplay: true,
	
	showMixed: function() { FractionType.wantsMixedNumberDisplay = true; },
	showImproper: function() { FractionType.wantsMixedNumberDisplay = false; },
	toString: function(obj) { return (this.wantsMixedNumberDisplay ? String(obj) : (obj.numerator + "/" + obj.denominator)); },
	toHTML: function(obj) {
		var typeString = this.type;
		var stringForType = FractionType.toString(obj);
		return (stringForType + calculator.HTMLforTypeBadge(typeString, display.isLarge() ? 66 : 45));
	},
	fromFraction: function(obj) { return obj.valueOf(); },
	fromAny: function(x) { return (typeof x === 'number' ? FractionType.fromNumber(x) : FractionType.fromString(String(x))); },
	fromNumber: function(x) { return new Fraction(x); },
	fromComponents: function(a, b) { return new Fraction(a, b); },
	toComponents: function(a) { calculator.stack.push(a.numerator); calculator.stack.push(a.denominator); },
	fromString: function(str) {	var c = str.match(/^(\-?[0-9]+ )?(\-?[0-9]+)\/([0-9]+$)/);
        if (c != null)
            return new Fraction((c[1] ? (+c[3]) * (+c[1]) : 0) + (+c[1] < 0 ? -c[2] : +c[2]), (+c[3]));
        else if (calculator.isADecimalNumber(str))
            return new Fraction(+str, 1);
        else
            throw Error("bad arg");
    },
	isStringRepresentation: function(x) { return (x.match(/^(\-?[0-9]+ )?(\-?[0-9]+)\/([0-9]+$)/) != null); },
	eval: function(obj) { return this.fromFraction(obj); },
		
	"numerator": function(a) { return a.numerator; },
	"denominator": function(a) { return a.denominator; },

	"==": function(a, b) { if (typeof a == "number") a = this.fromNumber(a); return a.equals(b); },
	"=": function(x, y) { return x + '=' + y; },
	// was: "=": function(a, b) { return this["=="](a,b); }, /// todo: change this into assignment of local or global
	"!=": function(a, b) { return !this["=="](a,b); },
	">": function(a, b) { return (+a > +b); },
	"<": function(a, b) { return (+a < +b); },
	">=": function(a, b) { return (+a >= +b); },
	"<=": function(a, b) { return (+a <= +b); },
	"+": function(a, b) { if (typeof a == "number") a = this.fromNumber(a); return a.add(b); },
	"-": function(a, b) { if (typeof a == "number") a = this.fromNumber(a); return a.subtract(b); },
	"*": function(a, b) { if (typeof a == "number") a = this.fromNumber(a); return a.multiply(b); },
	"/": function(a, b) { if ((b instanceof Fraction && !b.numerator) || !b) return Infinity; if (typeof a == "number") a = this.fromNumber(a); return a.divide(b); },

	"toFraction": function(a) { return a; }, // having this method prevents this function from auto-converting a fraction into a decimal and then back into a (different) fraction
	"neg": function(a) { return new Fraction(-a.numerator, a.denominator); },
	"inv": function(a) { if ((a instanceof Fraction && !a.numerator) || !a) return Infinity; return new Fraction(a.denominator, a.numerator); },
	"sign": function(a) { return calculator.functions.sign(+a); },
	"mod": function(a, b) { return this.fromNumber(ME.mod(+a, +b)); },
	"max": function(a, b) { return (+a > +b ? a : b); },
	"min": function(a, b) { return (+a < +b ? a : b); },
	"abs": function(a) { return (a.numerator < 0 ? this.neg(a) : a); },
	"squared": function(a) { return a.multiply(a); },
	"incr": function(a) { return this["+"](a, Fraction.WHOLE); },
	"decr": function(a) { return this["-"](a, Fraction.WHOLE); },
	"INCR": function(a) { var r = this.incr(a); calculator.stack.push(r); return r; },
	"DECR": function(a) { var r = this.decr(a); calculator.stack.push(r); return r; },
	"size": function(x) { return [String(x.numerator).length - (x<0), String(x.denominator).length]; },

	onload: function() {
		if (!require("fraction-0.3.js"))
			alert("cannot initialize Fraction type!");
		
		// extend prototype
		Fraction.prototype.type = FractionType.type;
		Fraction.prototype.toJSON = function(key) { return { "type": FractionType.type, "needsRevival": true, "stringValue": this.toString() }; };
		Fraction.prototype.valueOf = function() { return (this.numerator/this.denominator); };
		Fraction.prototype.invert = function() { var tmp = this.numerator; this.numerator = this.denominator; this.denominator = tmp; return this; };

		// blend type's functions into calculator
		calculator.functions["toFraction"] = FractionType.fromAny;
		calculator.functions["\u2192fract"] = FractionType.fromComponents;
		calculator.functions["showMixed"] = FractionType.showMixed;
		calculator.functions["showImproper"] = FractionType.showImproper;
		
		// extend built-in functions
		calculator.functions.binary["toFraction"] = FractionType.fromString;
		
		// define function name aliases
		calculator.function_aliases["fract\u2192"] = "toComponents";
		calculator.function_aliases["\u2192Q"] = "toFraction";
		calculator.function_aliases["Q\u2192"] = "fromFraction";
		
		// some Fraction constants
		calculator.vars["whole"] = Fraction.WHOLE = new Fraction(1, 1);
		calculator.vars["half"] = Fraction.HALF = new Fraction(1, 2);
		calculator.vars["third"] = Fraction.THIRD = new Fraction(1, 3);
		calculator.vars["quarter"] = Fraction.QUARTER = new Fraction(1, 4);
		
		FractionType.isLoaded = true;
	}
};

var ContinuedFractionType = {
	type: "CF",
	isLoaded: true,
	/// future: wantsGraphicalDisplay: false,
	limitInteger: 300,
	maxTermsForConversionFromDecimal: 18,

	instance: function(terms) { // the object's constructor function
		this.type = ContinuedFractionType.type;
		this.terms = terms;
		this.toString = function() { return ContinuedFractionType.toString(this); }; // to permit auto-conversion to String in JS
		this.valueOf = function() { return ContinuedFractionType.toNumber(this); }; // to permit auto-conversion to Number in JS
		///this.toJSON = function(key) { return { "type": ContinuedFractionType.type, "needsRevival": true, "stringValue": this.toString() }; };
	},
	termsFromNumber: function(x) {
		var a = Math.floor(x);
		var terms = [a];
		var len = 1;
		while (x != a && a < ContinuedFractionType.limitInteger && len <= ContinuedFractionType.maxTermsForConversionFromDecimal) {
			x = 1.0 / (x-a);
			a = Math.floor(x);
			terms[len++] = a;
			// perform periodicity check
			if (a != 1 && (len % 2)) { // todo: does this second condition make sense? (Excludes the golden ratio from working.)
				var i = 1, l2 = (len+1)/2;
				for (; i<l2; i++)
					if (terms[i] != terms[l2+i-1])
						break;
				if (i == l2) { 
					terms = terms.slice(0,l2);
					terms.periodic = true;
					break;
				}
			}
		}
		if (a > ContinuedFractionType.limitInteger*10) terms.length = terms.length-1; // heuristic to keep precision issues from resulting in large bogus last term
		if (len > ContinuedFractionType.maxTermsForConversionFromDecimal)
			terms.truncated = true;
		return terms;
	},
	termsFromFraction: function(x) {
		var n = x.numerator, d = x.denominator;
		var a = Math.floor(n/d), r = n%d; /// todo: don't convert to decimal
		var terms = [a];
		var len = 1;
		while (x != a && a < ContinuedFractionType.limitInteger && len <= ContinuedFractionType.maxTermsForConversionFromDecimal) {
			n = d;
			d = r;
			a = Math.floor(n/d);
			r = n%d;
			terms[len++] = a;
			// perform periodicity check
			if (a != 1 && (len % 2)) { // todo: does this second condition make sense? (Excludes the golden ratio from working.)
				var i = 1, l2 = (len+1)/2;
				for (; i<l2; i++)
					if (terms[i] != terms[l2+i-1])
						break;
				if (i == l2) { 
					terms = terms.slice(0,l2);
					terms.periodic = true;
					break;
				}
			}
		}
		if (len > ContinuedFractionType.maxTermsForConversionFromDecimal)
			terms.truncated = true;
		return terms;
	},
	termsFromSqrtNumber: function(x) {
		var a0 = Math.floor(Math.sqrt(x));
		var terms = [a0];
		if (a0*a0 != x) {
			var a = a0, m = 0, d = 1;
			while (a != a0+a0) {
				m = d*a-m;
				d = Math.floor((x-m*m)/d);
				a = Math.floor((a0+m)/d);
				terms.push(a);
			}
			terms.periodic = true;
		}
		return terms;
	},

	toString: function(obj) { return "[" + obj.terms[0] + ";" + (obj.terms.periodic ? "(" : "") + obj.terms.slice(1).join(",") + (obj.terms.periodic ? ")" : "") + (obj.terms.truncated ? ",..." : "") + "]"; },
	toHTML: function(obj) {
		var typeString = this.type;
		var stringForType = ContinuedFractionType.toString(obj);
		return (stringForType + calculator.HTMLforTypeBadge(typeString, display.isLarge() ? 40 : 25));
	},
	toFraction: function(obj) {
		var t = obj.terms;
		var f = new Fraction(1, t[t.length-1]);
		for (var i=t.length-2; i>=0; i--) {
			f = f.add(t[i]).invert();
		}
		f.invert();
		return f;
	},
    toBigNum: function(obj) { return this["int"](obj); },
    toBigF: function(obj) { return this.toNumber(obj); },
	toNumber: function(obj) { return this.toDec(obj); },
	toDec: function(obj) {
		if (!require("bignumber.js"))
			throw Error("missing bignumber support");

		var t = obj.terms;
		var n = 1, d = t[t.length-1], tmp;
		var cycles = (obj.terms.periodic ? BigFloat.precision/t.length*3 : 1), isFirstCycle = true;
		// alert("periodic: " + obj.terms.periodic + " cycles: " + cycles);
		do {
			var startTermIndex = (isFirstCycle ? t.length-2 : t.length-1);
			var isNonTerminalCycle = (--cycles > 0);
			var endTermIndex = (isNonTerminalCycle ? 1 : 0);
			for (var i=startTermIndex; i>=endTermIndex; i--) {
				if (typeof(n) == "number") { 
					tmp = n;
					n += t[i]*d;
					if (n > calculator.vars.maxInt) {
						n = BigNum.fromNumber(tmp);
						d = BigNum.fromNumber(d);
						t = t.map(function(x) { return BigNum.fromNumber(x); });
						++i; continue; // restart this convergent
					}
				}
				else // i.e. BigNumber
					n = n.add(d.multiply(t[i]));
				
				tmp = n; n = d; d = tmp; // invert
			}
			isFirstCycle = false;
		}
		while (isNonTerminalCycle);

		tmp = n; n = d; d = tmp; // invert
		
		if (typeof(n) == "number") 
			return n/d;
		else {
			n = new BigNumber(String(n));
			d = new BigNumber(String(d));
			return n.divide(d);
		}
	},
	fromAny: function(x) { return (typeof x === 'number' ? ContinuedFractionType.fromNumber(x) : (x instanceof Fraction ? ContinuedFractionType.fromFraction(x) : (calculator.typeOf(x) == "vector" ? ContinuedFractionType.fromVector(x) : ContinuedFractionType.fromString(String(x))))); },
	fromVector: function(x) { return new ContinuedFractionType.instance(x); },
	fromNumber: function(x) { return new ContinuedFractionType.instance(ContinuedFractionType.termsFromNumber(x)); },
	fromFraction: function(x) { return new ContinuedFractionType.instance(ContinuedFractionType.termsFromFraction(x)); },
	fromSqrtNumber: function(x) { return new ContinuedFractionType.instance(ContinuedFractionType.termsFromSqrtNumber(x)); },
	"convergent": function(obj, pos) { if (typeof pos !== "number") throw Error("wrong type of argument");
		if (!obj.terms.periodic)
            return this.toFraction(this.truncate(obj, pos));
        else {
            var c = this.convergents(obj, pos);
            return c.pop();
        }

		/*
		var v = [];
		var n = (!obj.terms.periodic && pos > obj.terms.length ? obj.terms.length : pos);
		for (var i=1; i<n; i++)
			v.push(ContinuedFractionType.convergent(obj, i)); 
		// if (obj.terms.periodic) v.push("..."); // todo: instead of this, do v.isOpen=true and support this in display and when copying, etc.
		return v;
		 */
	},
	fromString: function(str) {	var c = new ContinuedFractionType.instance(JSON.parse(str.replace(";",",").replace(/[()]/g, ""))); if (str.indexOf("(") != -1) c.terms.periodic = true; return c; },
	isStringRepresentation: function(x) { return (x.match(/^\u005b\-?([0-9]+);(\()?([0-9,]*)([0-9])(\))?\u005d$/) != null); },
	eval: function(obj) { return (obj.terms.periodic ? ContinuedFractionType.toNumber(obj) : ContinuedFractionType.toFraction(obj)); },

	"int": function(a) { return a.terms[0]; },
	"terms": function(a) { return a.terms; },
	"periodic": function(a) { return (a.terms.periodic == true); },
	"period": function(a) { return (a.terms.periodic ? a.terms.length-1 : 0); },
	"truncate": function(a, n) { a = a.clone(); n = n+1; if (n<a.terms.length) a.terms.length = n; return a; },
	"convergents": function(obj, pos) { if (typeof pos !== "number") throw Error("wrong type of argument");
		var v = [];
		if (!obj.terms.periodic) {
            if (pos > obj.terms.length) throw Error("bad arg");
            for (var i=0; i<pos; i++)
                v.push(this.convergent(obj, i));
        }
		else {
			if (!require("bignumber.js"))
				throw Error("missing bignumber support");
			
			function addToResult(n, d) {
				if (typeof(n) == "number") 
					v.push(new Fraction(n, d));
				else {
					n = new BigNumber(String(n));
					d = new BigNumber(String(d));
					v.push([n, d]);
				}
			}				

			var t = obj.terms;
			var n = 1, d = t[t.length-1], tmp;
			var cycles = pos, isFirstCycle = true;
			// alert("periodic: " + obj.terms.periodic + " cycles: " + cycles);
			do {
				var startTermIndex = (isFirstCycle ? t.length-2 : t.length-1);
				var isNonTerminalCycle = (--cycles > 0);
				var endTermIndex = (isNonTerminalCycle ? 1 : 0);
				for (var i=startTermIndex; i>=endTermIndex; i--) {
					if (typeof(n) == "number") { 
						tmp = n;
						n += t[i]*d;
						if (n > calculator.vars.maxInt) {
							n = BigNum.fromNumber(tmp);
							d = BigNum.fromNumber(d);
							t = t.map(function(x) { return BigNum.fromNumber(x); });
							++i; continue; // restart this convergent
						}
					}
					else // i.e. BigNumber
						n = n.add(d.multiply(t[i]));
					
					tmp = n; n = d; d = tmp; // invert
				}
				addToResult((typeof(d) == "number" ? n+d : n.add(d)), d);
				isFirstCycle = false;
			}
			while (isNonTerminalCycle);
			
			v.pop(); // don't ask
			
			tmp = n; n = d; d = tmp; // invert
			addToResult(n, d);
		}

        return v;
	},
		
	"==": function(a, b) { if (typeof a == "number") a = this.fromNumber(a); return a.equals(b); },
	// "=": function(a, b) { return this["=="](a,b); },
	"!=": function(a, b) { return !this["=="](a,b); },
	">": function(a, b) { return (+a > +b); },
	"<": function(a, b) { return (+a < +b); },
	">=": function(a, b) { return (+a >= +b); },
	"<=": function(a, b) { return (+a <= +b); },
	//		"+": function(a, b) { if (typeof a == "number") a = this.fromNumber(a); return a.add(b); },
	//		"-": function(a, b) { if (typeof a == "number") a = this.fromNumber(a); return a.subtract(b); },
	//		"*": function(a, b) { if (typeof a == "number") a = this.fromNumber(a); return a.multiply(b); },
	//		"/": function(a, b) { if ((b instanceof Fraction && !b.numerator) || !b) return Infinity; if (typeof a == "number") a = this.fromNumber(a); return a.divide(b); },
	"inv": function(a) { var t = a.terms; var periodic = t.periodic, truncated = t.truncated; if (t[0] == 0.0) { t = t.slice(1); t.periodic = periodic; t.truncated = truncated; } else t.unshift(0); return ContinuedFractionType.fromVector(t); },

	"toCF": function(a) { return a; }, // having this method prevents this function from auto-converting a fraction into a decimal and then back into a (different) fraction
	"neg": function(a) { var b = a.clone(); b.terms[0] = -b.terms[0]; return b; },
	"sign": function(a) { return calculator.functions.sign(a.terms[0]); },
	"size": function(x) { return (!this.periodic(x) ? x.terms.length : +Infinity); },
	// todo: implement incr, decr
		
	onload: function() {
		// blend type's functions into calculator
		calculator.functions["toCF"] = ContinuedFractionType.fromAny;
		calculator.functions["toSqrtCF"] = ContinuedFractionType.fromSqrtNumber;
		
		// extend built-in functions
		calculator.functions.binary["toCF"] = ContinuedFractionType.fromString;

		// define function name aliases
		calculator.function_aliases["\u2192CF"] = "toCF";
		
		// CF constants
		(calculator.vars["goldenRatio"] = new ContinuedFractionType.instance([1,1])).terms.periodic = true;
		(calculator.vars["sqrt2CF"] = new ContinuedFractionType.instance([1,2])).terms.periodic = true;
	}
};


var display = {
	stackSize: 16,
	stackStringSizeLimit: 100,
	stackStringSizeToFillWidth: 20,
	stackVectorComponentsLimit: 9,
	maxCharsPerLine: 28,
	wantsStackDisplay: true,
	wantsPrettyStackPositionNumbers: true,
	isShowingGraphics: false,
	nCurrentGraphs: 0,
	isLarge: function() { return (window.width > 600); },
	
	onload: function() {
		this.stackStringSizeLimit = Math.floor(window.innerWidth/3);
		this.stackVectorComponentsLimit = Math.floor(window.innerWidth/32);
		this.maxCharsPerLine = Math.floor(window.innerWidth/11);
	},

	showPage: function(html) { calcbody.innerHTML = html; },

	scrollToBottom: function() { window.scrollTo(0, 1000000); },

	htmlForStack: function(numberOfPositionsToShow, wantsPrettyFormatting, wantsFullSize) {
		var isLarge = this.isLarge();
		if (wantsFullSize)
			isLarge = true;
		var html = "";
/* the following doesn't work on iPhone thanks to "fixed" being defacto disabled
		html += '<span id="categoryName" style="right: 50px; bottom: 80px; font-size: 12px; position: fixed">' + calculator.currentDataCategory + '</span>';
*/
		html += "<br /><br /><br /><br /><br />"; // put some space above so first stack item appears at bottom of page; todo: improve
//		html += '<canvas id="canvas" width="' + String(window.innerWidth-20) + '" height="' + String(window.innerHeight-20) + '" style="position: absolute; z-index: -1"></canvas>';
		for (var i=numberOfPositionsToShow; i>=1; i--) {
			html += '<div>';
			var widthForNumber = 4;
			if (wantsPrettyFormatting) {
				widthForNumber = (i < 10 ? (isLarge ? 19 : 16) : (i < 100 ? (isLarge ? 28 : 24) : (isLarge ? 36 : 32)));
				html += '<span style="position: absolute; font-size: ' + (isLarge ? "14" : "12") + 'px; color: white">' + "&nbsp;" + i + '</span>';
				html += '<img src="stackPositionButton.png" width="' + String(widthForNumber) + '" height="' + (isLarge ? "19" : "16") + '" style="position: absolute; z-index: -1">';
				html += "&nbsp;";
			}
			else
				html += i + ':';
			html += '<span class="stackPos" style="margin-left: ' + widthForNumber + 'px"></span>';
			html += '</div>';
		}
		
		return html;
	},
	showStack: function(capacity) {
		this.stackSize = capacity;
		this.showPage(this.htmlForStack(capacity, this.wantsPrettyStackPositionNumbers));
		this.wantsStackDisplay = true;
		window.onresize = null;
	},
	updateCategoryShown: function() { /* see iPhone comment above; use on Android: categoryName.innerHTML = calculator.currentDataCategory; */ },

	stringForNL: "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
	stringForItem: function(item) {
		try {
			var type = typeof item;
			if (type == "number")
				return this.stringForNumber(item);
			else if (calculator.isAMatrix(item))
				return this.stringForMatrix(item);
			else if (calculator.isAVector(item))
				return this.stringForVector(item);
			else if (type == "object" && "type" in item && item.type in calculator.customTypes && calculator.customTypes[item.type].isLoaded)
				return ("toHTML" in calculator.customTypes[item.type] ? calculator.customTypes[item.type].toHTML(item) : ("(" + item.type + ") " + calculator.customTypes[item.type].toString(item)));
			else if (type == "object" && "stringValue" in item && typeof item.stringValue == "string")
				return item.stringValue;
			else if (type == "object")
				return JSON.stringify(item);
			else {
				var str = item.toString();
				if (calculator.isAComplexNumber(str))
					return this.stringForComplexNumber(str);
    			else if (calculator.isAName(str))
                    return ME.expr.toHTML(str);
				else if (calculator.isADataURL(str))
					return this.stringForDataURL(str);
				else {
					var length = str.length;
					if (length > this.stackStringSizeLimit) {
						str = str.slice(0, this.stackStringSizeToFillWidth);
						str += "...&nbsp;(" + length + ")";
					}
					// make sure multiple spaces in firm strings display in HTML
					if (calculator.isAFirmString(str))
						str = str.replace(/[ ][ ]/g, "&nbsp;&nbsp;");
					return str;
				}
			}
		}
		catch(e) {
			return (item == undefined ? "(undefined)" : item.toString() + " (invalid)");
		}
	},
	stringForNumber: function(item, n_digits) {
		var numRep = calculator.mode.number_representation;
		
		if (numRep.type == "normal") {
			var str = item.toString();
			var numSignificantDigits = n_digits || 15; // was: 13
			if (str.length > numSignificantDigits && str.indexOf("e") == -1) {
				var wasInteger = (str.indexOf(".") != -1);
				str = item.toPrecision(numSignificantDigits);
				if (wasInteger)
					str = str.replace(/[0]+$/, "").replace(/[.]$/, "");
			}
			return str;
		}
		else {
			function formattedAsEngineeringIfNecessary(x) { // conversion from scientific to engineering notation
				if (numRep.type == "engineering") {
					var posOfE = x.lastIndexOf('e');
					var exponent = Number(x.slice(posOfE + 1));
					var shiftVal = exponent % 3;
					if (shiftVal) {
						var isExponentNegative = (shiftVal < 0);
						if (isExponentNegative) shiftVal += 3;
						var engExponent = exponent-shiftVal;
						var dotPos = x.indexOf('.');
						var hasADot = (dotPos != -1); // in a case like "2e+1", there's no dot
						if (!hasADot) dotPos = 1;
						var beginning = x.slice(0, dotPos);
						var middle = x.slice(dotPos+(hasADot ? 1 : 0), posOfE);
					
						// zeroes to be inserted, if necessary
						var zeroes = "";
						for (var i=0; i<(shiftVal-numRep.val); i++)
							zeroes += "0";
						
						x = beginning + middle + zeroes + x[posOfE] + (isExponentNegative ? "" : x[posOfE+1]) + String(engExponent);
						if (hasADot)
							x = x.slice(0, dotPos+shiftVal) + "." + x.slice(dotPos+shiftVal);
						// x += " [" + shiftVal + hasADot + String(shiftVal-numRep.val) + "] " + zeroes; // DEBUG
					}
				}
				return x;
			}
			function tsep(n,swap) {
				var ts=",", ds="."; // thousands and decimal separators
				if (swap) { ts="."; ds=","; } // swap if requested
				
				var ns = String(n),ps=ns,ss=""; // numString, prefixString, suffixString
				var i = ns.indexOf(".");
				if (i!=-1) { // if ".", then split:
					ps = ns.substring(0,i);
					ss = ds+ns.substring(i+1);
				}
				return ps.replace(/(\d)(?=(\d{3})+([.]|$))/g,"$1"+ts)+ss;
			}
			return (numRep.type == "fixed" ? tsep(item.toFixed(numRep.val), numRep.thousandsSeparator == ".") : formattedAsEngineeringIfNecessary(item.toExponential(numRep.val)));
		}
	},
	stringForComplexNumber: function(item) {
		var parts = calculator.complexParts(item);
		var polarOrSphericalDisplay = (calculator.mode.angle.vectors != "rect");
		if (polarOrSphericalDisplay)
			parts = [ME.vector.abs(parts), ME.atan2(parts[1], parts[0])];
		var result = "(" + this.stringForNumber(parts[0]) + ",";
		return result + (result.length > 14 ? this.stringForNL + "&nbsp;" : " ") + (polarOrSphericalDisplay ? "\u2220" : "") + this.stringForNumber(parts[1]) + ")";
	},
	stringForVector: function(item) {
		var vec = item; // was: (typeof item == "object" ? item : calculator.functions.vector.fromString(item));
		var hasBeenTruncated = false;
		var wouldHaveBeenTruncated = false;
		var length = vec.length;
		if (length > this.stackVectorComponentsLimit) {
			if (vec.showExpanded)
				wouldHaveBeenTruncated = true;
			else {
				length = this.stackVectorComponentsLimit;
				hasBeenTruncated = true;
			}
		}
		var result = "[ ";
		var posAtLastBreak = 0;
		var polarOrSphericalDisplay = (calculator.mode.angle.vectors != "rect" && (length == 2 || length == 3) && ME.vector.isReal(vec));
		for (var col=0; col<length; col++) {
			if (typeof vec[col] == "object") {
				vec[col].inVector = true;
				vec[col].inMatrix = vec.inMatrix;
			}
			var formattedItem;
			if (polarOrSphericalDisplay) {
				var wantsSpherical = (calculator.mode.angle.vectors == "spherical");
				formattedItem = (col == 0 ? this.stringForItem(ME.vector.abs((wantsSpherical ? vec : [vec[0], vec[1]]))) :
								 (col == 1 ? "\u2220" + this.stringForItem(ME.atan2(vec[1], vec[0])) :
								  /*col==2*/(wantsSpherical ? "\u2220" + this.stringForItem(ME.acos(vec[2]/ME.vector.abs(vec))) : this.stringForItem(vec[col]))
								  ));
			}
			else
				formattedItem = this.stringForItem(vec[col]);
			if (result.length+formattedItem.length > posAtLastBreak+this.maxCharsPerLine && col > 0) {
				result += this.stringForNL;
				posAtLastBreak = result.length;
			}
			result += formattedItem + " ";/// + (col<length-1 ? ", " : "");
		}
		if (hasBeenTruncated || wouldHaveBeenTruncated) {
			var uniqueTag = String(Math.random()).slice(10);
			vec.tag = uniqueTag; // tag object
			if (hasBeenTruncated)
				result += "<span style='font-size: 12px' onclick='calculator.stackItemWithTag(\"" + uniqueTag + "\").showExpanded=true;calculator.show()'>" + "...&nbsp;(" + Number(vec.length-length) + "&nbsp;more) " + "</span>";
			else
				result += "<span style='font-size: 12px' onclick='calculator.stackItemWithTag(\"" + uniqueTag + "\").showExpanded=false;calculator.show()'>" + "&nbsp;(less) " + "</span>";
		}
		result += "]";
		return result;
	},
	stringForMatrix: function(item) {
		var m = item;
		var length = m.length;
		var hasBeenTruncated = false;
		var wouldHaveBeenTruncated = false;
		if (length > this.stackVectorComponentsLimit) {
			if (m.showExpanded)
				wouldHaveBeenTruncated = true;
			else {
				length = this.stackVectorComponentsLimit;
				hasBeenTruncated = true;
			}
		}
		var result = "[";
		for (var row=0; row<length; row++) {
			if (typeof m[row] == "object")
				m[row].inMatrix = true;
			result += this.stringForItem(m[row]);
			result += (row<length-1 ? ("&nbsp;" + this.stringForNL) : ""); // extra space serves to align more nicely if stack is right-aligned
		}
		if (hasBeenTruncated || wouldHaveBeenTruncated) {
			var uniqueTag = String(Math.random()).slice(10);
			m.tag = uniqueTag; // tag object
			if (hasBeenTruncated)
				result += this.stringForNL + "<span style='font-size: 12px' onclick='calculator.stackItemWithTag(\"" + uniqueTag + "\").showExpanded=true;calculator.show()'>" + "...&nbsp;(" + Number(m.length-length) + "&nbsp;more) " + "</span>";
			else
				result += this.stringForNL + "<span style='font-size: 12px' onclick='calculator.stackItemWithTag(\"" + uniqueTag + "\").showExpanded=false;calculator.show()'>" + "&nbsp;(less) " + "</span>";
		}
		result += "]";
		return result;
	},
	stringForDataURL: function(item) {
		var html = '<img src=' + item + ' width="184" height="50" ' + '/>';
		return html;
	},

	showGraphics: function(b, extraHTML) {
		// no action, if already in desired mode at desired size
		var desiredWidth = window.innerWidth-20, desiredHeight = window.innerHeight-20;
		if (b == this.isShowingGraphics && (!b || (b && canvas && canvas.graphicsSource == arguments.callee.caller && (canvas.width == desiredWidth && canvas.height == desiredHeight)))) {
			if (b) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); // clear previous render
			return;
		}

		this.isShowingGraphics = b;

		if (b) {
			document.documentElement.style.webkitUserSelect = "none";

			var html = extraHTML || "";
			html += '<div>\n\t<canvas id="canvas" width="' + String(desiredWidth) + '" height="' + String(desiredHeight) + '" style="z-index: 0"></canvas>\n</div>\n';
// Retina support:
///			html += '<div>\n\t<canvas id="canvas" width="' + String(desiredWidth*devicePixelRatio) + '" height="' + String(desiredHeight*devicePixelRatio) + '" style="z-index: 0; width: ' + String(desiredWidth) + 'px; height: ' + String(desiredHeight) + 'px"></canvas>\n</div>\n';

			this.showPage(html);
			this.wantsStackDisplay = false;

///			display.width = desiredWidth;
///			display.height = desiredHeight;

			canvas.graphicsSource = arguments.callee.caller; // used when this function is called again to see if the graphics source has changed

			// register caller, and its arguments, as function to call when window resizes (to cause automatic redraw)
			var func = arguments.callee.caller;
			var funcArgs = arguments.callee.caller.arguments;
			window.onresize = function() { func.apply(calculator, funcArgs); };
			
			///canvas = document.getElementById('canvas');
			this.detectedMove = false; // default; used (by following touchend handler) in case there're no other touch handlers which set it
			canvas.addEventListener("touchstart", function(e) { display.numberOfTouches = e.touches.length; }, false);
			canvas.addEventListener("touchend", function(e) { if (!display.detectedMove && display.numberOfTouches == 2) calculator.push("@fromDisplay"); }, false); // register two-finger tap to grab screen
			canvas.hasTouchMoveHandlers = []; // array for possible use by some draw method (used by draw1D)
			calculator.exec("noteDisplayChange", "graphics");
		}
		else {
			calculator.analytics.reset(); // reset eval logic, in case we optimized

			// canvas doesn't send an unload event as the page is being removed; so we need to do this manually
			var evObj = document.createEvent('HTMLEvents');
			evObj.initEvent('unload', true, true);
			canvas.dispatchEvent(evObj);
			
			document.documentElement.style.webkitUserSelect = "auto";
			this.nCurrentGraphs = 0;
			this.showStack(this.stackSize);
			calculator.exec("noteDisplayChange", "stack");
		}
	},
	
	showBackgroundImage: function() {
		if (!display.isShowingGraphics)
			display.showGraphics(true);

		var ctx = canvas.getContext('2d');
		ctx.drawImage(display.backgroundImage, 0, 0);
	},
	showImage: function(nd_img) {
		this.backgroundImage = new Image();
		this.backgroundImage.onload = function() { setTimeout(display.showBackgroundImage, 0); }
		this.backgroundImage.src = nd_img.data.slice(1,-1);

		if (nd_img.height > (this.isLarge() ? 600 : 300))
			calculator.exec("resizeWebUI");
	},
	showImageFromURL: function(url) {
		if (url.indexOf('"data:image') != 0 && url.indexOf('http://') != 0)
			throw Error("input is not a URL");
		this.backgroundImage = new Image();
		this.backgroundImage.onload = function() {
			setTimeout(display.showBackgroundImage, 0);
		}
		this.backgroundImage.src = url;

		if (url.length > 16*1024) // todo: improve; cheap-o heuristic for "must be a full-screen image"
			calculator.exec("resizeWebUI");
	},

	showPlotKitGraphics: function() {
		var html = "";
		html += '<script src="MochiKit/MochiKit.js" type="text/javascript"><\u002fscript>\n';
		html += '<script src="PlotKit/PlotKit.js" type="text/javascript"><\u002fscript>\n';
		this.showGraphics(true, html);
	}
};


var calculator = {
	stack: [],
	lastArgs: [],
	
	mode: {
		"operation": {
			"name": "RPN",
			"wantsStackDisplay": true,
			"wantsDynamicStack": true, // dynamically growing/shrinking stack display
			"wantsSymbolicMath": true,
			"eval": "halfsym", // given p:=5, 'SIN(x^√2)+p': "numeric": Error: no such variable: x, "func": sin(pow(x,sqrt(2))+5, "halfsym": sin(x^2)+5, "sym": sin(x^2)+p
			"permitExpressionArgs": false // allow expressions/RPL to be passed to non-catch-all (@xxx) functions
		},
		"angle": {
			"inRadians": true,
			"scalerToRadians": 1.0,
			"vectors": "rect"
		},
		"number_representation": {
			"type": "normal", // one of "normal", "fixed", "scientific", "engineering"
			"val": 0,
			"thousandsSeparator": ","
		},
		"binary": {
			"wordSize": 32,
			"validMask": 0xffffffff
		},
	},
	setToRadians: function(b) { this.mode.angle.inRadians = b; this.mode.angle.scalerToRadians = (b ? 1.0 : Math.PI/180.0); },
	setVectorDisplayMode: function(str) { this.mode.angle.vectors = str; },

	analytics: {
		"isLogging": false,
		"log": [],
		"ignoreNextPush": false,
		"startLogging": function() { this.log = []; this.isLogging = true; },
		"stopLogging": function() { this.isLogging = false; this.ignoreNextPush = false; },
		"canDoFastEval": false,
		"usesNonRealFunctions": false,
		"usesCaret": false,
		"shouldDetermineEntropy": false,
		"eval": function() { this.canDoFastEval = !(this.usesNonRealFunctions || this.usesCaret); },
		"reset": function() { this.canDoFastEval = this.usesNonRealFunctions = this.usesCaret = false; }
	},

	vars: {
		"version": '"1.6"',
		"true": true,
		"false": false,
		"Infinity": Infinity,
		"e": Math.E,
		"i": "(0,1)",
		"ln10": Math.LN10,
		"ln2": Math.LN2,
		"pi": Math.PI,
		"\u03c0": Math.PI,
		"half_pi_period": 2.0/Math.PI,
		"maxInt": 9007199254740992,
		"MAXR": Number.MAX_VALUE,
		"MINR": Number.MIN_VALUE,
		"MEM": 10 * 1024 * 1024,
		"sqrt2": Math.SQRT2,
		"local": {} // empty default category; RPL programs will point this to their locally defined var dict
	},

	wantsVarStoreToSyncToHost: true,
	currentDataCategory: "local",
	setCurrentDataCategory: function(name, ignoreFolderActions) {
		if (name != this.currentDataCategory) {
			if (!ignoreFolderActions && ".onexit" in this.functions[this.currentDataCategory]) // call exit code for previous folder
				this.functions[this.currentDataCategory][".onexit"]();

			this.currentDataCategory = name;
			display.updateCategoryShown();

			if (!ignoreFolderActions && ".onenter" in this.functions[this.currentDataCategory]) // call entry code for new folder
				this.functions[this.currentDataCategory][".onenter"]();
		}
	},

	ProgramFragment: {
		instance: function(prg, nArgsToTake) { // negative nArgsToTake prevents direct function support (and assume stack-based args)
			var prgType = calculator.typeOf(prg); // CONSIDER putting this back in: if (!(prgType == "operator" || prgType == "RPL program" || prgType == "vector" || prgType == "string")) throw Error("wrong type of argument");
			var funcname = (prgType == "operator" ? prg
							: ((prgType == "vector" && prg.length == 1 && prg[0].match(/\:r$/)) ? prg[0].replace(":r", "")
							   : (prgType == "string" && prg.indexOf(" ") == -1 && prg.indexOf(":r") != -1 ? calculator.unquote(prg.replace(":r", ""))
								  : undefined)));
			// todo: also have a funcname for [real sin]

			if (funcname && nArgsToTake >= 0) {
				///if (!(funcname in ME)) throw Error(funcname + " not a real function");
				if (calculator.numberOfArgsForFunctionWithName(funcname) != nArgsToTake) throw Error(funcname + " doesn't take " + nArgsToTake + " argument");
				this.func = ME[funcname];
				this.opName = calculator.unquote(prg); // also keep opName in case eval() sees non-number values
			}
			else if (prgType == "vector" && prg.length == 0) { // special case of empty vector
				this.func = function(_x) { return _x; };
			}
			else if (prgType == "vector" && prg.length >= 2 && prg[0] == "real") {
				this.func = calculator.functionForExpression(calculator.expressionForRPN(prg.slice(1).join(" ")));
			}
			else if (prgType == "RPL program")
				this.compiledPrg = calculator.RPLProgram.compile(calculator.RPLProgram.tokenize(prg));
			else if (prgType == "vector")
				this.prgVec = prg;
			else if (prgType == "string") {
				var prgText = calculator.unquote(prg);
				if (!calculator.isFunction(prgText)) throw Error(prgText + " is not a function");
				this.opName = prgText;
			}
            else {
                this.func = function(_x) { return _x == prg; };
            }

			if (calculator.ProgramFragment.instance.prototype.eval === undefined)
				calculator.ProgramFragment.instance.prototype.eval = function(x, ignoreStackLength) {
					if (this.func && (typeof(x) === "number" || typeof(x) == "boolean"))
                        return this.func.call(ME, x);
					// alternatively, stack-based evaluation
					var savedStackLength = calculator.stack.length;
					if (x !== undefined) calculator.stack.push(x);
					if (this.compiledPrg)
						calculator.RPLProgram.run(this.compiledPrg);
					else if (this.prgVec)
						ME.vector.eval(this.prgVec);
					else // an op string
						calculator.operate(this.opName);
					/* was: else // a string
						calculator.stack.push(calculator.calc(this.prgText));*/
					if (!ignoreStackLength && calculator.stack.length != savedStackLength+1)
						throw Error("incorrect count of arguments on stack");
					return calculator.stack.pop();
				};
		},
		fromObj: function(prg, nArgsToTake) { if (nArgsToTake === undefined) nArgsToTake=1; return new this.instance(prg, nArgsToTake); }
	},
	
	functions: {
		"local": {}, // empty default category
		"+":	function(x, y) { return x+y; },
		"-":	function(x, y) { return x-y; },
		"*":	function(x, y) { return x*y; },
		"/":	function(x, y) { return x/y; },
		"divrem": function(x, y) { return [this.floor(x/y), this.mod(x, y)]; },
		"IDIV2": function(x, y) { var r = this.divrem(x, y); calculator.stack.push(r[0]); return r[1]; },
		"quot": function(x, y) { return this.floor(x/y); },
		"rem":	function(x, y) { return x%y; },
		"mod":	function(x, y) { return (x>=0 && y>=0 ? x%y : x-y*this.floor(x/y)/*(x%y)+y*/); },
		"<":	function(x, y) { return x < y; },
		">":	function(x, y) { return x > y; },
		"<=":	function(x, y) { return x <= y; },
		">=":	function(x, y) { return x >= y; },
		"==":	function(x, y) { return x == y; },
		"=":	function(x, y) { return x + '=' + y; },
		// was: "=":	function(x, y) { return x == y; },
		"@same": function(x, y) { if (typeof x === "object" && typeof y === "object") { x = JSON.stringify(x); y = JSON.stringify(y); } return x == y; },
		"!=":	function(x, y) { return x != y; },
		"@ifte": function(cond, a, b) { cond = this["toNumber"](cond); /* if (typeof cond == "string") { if (cond == "true") cond = true; else if (cond == "false") cond = false; else throw Error("wrong type of argument"); } */ return this["@softnum"](cond ? a : b); },
		"@ift":	function(cond, a) { return this["@ifte"](cond, a, undefined); },
		"and": function(x, y) { return (x != 0 && y != 0); },
		"or": function(x, y) { return (x != 0 || y != 0); },
		"xor": function(x, y) { return ((x != 0 && y == 0) || (x == 0 && y != 0)); },
		"not": function(x) { return (x == 0); },
		"abs":	function(num) { return Math.abs(num); },
		"acos":	function(x) { return ((x >= -1.0 && x <= 1.0) ? Math.acos(x) / calculator.mode.angle.scalerToRadians : this.complex.acos(x)); },
		"asin":	function(x) { return ((x >= -1.0 && x <= 1.0) ? Math.asin(x) / calculator.mode.angle.scalerToRadians : this.complex.asin(x)); },
		"atan":	function(x) { return Math.atan(x) / calculator.mode.angle.scalerToRadians; },
		"atan2": function(x, y) { return Math.atan2(x, y) / calculator.mode.angle.scalerToRadians; },
		"ceil":	Math.ceil,
		"cos":	function(x) { var result = Math.cos(x * calculator.mode.angle.scalerToRadians); return ((calculator.mode.angle.inRadians && !this.fract(x * calculator.vars.half_pi_period)) || (!calculator.mode.angle.inRadians && !(x % 90)) ? Math.round(result) : result); },
		"sin":	function(x) { var result = Math.sin(x * calculator.mode.angle.scalerToRadians); return ((calculator.mode.angle.inRadians && !this.fract(x * calculator.vars.half_pi_period)) || (!calculator.mode.angle.inRadians && !(x % 90)) ? Math.round(result) : result); },
		"sinc":	function(x) { return (x != 0.0 ? this.sin(x)/x : 1.0); },
		"exp":	Math.exp,
		"exp_minus_one": function(x) { var u = Math.exp(x); if (u != 1) { if ((u-1) == -1) x = -1; else x = (u-1) * x / Math.log(u); } return x; },
		"floor": Math.floor,
		"ln":	function(x) { return (x >= 0.0 ? Math.log(x) : this.complex.ln(x)); },
		"ln_plus_one": function(x) { return (x >= -1.0 ? this.ln(x+1) : this.complex.ln(x+1)); },
		"log":	function(x) { return (x >= 0.0 ? this.round(this.ln(x) * Math.LOG10E, 14) : this.complex.log(x)); },
		"log2":	function(x) { return (x >= 0.0 ? this.round(this.ln(x) * Math.LOG2E, 14) : this.complex.log2(x)); },
		"alog": function(x) { return this.pow(10, x); },
		"alog2": function(x) { return this.pow(2, x); },
		"max":	Math.max,
		"min":	Math.min,
		"pow":	function(x, y) { return (x >= 0 || Math.floor(y) == y ? Math.pow(x, y) : this.complex.pow(x, y)); },
		/// todo: delete "^": function(x, y) { calculator.analytics.usesCaret = true; return this.pow(x, y); },
		"random":	Math.random,
		"random_seed":	function(x) { /* todo: implement */ },
		"randomize": function(x) { return this.random(); },
		"round": function(x, nDigits) { if (!(nDigits == Math.floor(nDigits) && nDigits >= 0 && nDigits < 17)) throw Error("bad arg"); var fac = this.alog(nDigits); return Math.round(x * fac)/fac; },
		"trunc": function(x, nDigits) { if (!(nDigits == Math.floor(nDigits) && nDigits >= 0 && nDigits < 17)) throw Error("bad arg"); var fac = this.alog(nDigits); return ((x > 0 ? Math.floor(x * fac) : Math.ceil(x * fac))/fac); },
		"sqrt":	function(x) { return (x >= 0 ? Math.sqrt(x) : this.complex.sqrt(x)); },
		"squared": function(x) { return x*x; },
		"tan":	function(x) { return this.sin(x) / this.cos(x); }, // tangent; this will correctly compute Infinity for pi/2; advantage of keeping this as is versus using Math.tan
		"cot":	function(x) { return this.cos(x) / this.sin(x); }, // cotangent
		"sec":	function(x) { return 1 / this.cos(x); }, // secant
		"csc":	function(x) { return 1 / this.sin(x); }, // cosecant
		"sinh": function(x) { return (Math.exp(x)-Math.exp(-x))/2; },
		///"sinh2": function(x) { var ex = Math.exp(x); return (ex-1/ex)/2; },
		"cosh": function(x) { return (Math.exp(x)+Math.exp(-x))/2; },
		"tanh": function(x) { return (Math.exp(2*x)-1)/(Math.exp(2*x)+1); },
		"coth": function(x) { return (Math.exp(2*x)+1)/(Math.exp(2*x)-1); }, // hyperbolic cotangent
		"sech": function(x) { return 2/(Math.exp(x)+Math.exp(-x)); }, // hyperbolic secant
		"csch": function(x) { return 2/(Math.exp(x)-Math.exp(-x)); }, // hyperbolic cosecant
		"asinh": function(x) { return this["ln"](x + Math.sqrt(x*x+1)); },
		"acosh": function(x) { return (x >= 1 ? this["ln"](x + Math.sqrt(x-1) * Math.sqrt(x+1)) : this.complex.acosh(x)); },
		"atanh": function(x) { return ((x <= 1 && x >= -1) ? this["ln"]((1+x)/(1-x)) * 0.5 : this.complex.atanh(x)); },
		"acsch": function(x) { return this["ln"](Math.sqrt(1+1/(x*x))+1/x); },
		"asech": function(x) { return this["ln"](Math.sqrt(1/x-1)*Math.sqrt(1/x+1)+1/x); }, // todo: (x >= 0 && x <= 1); otherwise, call complex
		"acoth": function(x) { return this["ln"]((x+1)/(x-1)) * 0.5; }, // todo: (x <= -1 || x >= 1); otherwise, call complex
		"isInt": function(x) { return (x == Math.floor(x)); },
		"isFalse": function(x) { return (x == false); },
		"isSquare": function(x) { return this.isInt(Math.sqrt(x)); },
		"isPowerOf2": function(x) { return !(x & x-1); },
		///only good for 32-bit: "powerOf2": function(n) { n |= (n >>  1); n |= (n >>  2); n |= (n >>  4); n |= (n >>  8); n |= (n >> 16); return n - (n >> 1); },
		"powerOf2": function(x) { return this.pow(2, this["int"](this.log2(x))); },
		"int": function(x) { return (x < 0 ? Math.ceil(x) : Math.floor(x)); },
		"fract": function(x) { return x - this["int"](x); },
		"sign": function(x) { return (x < 0 ? -1 : (x > 0 ? 1 : 0)); },
		"mantissa": function(x) { return (x ? this.toPrecision(this.pow(10, -this.exponent(x)) * x) : 0); },
		"exponent": function(x) { return this.floor(this.log(x)); },
		"neg": function(x) { return -x; },
		"inv": function(x) { return 1.0/x; },
		"percent": function(x, y) { return x*y/100; },
		"%": function(x, y) { return this.percent(x, y); },
		"percent_of_total": function(x, y) { return y*100/x; },
		"percent_change": function(x, y) { return this.percent_of_total(x, y) - 100; },
		"factorial": function(x) { var isInt = this.isInt(x);
			if (isInt && x <= 17 && x >= 0) return [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600,6227020800,87178291200,1307674368000,20922789888000,355687428096000][x];
			var res = this.gamma(x+1); return (isInt ? Math.round(res) : res);
		},
		"loggamma": function(x) {
			with(Math) { var v=1; var w=0; var z=0;
				while ( x<8 ) { v*=x; x++ }
				w=1/(x*x);
				return ((((((((-3617/122400)*w + 7/1092)*w
							 -691/360360)*w + 5/5940)*w
						   -1/1680)*w + 1/1260)*w
						 -1/360)*w + 1/12)/x + 0.5 * log(2*PI)-log(v)-x+(x-0.5)*log(x) ;
			}
		},
		"gamma": function(x) {
			with(Math) {
				if ( x <= 0 ) {
					if (abs(x)-floor(abs(x))==0 )
						return +Infinity;
					else return PI/(sin(PI*x) * exp(this.loggamma(1-x)));
				}
				else 
					return exp(this.loggamma(x)) ;
			}
		},
		
		"ChiSquareDistribution": function(n, x) {
			if(x>1000 || n>1000) { var q=this.norm_dist((this.pow(x/n,1/3)+2/(9*n)-1)/this.sqrt(2/(9*n)))/2; if (x>n) {return q; } { return 1-q; } }
			var p=this.exp(-0.5*x); if((n%2)==1) { p=p*this.sqrt(2*x/Math.PI); }
			var k=n; while(k>=2) { p=p*x/k; k=k-2; }
			var t=p; var a=n; while(t>1e-15*p) { a=a+2; t=t*x/a; p=p+t; }
			return 1-p;
		},
		"NormalDistribution": function(mean, variance, x) { var z=(mean-x)/Math.sqrt(variance); return ((z<0) ? ((z<-10) ? 0 : this.ChiSquareDistribution(1,z*z)/2 ) : ( (z>10) ? 1 : 1-this.ChiSquareDistribution(1,z*z)/2 ) ); },
		"NormalPDF": function(mean, variance, x) { var a = x - mean; return Math.exp(-(a * a) / (2 * variance)) / (Math.sqrt(2 * Math.PI * variance)); },
		"NormalQuantile": function(x) { // as per http://www.hpmuseum.org/cgi-sys/cgiwrap/hpmuseum/forum.cgi?read=182786#182786
			if (x <= 0) return +Infinity; else if (x >= 1) return -Infinity;
			var z, p = Math.min(x, 1-x), s = this.sign(0.5 - x);
			if (p < 0.2) { var u = -2*this.ln(p); z = Math.sqrt(-2*this.ln(p*Math.sqrt((u-1)*2*Math.PI))) + 1/(u*u); }
			else { var u = (0.5-p)*Math.sqrt(2*Math.PI); z = u + (u*u*u)/6;	}
			var k = 3;
			do {
				var t = (this.NormalDistribution(0, 1, z)-p)/this.NormalPDF(0, 1, z);
				z = z + t/(1 - t*z/2);
			}
			while (--k);
			return z*s;
		},
		"erf": function(z) { return -( (z<0) ? (2*this.NormalDistribution(0, 1, this.sqrt(2)*z)-1) : (1-2*this.NormalDistribution(0, 1, -this.sqrt(2)*z)) ); },
		"StudentTDistribution": function(n, t) { if (n != Math.floor(n)) throw Error("bad arg");
			function StatCom(q,i,j,b) {
				var zz=1; var z=zz; var k=i; while(k<=j) { zz=zz*q*k/(k-b); z=z+zz; k=k+2; };
				return z;
			}
			t=Math.abs(t); var w=t/this.sqrt(n); var th=this.atan(w);
			if(n==1) { return (1-th/(Math.PI/2))/2; }
			var sth=Math.sin(th); var cth=Math.cos(th);
			if((n%2)==1) { return (1-(th+sth*cth*StatCom(cth*cth,2,n-3,-1))/(Math.PI/2))/2; }
			else { return (1-sth*StatCom(cth*cth,1,n-3,-1))/2; }
		},
		"StudentTPDF": function(n, t) { if (n != Math.floor(n)) throw Error("bad arg"); return this.gamma((n+1)/2)/(Math.sqrt(n * Math.PI) * this.gamma(n/2) * Math.pow((1 + (t*t)/n), (n+1)/2)); },
		"StudentTQuantile": function(df, x) { // as per http://www.hpmuseum.org/cgi-sys/cgiwrap/hpmuseum/archv020.cgi?read=183112
			if (df != Math.floor(df)) throw Error("bad arg");
			if (x <= 0) return +Infinity; else if (x >= 1) return -Infinity; else if (x == 0.5) return 0;
			var t, p = Math.min(x, 1-x), s = this.sign(0.5 - x);
			if (-this.ln(p) < 1.7 * df) {
				if (p < 0.2) {
					var u = -2*this.ln(p);
					x = Math.sqrt(-2*this.ln(p*Math.sqrt((u-1)*2*Math.PI))) + 1/(u*u);
				}
				else {
					var u = (0.5-p)*Math.sqrt(2*Math.PI);
					x = u + (u*u*u)/6;
				}
				var x3 = x*x*x;
				var u = (x3 + x) / 4 / df;
				var v = (x3*x*x / 12 + x3 / 4) / (df*df);
				t = x + u + v;
			}
			else {
				var u = 2*p*df*Math.sqrt(Math.PI/(2*df - 1));
				t = Math.sqrt(df) / Math.pow(u,(1/df));
			}
			
			var d, k = 10;
			do {
				d = (this.StudentTDistribution(df, t) - p) / this.StudentTPDF(df, t);
				t += d;
			}
			while (d*d > 1e-30 && --k);
			
			return t*s;
		},
		"FisherFDistribution": function(n1, n2, f) {
			function StatCom(q,i,j,b) {
				var zz=1; var z=zz; var k=i; while(k<=j) { zz=zz*q*k/(k-b); z=z+zz; k=k+2; };
				return z;
			}
			var x=n2/(n1*f+n2);
			if((n1%2)==0) { return StatCom(1-x,n2,n1+n2-4,n2-2)*this.pow(x,n2/2) }
			if((n2%2)==0){ return 1-StatCom(x,n1,n1+n2-4,n1-2)*this.pow(1-x,n1/2) }
			var th=this.atan(this.sqrt(n1*f/n2)); var a=th/(Math.PI/2); var sth=Math.sin(th); var cth=Math.cos(th);
			if(n2>1) { a=a+sth*cth*StatCom(cth*cth,2,n2-3,-1)/(Math.PI/2); }
			if(n1==1) { return 1-a; }
			var c=4*StatCom(sth*sth,n2+1,n1+n2-4,n2-2)*sth*this.pow(cth,n2)/Math.PI;
			if(n2==1) { return 1-a+c/2; }
			var k=2; while(k<=(n2-1)/2) {c=c*k/(k-.5); k=k+1; }
			return 1-a+c;
		},
		"combinations": function(n, m) { if (!(n == Math.floor(n) && n >= 0 && m == Math.floor(m) && m >= 0)) throw Error("bad arg"); return (n<m ? 0 : Math.round(this.factorial(n) / (this.factorial(m) * this.factorial(n - m)))); },
		"permutations": function(n, m) { if (!(n == Math.floor(n) && n >= 0 && m == Math.floor(m) && m >= 0)) throw Error("bad arg"); return (n<m ? 0 : Math.round(this.factorial(n) / this.factorial(n - m))); },
		"gcd": function(a, b) { if (a < 0) { a = -a; }; if (b < 0) { b = -b; }; if (b > a) { var tmp = a; a = b; b = tmp; } while (true) { a %= b; if (!a) return b; b %= a; if (!b) return a; }; },
		"lcm": function(a, b) { return ((a / this.gcd(a,b)) * b); },
		"fib": function(n) { if (n<0 || n>1400) throw Error("bad arg"); if (n <= 1) return n; var a = 0; var b = 1; var val; for (var i=2; i<=n; i++) { val = a+b; a = b;	b = val; } return val; },
		"hermite": function(n) { if (n != Math.floor(n) || n <= 0) throw Error("bad arg");
			var res = "'", nFact = this.factorial(n) * Math.pow(2, -n/2);
			for (var m=0; m<=n/2; m++) {
				var fac = Math.round(nFact * Math.pow(-1, m) / (this.factorial(m)*this.factorial(n-2*m)) * 2);
				///if (!fac) continue;
				if (fac > 0 && m>0) res += "+";
				if (fac != 1) res += fac;
				var exp = (n-2*m); if (exp > 1) res += "*X^" + exp;
			}
			return res + "'";
		},
		"split": function(x) { var v = [], s = String(x).replace(".", ""); var size = s.length; for (var i=0; i<size; i++) v.push(+s[i]); return v; },
		"permutate": function(x) { x = String(x); if (x.length > 10) throw Error("resultTooLarge"); var results = [];
			function perm(begin, end) {
				if (end.length == 1)
					results.push(+(begin+end));
				else
					for (var i=0; i<end.length; i++) {
						var s = end.substring(0, i) + end.substring(i+1);
						arguments.callee(begin + end[i], s);
					}
			}
			perm("", x);
			return results;
		},
		"modfib": function(x, m) { return this.matrix.modpow([[0,1],[1,1]], x, m)[0][1]; },
		"isSquareFree": function(x) { return (x==1 ? true : (ME.vector.rproduct(this.factors(x), 1, 1, 0) == 1)); },
		"squareFreePart": function(x) { if (x==1) return 1; var facs = this.factors(x), prod = 1; for (var i=0; i<facs.length; i+=2) prod *= (facs[i+1]&1 ? facs[i] : 1); return prod; },
		"moebius": function(x) { if (x<1) throw Error("bad arg"); if (x==1) return 1; var f = this.factors(x); return (ME.vector.rproduct(f, 1, 1, 0) == 1 ? (f.length&3 ? -1 : 1) : 0); },
		"radical": function(x) { if (x<1) throw Error("bad arg"); if (x==1) return 1; return ME.vector.rproduct(this.factors(x), 0, 1, 0); },
		"omega": function(x) { if (x<1) throw Error("bad arg"); if (x==1) return 0; return this.factors(x).length/2; },
		"Omega": function(x) { if (x<1) throw Error("bad arg"); if (x==1) return 0; return ME.vector.rtotal(this.factors(x), 1, 1, 1); },
		"sigma": function(x, n) {
			if (n == 0) return (x==1 ? 1 : ME.vector.rproduct(this.factors(x), 1, 1, 1));
			else return ME.vector.rtotal(this.divs(x), 0, 0, n);
		},
		"ndivs": function(x) { return this.sigma(x, 0); },
		"divs": function(x) { var result = []; result[0] = 1;
			var factors = this.factors(x);
			for (var i=factors.length-2; i>=0; i-=2) {
				var fac = factors[i];
				var nf = fac, multipliers = [];
				for (var j=factors[i+1]; j>0; j--, nf *= fac)
					multipliers.push(nf);
				result = result.concat(this.vector.cproduct(result, multipliers));
			}
			return result.sort(function(a, b) { return a-b; });
		},
		"factors": function(m) {
			if (!calculator.wantsExpressionResult && m == 1) return []; 
			var wheel = new Array(1,2,2,4,2,4,2,4,6,2,6,4,2,4,6,6,2,6,4,2,6,4,6,8,4,2,4,2,4,14,4,6,2,10,2,6,6,
								  4,2,4,6,2,10,2,4,2,12,10,2,4,2,4,6,2,6,4,6,6,6,2,6,4,2,6,4,6,8,4,2,4,6,8,6,
								  10,2,4,6,2,6,6,4,2,4,6,2,6,4,2,6,10,2,10,2,4,2,4,6,8,4,2,4,12,2,6,4,2,6,4,6,
								  12,2,4,2,4,8,6,4,6,2,4,6,2,6,10,2,4,6,2,6,4,2,4,2,10,2,10,2,4,6,6,2,6,6,4,6,6,
								  2,6,4,2,6,4,6,8,4,2,6,4,8,6,4,6,2,4,6,8,6,4,2,10,2,6,4,2,4,2,10,2,10,2,4,2,4,8,
								  6,4,2,4,6,6,2,6,4,8,4,6,8,4,2,4,2,4,8,6,4,6,6,6,2,6,6,4,2,4,6,2,6,4,2,4,2,10,2,
								  10,2,6,4,6,2,6,4,2,4,6,6,8,4,2,6,10,8,4,2,4,2,4,8,10,6,2,4,8,6,6,4,2,4,6,2,6,4,6,
								  2,10,2,10,2,4,2,4,6,2,6,4,2,4,6,6,2,6,6,6,4,6,8,4,2,4,2,4,8,6,4,8,4,6,2,6,6,4,2,
								  4,6,8,4,2,4,2,10,2,10,2,4,2,4,6,2,10,2,4,6,8,6,4,2,6,4,6,8,4,6,2,4,8,6,4,6,2,4,6,
								  2,6,6,4,6,6,2,6,6,4,2,10,2,10,2,4,2,4,6,2,6,4,2,10,6,2,6,4,2,6,4,6,8,4,2,4,2,12,6,
								  4,6,2,4,6,2,12,4,2,4,8,6,4,2,4,2,10,2,10,6,2,4,6,2,6,4,2,4,6,6,2,6,4,2,10,6,8,6,4,
								  2,4,8,6,4,6,2,4,6,2,6,6,6,4,6,2,6,4,2,4,2,10,12,2,4,2,10,2,6,4,2,4,6,6,2,10,2,6,4,
								  14,4,2,4,2,4,8,6,4,6,2,4,6,2,6,6,4,2,4,6,2,6,4,2,4,12,2,12 );
			function addToResult(n, e) {
				if (calculator.wantsExpressionResult) {
					if (result.length)
						result += "*";
					result += n;
					if (e != 1)
						result += "^" + e;
				}
				else {
					result.unshift(e);
					result.unshift(n);
				}
			}

			var km = m;			
			var result = (calculator.wantsExpressionResult ? "" : []);
			function find_factors() {
				var wheel_max = wheel.length, wheel_start = 5; // wheel dimensions and entry point
				var i = 0, n = 2;
				do {
					var e = 0, q = Math.floor(m/n);
					while(m == n * q) {
						e++;
						m = q;
						q = Math.floor(m/n);
					}
					if(e > 0) // this factor divided m?
						addToResult(n, e);

					// next position on the wheel
					n += wheel[i++];
					if(i == wheel_max) i = wheel_start;
				}
				while (n <= q);				
			}
			if (m) // if non-zero, search for factors
				find_factors();

			if (m == km) { // is "m" prime?
				if (calculator.wantsExpressionResult)
					return m; // special case behavior: primes (and 0, 1) return themselves, instead of expression
				addToResult(m, 1);
			}
			else if (m != 1 || km == 1) // is there a remainder?
				addToResult(m, 1);
			return (calculator.wantsExpressionResult ? calculator.quote(result) : result);
		},
		"factor": function(x) { calculator.wantsExpressionResult = true; var s = this.factors(x, true); delete calculator.wantsExpressionResult; return s; },
		"primes": function(max) { // sieve of Eratosthenes
			var D = [], primes = [];
			for (var q=2; q<=max; q++) {
				if (D[q]) {
					for (var i=0; i<D[q].length; i++) {
						var p = D[q][i];
						if (D[p+q]) D[p+q].push(p);
						else D[p+q]=[p];
					}
					delete D[q];
				} else {
					primes.push(q);
					if (q*q<=max) D[q*q]=[q];
				}
			}
			return primes;
		},
		"prepIsPrime": function(max) { // sieve of Eratosthenes
			if (!(calculator.vars.isPrimeArray && max <= calculator.vars.isPrimeArray.max)) {
				var arr = calculator.vars.isPrimeArray = [];
				calculator.vars.isPrimeArray.max = max;
				var D = [];
				for (var q=2; q<=max; q++) {
					if (D[q]) {
						for (var i=0; i<D[q].length; i++) {
							var p = D[q][i];
							if (D[p+q]) D[p+q].push(p);
							else D[p+q]=[p];
						}
						delete D[q];
					} else {
						arr[q] = true;
						if (q*q<=max) D[q*q]=[q];
					}
				}
			}
		},
		"modadd": function(a,b,n) {	var sum; sum = (a + b) % n;	if (sum < 0) {sum += n;}; return sum; },
		"modmul": function(a,b,n) {	var prod; prod = (a * b) % n; if (prod < 0) {prod += n;}; return prod; },
		"xgcd": function(a,b) { // 
			var quot, a1=1, b1=0, a2=0, b2=1, retval=new Array();
			if(a < 0) {a = -a;};
			if(b < 0) {b = -b;};
			if(b > a) {temp = a; a = b; b = temp;};
			while (true) {
				quot = -Math.floor(a / b);
				a %= b;
				a1 += quot*a2; b1 += quot*b2;
				if(a == 0) {retval[0]=b; retval[1]=a2; retval[2]=b2; return retval;};
				quot = -Math.floor(b / a);
				b %= a;
				a2 += quot*a1; b2 += quot*b1;
				if(b == 0) {retval[0]=a; retval[1]=a1; retval[2]=b1; return retval;};
			};
			retval[0]=b; retval[1]=a2; retval[2]=b2; return retval;
		},
		"modpow": function(base, exponent, modulus) {
			var result = 1;
			if (this.isInt(exponent)) {
				// credit: book "Applied Cryptography" by Bruce Schneier
				while (exponent > 0) {
					if ((exponent & 1))
						result = (result * base) % modulus;
						///{ var tmp = result * base; result = tmp - (modulus * ME.int(tmp / modulus)); }
					exponent >>= 1;
					base = (base * base) % modulus;
				}
			}
			else { // non-integer exponent
				var r = Math.pow(base, exponent);
				if (r < calculator.vars.maxInt)
					return r % modulus;

				exponent = (exponent * this.ln(base));
				result += exponent; // second term
				var n = exponent, d = 1;
				for (var i=2; i<30; i++) {
					n = n * exponent;
					d = d * i;
					result += n/d % modulus;
				}
				result %= modulus;
			}
			return result;
		},
		"prepPhi": function(M) {
			var fact = [];
			for(var i=0; i<M; i++) fact[i]=1;
			for(var i=2; i<M; i++) if(fact[i]==1) for(var k=i+i; k<M; k+=i) if(fact[k]==1) fact[k]=i;
			calculator.vars.phiF = fact;
		},
		"phi_prepped": function(x) {
			if(x <= 1) return 1;
			var f = calculator.vars.phiF[x];
			if(f == 1) return x-1;
			var p = 1, fp = 1;
			while((x /= f) % f == 0) { p++; fp *= f; }
			return arguments.callee(x)*(f-1)*fp;
		},
		"phi": function(n) { if ("phiF" in calculator.vars && n < calculator.vars.phiF.length) return this.phi_prepped(n);
			var result = 1;
			if (!(n%2)) { n /= 2; while (!(n%2)) { n /= 2; result *= 2; } }
			for (var k=3; k*k<=n; k+=2) {
				if (!(n%k)) {
					n /= k;
					result *= k-1;
					while (!(n%k)) {
						n /= k;
						result *= k;
					}
				}
			}
			if (n>1) result *= n-1;
			return result;
		},
		"isProbablePrime": function(numb) { // credit: http://userpages.umbc.edu/~rcampbel/NumbThy/Class/BasicNumbThy.html
			var i, r, d, pow2, base, x;
			// Compute largest pow2 so that (numb-1) = d*2^pow2
			d = numb-1;
			for(pow2=0; (((1<<pow2) & d)==0); pow2++){};
			d = (d >> pow2);
			for(base = 2; base <= 7; base++)
			{
				if((base>2) && ((base & 1)==0)) {continue;};  // Composite bases give redundant tests
				x = this.modpow(base,d,numb);
				if((x!=1) && (x!=(numb-1)))
				{
					for(r=1; r<=(pow2-1); r++)
					{
						x = this.modmul(x,x,numb);
						if(x==1){return false;};   // Previous value of x was sqrt(1) other than -1
						if(x==(numb-1)){break;};
					};
					if(x!=(numb-1)){return false;};  // base^((numb-1)/2) != 1 or -1, equiv to Fermat test
				};
			};
			return true;
		},
		"isPrime": function(x) { //
			if (x <= calculator.vars.isPrimeArray.length) return (calculator.vars.isPrimeArray[x] == undefined ? false : true);
			return (/*([2,3,5,7,11,13,17,19].indexOf(x)!=-1) || */((this.gcd(9699690/* 2*3*5*7*11*13*17*19 */,x)==1) && this.isProbablePrime(x)));
		},
		"nextPrime": function(x) { if (x<2) return 2; ++x; if (!(x&1)) ++x; while (!this.isPrime(x)) x += 2; return x; },
		"prevPrime": function(x) { if (x<=3) return 2; --x; if (!(x&1)) --x; while (!this.isPrime(x)) x -= 2; return x; },
		"incr": function(x) { return x+1; },
		"decr": function(x) { return x-1; },
		"INCR": function(x) { ++x; calculator.stack.push(x); return x; },
		"DECR": function(x) { --x; calculator.stack.push(x); return x; },
		"isEven": function(x) { return !(x&1); },
		"size": function(x) { return String(x).length - (x<0); },
		"reverse": function(x) { return +(String(x).split("").reverse().join("")); },
		"head": function(x) { return x; }, // purpose: permit 'head' to be used to obtain "primary item" for functions returning either a number/expr or an array of such
		"VERSION": function() { return calculator.vars.version; },
		"FC?C": function(x) { x = "flag"+x; var ret = (calculator.vars.local[x] == 0 || calculator.vars.local[x] == undefined); calculator.vars.local[x] = 0; return ret; },
		"FS?C": function(x) { x = "flag"+x; var ret = Boolean(calculator.vars.local[x]); calculator.vars.local[x] = 0; return ret; },
		"FS?": function(x) { x = "flag"+x; return Boolean(calculator.vars.local[x]); },
		"CF": function(x) { x = "flag"+x; calculator.vars.local[x] = 0; },
		"SF": function(x) { x = "flag"+x; calculator.vars.local[x] = 1; },
		"flags_recall": function() { var v = []; for (var i=0; i<128; i++) v[i] = calculator.vars.local["flag"+i] || 0; return BigNum.fromString(v.reverse().join("") + "b"); },
		"@flags_store": function(x) { if (calculator.typeOf(x) != "bignum") throw Error("wrong type of argument");
			var saved_radix = BigNum.radix; BigNum.radix = 2; var v = BigNum.toString(x).split("").reverse(); v.shift(); BigNum.radix = saved_radix;
			for (var i=0; i<128; i++) calculator.vars.local["flag"+i] = v[i];
			// todo: store flags persistently when quitting calc, and restore upon reload
		},

		"callWA": function(cmd, arg) { this.string.loadURL("http://wolframalpha.com/input/?i=" + cmd + "%20" + encodeURIComponent(calculator.unquote(arg))); },
		
		"getDrawParams": function() { var params = calculator.vars[calculator.currentDataCategory]["PPAR"]; return (params ? params.clone() : ["(0,0)", "(1,1)"]); /* was: if (params == undefined) throw Error("nonexistent PPAR variable"); return (params ? params : undefined); */ },
		"insertIntoDrawParams": function(x, pos) { var params = this.getDrawParams(); params[pos] = x; calculator.functions["@var_store"](params, "'PPAR'"); },
		"storeCurrentDrawParams": function() { calculator.functions["@var_store"](this.getDrawParams(), "'PPAR'"); },
		"@store_pmin": function(coord) { if (!calculator.isAComplexNumber(coord)) throw Error("bad arg"); this.insertIntoDrawParams(coord, 0); },
		"@store_pmax": function(coord) { if (!calculator.isAComplexNumber(coord)) throw Error("bad arg"); this.insertIntoDrawParams(coord, 1); },
		"@store_indep": function(name) { if (!calculator.isAName(name)) throw Error("bad arg"); this.insertIntoDrawParams(calculator.unquote(name), 2); },
		"@store_eq": function(x) { this["@var_store"]((calculator.isAFirmString(x) ? ME.string.toName(x) : x), "'eq'"); },
		"@recall_eq": function() { return this["@var_recall"]("'eq'"); },
		"@draw": function() { /*if (canvas) canvas.className = canvas.className;*/ /* calculator.nDraws = (calculator.nDraws == undefined ? 0 : calculator.nDraws+1); calculator.exec("log", "@draw" + calculator.nDraws); */ var eq = calculator.vars[calculator.currentDataCategory]['eq']; if (!eq) throw Error("no equation set (nonexistent eq variable)"); display.showGraphics(true); var isAlgebraic = (eq[0] == "'"); var eqs = (isAlgebraic ? calculator.unquote(eq).split("=") : [eq]); display.nCurrentGraphs = eqs.length; for (var i=0; i<eqs.length; i++) calculator.draw1D(isAlgebraic ? calculator.quote(eqs[i]) : eqs[i], i); },
		"plot_scaleWidth": function(scaler) { var params = this.getDrawParams(); var pmin = calculator.complexParts(calculator.unquote(params[0])), pmax = calculator.complexParts(calculator.unquote(params[1]));
			var span = (pmax[0] - pmin[0]); var center = pmin[0] + span/2.0; span *= scaler; pmin[0] = center - span/2.0; pmax[0] = center + span/2.0;
			this.insertIntoDrawParams(this.complex.fromReal(pmin[0], pmin[1]), 0); this.insertIntoDrawParams(this.complex.fromReal(pmax[0], pmax[1]), 1);
		},
		"plot_scaleHeight": function(scaler) { var params = this.getDrawParams(); var pmin = calculator.complexParts(calculator.unquote(params[0])), pmax = calculator.complexParts(calculator.unquote(params[1]));
			var span = (pmax[1] - pmin[1]); var center = pmin[1] + span/2.0; span *= scaler; pmin[1] = center - span/2.0; pmax[1] = center + span/2.0;
			this.insertIntoDrawParams(this.complex.fromReal(pmin[0], pmin[1]), 0); this.insertIntoDrawParams(this.complex.fromReal(pmax[0], pmax[1]), 1);
		},

		"email": function() {
			var iconDataURLs = {
				"stackPosition": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAQCAYAAAAMJL+VAAABXklEQVQ4Ea2Uz0oDMRDGv5n14mlrwZPgAxQqeCzoxbV9iq56E3pR8EUKngVZfQfBuoJ4KAgFseAD9Fqo9SRIkzHZbkvY9iBLcsmfL/lNJuQbEhEUW5JOGoygDkhNQJtF3Z0T5AegT6UwOG2FA1ezY3ID3D1+H1Eg1yCqFTf+ay4yFEWXcSt8XuxfBkjS6QUTdRdC6V6gzJucx1F4YxlZgPt00gSCBxCC0mD3oA2iJYqblReer3PXG9wCzUWJkb0GJb3JATG/uhfwNZ5pvccCbvgCFjkbxA02qVSLgq+5QHYYGsoXcB2HhWS8TvCzRiMGqb4f2CrF/NW33AfTD+NeUxo8NpH3dlTZz32gr2DM4Q0v+NXQHcvLArSjas/a20uQeanonETV7OnzDABbO0ShBZNa6UzMWfMpDxd1yHKWxc6F3j591a1JTCXfNbbfdrWVsWBMhNFMdP/seGtY1P8A7MmDyqqCbk0AAAAASUVORK5CYII=",
				"type": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAQCAYAAAAMJL+VAAABe0lEQVQ4EWP8//8/AzpYdfluKivLXztG5n/a/xn/c6DLI/MZ/zP++P+X6erfPyw7QnSVliLLgdiMyBasvXyniJX3exsz+x92dIXE8P/+ZPnx+zNndbCuSh9MPdyCtTdureXg/xoEkyCXBobH/5/vuRcGa6klgsxgAhFrrt4sZ+f/GghiUwoYgaHCLvg1fu2l23kgs8AWsHH/agRJUGo4TD/ILFa+n+0gPuOay7czOYQ/T4NJUpP+8oonmAmYUrypaSiyWWxs/wOZGJn+CyELUpXN+F8WFAd/qWoommFM//4zvkIToxr33z/G+0z/fjNuppqJaAb9AZoNzmibHlz+Dsy9eIsENL0EuX9/sn7zU9DhBueDX1/ZGkA5kKAuIhX8BxZgPz5zFoCUI4qKa7fmg3IgpRkOa1EBsglUdvx8w1sC8hqITw4A6f32hi8dVg6BzID7ANnAlRdvB4EyCQPTfwUGpn/CyHIY7H9Mbxn+MT749Ytxfbi+6jp0eQCZMJGhOB/tDAAAAABJRU5ErkJggg=="
			};			
			calculator.exec("email", calcbody.innerHTML.replace(/\\/g, "|").replace(/*/(width|height)="[0-9]+"/g*//width="184" height="50"/g, "")./*replace(/"color: white"/g, "color: gray").*/replace(/"stackPositionButton.png"/g,iconDataURLs["stackPosition"]).replace(/"typeButton.png"/g,iconDataURLs["type"]));
		},

		"stopAnyGraphics": function() { display.showGraphics(false); },
		"scribble": function() {
			if ("lineInterval" in display && "blankInterval" in display) {
				clearInterval(display.lineInterval);
				clearInterval(display.blankInterval);
			}
			display.showGraphics(true);
			var context = canvas.getContext('2d');

			var lastX = context.canvas.width * Math.random();
			var lastY = context.canvas.height * Math.random();
			
			var hue = 0;
			function line() {
				context.save();
				context.translate(context.canvas.width/2, context.canvas.height/2);
				context.scale(0.9, 0.9);
				context.translate(-context.canvas.width/2, -context.canvas.height/2);
				context.beginPath();
				context.lineWidth = 5 + Math.random() * 10;
				context.moveTo(lastX, lastY);
				lastX = context.canvas.width * Math.random();
				lastY = context.canvas.height * Math.random();
				context.bezierCurveTo(context.canvas.width * Math.random(),
									  context.canvas.height * Math.random(),
									  context.canvas.width * Math.random(),
									  context.canvas.height * Math.random(),
									  lastX, lastY);
				
				hue = hue + 10 * Math.random();
				context.strokeStyle = 'hsl(' + hue + ', 50%, 50%)';
				context.shadowColor = 'white';
				context.shadowBlur = 10;
				context.stroke();
				context.restore();
			}
			display.lineInterval = setInterval(line, 50);
			
			function blank() {
				context.fillStyle = 'rgba(255,255,255,0.1)';
				context.fillRect(0, 0, context.canvas.width, context.canvas.height);
			}
			display.blankInterval = setInterval(blank, 40);

			canvas.addEventListener("unload", function() { clearInterval(display.lineInterval); delete display.lineInterval; clearInterval(display.blankInterval); delete display.blankInterval; });
		},

		// conversions
		"toPrecision": function(x) { return Number(Number(x).toPrecision(15)); },
		"degToRad": function(x) { return x * Math.PI / 180.0; },
		"radToDeg": function(x) { return x * 180.0 / Math.PI; },
		"toHMS": function(x) { return this.toPrecision((90*x+100*this["int"](this.toPrecision(x))+this["int"](this.toPrecision(60*x)))/250); },
		"HMStoS": function(x) { return ((250*x-60*this["int"](this.toPrecision(x))-this["int"](this.toPrecision(100*x)))/90); },
		"fromHMS": function(x) { return ME.toPrecision(this.HMStoS(x)); },
		"HMSplus": function(x, y) { return this.toHMS((this.HMStoS(x) + this.HMStoS(y))); },
		"HMSminus": function(x, y) { return this.toHMS((this.HMStoS(x) - this.HMStoS(y))); },
		"unicode": function(charOrCode) { var code = parseInt(charOrCode); return (isNaN(code) ? charOrCode.toString().charCodeAt(0) : String.fromCharCode(code)); },
		"toBig": function(x) { return (x == Math.floor(x) ? BigNum.fromNumber(x) : BigFloat.fromNumber(x)); },
		"fromBig": function(x) { return +x; },

		string: {
			toNumber: function(x) { return +x; },
			"fromString": function(x) {
				x = calculator.RPLProgram.tokenizeWithDelimiters('"', '"', x); // was: x = this.stripFirmDelimiters(x); x = x.split(" "); // todo: also split by "," and *split into elements* respecting opening and closing delimiters, e.g. << ... >> must become one entry
				var k = 0;
				if (x[0] == "GROB") { // special case treatment for grobs
					if (x.length < 4)
						throw Error("too few arguments on stack");
					if (!(calculator.isABinaryNumber(x[1]) && calculator.isABinaryNumber(x[2])))
						throw Error("wrong type of argument");
					calculator.push(NDImage.toImage(this.toString("Graphic"), this.toString("0x" + x[3]), Number(x[1]), Number(x[2])));
					k = 4;
				}
				var saved_wantsStackDisplay = calculator.mode.operation.wantsStackDisplay; calculator.mode.operation.wantsStackDisplay = false;
				var saved_wantsUndo = calculator.wantsUndo; calculator.wantsUndo = false;
				try {
					for (; k<x.length; k++)
						calculator.push(x[k]);
				}
				catch(e) { throw e; }
				finally {
					calculator.mode.operation.wantsStackDisplay = saved_wantsStackDisplay;
					calculator.wantsUndo = saved_wantsUndo;
				}
			},
			"toString": function(x) { return (calculator.isAFirmString(x) ? x : '"' + calculator.stringValueOfItem(x) + '"'); },
			"toName": function(x) { return ("'" + this.stripFirmDelimiters(x) + "'"); },
			"stripFirmDelimiters": function(x) { x = x.slice(1,-1); return x; },
			"unicode": function(x) { return x.charCodeAt(1/* skipping firm string delimiter */); },
			"append": function(x, y) { return this["+"](x, y); },
			"+": function(x, y) { var str = (calculator.isAFirmString(x) ? this.stripFirmDelimiters(x) : String(x)); var str2 = (calculator.isAFirmString(y) ? this.stripFirmDelimiters(y) : String(y)); return this.toString(str + str2); },
			"==": function(x, y) { return x == y; },
			"!=": function(x, y) { return x != y; },
			">": function(a, b) { return a > b; },
			"<": function(a, b) { return a < b; },
			">=": function(a, b) { return a >= b; },
			"<=": function(a, b) { return a <= b; },
			"charCode": function(x) { return this.unicode(x); },
			"pos": function(x, y) { if (typeof x != "string" || typeof y != "string") throw Error("wrong type of argument"); var str = this.stripFirmDelimiters(x); var searchStr = this.stripFirmDelimiters(y); return str.indexOf(searchStr)+1; },
			"sub": function(x, start, end) { if (typeof start != "number" || typeof end != "number") throw Error("wrong type of argument"); var str = this.stripFirmDelimiters(x); return this.toString(end ? str.slice(start-1, end) : str.slice(start-1)); },
			"reverse": function(x) { return x.split("").reverse().join(""); },
  			"slice": function(x, n, y) { if (!(typeof x == "string" && typeof n == "number" && typeof y == "string")) throw Error("wrong type of argument");
				x = this.stripFirmDelimiters(x); y = this.stripFirmDelimiters(y);
				--n; if (n < 0 || n > x.length) throw Error("bad arg");
				return this.toString(x.substr(0, n) + y + x.substr(n+y.length));
			},
			"replace": function(x, a, b) { if (!(typeof x == "string" && typeof a == "string" && typeof a == "string")) throw Error("wrong type of argument");
				a = this.stripFirmDelimiters(a); b = this.stripFirmDelimiters(b);
				var s; while ((s = x.replace(a, b)) != x) x = s; return s;
			},
			"pad": function(x, n, padChar) {
				if (!(calculator.isAFirmString(x) && calculator.isAFirmString(padChar) && padChar.length == 3 && typeof n === "number")) throw Error("wrong type of argument");
				x = this.stripFirmDelimiters(x); padChar = this.stripFirmDelimiters(padChar);
				x = (new Array(n - x.length + 1)).join(padChar).concat(x); // pad
				return this.toString(x);
			},
			"permutate": function(x) { x = this.stripFirmDelimiters(x); if (x.length > 9) throw Error("resultTooLarge"); var results = [];
				function perm(begin, end) {
					if (end.length == 1)
						results.push(calculator.functions.string.toString(begin+end));
					else
						for (var i=0; i<end.length; i++) {
							var s = end.substring(0, i) + end.substring(i+1);
							arguments.callee(begin + end[i], s);
						}
				}
				perm("", x);
				return results;
			},
			"split": function(x) { x = this.stripFirmDelimiters(x); return x.split("").map(function(x) { return '"' + x + '"'; }); },
			"match": function(x, regexp) { if (!(typeof x == "string" && typeof regexp == "string")) throw Error("wrong type of argument");
				x = this.stripFirmDelimiters(x); var regexp = new RegExp(this.stripFirmDelimiters(regexp));
				var result = x.match(regexp);
				if ((vars.hasResult = (result != null)))
					return (result.length == 1 ? '"' + result[0] + '"' : result.map(function(x) { return '"' + x + '"'; }));
			},
			"MD5": function(x) { if (require("md5.js")) return this.toString(MD5(this.stripFirmDelimiters(x))); },
			"head": function(x) { x = this.stripFirmDelimiters(x); return this.toString(x[0]); },
			"tail": function(x) { x = this.stripFirmDelimiters(x); return this.toString(x.slice(1)); },
			"last": function(x) { x = this.stripFirmDelimiters(x); return this.toString(x[x.length-1]); },
			"size": function(x) { return x.length-2; },
			"toDisplay": function(x) { /*if (canvas && canvas.setBacking) canvas.setBacking(x); else return x;*/ display.showImageFromURL(calculator.unquote(x)); },
			"alert": function(x) { calculator.exec("alert", "Message", "", calculator.unquote(x)); },
			"alertWithDelay": function(x, t) { calculator.exec("alert", "TimedMessage", t, calculator.unquote(x)); },
			"input": function(title, placeholder) { var result = prompt(this.stripFirmDelimiters(title), this.stripFirmDelimiters(placeholder)); if (!result) throw Error("interrupted"); return this.toString(result); },
			"DOERR": function (msg) { throw Error(this.stripFirmDelimiters(msg)); },
			"loadURL": function(url) { document.location = /*encodeURI(*/calculator.unquote(url)/*)*/; }
		},
		"char": function(x) { return this["@toString"](this.unicode(x)); },
		"@toString": function(x) { return this.string.toString(x); },
		"@loadURLArg": function(arg, url) {
			if (!calculator.isAFirmString(url)) throw Error("wrong type of argument");
			var argString;
			if (typeof arg === "object") {
				if ("length" in arg)
					throw Error("wrong type of argument");
				else
					argString = ("stringValue" in arg ? arg.stringValue : String(arg));
			}
			else if (calculator.isAFirmString(arg))
				argString = calculator.unquote(arg);
			else
				argString = String(arg);
			calculator.functions.string.loadURL(calculator.unquote(url).replace("$$", encodeURIComponent(argString)));
		},
		"@fromDisplay": function() { /*if (canvas && canvas.backing) return canvas.backing;*/ if (!display.isShowingGraphics) throw Error("requires display of a graphic"); 
			return NDImage.toImage('"screen"', this["@toString"](canvas.toDataURL()), canvas.width, canvas.height);
		},
		"@repeat": function(prg, n) { if (!(typeof n == "number")) throw Error("wrong type of argument");
			var prg = calculator.ProgramFragment.fromObj(prg, -1);
			for (var i=0; i<n; i++)
				calculator.stack.push(prg.eval(undefined, true));
		},
		
		expr: {
			type: "expression or name",
			typeHP: 9,
			isLoaded: true,
            wasProducedByWA: false,
			toString: function(obj) { return obj; },
            toHTML: function(obj) {
                var badgeHTML = "";
                if (obj.wasProducedByWA) {
                    badgeHTML = calculator.HTMLforTypeBadge("W|A");
                }
                return "<i>" + calculator.unquote(this.toString(obj)) + "</i>" + badgeHTML;
            },
			isStringRepresentation: function(str) { return calculator.isAName(str); },
			fromString: function(str) { return str; },

			// non-CAS CAS functions
			"derivative": function(x) { ME.callWA("derivative", x); return x; },
			"integral": function(x) { ME.callWA("integral", x); return x; },
			"solve": function(x) { ME.callWA("solve", x); return x; },
			"solveFor": function(eq, x) { ME.callWA("solve", calculator.unquote(eq) + " for " + calculator.unquote(x)); return eq; },
			"taylor": function(x) { ME.callWA("taylor", x); return x; },
			"integrate": function(a, b, expr, indep) { require("num_integration.js"); if (!(calculator.typeOf(indep) == "expression or name" && calculator.typeOf(expr) == "expression or name" && typeof a == "number" && typeof b == "number")) throw Error("wrong type of argument");
				var f = calculator.functionForExpression(expr);
				var integrator = new Integration(f); var result = integrator.doubleexponential(a, b); calculator.vars.IERR = TaggedObject.fromNameAndObj("accuracy", integrator.accuracy);
				// alert("Result: " + result + "; acc digits: " + integrator.accuracy);
				var acc = parseFloat(integrator.accuracy);
				var n_acc_digits = -ME.exponent(acc); if (ME.mantissa(acc) > 5) --n_acc_digits;
				// alert("Result: " + result + "; acc digits: " + n_acc_digits);
				return ME.round(result, n_acc_digits);
			},
			
			"subst": function(expr, eq) { if (!(calculator.typeOf(expr) == "expression or name" && calculator.typeOf(eq) == "expression or name")) throw Error("wrong type of argument");
				var y=calculator.unquote(eq).split("="); if (y.length != 2) throw Error("2nd arg not an equation");
				if (calculator.isALikelyExpression(y[1])) y[1] = "(" + y[1] + ")"; // if left size of eq is expr, make sure we place it in parentheses
				return expr.replace(new RegExp(y[0], "g"), y[1]);
			},
			"right": function(x) { return x.replace(/[^\u0027]+[ ]?(=|->|~~)[ ]?/g, ""); },
			"noand": function(expr) { return calculator.quote(calculator.unquote(expr).replace(/[ ]and.+/, "")); },
			
			eval: function(x) {
				// console.log("ME.expr.eval (" + calculator.mode.operation.eval + "): " + x);
				var res = calculator.eval(calculator.unquote(x));
				return (typeof res == "string" && calculator.isALikelyExpression(res) && !calculator.isAComplexNumber(res) && !calculator.isAName(res) ? calculator.quote(res) : res);
			},
			toNumber: function(x) {
				var saved_evalMode = calculator.mode.operation.eval;
				calculator.mode.operation.eval = "numeric";
				try {
					var res = this.eval(x);
				}
				catch(e) { throw e; }
				finally {
					calculator.mode.operation.eval = saved_evalMode;
				}
				return res;
			},
			"symbolic": function(op_name, args) {
				// console.log("symbolic: " + JSON.stringify(arguments));
				var funcName = calculator.function_aliases[op_name] || op_name; // the unaliased function name
				if (op_name == "!") op_name = "factorial";
				if (calculator.mode.operation.eval == "halfsym")
					if (op_name == "^") funcName = "^"; // keep ^ infix notation
				// console.log("symbolic: " + op_name + " (" + funcName + "); args: " + JSON.stringify(args));
				if (funcName in calculator.infixOperators) {
					if (args.length != 2)
						throw Error("incorrect count of arguments on stack");
					var op1 = calculator.unquote(String(args[0]));
					if (op1.length > 1)
						op1 = calculator.parenthesize(op1);
					var op2 = calculator.unquote(String(args[1]));
					if (op2.length > 1)
						op2 = calculator.parenthesize(op2);
					retval = calculator.quote( op1 + (op_name.length>2 ? " " : "") + op_name + (op_name.length>2 ? " " : "") + op2 );
				}
				else {
					retval = funcName + "("; // use funcName instead of op_name to not produce things like '^(x, 3)' or 'SIN(x)'
					var n_args = args.length;
					if (n_args) {
						for (var i=0; i<n_args-1; i++)
							retval += calculator.unquote(String(args[i])) + ", ";
						retval += calculator.unquote(String(args[n_args-1])); // last arg added without comma
					}
					retval += ")";
					retval = calculator.quote(retval);
				}
				return retval;
			},
            "memo": function(name) {
                function memoize(func) { // http://www.sitepoint.com/implementing-memoization-in-javascript/
                    var memo = {};
                    var slice = Array.prototype.slice;

                    return function() {
                        var args = slice.call(arguments);
                        if (args in memo)
                            return memo[args];
                        else
                            return (memo[args] = func.apply(this, args));
                    }
                }
                
                return memoize(this.functionWithName(name));
            },
			"functionWithName": function(name) {
				name = calculator.unquote(name);

                // map name, if alias
                if (name in calculator.function_aliases)
                    name = calculator.function_aliases[name];

                var nameComponents = name.split(".");
                var f = ME;
                for (var i=0; i<nameComponents.length && f != undefined; i++)
                    f = f[nameComponents[i]];

                if (f == undefined) {
                    if (name in this.functions[this.currentDataCategory])
                        f = this.functions[this.currentDataCategory][name];
                    else {
                        // in custom type function collection?
                        for (var type in calculator.customTypes) {
                            if (name in calculator.customTypes[type]) {
                                f = calculator.customTypes[type][name];
                                break;
                            }
                        }
                    }
                }

				return f;
			},
			"functionForNaturalMath": function(x) {
				x = calculator.unquote(x);
				if (x.indexOf("=") == -1) throw Error("required '=' missing in natural math definition");
				var args = x.match(/\(([^=]*)\)/); if (!args) throw Error("missing closing parenthesis in natural math definition");
				var body = x.match(/\=(.+$)/); if (!body) throw Error("malformed natural math definition");
				var expr = calculator.evaluableExpressionForExpression(body[1]);
				return calculator.functionForEvaluableExpression(expr, args[1]);
			}
		},

		binary: {
			"eval": function(x) { return this.toDec(x); },
			"toNumber": function(x) { return this.eval(x); },
			"decimalToHex": function(d) { return d.toString(16); },
			"hexToDecimal": function(h) { return parseInt(h, 16); },
			"decimalToOct": function(d) { return d.toString(8); },
			"octToDecimal": function(o) { return parseInt(o, 8); },
			"decimalToBinary": function(d) { return d.toString(2); },
			"binaryToDecimal": function(b) { return parseInt(b, 2); },
			"toDec": function(x) { if (typeof x == "string") { if (x[0] == '0' && x[1] == 'x') return this.hexToDecimal(x); else if (x[x.length-1] == 'o') return this.octToDecimal(x); else if (x[x.length-1] == 'b') return this.binaryToDecimal(x); } return this.toBinary(x); },
			"toHex": function(x) { if (typeof x == "string") { if (x[x.length-1] == 'o') return "0x" + this.decimalToHex(this.octToDecimal(x)); else if (x[x.length-1] == 'b') return "0x" + this.decimalToHex(this.binaryToDecimal(x)); } return "0x" + this.decimalToHex(this.toBinary(x)); },
			"toOct": function(x) { if (typeof x == "string") { if (x[0] == '0' && x[1] == 'x') return this.decimalToOct(this.hexToDecimal(x)) + "o"; else if (x[x.length-1] == 'o') return x; else if (x[x.length-1] == 'b') return this.decimalToOct(this.binaryToDecimal(x)) + "o"; } return this.decimalToOct(this.toBinary(x)) + "o"; },
			"toBin": function(x) { if (typeof x == "string") { if (x[0] == '0' && x[1] == 'x') return this.decimalToBinary(this.hexToDecimal(x)) + "b"; else if (x[x.length-1] == 'o') return this.decimalToBinary(this.octToDecimal(x)) + "b"; else if (x[x.length-1] == 'b') return x; } return this.decimalToBinary(this.toBinary(x)) + "b"; },
			"toBinary": function(x) { return Math.floor(eval(x)); },
			"fromBinary": function(x) { return this["toDec"](x); },
			"baseOf": function(x) { if (typeof x == "number") return 10; if (typeof x == "string") { if (calculator.isAHexNumberString(x)) return 16; if (calculator.isAnOctNumberString(x)) return 8; if (calculator.isATrueBinaryNumberString(x)) return 2; if (calculator.isADecimalNumber(x)) return 10; } return 0; },
			"decoratedValForBase": function(val, base) { return (base == 16 ? "0x" + val : (base == 8 ? val + "o" : (base == 2 ? val + "b" : Number(val)))); },
			"store_ws": function(x) { if (x == 0 || x > 32) throw Error("unsupported arg"); calculator.mode.binary.wordSize = x; calculator.mode.binary.validMask = (x == 32 ? 0xffffffff : (1<<x)-1); },
			"recall_ws": function() { return calculator.mode.binary.wordSize; },
			"+": function(x, y) { var base = this.baseOf(x); var val = Number(Math.floor(this.toDec(x) + this.toDec(y))).toString(base); return this.decoratedValForBase(val, base); },
			"-": function(x, y) { var base = this.baseOf(x); var val = Number(Math.floor(this.toDec(x) - this.toDec(y))).toString(base); return this.decoratedValForBase(val, base); },
			"*": function(x, y) { var base = this.baseOf(x); var val = Number(Math.floor(this.toDec(x) * this.toDec(y))).toString(base); return this.decoratedValForBase(val, base); },
			"squared": function(x) { return this["*"](x, x); },
			"/": function(x, y) { var base = this.baseOf(x); var val = Number(Math.floor(this.toDec(x) / this.toDec(y))).toString(base); return this.decoratedValForBase(val, base); },
			"isEven": function(x) { return ME.isEven(this.toDec(x)); },
			"isInt": function(x) { return true; },
			// todo: "isSquare": function(x) { return this.isInt(Math.sqrt(x)); },
			"isPowerOf2": function(x) { return !this.toDec(this.and(x, this.decr(x))); },
			"incr": function(x) { return this["+"](x, 1); },
			"decr": function(x) { return this["-"](x, 1); },
			"INCR": function(x) { var r = this.incr(x); calculator.stack.push(r); return r; },
			"DECR": function(x) { var r = this.decr(x); calculator.stack.push(r); return r; },
			"==": function(x, y) { return this.toDec(x) == this.toDec(y); },
			"!=": function(x, y) { return !this["=="](x, y); },
			"and": function(x, y) { var base = this.baseOf(x); var val = Number(this.toDec(x) & this.toDec(y)).toString(base); return this.decoratedValForBase(val, base); },
			"or": function(x, y) { var base = this.baseOf(x); var val = Number(this.toDec(x) | this.toDec(y)).toString(base); return this.decoratedValForBase(val, base); },
			"xor": function(x, y) { var base = this.baseOf(x); var val = Number(this.toDec(x) ^ this.toDec(y)).toString(base); return this.decoratedValForBase(val, base); },
			"not": function(x) { if (typeof x == "boolean" || calculator.isADecimalNumber(x)) return !x; /*if (x == 0) return 1; if (x == 1) return 0;*/ if (this.recall_ws() == 32) throw Error("unimplemented for binary word size of 32 bits; use smaller word"); var base = this.baseOf(x); var val = Number((~this.toDec(x)) & calculator.mode.binary.validMask).toString(base); return this.decoratedValForBase(val, base); },
			"bitnot": function(x) { return ~x; },
			"shift_left": function(x) { var base = this.baseOf(x); var val = Number((this.toDec(x) << 1) & calculator.mode.binary.validMask).toString(base); return this.decoratedValForBase(val, base); },
			"arithmetic_shift_right": function(x) { var base = this.baseOf(x); var val = Number((this.toDec(x) >> 1) & calculator.mode.binary.validMask).toString(base); return this.decoratedValForBase(val, base); },
			"shift_right": function(x) { var base = this.baseOf(x); var val = Number((this.toDec(x) >> 1) & calculator.mode.binary.validMask).toString(base); return this.decoratedValForBase(val, base); },
			"shift_left_byte": function(x) { var base = this.baseOf(x); var val = Number((this.toDec(x) << 8) & calculator.mode.binary.validMask).toString(base); return this.decoratedValForBase(val, base); },
			"shift_right_byte": function(x) { var base = this.baseOf(x); var val = Number((this.toDec(x) >> 8) & calculator.mode.binary.validMask).toString(base); return this.decoratedValForBase(val, base); },
			"rotate_left": function(x) { var base = this.baseOf(x); var val = this.toBin(x).replace("b", ""); if (val.length == calculator.mode.binary.wordSize) { val = val.slice(1) + val[0]; } else val += "0"; val += "b"; val = Number(this.toDec(val)).toString(base); return this.decoratedValForBase(val, base); },
			"rotate_right": function(x) { var base = this.baseOf(x); var val = this.toBin(x).replace("b", ""); var len = val.length; if (val[len-1] == "1") { var fillZeroes = ""; for (var i=0; i<(calculator.mode.binary.wordSize-val.length); i++) fillZeroes += "0"; val = "1" + fillZeroes + val.slice(0, -1); } else val = val.slice(0, -1); val += "b"; val = Number(this.toDec(val)).toString(base); return this.decoratedValForBase(val, base); },
			"rotate_left_byte": function(x) { for (var i=0; i<8; i++) x = this.rotate_left(x); return x; },
			"rotate_right_byte": function(x) { for (var i=0; i<8; i++) x = this.rotate_right(x); return x; },
		},

		complex: {
			"fromReal": function(r, i) { return "(" + r + "," + i + ")"; }, 
			"toReal": function(c) { var arr = calculator.complexParts(c); calculator.pushArraySilently(arr); },
			"eval": function(c) { var v = calculator.complexParts(c); return this.fromReal(calculator.functions["@eval"](v[0]), calculator.functions["@eval"](v[1])); },
			"toNumber": function(c) { var v = calculator.complexParts(c); return this.fromReal(calculator.functions["@toNumber"](v[0]), calculator.functions["@toNumber"](v[1])); },
			"realPart": function(c) { return calculator.complexParts(c)[0]; },
			"imaginaryPart": function(c) { return calculator.complexParts(c)[1]; }, 
			"conjugate": function(c) { var arr = calculator.complexParts(c); return this.fromReal(arr[0], Number(arr[1]) * (-1)); },
			"unitize": function(c) { var v = calculator.complexParts(c); var s = 1.0 / Math.sqrt(v[0] * v[0] + v[1] * v[1]); return this.fromReal(v[0] * s, v[1] * s); },
			"+": function(c1, c2) { var x = calculator.complexParts(c1); var y = calculator.complexParts(c2); return this.fromReal(x[0] + y[0], x[1] + y[1]); },
			"-": function(c1, c2) { var x = calculator.complexParts(c1); var y = calculator.complexParts(c2); return this.fromReal(x[0] - y[0], x[1] - y[1]); },
			"*": function(c1, c2) { var x = calculator.complexParts(c1); var y = calculator.complexParts(c2); return this.fromReal(x[0] * y[0] - x[1]*y[1], x[0]*y[1] + x[1]*y[0]); },
			"squared": function(c) { return this["*"](c, c); },
			"/": function(c1, c2) { var x = calculator.complexParts(c1); var y = calculator.complexParts(c2); var s = 1 / (y[0] * y[0] + y[1] * y[1]); return this.fromReal((x[0]*y[0] + x[1]*y[1]) * s, (-x[0]*y[1]+x[1]*y[0]) * s); },
			"inv": function(c) { return this["/"]("1", c); },
			"==": function(c1, c2) { var x = calculator.complexParts(c1); var y = calculator.complexParts(c2); return (x[0] == y[0] && x[1] == y[1]); },
			"=": function(x, y) { return x + '=' + y; },
			// was: "=": function(c1, c2) { return this["=="](c1, c2); },
			"!=": function(c1, c2) { return !this["=="](c1, c2); },
			"neg": function(c) { var v = calculator.complexParts(c); return this.fromReal(v[0] * (-1), v[1] * (-1)); },
			"abs": function(c) { var v = calculator.complexParts(c); return Math.sqrt(v[0] * v[0] + v[1] * v[1]); },
			"round": function(c, nDigits) { var v = calculator.complexParts(c); return this.fromReal(calculator.functions.round(v[0], nDigits), calculator.functions.round(v[1], nDigits)); },
			"trunc": function(c, nDigits) { var v = calculator.complexParts(c); return this.fromReal(calculator.functions.round(v[0], nDigits), calculator.functions.trunc(v[1], nDigits)); },
			"sign": function(c) { return this.unitize(c); },
			"arg": function(c) { var v = calculator.complexParts(c); return calculator.functions.atan2(v[1], v[0]); },
			"exp": function(c) { var v = calculator.complexParts(c); var s = Math.exp(v[0]); var inDegMode = !calculator.mode.angle.inRadians;
				if (inDegMode) calculator.setToRadians(true); // make sure we're in Radians
				v[0] = calculator.functions.cos(v[1]);
				v[1] = calculator.functions.sin(v[1]);
				if (inDegMode) calculator.setToRadians(false); // reset
				return this.fromReal(v[0] * s, v[1] * s);
			},
			"ln": function(c) { var polar = calculator.complexParts(this.rectToPolar(c)); return this.fromReal(Math.log(polar[0]), polar[1]); },
			"log": function(c) { return this["*"](this.ln(c), Math.LOG10E); },
			"log2": function(c) { return this["*"](this.ln(c), Math.LOG2E); },
			"alog": function(c) { return this.pow(10, c); },
			"pow": function(c1, c2) { var v = calculator.complexParts(c1); if (v[0] == 0.0 && v[1] == 0.0) return this.fromReal(0,0); return this.exp(this["*"](c2, this.ln(c1))); },
			/// todo: delete "^": function(x, y) { calculator.analytics.usesCaret = true; return this.pow(x, y); },
			"sqrt": function(c) { return this.pow(c, 0.5); },
			"sin": function(c) { return this["/"](this["-"](this.exp(this["*"]("(0,1)", c)), this.exp(this["*"]("(0,-1)", c))), "(0,2)"); },
			"cos": function(c) { return this["/"](this["+"](this.exp(this["*"]("(0,1)", c)), this.exp(this["*"]("(0,-1)", c))), "2"); },
			"tan": function(c) { return this["/"](this["sin"](c), this["cos"](c)); },
			"asin": function(c) { return this["*"]("(0,-1)", this["ln"](this["+"](this["*"]("(0,1)", c), this.sqrt(this["-"]("(1,0)", this["squared"](c)))))); },
			"acos": function(c) { return this["-"](this.fromReal(Math.PI/2, 0), this.asin(c)); },
			"atan": function(c) { c = this["*"]("(0, 1)", c); return this["*"]("(0, 0.5)", this["-"](this["ln"](this["-"]("(1, 0)", c)), this["ln"](this["+"]("(1, 0)", c)))); },
			"sinh": function(c) { return this["/"](this["-"](this.exp(c), this.exp(this["neg"](c))), "2"); },
			"cosh": function(c) { return this["/"](this["+"](this.exp(c), this.exp(this["neg"](c))), "2"); },
			"tanh": function(c) { return this["/"](this["sinh"](c), this["cosh"](c)); },
			"coth": function(c) { return this["/"](this["cosh"](c), this["sinh"](c)); },
			"asinh": function(c) { return this["ln"](this["+"](c, this.sqrt(this["+"](this["squared"](c),"(1,0)")))); },
			"acosh": function(c) { return this["ln"](this["+"](c, this["*"](this.sqrt(this["-"](c,"(1,0)")),this.sqrt(this["+"](c,"(1,0)"))))); }, // todo: (-1,0) should yield (0, pi)
			"atanh": function(c) { return this["/"](this["ln"](this["/"](this["+"]("(1,0)",c),this["-"]("(1,0)",c))),"(2,0)"); },
			"sinc":	function(c) { return (c != "(0,0)" ? this["/"](this.sin(c), c) : "(1,0)"); },
			"rectToPolar": function(c) { return this.fromReal(this.abs(c), this.arg(c)); },
			"polarToRect": function(c) { var v = calculator.complexParts(c); return this.fromReal(v[0] * calculator.functions.cos(v[1]), v[0] * calculator.functions.sin(v[1])); },
		},

		vector: {
			type: "vector",
			isLoaded: true,
			fromString: function(x) { /* was if (typeof x !== "object") x = eval(x);*/
				if (calculator.typeOf(x) == "vector") return this.map(x, "fromString"); // disambiguate call: if input is a vector, forward to mapping
				var beginChar = x[0];
				var endChar = (beginChar == '[' ? ']' : '}');
				var arr = calculator.RPLProgram.tokenizeWithDelimiters(beginChar, endChar, x);

				// look for literals, and eval into respective objects (code works recursively for arrays)
				for (var i=0; i<arr.length; i++) {
					var token = arr[i];

					// a custom type literal?
					var isACustomLiteral = false;
					for (var type in calculator.customTypes) {
						if ("isStringRepresentation" in calculator.customTypes[type] && calculator.customTypes[type].isStringRepresentation(token)) {
							arr[i] = calculator.customTypes[type].fromString(token);
							isACustomLiteral = true;
							break;
						}
					}
					if (!isACustomLiteral) {
						// a built-in type literal?
						if (calculator.isADecimalNumber(token))
							arr[i] = parseFloat(token);
						else if (calculator.isABinaryNumber(token))
							arr[i] = calculator.functions.binary.toDec(token);
					}
					
					// default: keep the string as is
				}

				return arr;
			},
			toString: function(arr) { return JSON.stringify(arr).replace(/\,(?![^,]+\))/g, " ").replace(/.\"+/g, function(s) { return (s[0] == '\\' ? s[1] : s[0]); }); }, // this comment to fix syntax coloring and indentation: ")}
			isStringRepresentation: function(str) { return ((str[0] == "[" && str.indexOf(";") == -1/* && str.match(/\u005d.\u005b/) == null*/) || (str[0] == "{" && str.indexOf(':') == -1 && str.match(/\}.\{/) == null)); }, // test for ";" to exclude type CF // todo: consider: used to also check for !calculator.isAMatrix(str)) which no longer works with strings; overall it works because matrix's fromString calls vector's fromString
			toNumber: function(x) { var v = []; for (var i=0; i<x.length; i++) v[i] = calculator.functions["@toNumber"](x[i]); return v; },
			eval: function(x) {	// emulate EVAL on LISTS (note: not evaluating expressions is compliant behavior)
				var saved_wantsStackDisplay = calculator.mode.operation.wantsStackDisplay; calculator.mode.operation.wantsStackDisplay = false;
				var saved_wantsUndo = calculator.wantsUndo; calculator.wantsUndo = false;
				var saved_isLogging = calculator.analytics.isLogging; calculator.analytics.isLogging = false;
				try {
					for (var i=0; i<x.length; i++) {
						var item = x[i];
						if (calculator.isAnRPLProgram(item))
							calculator.RPLProgram.eval(item);
						else
							calculator.push(item);
					}
				}
				catch(e) { throw e; }
				finally {
					calculator.mode.operation.wantsStackDisplay = saved_wantsStackDisplay;
					calculator.wantsUndo = saved_wantsUndo;
					calculator.analytics.isLogging = saved_isLogging;
				}
			},
			hasUnknowns: function(x) { for (var i=0; i<x.length; i++) if (calculator.typeOf(x[i]) == "unknown") return true; return false; },
			peval: function(v, x) {
				var expr = "'";
				var lastIndex = v.length-1;
				for (var i=0; i<=lastIndex; i++) {
					var expo = (lastIndex-i);
					var coef = v[i];
					var coefIsComposed = false;
					if (calculator.typeOf(coef) == "expression or name") { coef = calculator.unquote(coef); if (calculator.isABinaryNumber(coef)) coef = calculator.functions.binary.toDec(coef); else if (coef.length > 1) coefIsComposed = true; }
					else if (calculator.typeOf(coef) != "number") throw Error("wrong type of argument");
					
					if (!coef) continue;
					if (i && (coefIsComposed || coef > 0)) expr += "+";
					if (coef == -1 && i != lastIndex) expr += "-";
					else if (coefIsComposed || coef != 1 || i == lastIndex) { expr += (coefIsComposed ? "(" + coef + ")" : coef); if (i < lastIndex) expr += "*"; }

					if (i != lastIndex)
						expr += (expo == 1 ? "x" : "x^" + expo);
				}
				expr += "'";
				if (calculator.typeOf(x) == "expression or name")
					return calculator.mapStringsInString(expr, { "x": calculator.unquote(x) });
				else {
					calculator.vars.local.x = x;
					var result = calculator.eval(calculator.unquote(expr));
					calculator.vars.local = {};
					return result;
				}
			},
///			onload: function() { Array.prototype.type = "vector"; }, // if this is enabled, CanvasGraph plotting yields "can not compare to NaN errors"; if this can be fixed, special case code for vector can be removed from stringValueForItem()
																		 
			"add": function(x, y) {
				if ((calculator.isAVector(x)/* && !calculator.isAMatrix(x)*/) && (calculator.isAVector(y)/* && !calculator.isAMatrix(y)*/)) return this["+"](x, y); // vector + vector
				var z = [];
				var v, s; if (calculator.isAVector(x)) { v = x; s = y; } else { v = y; s = x; }
				var scalarIsReal = (typeof s == "number");
				for (var i=0; i<v.length; i++)
					if (scalarIsReal && typeof v[i] == "number") z[i] = v[i] + s; else z[i] = calculator.calc(v[i], s, "+");
				return z; },
			"append": function(x, y) { var z = [];
				if (calculator.isAVector(x)) { z = x.clone(); z.push(y); /* append y */	}
				else if (calculator.isAFirmString(x)) { return ME.string.append(x, JSON.stringify(y)); }
				else { z = y.clone(); z.unshift(x); /* insert y at position 1 */ }
				return z;
			},
			"augment": function(x, y) { if (calculator.isAMatrix(x) || !calculator.isAVector(x) || !calculator.isAVector(y)) return this.append(x, y); // past this, x and y are known to be vectors
				if (x.length != y.length) throw Error("bad arg");
				var m = []; m[0] = x.clone(); m[1] = y.clone(); return m; },
			"zip": function(x, y) { if (!(calculator.isAVector(x) && calculator.isAVector(y))) throw Error("wrong type of argument");
				if (x.length != y.length) throw Error("bad arg");
				var z = []; for (var i=0; i<x.length; i++) { z.push(x[i]); z.push(y[i]); } return z; },
			"unzip": function(z) {
				var x = [], y = []; for (var i=0; i<z.length;) { x.push(z[i++]); y.push(z[i++]); } calculator.stack.push(x); calculator.stack.push(y); },
			"fromDiagonal": function(x, size) { if (!(calculator.isAVector(x) && calculator.isAVector(size))) throw Error("wrong type of argument");
				var m = []; for (var i=0; i<size[0]; i++) { var row = m[i] = []; for (var j=0; j<size[1]; j++) row[j] = (i != j ? 0 : x[j]); } return m; },
			"+": function(x, y) {
				if (calculator.isAVector(x) && calculator.isAVector(y) && x.length == y.length) { // vector + vector; // todo: think over the implied skipping to vector + any in case dims don't match
					var z = [];
					if (x.length != y.length) throw Error("incompatible dimensions");
					for (var i=0; i<x.length; i++)
						if (typeof x[i] === "number" && typeof y[i] === "number") z[i] = x[i] + y[i]; else z[i] = calculator.calc(x[i], y[i], "+");
					return z;
				}
				else return this.append(x, y); // vector + any or any + vector
			},
			"right": function(v) { return v.map(function(x) { return (calculator.isAName(x) ? ME.expr.right(x) : x); }); },
			"push": function(x, y) { if (!calculator.isAVector(x)) throw Error("wrong type of argument");
				var z = x.clone(); z.push(y);
				return z; },
			"concat": function(x, y) { if (!(calculator.isAVector(x)/* && calculator.isAVector(y)*/)) throw Error("wrong type of argument");
				return x.concat(y); },
			"compare": function(x, y) { if (!(calculator.isAVector(x) && calculator.isAVector(y))) throw Error("wrong type of argument");
				var z = [], len = Math.max(x.length, y.length);
				for (var i=0; i<len; i++)
					if (typeof x[i] === "number" && y[i] === "number") { if (x[i] != y[i]) z.push(i+1); } else if (calculator.calc(x[i], y[i], "!=")) z.push(i+1);
				return z; },
			"complement": function(x, y) { if (!(calculator.isAVector(x) && calculator.isAVector(y))) throw Error("wrong type of argument");
				return x.filter(function(x) { return y.indexOf(x) == -1; }); },
			"intersect": function(x, y) { if (!(calculator.isAVector(x) && calculator.isAVector(y))) throw Error("wrong type of argument");
				return x.filter(function(x) { return y.indexOf(x) != -1; }); },
			"-": function(x, y) {
				var z = [];
				if (calculator.isAVector(x) && calculator.isAVector(y)) { // vector - vector
					if (x.length != y.length) throw Error("incompatible dimensions");
					for (var i=0; i<x.length; i++)
						if (typeof x[i] == "number" && typeof y[i] == "number") z[i] = x[i] - y[i]; else z[i] = calculator.calc(x[i], y[i], "-");
				}
				else { // vector - any
					var v, s; if (calculator.isAVector(x)) { v = x; s = y; } else { v = y; s = x; }
					var scalarIsReal = (typeof s == "number");
					if (v == x) {
						for (var i=0; i<v.length; i++)
							if (scalarIsReal && typeof v[i] == "number") z[i] = v[i] - s; else z[i] = calculator.calc(v[i], s, "-");
					}
					else
						for (var i=0; i<v.length; i++)
							if (scalarIsReal && typeof v[i] == "number") z[i] = s - v[i]; else z[i] = calculator.calc(s, v[i], "-");
				}
				return z; },
			"vmin": function(x) { var result = x[0];
				for (var i=1; i<x.length; i++)
					if (typeof x[i] === "number") result = Math.min(x[i], result); else result = calculator.calc(x[i], result, "min");
				return result; },
			"vmax": function(x) { var result = x[0];
				for (var i=1; i<x.length; i++)
					if (typeof x[i] === "number") result = Math.max(x[i], result); else result = calculator.calc(x[i], result, "max");
				return result; },
			"vgcd": function(x) { var result = x[0];
				for (var i=1; i<x.length; i++)
					if (typeof x[i] === "number") result = ME.gcd(x[i], result); else result = calculator.calc(x[i], result, "gcd");
				return result; },
			"vlcm": function(x) { var result = x[0];
				for (var i=1; i<x.length; i++)
					if (typeof x[i] === "number") result = ME.lcm(x[i], result); else result = calculator.calc(x[i], result, "lcm");
				return result; },
			"rem": function(x, m) { if (typeof m != "number") throw Error("wrong type of argument");
				var z = [];
				for (var i=0; i<x.length; i++)
					if (typeof x[i] === "number") z[i] = ME.rem(x[i], m); else z[i] = calculator.calc(x[i], m, "rem");
				return z; },
			"mod": function(x, m) { if (typeof m != "number") throw Error("wrong type of argument");
				var z = [];
				for (var i=0; i<x.length; i++)
					if (typeof x[i] === "number") z[i] = ME.mod(x[i], m); else z[i] = calculator.calc(x[i], m, "mod");
				return z; },
			"*": function(x, y) {
				var z = [];
				if (calculator.isAVector(x) && calculator.isAVector(y)) { // vector * vector
					if (x.length != y.length) throw Error("incompatible dimensions");
					for (var i=0; i<x.length; i++)
						if (typeof x[i] === "number" && typeof y[i] === "number") z[i] = x[i] * y[i]; else z[i] = calculator.calc(x[i], y[i], "*");
				}
				else {
					var v, s; if (calculator.isAVector(x)) { v = x; s = y; } else { v = y; s = x; }
					var scalarIsReal = (typeof s == "number");
					for (var i=0; i<v.length; i++)
						if (scalarIsReal && typeof v[i] == "number") z[i] = v[i] * s; else z[i] = calculator.calc(v[i], s, "*");
				}
				return z; },
			"/": function(x, y) {
				var z = [];
				if (calculator.isAVector(x) && calculator.isAVector(y)) { // vector / vector
					if (x.length != y.length) throw Error("incompatible dimensions");
					for (var i=0; i<x.length; i++)
						if (typeof x[i] === "number" && typeof y[i] === "number") z[i] = x[i] / y[i]; else z[i] = calculator.calc(x[i], y[i], "/");
				}
				else {
					var v, s; if (calculator.isAVector(x)) { v = x; s = y; } else { v = y; s = x; }
					var scalarIsReal = (typeof s == "number");
					if (s == y)
						for (var i=0; i<v.length; i++)
							if (scalarIsReal && typeof v[i] == "number") z[i] = v[i] / s; else z[i] = calculator.calc(v[i], s, "/");
					else
						for (var i=0; i<v.length; i++)
							if (scalarIsReal && typeof v[i] == "number") z[i] = s / v[i]; else z[i] = calculator.calc(s, v[i], "/");
				}
				return z; },
			"pow": function(v, s) { if (!(calculator.isAVector(v) && (typeof s === 'number' || calculator.isAComplexNumber(s)))) throw Error("unsupported arg type");
				if (Number(s)) s = Number(s);
				var z = [];
				for (var i=0; i<v.length; i++)
					if (typeof v[i] == "number" && typeof s == "number") z[i] = Math.pow(v[i], s); else z[i] = calculator.calc(v[i], s, "pow");
				return z; },
			"match": function(x, regexp) { if (!(calculator.isAVector(x) && typeof regexp == "string")) throw Error("wrong type of argument");
				var regexp = new RegExp(ME.string.stripFirmDelimiters(regexp));
				var z = [];
				for (var i=0; i<x.length; i++) {
					var isNumber = (typeof x[i] == "number");
					var s = String(x[i]);
					var isFirmString = (s[0] == '"'); if (isFirmString) s = ME.string.stripFirmDelimiters(s);
					var result = s.match(regexp);
					if (result) {
						if (isNumber) z.push(result.length == 1 ? +result[0] : result.map(function(x) { return +x; }));
						else if (isFirmString) z.push(result.length == 1 ? '"' + result[0] + '"' : result.map(function(x) { return '"' + x + '"'; }));
						else z.push(result.length == 1 ? result[0] : result);
					}
				}
				return z;
			},
			"==": function(x, y) {
				if (!"length" in x || !"length" in y || x.length != y.length) return false;
				for (var i=0; i<x.length; i++)
					if (typeof x[i] == "number" && typeof y[i] == "number") { if (x[i] != y[i]) return false; }
					else if (!calculator.calc(x[i], y[i], "==")) return false;
				return true; },
			"!=": function(x, y) { return !this["=="](x, y); },
			"fromElements": function(n) { var dim = eval(n); if (dim.length == 1) n = dim[0]; else if (dim.length > 1) return calculator.functions.fromElements(n); if (n > calculator.stack.length) throw Error("too few elements on stack"); var v = []; for (var i=0; i<n; i++) v.unshift(calculator.stack.pop()); return v; },
			"toElements": function(v) { for (var i=0; i<v.length; i++) calculator.stack.push(v[i]); return v.length; },
			"setAt": function(x, pos, val) { var v = x.clone(); pos = Number(pos)-1; if (pos < 0 || pos >= v.length) throw Error("bad index"); v[pos] = val; return v; },
			"PUTI": function(v, pos, val) { if (pos <= 0 || pos > v.length) throw Error("bad index"); calculator.stack.push(this.setAt(v, pos, val)); return (pos % v.length)+1; },
			"at": function(v, pos) { pos = Number(pos)-1; if (pos < 0 || pos >= v.length) throw Error("bad index"); return v[pos]; },
			"GETI": function(v, pos) { if (pos <= 0 || pos > v.length) throw Error("bad index"); calculator.stack.push(v); calculator.stack.push((pos % v.length)+1); return this.at(v, pos); },
			"head": function(v) { return v[0]; },
			"tail": function(v) { return v.slice(1); },
			"last": function(v) { return v[v.length-1]; },
			"size": function(x) { return x.length; },
			"resize": function(x, n) { if (!(typeof n === 'number' && calculator.isAVector(x))) throw Error("bad arg"); var v = x.clone(); for (var i=v.length; i<n; i++) v[i] = 0; v.length = n; return v; },
			"setToConstant": function(x, cons) { if (!calculator.isAVector(x)) throw Error("bad arg");
				var v = [];
				if (x.length == 2) { // two numbers -> create matrix
					var n = x[0], m = x[1];
					for (var i=0; i<n; i++) { v[i] = []; for (var j=0; j<m; j++) v[i][j] = cons; }
				}
				else {
					var n = (x.length == 1 ? x[0] : x.length);
					for (var i=0; i<n; i++) v[i] = cons;
				}
				return v;
			},
			///"neg": function(x) { return this.map(x, "neg"); },
			"remove": function(x, n) { x = x.slice(0); x.splice(n-1, 1); return x; }, // todo: consider using http://ejohn.org/blog/javascript-array-remove/ instead
			"insert": function(x, n, y) { x = x.slice(0); x.splice(n-1, 0, y); return x; },
			"slice": function(x, n, y) { if (!(calculator.isAVector(x) && typeof n == "number" && calculator.isAVector(y))) throw Error("wrong type of argument");
				--n; if (n < 0 || n > x.length) throw Error("bad arg");
				for (var i=0; i<y.length; i++) x[n+i] = (typeof y[i] == "object" ? y[i].clone() : y[i]); return x;
			},
			"abs": function(x) { return Math.sqrt(this["dot"](x, x)); },
			"dot": function(x, y) { if (x.length != y.length) throw Error("incompatible dimensions"); var result = 0; for (var i=0; i<x.length; i++) result += x[i]*y[i]; return result; },
			"cross": function(x, y) { if (!(x.length == y.length && (x.length == 2 || x.length == 3))) throw Error("invalid dimensions"); if (x.length == 2) { x = x.clone(); y = y.clone(); x[2] = y[2] = 0; } var n = []; n[0] = (x[1] * y[2]) - (x[2] * y[1]); n[1] = (x[2] * y[0]) - (x[0] * y[2]); n[2] = (x[0] * y[1]) - (x[1] * y[0]); return n; },
			"RNRM": function(x) { var max = calculator.vars.MINR; for (var i=0; i<x.length; i++) max = Math.max(Math.abs(x[i]), max); return max; },
			"CNRM": function(x) { var result = 0; for (var i=0; i<x.length; i++) result += Math.abs(x[i]); return result; },
			"RANM": function(x) { if (!(x.length == 2 && this.isReal(x))) throw Error("bad arg"); var m = []; for (var i=0; i<x[0]; i++) m[i] = new Array(x[1]); return calculator.functions.matrix.RANM(m); },
			"pos": function(v, x) { x = +x; for (var i=0; i<v.length; i++) if (+v[i] == x) return i+1; return 0; }, // todo: use indexOf for real vectors and make work for objects
			"sub": function(v, start, end) { start = Math.max(Number(start)-1, 0); end = Math.min(Number(end)-1, v.length-1); var nv = []; for (var i=start; i<=end; i++) nv[i-start] = v[i]; return nv; },
			"total": function(v) { var sum = v[0], l = v.length; for (var i=1; i<l; i++) if (typeof v[i] == "number") sum += v[i]; else sum = calculator.calc(sum, v[i], "+"); return sum; },
			"rtotal": function(v, off, skip, exp) { if (!(calculator.isAVector(v) && typeof off == "number" && typeof skip == "number" && typeof exp == "number")) throw Error("wrong type of argument"); if (off < 0 || skip < 0) throw Error("bad arg"); var incr = skip+1;
				function power(x) { switch(exp) { case 0: return 1; case 1: return x; case 2: return x*x; case 3: return x*x*x; default: return Math.pow(x,exp); } }
				var sum = power(v[off]), l = v.length; for (var i=off+incr; i<l; i+=incr) sum += power(v[i]); return sum; },
			"powersum": function(v, exp) { return this.rtotal(v, 0, 0, exp); },
			"product": function(v) { var p = v[0], l = v.length; for (var i=1; i<l; i++) if (typeof v[i] == "number") p *= v[i]; else p = calculator.calc(p, v[i], "*"); return p; },
			"rproduct": function(v, off, skip, add) { if (!(calculator.isAVector(v) && typeof off == "number" && typeof skip == "number" && typeof add == "number")) throw Error("wrong type of argument");  if (off < 0 || skip < 0) throw Error("bad arg"); var incr = skip+1;
				var p = (v[off]+add), l = v.length; for (var i=off+incr; i<l; i+=incr) p *= (v[i]+add); return p; },
			"cproduct": function(x, y) { if (!(calculator.isAVector(x) && calculator.isAVector(y))) throw Error("wrong type of argument");
				var z = []; for (var i=0; i<x.length; i++) for (var j=0; j<y.length; j++) z.push(x[i]*y[j]); return z; },
			"fromList": function(x) { return this.toElements(x); },
			"fromVec": function(x) { this.toElements(x); /* don't return return value (size) */ },
			"rotate_left": function(x) { x.push(x.shift()); return x; },
			"rotate_right": function(x) { x.unshift(x.pop()); return x; },
			"combine": function(x, y, ops) { if (typeof y == "number") y = [y]; if (!(calculator.isAVector(x) && calculator.isAVector(y) && calculator.isAVector(ops))) throw Error("wrong type of argument");
				if (ops.length != 1) throw Error("bad arg"); var op = ops[0]; var vecAreReals = (this.isReal(x) && this.isReal(y));
				var z = [];
				for (var i=0; i<x.length; i++) {
					if (vecAreReals && op == "+") for (var j=0; j<y.length; j++) z.push(x[i]+y[j]);
					else if (vecAreReals && op == "*") for (var j=0; j<y.length; j++) z.push(x[i]*y[j]);
					else for (var j=0; j<y.length; j++) z.push(calculator.calc(x[i], y[j], op));
				}
				return z;
			},
			"permutate": function(x) { if (x.length > 9) throw Error("resultTooLarge"); var results = [];
				function perm(begin, end) {
					if (end.length == 1)
						results.push(begin.concat(end));
					else
						for (var i=0; i<end.length; i++) {
							var s = end.slice(0, i).concat(end.slice(i+1));
							arguments.callee(begin.concat(end[i]), s);
							///todo: fix; result not correct; potentially faster as using splice()
							///var s = end.splice(i,1);
							///arguments.callee(begin.concat(s), end.clone());
						}
				}
				perm([], x);
				return results;
			},			
			"isReal": function(x) { var containsOnlyNumbers = true; for (var i=0; i<x.length; i++) if (typeof x[i] !== "number") return false; return true; },
			"isSameType": function(x) { var containsSameType = true; var type = calculator.typeOf(x[0]); for (var i=0; i<x.length; i++) if (calculator.typeOf(x[i]) !== type) return false; return true; },
			"sort": function(x) {
				var sortFunc;
				if (this.isReal(x))
					sortFunc = function(a, b) { return a-b; };
				else if (this.isSameType(x) && (typeof x[0] == "string" || typeof x[0] == "object")) {
					if (typeof x[0] == "object" && "type" in x[0] && x[0].type in calculator.customTypes && "<" in calculator.customTypes[x[0].type] && calculator.customTypes[x[0].type].isLoaded)
						sortFunc = function(a, b) { return (calculator.customTypes[a.type]["<"](a, b) ? -1 : (calculator.customTypes[a.type]["=="](a, b) ? 0 : 1)); };
					// string case leads to undefined sortFunc, which is desired
				}
				else
					throw Error("unsortable array elements");
				return x.clone().sort(sortFunc);
			},
			"shuffle": function(x) { return x.clone().sort(function(a, b) { return 0.5 - Math.random(); }); },
			"reverse": function(x) { return x.clone().reverse(); },
			"repeat": function(x, n) { var size = x.length;
                if (n<0) { x = x.clone().reverse(); n = -n; }
                var v = [];
                for (var k=n; k>=0; k--) for (var i=0; i<size; i++) v.push(x[i]);
                return v;
            },
			"rsort": function(x) { return this.sort(x).reverse(); },
			"uniq": function(arr) {
				var i, len=arr.length, out=[], obj={};
				for (i=0; i<len; i++)
					obj[JSON.stringify(arr[i])] = 0;
				for (i in obj)
					if (i != "clone")
						out.push(JSON.parse(i));
				return out;
			},
			"fft": function(x) { if (!require("dspUtils-09.js", true)) return;
				var len = x.length;
				var Ar = [], Ai = [];
				for (var i=0; i<len; i++) {
					var c = calculator.complexParts(x[i]);
					Ar[i] = c[0];
					Ai[i] = c[1];
				}
				
				fft(+1, len, Ar, Ai);
				// mesh result data
				var result = [];
				for (var i=0; i<len; i++)
					result.push(calculator.functions.complex.fromReal(Ar[i]*len, Ai[i]*len));
				return result;
			},
			"ifft": function(x) { if (!require("dspUtils-09.js", true)) return;
				var len = x.length;
				var fac = 1/len;
				var Ar = [], Ai = [];
				for (var i=0; i<len; i++) {
					var c = calculator.complexParts(x[i]);
					Ar[i] = c[0]*fac;
					Ai[i] = c[1]*fac;
				}
				
				fft(-1, len, Ar, Ai);
				// mesh result data
				var result = [];
				for (var i=0; i<Ar.length; i++)
					result.push(calculator.functions.complex.fromReal(Ar[i], Ai[i]));
				return result;
			},
			"DOLIST": function(vec, n, prg) { if (!(calculator.typeOf(n) == "number")) throw Error("wrong type of argument");
				var prg = calculator.ProgramFragment.fromObj(prg, -1);
				var lists = [ vec ];
				for (var i=1; i<n; i++) {
					var list = calculator.stack.pop();
					if (!(calculator.typeOf(list) == "vector" && list.length == vec.length)) throw Error("bad arg");
					lists[i] = list;
				}
				var savedStackLength = calculator.stack.length;
				var l = vec.length;
				for (var i=0; i<l; i++) {
					for (var args=n-1; args>=0; args--)
						calculator.stack.push(lists[args][i]);
					calculator.stack.push(prg.eval(undefined, true));
				}
				if ((calculator.vars.local["hasResult"] = (calculator.stack.length-savedStackLength > 1))) // transparent extension: set a flag to indicate no result
					return this.fromElements(calculator.stack.length-savedStackLength);
			},
			"DOSUBS": function(vec, n, prg) { if (!(typeof n == "number")) throw Error("wrong type of argument");
				var prg = calculator.ProgramFragment.fromObj(prg, -1);
				var savedStackLength = calculator.stack.length;
				var l = vec.length-n+1;
				for (var i=0; i<l; i++) {
					for (var args=0; args<n; args++)
						calculator.stack.push(vec[i+args]);
					calculator.vars.local["NSUB"] = i+1;
					calculator.vars.local["ENDSUB"] = l;
					calculator.stack.push(prg.eval(undefined, true));
				}
				if ((calculator.vars.local["hasResult"] = (calculator.stack.length-savedStackLength > 1))) // transparent extension: set a flag to indicate no result
					return this.fromElements(calculator.stack.length-savedStackLength);
			},
			"fold": function(vec, prg) { var prg = calculator.ProgramFragment.fromObj(prg, -1);
				if (prg.compiledPrg && !prg.compiledPrg.length) { calculator.stack = calculator.stack.concat(vec); } else
				if (vec.length > 0) {
					calculator.stack.push(vec[0]);
					for (var i=1; i<vec.length; i++)
						calculator.stack.push(prg.eval(vec[i], true));
				}
			},
			"MAP": function(x, prg) { var prgType = calculator.typeOf(prg); if (!(prgType == "RPL program" || prgType == "vector")) throw Error("wrong type of argument");
				var compiledPrg = (prgType == "RPL program" ? calculator.RPLProgram.compile(calculator.RPLProgram.tokenize(prg)) : undefined);
				var savedStackLength = calculator.stack.length;
				var v = [];
				for (var i=0; i<x.length; i++) {
					calculator.stack.push(x[i]);
					if (compiledPrg)
						calculator.RPLProgram.run(compiledPrg);
					else
						this.eval(prg);
					if (calculator.stack.length < savedStackLength+1)
						throw Error("too few arguments on stack");
					if (calculator.stack.length == savedStackLength+1)
						v.push(calculator.stack.pop());
					else {
						if (calculator.vars.shouldConcatenateMapResults)
							for (var k=savedStackLength-1; k<calculator.stack.length; k++)
								v.push(calculator.stack.pop());
						else {
							var res = [];
							for (var k=savedStackLength-1; k<calculator.stack.length; k++)
								res.unshift(calculator.stack.pop());
							v.push(res);
						}
					}
				}
				return v;
			},
			"doUntil": function(x, prg, cond) {
				var wantsHashAll = (prg instanceof Array && prg[0] == "hash");
				if (wantsHashAll) { prg = prg.slice(1); } // remove hint from prg
				var wantsRecursionDetect = (cond instanceof Array && cond[0] == "recurse");
				if (wantsRecursionDetect) { cond = cond.clone(); cond[0] = "isFalse"; } // replace "recurse" with "isFalse", so loop goes on until recursion occurs
				var condIsFalse = (cond instanceof Array && cond.length == 1 && cond[0] == "isFalse");
				var condIsTrue = (cond instanceof Array && cond.length == 0);
				var prg = calculator.ProgramFragment.fromObj(prg), cond = calculator.ProgramFragment.fromObj(cond);
				var v = [], counts = [];
				var maxIterationCount = 1000;
				var hashes = {}, iterCounts = {};
				for (var i=0; i<x.length; i++) {
					var xx = x[i], cc, iterationCount = 0, hitHash = false;
					vars.NSUB = i+1;
					var vals = {}; // values encountered; used when hashing all or detecting recursion
					do {
						if (wantsRecursionDetect) {
							if (xx in vals)
								break;
						}
						else if (xx in hashes) {
							iterationCount += iterCounts[xx];
							xx = hashes[xx];
							hitHash = true;
							break;
						}
						++iterationCount;
						if (wantsHashAll || wantsRecursionDetect)
							vals[xx] = iterationCount;
						vars.iter = iterationCount; //// todo: decide if "current value" is desirable; can as well assign a local in prg
						// alert("doUntil item: " + xx);
						xx = prg.eval(xx);
						// alert("doUntil condition: " + xx);
						cc = (condIsTrue ? xx : (condIsFalse ? !xx : cond.eval(xx)));
					}
					while(!cc && iterationCount < maxIterationCount);
					if (!hitHash) {
						hashes[x[i]] = xx;
						iterCounts[x[i]] = iterationCount;
						if (wantsHashAll) {
							for (var val in vals) {
								hashes[val] = xx;
								iterCounts[val] = iterationCount-vals[val]+1; // debug: set to zero to see actual iterations performed
							}
						}
					}
					v.push(xx); counts.push(iterationCount);
				}
				delete vars.iter; delete vars.NSUB;
				calculator.stack.push(v); return counts;
			},
			"find": function(vec, prg) { var prg = calculator.ProgramFragment.fromObj(prg);
				var l = vec.length;
				var start = (calculator.vars.local["offset"] > 0 ? calculator.vars.local["offset"] : 0);
				for (var i=start; i<l; i++) {
					calculator.vars.local["N"] = i+1;
					if (prg.eval(vec[i]) != 0) { // found first element that yields nonzero result
						calculator.vars.local["hasResult"] = true;
						return vec[i];
					}
				}
				calculator.vars.local["hasResult"] = false;
			},
			"count": function(vec, prg) { var prg = calculator.ProgramFragment.fromObj(prg);
                var sum = 0;
				var l = vec.length;
				var start = (calculator.vars.local["offset"] > 0 ? calculator.vars.local["offset"] : 0);
				for (var i=start; i<l; i++) {
					if (prg.eval(vec[i]) != 0) { // found first element that yields nonzero result
						++sum;
					}
				}
				return sum;
			},
			"squareFree": function(vec) { return this.filter(vec, ["isSquareFree"]); },
			"filter": function(vec, prg) { var prg = calculator.ProgramFragment.fromObj(prg);
				var v = [];
				if (prg.func)
					v = vec.filter(prg.func);
				else {
					var l = vec.length;
					for (var i=0; i<l; i++) {
						// collect elements that run program with nonzero result
						if (prg.eval(vec[i]))
							v.push(vec[i]);
					}
				}
				//if ((calculator.vars.local["hasResult"] = (v.length > 0))
					return v;
			},
			"select": function(vec, vec2, prg) { if (!(calculator.typeOf(vec) == "vector" && calculator.typeOf(vec2) == "vector")) throw Error("wrong type of argument"); if (vec.length != vec2.length) throw Error("bad arg");
				var prg = calculator.ProgramFragment.fromObj(prg);
				var v = [];
				var l = vec.length;
				for (var i=0; i<l; i++) {
					// collect elements from vec that run program on corresponding elements from vec2 with nonzero result
					if (prg.eval(vec2[i], true) != 0)
						v.push(vec[i]);
				}
				//if ((calculator.vars.local["hasResult"] = (v.length > 0))
					return v;
			},
			/// using map function, which changes "this" so that "cos" doesn't work, for example: "map": function(x, funcName) { x = this.fromString(x); if (this.isReal(x)) return this.toString(x.map(calculator.functions[funcName], calculator.functions)); else { for (var i=0; i<x.length; i++) x[i] = calculator.calc(x[i], funcName); return this.toString(x); } }
			"map": function(x, prg) { if (calculator.typeOf(x) != "vector") throw Error("wrong type of argument");
				var prg = calculator.ProgramFragment.fromObj(prg); // was: var func = calculator.functions[funcName];
				var v = [];
				for (var i=0; i<x.length; i++)
					v[i] = prg.eval(x[i]);
					// was: v[i] = ((func != undefined && typeof x[i] === "number") ? func.call(calculator.functions, x[i]) : calculator.calc(x[i], funcName));
				return v;
			},
			"any": function(x, prg) { if (calculator.typeOf(x) != "vector") throw Error("wrong type of argument");
				var prg = calculator.ProgramFragment.fromObj(prg); // expected to return a boolean result

                // special case early return
                if (!x.length) {
                    calculator.vars.local.result = {}; // no result, but make access safe
                    return true;
                }

                // apply prg to each item in x until true is found
				for (var i=0; i<x.length; i++) {
                    var val = prg.eval(x[i]);
					if (val == true) {
                        calculator.vars.local.result = { input: x[i], index: i }; // record input that caused early return and its index
                        return true;
                    }
                }
                calculator.vars.local.result = {}; // no result, but make access safe
				return false;
			},
			"every": function(x, prg) { if (calculator.typeOf(x) != "vector") throw Error("wrong type of argument");
				var prg = calculator.ProgramFragment.fromObj(prg); // expected to return a boolean result

                // apply prg to each item in x unless false is found
				for (var i=0; i<x.length; i++) {
                    var val = prg.eval(x[i]);
					if (val == false) {
                        calculator.vars.local.result = { input: x[i], index: i }; // record value that caused early return and index of input in x
                        return false;
                    }
                }
                calculator.vars.local.result = {}; // no result, but make access safe
				return true;
			},
			"join": function(x) {
                // assumes a vector of strings or types that will auto-convert to strings
				return ME.string.toString(x.join(calculator.vars.local.options && calculator.vars.local.options.separator));
			},
			"linePlot": function(v) {
				if (!this.isReal(v)) throw Error("bad arg");
				var m = [];
				for (var i=0; i<v.length; i++)
					m.push([i,v[i]]);
				calculator.functions.matrix.linePlot(m);
			},
			"input": function(title, options) { if (calculator.typeOf(title) != "string") throw Error("wrong type of argument");
				var wantsValidation = ("V" in options);
				var placeholder = '""';
				for (var i=0; i<options.length; i++)
					if (calculator.typeOf(options[i]) == "string")
						placeholder = options[i];
				var userText, isValid = true;
				do {
					userText = calculator.unquote(calculator.functions.string.input(title, placeholder));
					if (wantsValidation)
						isValid = (calculator.typeOf(userText) != "unknown");
				}
				while (wantsValidation && !isValid);
				return calculator.functions.string.toString(userText);
			},
		},
/*
		"@plot": function(x) {
			if (!(calculator.typeOf(x) == "vector" || calculator.typeOf(x) == "matrix")) throw Error("bad arg");
			var m = x;
			if (calculator.typeOf(x) == "vector") {
				m = [];
				for (var i=0; i<x.length; i++)
					m.push([i, x[i]]);
			}
			display.showGraphics(true);
			calculator.drawLineChart(m);
		},
*/
		matrix: {
			type: "matrix",
			isLoaded: true,
			fromString: function(x) { /*was: if (typeof x != "object") x = eval(x); */ x = calculator.functions.vector.fromString(x); return x; },
			toString: function(x) { /* was: return JSON.stringify(arr);*/ return calculator.functions.vector.toString(x); }, // was: var str = sylvesterObj.inspect().replace(/\n/g,","); return ("[" + str + "]"); },
			toNumber: function(m) { var nm = []; for (var j=0; j<m.length; j++) { nm[j] = []; for (var i=0; i<m[0].length; i++) nm[j][i] = calculator.functions["@toNumber"](m[j][i]); } return nm; },
			eval: function(m) { var nm = []; for (var j=0; j<m.length; j++) { nm[j] = []; for (var i=0; i<m[0].length; i++) nm[j][i] = calculator.functions["@eval"](m[j][i]); } return nm; },
			"right": function(x) { var m = []; for (var i=0; i<x.length; i++) m[i] = x[i].map(function(x) { return (calculator.isAName(x) ? ME.expr.right(x) : x); }); return m; },
			"+": function(x, y) {
				if (!(calculator.isAMatrix(x) && calculator.isAMatrix(y))) return ME.vector["+"](x, y);
				if (!(y.length == x.length && y[0].length == x[0].length)) throw Error("incompatible dimensions");
				var z = [];
				for (var i=0; i<x.length; i++) {
					z[i] = []; 
					for (var j=0; j<x[i].length; j++)
						if (typeof x[i][j] === "number" && typeof y[i][j] === "number") z[i][j] = x[i][j] + y[i][j]; else z[i][j] = calculator.calc(x[i][j], y[i][j], "+");
				}
				return z; },
			"-": function(x, y) {
				if (!(calculator.isAMatrix(x) && calculator.isAMatrix(y))) return ME.vector["-"](x, y);
				if (!(y.length == x.length && y[0].length == x[0].length)) throw Error("incompatible dimensions");
				var z = [];
				for (var i=0; i<x.length; i++) {
					z[i] = []; 
					for (var j=0; j<x[i].length; j++)
						if (typeof x[i][j] === "number" && typeof y[i][j] === "number") z[i][j] = x[i][j] - y[i][j]; else z[i][j] = calculator.calc(x[i][j], y[i][j], "-");
				}
				return z; },
			"*": function(x, y) { // x must be a scalar or matrix; b must be a scalar, matrix, or vector; one of x, y is sure to be a matrix
				var m;
				var m2;
				var v;
				var scalar;
				if (!calculator.isAMatrix(x)) { // deal with scalar * matrix case first
					if ((!(typeof x === 'number' || calculator.isAComplexNumber(x))))
						throw Error("unsupported arg type");
					scalar = x;
					m = y;
				}
				if (m == undefined) { // no matrix yet; it's sure to be x at this point
					m = x;
					// check for type of y; must be scalar or vector
					if (typeof y === 'number' || calculator.isAComplexNumber(y))
						scalar = y;
					else if (calculator.isAMatrix(y)) {
						m2 = y;
						if (!(m2.length == m[0].length)) // check dimensions
							throw Error("incompatible dimensions");
					}
					else if (calculator.isAVector(y)) {
						v = y;
						if (v.length != m[0].length) // check dimensions
							throw Error("incompatible dimensions");
					}
					else
						throw Error("unsupported arg type");
				}
				// now have m and one of m2, v, s
				var z = [];
				if (scalar) { // m * s
					var scalarIsReal = (typeof scalar === "number");
					for (var i=0; i<m.length; i++) {
						z[i] = []; 
						for (var j=0; j<m[i].length; j++)
							if (typeof m[i][j] === "number" && scalarIsReal) z[i][j] = m[i][j] * scalar; else z[i][j] = calculator.calc(m[i][j], scalar, "*");
					}
				}
				else if (v) { // m * v
					var operandsAreReal = (this.isReal(m) && calculator.functions.vector.isReal(v));
					for (var i=0; i<m.length; i++) {
						var dot = 0;
						for (k=0; k<v.length; k++)
							if (operandsAreReal) dot += m[i][k] * v[k]; else dot = calculator.calc(dot, calculator.calc(m[i][k], v[k], "*"), "+");
						z[i] = dot;
					}
				}
				else { // m * m2
					var matricesAreReal = (this.isReal(m) && this.isReal(m2));
					for (var i=0; i<m.length; i++) {
						z[i] = []; 
						for (var j=0; j<m2[0].length; j++) {
							var dot = 0;
							for (k=0; k<m2.length; k++)
								if (matricesAreReal) dot += m[i][k] * m2[k][j]; else dot = calculator.calc(dot, calculator.calc(m[i][k], m2[k][j], "*"), "+");
							z[i][j] = dot;
						}
					}
				}
				return z;
			},
			"/": function(x, y) {
				if (calculator.isAMatrix(y)) y = $M(y); else return ME.vector["/"](x, y);
				if (calculator.isAMatrix(x) || calculator.isAVector(x)) x = $M(x); else throw Error("unsupported arg type");
				if (y.cols() != x.rows()) throw Error("incompatible dimensions");
				y = y.inv(); if (y == null) throw Error("zero determinant; cannot divide");
				y = y.multiply(x);
				if (y.cols() == 1 /* is vector */) return y.col(1).elements; else return y.elements; },
			"rem": function(x, m) { if (typeof m != "number") throw Error("wrong type of argument");
				var z = [];
				for (var i=0; i<x.length; i++)
					z[i] = calculator.functions.vector.rem(x[i], m);
				return z; },
			"mod": function(x, m) { if (typeof m != "number") throw Error("wrong type of argument");
				var z = [];
				for (var i=0; i<x.length; i++)
					z[i] = calculator.functions.vector.mod(x[i], m);
				return z; },
            "pow": function(x, exponent) {
                if (typeof exponent != "number") throw Error("wrong type of argument");
                if (!ME.isInt(exponent)) throw Error("bad arg");
				if (exponent == 0)
					return this.identity(x);
				var x_orig = x.clone();
				function f2(expo) {
					var x, r = [];
					do { r.push(x = Math.floor(calculator.functions.log2(expo))); expo -= Math.pow(2, x); } while (expo);
					return r;
				}
				var expos = f2(exponent);
				///alert("powops: " + expos);
				for (var i=expos.shift()-1; i>=0; i--) {
					x = this["*"](x, x);
					while (expos[0] == i) {
						///alert("mul at: " + i);
						x = this["*"](x, x_orig);
						expos.shift();
					}
				}
				return x; },
            /// todo: delete "^": function(a, b) { return this["pow"](a,b); },
            "modpow": function(x, exponent, m) {
                if (typeof exponent != "number" || typeof m != "number") throw Error("wrong type of argument");
                if (!ME.isInt(exponent)) throw Error("bad arg");
				if (exponent == 0)
					return this.identity(x);
				var x_orig = x.clone();
				function f2(expo) {
					var x, r = [];
					do { r.push(x = Math.floor(calculator.functions.log2(expo))); expo -= Math.pow(2, x); } while (expo);
					return r;
				}
				var expos = f2(exponent);
				for (var i=expos.shift()-1; i>=0; i--) {
					x = this["*"](x, x);
					x = this["mod"](x, m);
					while (expos[0] == i) {
						x = this["*"](x, x_orig);
						x = this["mod"](x, m);
						expos.shift();
					}
				}
				return x; },
			"==": function(x, y) { if (x.length != y.length) return false;
				for (var i=0; i<x.length; i++) if (!calculator.functions.vector["=="](x[i], y[i])) return false; return true; },
			"!=": function(x, y) { return !this["=="](x, y); },
			"inv": function(x) { x = $M(x); x = x.inv(); if (x == null) throw Error("zero determinant; cannot compute inverse"); return x.elements; },
			"fromElements": function(dim) { if (dim.length != 2) throw Error("unsupported dimensions"); var m = []; for (var i=0; i<dim[0]; i++) m.unshift(calculator.functions.vector.fromElements(dim[1])); return m; },
			"toElements": function(m) { var nRows = m.length; for (var row=0; row<nRows; row++) calculator.pushArraySilently(m[row]); return this.size(m); },
			"setAt": function(x, pos, val) { if (!calculator.isAMatrix(x)) throw Error("bad arg 1: not a matrix"); if (pos.length != 2) throw Error("bad index"); var m = x.clone(); var newpos = [Number(pos[0])-1, Number(pos[1])-1]; if (!(newpos[0] >= 0 && newpos[0] < m.length && newpos[1] >= 0 && newpos[1] < m[0].length)) throw Error("bad index"); m[newpos[0]][newpos[1]] = val; return m; },
			"PUTI": function(m, pos, val) { if (pos.length != 2) throw Error("bad index"); var newpos = [pos[0], (pos[1] % m[0].length)+1]; calculator.stack.push(this.setAt(m, pos, val)); if (newpos[1] == 1) newpos[0] = ((newpos[0] % m.length)+1); return newpos; },
			"at": function(m, pos) { if (pos.length != 2) throw Error("bad index"); var newpos = [Number(pos[0])-1, Number(pos[1])-1]; var result; if (!(newpos[0] >= 0 && newpos[0] < m.length && newpos[1] >= 0 && newpos[1] < m[0].length)) throw Error("bad index"); return m[newpos[0]][newpos[1]]; },
			"GETI": function(m, pos) { if (pos.length != 2) throw Error("bad index"); calculator.stack.push(m); var newpos = [pos[0], (pos[1] % m[0].length)+1]; if (newpos[1] == 1) newpos[0] = ((newpos[0] % m.length)+1); calculator.stack.push(newpos); return this.at(m, pos); },
			"addRow": function(m, v) { if (!calculator.isAMatrix(m) || !calculator.isAVector(v)) throw Error("bad arg"); if (v.length != m[0].length) throw Error("incompatible dimensions"); var nm = m.clone(); nm[nm.length] = v; return nm; },
			"size": function(x) { return new Array(x.length, x[0].length); },
			"resize": function(x, n) { if (!(calculator.isAVector(n) && calculator.isAMatrix(x))) throw Error("bad arg"); var m = x.clone(); var size = n; var oldSize = [m.length, m[0].length]; m.length = size[0]; for (var i=0; i<size[0]; i++) { for (var j=0; j<size[1]; j++) if (i>=oldSize[0] || j>=oldSize[1]) { if (!j) m[i] = []; m[i][j] = 0; } m[i].length = size[1]; } return m; },
			"transpose": function(x) { x = $M(x); return x.transpose().elements; },
			"triangular": function(x) { x = $M(x); return x.toUpperTriangular().elements; },
			"setToConstant": function(x, cons) { if (!calculator.isAMatrix(x)) throw Error("bad arg"); var m = []; for (var i=0; i<x.length; i++) { m[i] = []; for (var j=0; j<x[0].length; j++) m[i][j] = cons; } return m; },
			"identity": function(x) { if (calculator.isAMatrix(x)) x = x.length; if (typeof x != "number") throw Error("wrong type of argument"); return Matrix.I(x).elements; },
			"RANM": function(m) { for (var i=0; i<m.length; i++) for (var j=0; j<m[0].length; j++) m[i][j] = Math.round((Math.random()-0.5)*18); return m; },
			"residual": function(b, a, x) { if (!(calculator.isAMatrix(a) && ((calculator.isAMatrix(b) && calculator.isAMatrix(x)) || (calculator.isAVector(b) && calculator.isAVector(x))))) throw Error("bad arg"); return (calculator.isAMatrix(x) ? this["-"](b, this["*"](a, x)) : calculator.functions.vector["-"](b, this["*"](a, x))); },
			"rank": function(x) { x = $M(x); return x.rank(); },
			"trace": function(x) { x = $M(x); if (!x.isSquare()) throw Error("matrix not square"); return x.trace(); },
			"diagonal": function(x) { var size = x.length; if (x[0].length != size) throw Error("matrix not square"); var v = []; for (var i=0; i<size; i++) v.push(x[i][i]); return v; },
			"diagonals": function(x) { var size = x.length; if (x[0].length != size) throw Error("matrix not square"); var m = []; for (var k=0; k<size; k++) { var v = []; for (var i=0; i<size; i++) v.push(x[i][(i+k)%size]); m.push(v); } return m; },
			"flip": function(x) { var size = x.length, hsize = x[0].length; var m = []; for (var k=0; k<size; k++) { var v = []; for (var i=hsize-1; i>=0; i--) v.push(x[k][i]); m.push(v); } return m; },
			"determinant": function(x) { x = $M(x); return x.determinant(); },
			"abs": function(x) { var sum = 0; for (var i=0; i<x.length; i++) for (var j=0; j<x[i].length; j++) sum += x[i][j]*x[i][j]; return Math.sqrt(sum); },
			"RNRM": function(x) { var max = calculator.vars.MINR; for (var i=0; i<x.length; i++) { var sum=0; for (var j=0; j<x[i].length; j++) sum += Math.abs(x[i][j]); max = Math.max(sum, max); } return max; },
			"CNRM": function(x) { var max = calculator.vars.MINR; for (var i=0; i<x[0].length; i++) { var sum=0; for (var j=0; j<x.length; j++) sum += Math.abs(x[j][i]); max = Math.max(sum, max); } return max; },
			///"neg": function(x) { return this.map(x, "neg"); },
			"pos": function(m, x) { var i, j; for (i=0; i<m.length; i++) for (j=0; j<m[i].length; j++) if (m[i][j] == x) return [(i+1),(j+1)]; return 0; },
			"sub": function(m, start, end) { start = Math.max(Number(start)-1, 0); end = Math.min(Number(end)-1, m.length-1); var nm = []; for (var i=start; i<=end; i++) nm[i-start] = m[i]; return nm; },
			"fromList": function(x) { return calculator.functions.vector.toElements(x); }, // treat matrix like a vector; (this might be a stack with a vector as first element)
			"isReal": function(x) { for (var i=0; i<x.length; i++) for (var j=0; j<x[i].length; j++) if (typeof x[i][j] !== "number") return false; return true; },
			"isSameType": function(x) { var containsSameType = true; var type = calculator.typeOf(x[0]); for (var i=0; i<x.length; i++) for (var j=0; j<x[i].length; j++) if (calculator.typeOf(x[i][j]) !== type) return false; return true; },
			/// map version with somehow doesn't work "map": function(x, funcName) { if (this.isReal(x)) return $M(x).map(calculator.functions[funcName], calculator.functions).elements; else { var m = []; for (var i=0; i<x.length; i++) { m[i] = []; for (var j=0; j<x[i].length; j++) m[i][j] = calculator.calc(x[i][j], funcName); } return m; } }
			//was: "map": function(x, prg) { var func = calculator.functions[funcName]; var m = []; for (var i=0; i<x.length; i++) { m[i] = []; for (var j=0; j<x[i].length; j++) m[i][j] = ((func != undefined && typeof x[i][j] === "number") ? func.call(calculator.functions, x[i][j]) : calculator.calc(x[i][j], funcName)); } return m; },
			"map": function(x, prg) { if (calculator.typeOf(x) != "matrix") throw Error("wrong type of argument");
				var prg = calculator.ProgramFragment.fromObj(prg);
				var z = [];
				for (var i=0; i<x.length; i++) {
					z[i] = []; 
					for (var j=0; j<x[i].length; j++)
						z[i][j] = prg.eval(x[i][j]);
				}
				return z;
			},
			"linePlot": function(m) {
				if (!(calculator.functions.matrix.isReal(m) && m.length > 1 && m[0].length > 1)) throw Error("bad arg");
				display.showGraphics(true);
				//	was: calculator.drawLineChart(m);

				// get default plot params merged with user's
				var params = { "autoscale": true, "keepAspect": true, "flip": true, "strokeStyle": 'rgb(128, 128, 255)', "closePath": false, "lineWidth": 1.0 };
				var userParams = calculator.vars.plotParams || {};
				for (var p in userParams) { params[p] = userParams[p]; }

				var ctx = canvas.getContext('2d');
				ctx.save();
				ctx.strokeStyle = params.strokeStyle;
				
				if (params.autoscale) {
					var minVal = m[0], maxVal = m[0];
					for (var i=1; i<m.length; i++) {
						minVal = [Math.min(minVal[0], m[i][0]), Math.min(minVal[1], m[i][1])];
						maxVal = [Math.max(maxVal[0], m[i][0]), Math.max(maxVal[1], m[i][1])];
					}

					var dx = maxVal[0]-minVal[0], dy = maxVal[1]-minVal[1]; 
					var scale = [canvas.width/dx, canvas.height/dy];

					var inset = [-minVal[0], -minVal[1]];
					if (params.keepAspect) {
						if (scale[0] > scale[1]) {
							inset[0] = scale[0]/scale[1]*dx/2;
							scale[0] = scale[1];
						}
						else {
							inset[1] = scale[1]/scale[0]*dy/2;
							scale[1] = scale[0];
						}
					}

//					ctx.scale(scale[0], scale[1]);
//					ctx.translate(inset[0], inset[1]);

//					ctx.setLineWidth(params.lineWidth/Math.min(scale[0], scale[1]));
				}
//				else
					ctx.setLineWidth(params.lineWidth);
				
				// data point to screen space pixel mapping functions
				function x2px(x) { return (x+inset[0])*scale[0]; }
				function y2py(y) { var y = (y+inset[1])*scale[1]; if (params.flip) y = canvas.height - y; return y; }
				
				// construct path
				ctx.beginPath();
				ctx.moveTo(x2px(m[0][0]), y2py(m[0][1]));
				for (var i=1; i<m.length; i++)
					ctx.lineTo(x2px(m[i][0]), y2py(m[i][1]));
				if (params.closePath)
					ctx.closePath();

				ctx.stroke();

				ctx.restore();
			}
		},
		
		// special case; real or no inputs but vector or matrix output
		"@seq": function(prg, index, start, end, incr) { var prgType = calculator.typeOf(prg); if (!(calculator.typeOf(index) == "expression or name" && (prgType == "RPL program" || prgType == "vector"))) throw Error("wrong type of argument");
			prg = '\u226a' + start + " " + end + " FOR " + calculator.unquote(index) + " " + (prgType == "vector" ? this.toString(prg) : prg) + " EVAL " + incr + " STEP " + '\u226b';
			var savedStackLength = calculator.stack.length;
			var compiledPrg = calculator.RPLProgram.compile(calculator.RPLProgram.tokenize(prg));
			if (compiledPrg)
				calculator.RPLProgram.run(compiledPrg);
			else
				this.vector.eval(prg);
			if ((calculator.vars.local["hasResult"] = (calculator.stack.length-savedStackLength > 1))) // transparent extension: set a flag to indicate no result
				return this.vector.fromElements(calculator.stack.length-savedStackLength);
		},
		"identity": function(x) { return this.matrix.identity(x); },
		"range": function(a, b) { var v = []; if (a<b) for (var i=a; i<=b; i++) v.push(i); else for (var i=a; i>=b; i--) v.push(i); return v; },
 		"fromElements": function(n) { var dim = eval(n); if (dim.length == undefined) { dim = []; dim[0] = n; } return (dim.length == 1 ? this.vector.fromElements(dim[0]) : this.matrix.fromElements(dim)); },
		"toList": function(n) { return this.vector.fromElements(n); },
		"toVec2": function() { return this.vector.fromElements(2); },
		"toVec3": function() { return this.vector.fromElements(3); },

///		"toList": function(n) { if (n > calculator.stack.length) throw Error("too few entries on stack"); var v = []; for (var i=0; i<n; i++) v.unshift(calculator.stack.pop()); return v; },
		
		// statistics functions
		"@stat_draw": function() { var data = this.stat_data(); var cols = this["stat_get_cols"](); display.showGraphics(true); calculator.drawData(data, cols[0]-1, cols[1]-1); },
		"@stat_draw_barChart": function() { var data = calculator.functions.stat_data(); var cols = calculator.functions["stat_get_cols"](); display.showGraphics(true); calculator.drawBarChart(data, cols[0]-1, cols[1]-1); },
		"@stat_draw_pieChart": function() { var data = calculator.functions.stat_data(); var cols = calculator.functions["stat_get_cols"](); display.showGraphics(true); calculator.drawPieChart(data, cols[0]-1, cols[1]-1); },
		"@stat_draw_lineChart": function() { var data = calculator.functions.stat_data(); var cols = calculator.functions["stat_get_cols"](); display.showGraphics(true); calculator.drawLineChart(data, cols[0]-1, cols[1]-1); },
		"stat_data": function() { var m = calculator.vars[calculator.currentDataCategory]["\u2211DAT"]; if (m == undefined) throw Error("nonexistent \u2211DAT"); return m; },
		"@stat_add": function(x) { var m = calculator.vars[calculator.currentDataCategory]["\u2211DAT"] || []; var fromScratch = (m.length == 0); if (fromScratch) m[0] = x; this["@stat_store"](((fromScratch ? m : this.matrix.addRow(m, x)))); },
		"stat_del_last": function() { var m = this.stat_data(); var v = m[m.length-1]; if (m.length > 1) { m.length = m.length-1; this["@stat_store"](m); } else this.stat_clear(); return v; },
		"stat_count": function() { var m = this.stat_data(); return m.length; },
		"stat_clear": function() { this["@var_delete"]("'\u2211DAT'"); },
		"@stat_store": function(m) { if (!calculator.isAMatrix(m)) throw Error("bad arg: not a matrix"); this["@var_store"](m, "'\u2211DAT'"); },
		"stat_recall": function() { var m = calculator.vars[calculator.currentDataCategory]["\u2211DAT"]; if (m == undefined) throw Error("nonexistent \u2211DAT"); return m; },
		"stat_total": function() { var m = this.stat_data();
			var v = [];
			for (var col=0; col<m[0].length; col++) {
				var sum = 0;
				for (var row=0; row<m.length; row++)
					sum += m[row][col];
				v.push(sum);
			}
			return v; },
		"stat_mean": function() { return this.vector["/"](this["stat_total"](), this["stat_count"]()); },
		"stat_max_val": function() { var m = this.stat_data();
			var v = [];
			for (var col=0; col<m[0].length; col++) {
				var val = m[0][col];
				for (var row=0; row<m.length; row++)
					val = Math.max(val, m[row][col]);
				v.push(val);
			}
			return v; },
		"stat_min_val": function() { var m = this.stat_data();
			var v = [];
			for (var col=0; col<m[0].length; col++) {
				var val = m[0][col];
				for (var row=0; row<m.length; row++)
					val = Math.min(val, m[row][col]);
				v.push(val);
			}
			return v; },
		"stat_standard_deviation": function() {
			var variances = this["stat_variance"]();
			var stddevs = [];
			for (var i=0; i<variances.length; i++)
				stddevs.push(Math.sqrt(variances[i]));
			return stddevs; },
		"stat_variance": function() { var m = this.stat_data();
			var v = [];
			for (var col=0; col<m[0].length; col++) {
				var squares = 0, sum = 0;
				for (var row=0; row<m.length; row++) {
					var x = m[row][col];
					squares += x * x;
					sum += x;
				}
				var mean = sum / m.length;
				var variance = (squares - sum*mean) / (m.length-1);
				v.push(variance);
			}
			return v; },
		"stat_select_cols": function(x, y) { var params; try { params = this["@var_recall"]("'\u2211PAR'") } catch(e) { params = []; }; params[0] = x; params[1] = y; this["@var_store"](params, "'\u2211PAR'"); },
		"stat_get_cols": function() { var params; try { params = this["@var_recall"]("'\u2211PAR'") } catch(e) { params = [1,2] }; params.length = 2; params[0] = Number(params[0]); params[1] = Number(params[1]); return params; },
		"stat_correlation": function() { var m = this.stat_data(); var cols = this["stat_get_cols"]();
			var n = m.length;
			var sums = [0, 0], squares = [0, 0], productSum = 0;
			for (var row=0; row<n; row++) {
				var x = m[row][cols[0]-1];
				var y = m[row][cols[1]-1];
				sums[0] += x;
				sums[1] += y;
				squares[0] += x * x;
				squares[1] += y * y;
				productSum += x*y;
			}
			var correlation = (n*productSum - sums[0]*sums[1]) / Math.sqrt((n*squares[0]-sums[0]*sums[0]) * (n*squares[1]-sums[1]*sums[1]));
			return correlation; },
		"stat_covariance": function() { var stddevs = this["stat_standard_deviation"](); return this["stat_correlation"]() * (stddevs[0]*stddevs[1]); },
		"stat_linear_regression": function() { var stddevs = this["stat_standard_deviation"](); var cols = this["stat_get_cols"]();
			var slope = this["stat_correlation"]() / (stddevs[cols[0]-1]/stddevs[cols[1]-1]);
			var means = this["stat_mean"]();
			var ordinate = -(means[cols[0]-1]*slope - means[cols[1]-1]);
			var params = cols; params[2] = ordinate; params[3] = slope; this["@var_store"](cols, "'\u2211PAR'");
			calculator.stack.push(ordinate);
			return slope;
		},
		"@stat_predicted_value": function(x) { var params; try { params = this["@var_recall"]("'\u2211PAR'"); } catch(e) { this.stat_linear_regression(); calculator.pop(); /* drop value pushed by LR */ params = this["@var_recall"]("'\u2211PAR'"); }; if (params == undefined) return 0; return x*params[3] + params[2]; },
		"stat_scaleToFit": function() {
			var min = this["stat_min_val"]();
			var max = this["stat_max_val"]();
			this.insertIntoDrawParams(this.complex.fromReal(min[1], min[0]), 0);
			this.insertIntoDrawParams(this.complex.fromReal(max[1], max[0]), 1);
		},			

		"stat_avg": function() { var m = this.stat_data(); var cols = this["stat_get_cols"]();
			var n = m.length;
			var sumY = 0, productSum = 0;
			for (var row=0; row<n; row++) {
				var x = m[row][cols[0]-1];
				var y = m[row][cols[1]-1];
				sumY += y;
				productSum += x*y;
			}
			return productSum / sumY; },

		// catch-all and stack functions
		"@var_store": function(x, name) { name = calculator.nameFromArg(name);
			if (name in calculator.vars.local) { // local var case
				calculator.vars.local[name] = x;
				return;
			}
			if (name[0].match(/[_\u005b\u005d\-\+\*\/\!\(\)\\\{\}0-9\u221a]/)) throw Error("invalid variable name: " + name);
			// install in current data category (var or function)
			if (calculator.isAFunctionString(x)) {
				var funcText = x.replace(/\t/g, "     "); // tabs give problems in eval apparently; replace with spaces
				var completedFuncText;
				if (x.indexOf("/*as is*/") != -1)
					completedFuncText = funcText;
				else { // no as-is function
					var with_insert = "with (calculator.vars[\"" + calculator.currentDataCategory + "\"]) with (calculator.functions) with (calculator.functions[\"" + calculator.currentDataCategory + "\"])";
					var begin = funcText.indexOf("{")+1;
					completedFuncText = funcText.slice(0, begin) + " " + with_insert + " { " + funcText.slice(begin) + " }";
				}
				var func = calculator.functions[calculator.currentDataCategory][name] = eval("(" + completedFuncText + ")");
				calculator.numberOfArgsForFunctionWithNameCache[name] = (func.length || func.arity);/// = {}; // in case # func changed
			}
			else if (typeof x == "string" && x[0] == "'" && calculator.isANaturalMathFunctionString(x.slice(1))) {
				calculator.functions[calculator.currentDataCategory][name] = ME.expr.functionForNaturalMath(x);
				calculator.vars[calculator.currentDataCategory][name] = x; // store original as variable, so this is shown when the item is edited
			}
			else {
				calculator.vars[calculator.currentDataCategory][name] = x;
				// in case a function of the same name existed before, delete it so it doesn't take precedence
				if (name in calculator.functions[calculator.currentDataCategory])
					delete calculator.functions[calculator.currentDataCategory][name];
			}
			// sync with host
			if (calculator.wantsVarStoreToSyncToHost) {
				if (typeof x === "object"/* && "type" in x*/)
					x = JSON.stringify(x);
				
				calculator.exec("@var_store", x, name);
			}
			// special treatment for RPL programs
			if (calculator.isAnRPLProgram(x)) calculator.RPLProgram.buildFunctionWrapper(name, calculator.currentDataCategory);
		},
		"@var_recall": function(name)   { name = calculator.nameFromArg(name);
			if (name in calculator.vars.local) // local var case
				return calculator.vars.local[name];
			else if (name in calculator.vars[calculator.currentDataCategory]) // a variable
				return calculator.vars[calculator.currentDataCategory][name];
			else if (name in calculator.functions[calculator.currentDataCategory]) { // a function
				var x = String(calculator.functions[calculator.currentDataCategory][name]);
				if (x.indexOf("/*as is*/") == -1) { // no as-is function
					var begin1 = x.indexOf("{")+1;
					var part1 = x.slice(0, begin1);
					var begin2 = x.slice(begin1).indexOf("{")+1;
					var part2 = x.slice(begin1+begin2, -2);
					return part1 + part2;
				}
				else
					return x;
			}
			else throw Error("undefined name: " + name);
		},
		"@var_delete": function(name)   { name = calculator.nameFromArg(name);
			if (name in calculator.vars[calculator.currentDataCategory] || name in calculator.functions[calculator.currentDataCategory]) {
				delete calculator.vars[calculator.currentDataCategory][name];
				//was: calculator.exec("@var_delete", name);
				setTimeout(function() { calculator.exec("@var_delete", name); }, 50); // todo: find better solution; delaying this so that (1) PURGE can be used in same RPL code with (1) STO
				if (name in calculator.functions[calculator.currentDataCategory])
					delete calculator.functions[calculator.currentDataCategory][name]; // delete any function wrapper
			}
			else throw Error("undefined name: " + name);
		},
		"@var_rename": function(new_name, old_name) {
			this["@var_store"](this["@var_recall"](old_name), new_name);
			this["@var_delete"](old_name);
		},
		"@var_plus": function(x, y) { var name;
			if (calculator.isAName(y)) {
				name = y; calculator.stack.push(x); calculator.stack.push(this["@var_recall"](name));
			} else {
				name = x; calculator.stack.push(this["@var_recall"](name)); calculator.stack.push(y);
			}
			calculator.operate("+");
			this["@var_store"](calculator.stack.pop(), name);
		},
		"@var_minus": function(x, y) { var name;
			if (calculator.isAName(y)) {
				name = y; calculator.stack.push(x); calculator.stack.push(this["@var_recall"](name));
			} else {
				name = x; calculator.stack.push(this["@var_recall"](name)); calculator.stack.push(y);
			}
			calculator.operate("-"); this["@var_store"](calculator.stack.pop(), name);
		},
		"@var_times": function(x, y) { var name;
			if (calculator.isAName(y)) {
				name = y; calculator.stack.push(x); calculator.stack.push(this["@var_recall"](name));
			} else {
				name = x; calculator.stack.push(this["@var_recall"](name)); calculator.stack.push(y);
			}
			calculator.operate("*"); this["@var_store"](calculator.stack.pop(), name);
		},
		"@var_divide": function(x, y) { var name;
			if (calculator.isAName(y)) {
				name = y; calculator.stack.push(x); calculator.stack.push(this["@var_recall"](name));
			} else {
				name = x; calculator.stack.push(this["@var_recall"](name)); calculator.stack.push(y);
			}
			calculator.operate("/"); this["@var_store"](calculator.stack.pop(), name);
		},
		"@var_neg": function(name) { calculator.stack.push(this["@var_recall"](name)); calculator.operate("neg"); this["@var_store"](calculator.stack.pop(), name); },
		"@var_inv": function(name) { calculator.stack.push(this["@var_recall"](name)); calculator.operate("inv"); this["@var_store"](calculator.stack.pop(), name); },
		"@var_conj": function(name) { calculator.stack.push(this["@var_recall"](name)); calculator.operate("conjugate"); this["@var_store"](calculator.stack.pop(), name); },
		"@clear": function() { calculator.stack.length = 0; },
		"@depth": function() { return calculator.stack.length; },
		"@swap": function(x, y) { calculator.stack.push(y); calculator.stack.push(x); },
		"@rotate": function(x, y, z) { calculator.stack.push(y); calculator.stack.push(z); calculator.stack.push(x); },
		"@unrotate": function(x, y, z) { calculator.stack.push(z); calculator.stack.push(x); calculator.stack.push(y); },
		"@roll": function(n) { if (n > calculator.stack.length) throw Error("too few entries on stack"); if (n > 1) { var arr = []; for (var i=0; i<n; i++) arr[i] = calculator.stack.pop(); for (var i=n-2; i>=0; i--) calculator.stack.push(arr[i]); calculator.stack.push(arr[n-1]); } },
		"@roll_down": function(n) { if (n > calculator.stack.length) throw Error("too few entries on stack"); if (n > 1) { var arr = []; for (var i=0; i<n; i++) arr[i] = calculator.stack.pop(); calculator.stack.push(arr[0]); for (var i=n-1; i>0; i--) calculator.stack.push(arr[i]); } },
		"@over": function(x, y) { calculator.stack.push(x); calculator.stack.push(y); calculator.stack.push(x); },
		"@pick": function(n) { if (n > calculator.stack.length) throw Error("too few entries on stack"); calculator.stack.push(calculator.stack[calculator.stack.length-n]); },
		"@pick3": function() { if (calculator.stack.length < 3) throw Error("too few entries on stack"); calculator.stack.push(calculator.stack[calculator.stack.length-3]); },
		"@unpick": function(obj, n) { if (n > calculator.stack.length) throw Error("too few entries on stack"); calculator.stack[calculator.stack.length-n] = obj; },
		"@dup":	function(x) { calculator.stack.push(x); calculator.stack.push(x); },
		"@dupdup": function(x) { calculator.stack.push(x); calculator.stack.push(x); calculator.stack.push(x); },
		"@dup2": function(x, y) { calculator.stack.push(x); calculator.stack.push(y); calculator.stack.push(x); calculator.stack.push(y); },
		"@dup_n": function(n) { if (n > calculator.stack.length) throw Error("too few entries on stack"); if (n > 0) { var arr = []; for (var i=0; i<n; i++) arr[i] = calculator.stack.pop(); for (var j=0; j<2; j++) for (var i=n-1; i>=0; i--) calculator.stack.push(arr[i]); } },
		"@drop": function() { if (calculator.stack.length) calculator.lastArgs = [calculator.stack.pop()]; },
		"@drop2": function(x, y) { }, // done; simply swallows inputs
		"@drop2nd": function(x, y) { return y; }, // swallows 1st input
		"@drop_n": function(n) { if (n > calculator.stack.length) throw Error("too few entries on stack"); for (var i=0; i<n; i++) calculator.stack.pop(); },
		"@last": function() { for (var i=0; i<calculator.lastArgs.length; i++) calculator.stack.push(calculator.lastArgs[i]); },
		"@var_type": function(name) { var obj; try { obj = this["@var_recall"](name); } catch(e) { return -1; } return this["@type"](obj); },
		"@type": function(x) { if (typeof x == "number") return 0; else if (typeof x == "object" && "type" in x && x.type in calculator.customTypes && "typeHP" in calculator.customTypes[x.type]) return calculator.customTypes[x.type].typeHP; else if (calculator.isAMatrix(x)) { return (ME.matrix.isSameType(x) ? (ME.matrix.isReal(x) ? 3 : (calculator.isAComplexNumber(x[0][0]) ? 4 : 5)) : 5); } else if (calculator.isAVector(x)) { return (ME.vector.isSameType(x) ? (ME.vector.isReal(x) ? 3 : (calculator.isAComplexNumber(x[0]) ? 4 : 5)) : 5); } else if (calculator.isAName(x)) { return (calculator.isALikelyExpression(x) ? 9 : (calculator.unquote(x) in calculator.vars ? 6 : 7)); } else if (calculator.isAComplexNumber(x)) return 1; else if (calculator.isAnRPLProgram(x)) return 8; else if (calculator.isAFirmString(x)) return 2; else if (calculator.isABoolean(x)) return 0; else if (calculator.isABinaryNumber(x)) return 10; else if (calculator.isFunction(x)) return 18; else if (calculator.isADataURL(x)) return 2; else return -1/* unknown */; },
		"@typeof": function(x) { var type = typeof x; if (x == undefined) return '"undefined"'; else if (type === "number") return '"number"'; else if (type === "object" && "type" in x) return ('"' + x.type + '"'); else if (calculator.isAMatrix(x)) return '"matrix"'; else if (calculator.isAVector(x)) return '"vector"'; else if (type === "object") return '"object"'; else if (calculator.isAName(x)) return '"expression or name"'; else if (calculator.isAComplexNumber(x)) return '"complex number"'; else if (calculator.isAnRPLProgram(x)) return '"RPL program"'; else if (calculator.isAFirmString(x)) return '"string"'; else if (calculator.isABoolean(x)) return '"boolean"'; else if (calculator.isABinaryNumber(x)) return '"binary number"'; else if (calculator.isADataURL(x)) return '"data URL"'; else if (typeof x === "function" || calculator.isAFunctionString(x)) return '"function"'; else if (calculator.isFunction(x)) return '"operator"'; else return '"unknown"'; },
		eval: function(x) { return x; },
		toNumber: function(x) { return x; },
		"@toNumber": function(x) {
			return this["@eval"](x, "toNumber");
		},
		"@softnum": function(x) {
			try {
				return this["@eval"](x, "toNumber");
			}
			catch(e) {
				return this["@eval"](x);
			}
		},
		"@eval": function(x) {
			var cmd = "eval";
			if (arguments.length > 1)
				cmd = arguments[1]; // only supported overwrite is "toNumber"

			// console.log("@eval: " + x);
			var type = typeof x;
			if (x === undefined || type === "number" || type === "boolean" || type === "function")
				return x;
			else if (calculator.isAMatrix(x))
				return this.matrix[cmd](x);
			else if (calculator.isAVector(x))
				return this.vector[cmd](x);
			else if (type === "object") {
				if ("type" in x && x.type in calculator.customTypes && calculator.customTypes[x.type].isLoaded && cmd in calculator.customTypes[x.type])
					return calculator.customTypes[x.type][cmd](x);
				else
					return x;
			}
			// from here on, we must be dealing with a string (only remaining JS type)
			else if (calculator.isAName(x)) // todo: move this into future expression class
				return ME.expr[cmd](x);
			else if (calculator.isAnObjectString(x) || calculator.isAFunctionString(x)) {
				try {
					var result = eval("(" + x + ")"); // test if eval'able
					return (calculator.isAnObjectString(x) ? result : x); // if function text, only return it (not the function object)
				}
				catch(e) {
					if (e instanceof SyntaxError)
						calculator.exec("alert", "SyntaxError", "in line", e.line);
					else if (e instanceof EvalError)
						calculator.exec("alert", "EvalError", "in line", e.line);
					throw e;
				}
			}
			else if (calculator.isAComplexNumber(x))
				return this.complex[cmd](x);
			else if (calculator.isAnRPLProgram(x))
				return calculator.RPLProgram.run(x);
            else if (calculator.isABinaryNumber(x))
                return ME.binary.eval(x);

			// try string to type converters
			for (var type in calculator.customTypes)
				if ("isStringRepresentation" in calculator.customTypes[type] && calculator.customTypes[type].isStringRepresentation(x))
					return calculator.customTypes[type].fromString(x);

			// this is the last course of action; instead of flagging unknown items (such as a variable name) as unknown, let's assume they might be expressions
			return ME.expr.toNumber(x);
		},
		"@stackAt": function(pos) { return calculator.stack[calculator.stack.length-pos]; },
		// setting modes
		"@toNormal": function() { calculator.mode.number_representation.type = "normal"; },
		"@toFixed": function(x) { if (typeof x == "number") { x = Math.max(0, Math.round(x)); calculator.mode.number_representation.type = "fixed"; calculator.mode.number_representation.val = x; } },
		"@toExponential": function(x) { if (typeof x == "number") { x = Math.max(0, Math.round(x)); calculator.mode.number_representation.type = "scientific"; calculator.mode.number_representation.val = x; } },
		"@toEngineering": function(x) { this["@toExponential"](x); calculator.mode.number_representation.type = "engineering"; },
		"@mode_degrees": function() { calculator.setToRadians(false); },
		"@mode_radians": function() { calculator.setToRadians(true); },
		"@mode_rect": function() { calculator.setVectorDisplayMode("rect"); },
		"@mode_polar": function() { calculator.setVectorDisplayMode("polar"); },
		"@mode_spherical": function() { calculator.setVectorDisplayMode("spherical"); },		
		"@convert": function(amount, from, to) { amount = this["toNumber"](amount); if (!(typeof amount == "number" && (calculator.isAName(from) || calculator.isAFirmString(from)) && (calculator.isAName(to) || calculator.isAFirmString(to)))) throw Error("wrong "); calculator.stack.push(calculator.convert(amount, calculator.unquote(from), calculator.unquote(to))); return to; },
		"@fromObj": function(x) { var type = calculator.typeOf(x); /// todo: remove this function after creating expression class; create fromObj functions for each kind of object
			if (type == "complex number")
				return this.complex.toReal(x);
			else if (type == "string")
				return this.string.fromString(x);
			else if (type == "vector")
				return this.vector.toElements(x);
			else if (type == "matrix")
				return this.matrix.toElements(x);
 			else if (type == "expression or name") {
				// partial expression-to-RPN conversion
				var saved_calcFunction = calculator.calc;
				var lastArgCount = -1;
				calculator.calc = function() {
					// delete stack pushes from previous invocation
					for (var i=0; i<lastArgCount+1; i++) // plus one comes from previous result, which also got pushed
						calculator.stack.pop();
					lastArgCount = arguments.length;

					// push args, numbers of args, and function name on stack
					var len = arguments.length-1;
					for (var i=0; i<len; i++)
						calculator.stack.push((calculator.typeOf(arguments[i]) == "unknown" ? calculator.quote(arguments[i]) : arguments[i]));
					calculator.stack.push(len);
					calculator.stack.push(arguments[len]);
//					throw Error("done");

					// symbolically "bake" given expression together (taken from operate function)
					var funcName = arguments[len];
					var args = arguments;
					var n_args = len;
					if ("+-*/^=<>".indexOf(funcName[0]) != -1 || funcName == '==' || funcName == '>=' || funcName == '<=') {
						var op1 = calculator.unquote(String(args[0]));
						if (op1.length > 1)
							op1 = calculator.parenthesize(op1);
						var op2 = calculator.unquote(String(args[1]));
						if (op2.length > 1)
							op2 = calculator.parenthesize(op2);
						retval = calculator.quote( op1 +  funcName + op2 );
					}
					else {
						retval = funcName + "(";
						for (var i=0; i<n_args-1; i++)
							retval += calculator.unquote(String(args[i])) + ", ";
						retval += calculator.unquote(String(args[n_args-1])); // last arg added without comma
						retval += ")";
						retval = calculator.quote(retval);
					}
					return retval;
				}
				var saved_evalMode = calculator.mode.operation.eval;
				calculator.mode.operation.eval = "halfsym"; // don't complain about undefined variables
				try {
					calculator.eval(calculator.unquote(x));
				}
				catch(e) {
					if (e.message != "done") throw e;
				}
				finally {
					calculator.calc = saved_calcFunction;
					calculator.mode.operation.eval = saved_evalMode;
				}
			}
			else if (typeof x === "object" && "type" in x && calculator.customTypes[x.type].isLoaded && "toComponents" in calculator.customTypes[x.type])
				return calculator.customTypes[x.type].toComponents(x);
			else throw Error("wrong type of argument");
		}
	},
	function_aliases: {
		/* calc keys */ "\u221a": "sqrt", "\u222b": "integrate", "\u2202": "derivative", "^": "pow", "!": "factorial", "CHS": "@sign", "DROP": "@drop", "ROLL": "@roll", "SWAP": "@swap", "LAST": "@last", "STO": "@var_store", "RCL": "@var_recall", "PURGE": "@var_delete", "DROP": "@drop", "EVAL": "eval", "\u2192NUM": "toNumber", "CLEAR": "@clear", "INV": "inv", "%CH": "percent_change", "CONVERT": "@convert", "SQ": "squared",
		/* ops */ ":=": "@var_store", "&&": "and", "||": "or", "\u2260": "!=", "\u2264": "<=", "\u2265": ">=",
		/* Mode */ "STD": "@toNormal", "FIX": "@toFixed", "ENG": "@toEngineering", "SCI": "@toExponential", "RAD": "@mode_radians", "DEG": "@mode_degrees",
		/* Trigs */ "SIN": "sin", "ASIN": "asin", "COS": "cos", "ACOS": "acos", "TAN": "tan", "ATAN": "atan", "\u2192HMS": "toHMS", "HMS\u2192": "fromHMS", "HMS+": "HMSplus", "HMS-": "HMSminus", "D\u2192R": "degToRad", "R\u2192D": "radToDeg",
		/* Logs */ "LOG": "log", "ALOG": "alog", "LN": "ln", "EXP": "exp", "LNP1": "ln_plus_one", "EXPM": "exp_minus_one", "SINH": "sinh", "ASINH": "asinh", "COSH": "cosh", "ACOSH": "acosh", "TANH": "tanh", "ATANH": "atanh",
		/* Complex */ "R\u2192C": "fromReal", "C\u2192R": "toReal", "RE": "realPart", "IM": "imaginaryPart", "CONJ": "conjugate", "SIGN": "sign", "P\u2192R": "polarToRect", "R\u2192P": "rectToPolar", "ARG": "arg",
		/* Stack */ "DUP": "@dup", "OVER": "@over", "DUP2": "@dup2", "DROP2": "@drop2", "ROT": "@rotate", "LIST\u2192": "fromList", "ROLLD": "@roll_down", "PICK": "@pick", "PICK3": "@pick3", "UNPICK": "@unpick", "DUPN": "@dup_n", "DROPN": "@drop_n", "DEPTH": "@depth", "\u2192LIST": "toList",
		/* String */ "\u2192STR": "@toString", "STR\u2192": "fromString", "CHR": "char", "NUM": "unicode", "\u2192LCD": "toDisplay", "LCD\u2192": "@fromDisplay", "POS": "pos", "SUB": "sub", "SIZE": "size",
		/* Plot */ "STEQ": "@store_eq", "RCEQ": "@recall_eq", "PMIN": "@store_pmin", "PMAX": "@store_pmax", "INDEP": "@store_indep", "DRAW": "@draw", "*W": "plot_scaleWidth", "*H": "plot_scaleHeight", "SCL\u2211": "stat_scaleToFit", "DRAW\u2211": "@stat_draw", "line\u2211": "@stat_draw_lineChart", "pie\u2211": "@stat_draw_pieChart",
		/* Store */ "STO+": "@var_plus", "STO-": "@var_minus", "STO*": "@var_times", "STO/": "@var_divide", "SNEG": "@var_neg", "SINV": "@var_inv", "SCONJ": "@var_conj",
		/* Stat */ "\u2211+": "@stat_add", "\u2211-": "stat_del_last", "N\u2211": "stat_count", "CL\u2211": "stat_clear", "STO\u2211": "@stat_store", "RCL\u2211": "stat_recall", "TOT": "stat_total", "MEAN": "stat_mean", "SDEV": "stat_standard_deviation", "VAR": "stat_variance", "MAX\u2211": "stat_max_val", "MIN\u2211": "stat_min_val", "COL\u2211": "stat_select_cols", "CORR": "stat_correlation", "COV": "stat_covariance", "LR": "stat_linear_regression", "PREDV": "@stat_predicted_value", "UTPC": "ChiSquareDistribution", "UTPF": "FisherFDistribution", "UTPN": "NormalDistribution", "UTPT": "StudentTDistribution", "NDIST": "NormalPDF", "COMB": "combinations", "PERM": "permutations",
		/* Array */ "\u220fLIST": "product", "\u2211LIST": "total", "ADD": "add", "\u2192ARRY": "fromElements", "ARRY\u2192": "toElements", "PUT": "setAt", "GET": "at", "\u2192V2": "toVec2", "\u2192V3": "toVec3", "V\u2192": "fromVec", "HEAD": "head", "TAIL": "tail", "SIZE": "size", "RDM": "resize", "TRN": "transpose", "TRAN": "transpose", "CON": "setToConstant", "IDN": "identity", "RSD": "residual", "CROSS": "cross", "DOT": "dot", "DET": "determinant", "ABS": "abs", "NEG": "neg", "POS": "pos", "SUB": "sub", "triang": "triangular", "TRACE": "trace", "\u2192DIAG": "diagonal", "DIAG\u2192": "fromDiagonal", "RANK": "rank", "SORT": "sort", "REVLIST": "reverse",
		/* Binary */ "DEC": "toDec", "HEX": "toHex", "OCT": "toOct", "BIN": "toBin", "STWS": "store_ws", "RCWS": "recall_ws", "RL": "rotate_left", "RR": "rotate_right", "RLB": "rotate_left_byte", "RRB": "rotate_right_byte", "R\u2192B": "toBinary", "B\u2192R": "fromBinary", "SL": "shift_left", "SR": "shift_right", "SLB": "shift_left_byte", "SRB": "shift_right_byte", "ASR": "arithmetic_shift_right", "AND": "and", "OR": "or", "XOR": "xor", "NOT": "not",
		/* Real */ "NEG": "neg", "FACT": "factorial", "RAND": "random", "RDZ": "random_seed", "ABS": "abs", "SIGN": "sign", "MANT": "mantissa", "XPON": "exponent", "IP": "int", "FP": "fract", "FLOOR": "floor", "CEIL": "ceil", "RND": "round", "TRNC": "trunc", "%T": "percent_of_total", "MAX": "max", "MIN": "min", "GAMMA": "gamma",
		/* Integer */ "GCD": "gcd", "LCM": "lcm", "DIVIS": "divs", "FACTORS": "factors", "FACTOR": "factor", "ISPRIME?": "isPrime", "NEXTPRIME": "nextPrime", "PREVPRIME": "prevPrime", "FIB": "fib", "MOD": "mod", "EULER": "phi", "IQUOT": "quot", "IREMAINDER": "rem",
		/* Solve */ "SOLVE": "solve", "ISOL": "solveFor", "TAYLR": "taylor",
		/* CAS */ "SUBST": "subst", "AUGMENT": "augment",
		/* Program */ "IFT": "@ift", "IFTE": "@ifte", "TYPE": "@type", "VTYPE": "@var_type", "SAME": "@same", "SEQ": "@seq",
		////* new ones */ "\u2211": "sum", "\u220f": "prod",
		/* ME */ "\u2192big": "toBig", "big\u2192": "fromBig",
		/* algebraic mode support */ "Ans": "@stackAt", "ANS": "Ans",
        /* ND1 prior */ "removeDuplicates": "uniq", "num": "toNumber",
		/* hp50g */ "FFT": "fft", "IFFT": "ifft", "STREAM": "fold", "OBJ\u2192": "@fromObj", "RCLF": "flags_recall", "STOF": "@flags_store", "DUPDUP": "@dupdup", "UNROT": "@unrotate", "NIP": "@drop2nd", "LASTARG": "@last", "RENAME": "@var_rename", "SREPL": "replace", "REPL": "slice", "PEVAL": "peval", "RECT": "@mode_rect", "CYLIN": "@mode_polar", "SPHERE": "@mode_spherical", "INPUT": "input", "MSGBOX": "alert"
	},
	functionsOperatingOnName: { // boolean indicates if result should be stored back into name
		"transpose": true, /* todo: add, once this works: "GETI": true, "PUTI": true,*/ "setAt": true, "at": false, "setToConstant": true, "identity": true, "INCR": true, "DECR": true
	},
	infixOperators: {
		"&&": true, "and": true, "AND": true, "||": true, "or": true, "OR": true,
		"=": true, "!=": true, ">": true, "<": true, "=": true, ">=": true, "<=": true, "==": true, 
		"mod": true, "MOD": true, "+": true, "-": true, "*": true, "/": true, "^": true
	},

	store: function(x, name) { ME["@var_store"](x, calculator.quote(name)); }, // convenience function for storing a variable from JS
	nameFromArg: function(name) { if (!this.isAName(name)) throw Error(name + " is not a name"); return (name[0] == "'" ? name.slice(1, (name.match(/\(\)\'$/) ? -3 : -1)) : name); }, // ' ))))))this comment to fix syntax coloring

	typeOf: function(val) { return this.unquote(this.functions["@typeof"](val)); },
	isAnRPLProgram: function(val) { return (typeof name === "string" && val[0] == "\u226a"); },
	isAName: function(val) { return (typeof name === "string" && val[0] == "'" && val[val.length-1] == "'"); },
	isALikelyExpression: function(val) { return (val.match(/[\-\+\*\/\^\!\%\=\<\>\(]/) != null); },
	isALikelyExpressionOrName: function(s) { return (typeof s === "string" && (calculator.typeOf(s) == "expression or name" || calculator.isALikelyExpression(s) || s.match(/^[a-zA-z]$/))); },
	isAFirmString: function(val) { return (typeof name === "string" && val[0] == '"'); },
	isAMatrix: function(val) { if (!(typeof val === "object" && "length" in val && typeof val[0] === "object" && "length" in val[0])) return false; var rowLength = val[0].length; for (var i=1; i<val.length; i++) if (!(typeof val[i] === "object" && "length" in val[i] && val[i].length == rowLength)) return false; return true; },
	isAVector: function(val) { return (typeof val === "object" && "length" in val); },
	isADecimalNumber: function(val) { return String(val).match(/^[-+]?(?:(?:[0-9]+[.]?[0-9]*)|(?:[.][0-9]+))(?:[Ee][-+]?[0-9]+)?$/) != null; },
	isASmallInteger: function(val) { return String(val).match(/^[0-9]{1,14}$/) != null; },
	isALikelyLiteral: function(val) { return "'\"\u226a[(".indexOf(val[0]) != -1; },
	isAComplexNumber: function(val) { return this.complexParts(val, true) != null; },
	isABinaryNumber: function(val) { return (this.functions.binary.baseOf(val) != 0 && String(val).match(/[\.eE]/) == null); },
	isAHexNumberString: function(x) { return (typeof name === "string" && x.match(/^0x[0-9a-fA-F]+$/) != null); },
	isAnOctNumberString: function(x) { return (typeof name === "string" && (x.match(/^0[0-7]+$/) != null || x.match(/^[0-7]+o$/) != null)); },
	isATrueBinaryNumberString: function(x) { return (typeof name === "string" && x.match(/^[01]+b$/) != null); },
	isABoolean: function(val) { return (typeof val === "boolean" || val == 'false' || val == 'true'); },
	isADataURL: function(val) { return (typeof val === "string" && val.slice(0, 11) == '"data:image'); },
	isAnObjectString: function(val) { return (typeof val === "string" && val[0] == "{"); },
	isAFunctionString: function(val) { return (typeof val === "string" && val.lastIndexOf("function", 0) == 0); },
	isANaturalMathFunctionString: function(val) { return (typeof val === "string" && val.lastIndexOf("f(", 0) == 0); },

	complexParts: function(c, testOnly) { if (typeof c == "number") return [c, 0]; var arr = String(c).match(/^[(]([^\u005b,()]+),([^,()]+)[)]$/); if (arr == null || arr.length != 3) { if (testOnly) return null; else return new Array(c, 0); } else { arr.shift(); arr[0] = +arr[0]; arr[1] = +arr[1]; return arr; }  },
	///was (old, before JSON to archive stack): makeNumbersNumberObjects: function(arr) { var l=arr.length; for (var i=0; i<l; i++) if (calculator.isANumber(arr[i])) arr[i] = eval(arr[i]); },
	nameAndUnit: function(str) { return str.match(/(.+)\s\u005b(.+)\u005d/); },

	exec: function() {
		var callString = "calc";
		for (var i=0; i<arguments.length; i++)
			callString += "::" + encodeURIComponent(arguments[i]);
        if (typeof module === 'Object' && webkit.messageHandlers && webkit.messageHandlers.host)
            webkit.messageHandlers.host.postMessage({ "message": callString });
		else if (clientInformation.platform != "MacIntel")
			document.location = callString;
	},

	setOperationalMode: function(op_mode) {
		this.mode.operation.name = op_mode;
		this.mode.operation.wantsStackDisplay = (op_mode == 'RPN' || op_mode == 'Normal');
		this.mode.operation.wantsDynamicStack = (op_mode == 'RPN' || op_mode == 'Normal');
		this.mode.operation.wantsSymbolicMath = (op_mode == 'RPN' || op_mode == 'Normal');
	},

	mapStringsInString: function(str, map) {
		var s;
		for (var mapping in map)
			while ((s = str.replace(mapping, map[mapping])) != str)
				str = s;
		return str;
	},
	
	show: function() {
		if (this.mode.operation.wantsStackDisplay && display.wantsStackDisplay) {
			var l = this.stack.length;

			if (this.mode.operation.wantsDynamicStack)
				display.showStack(l);

			var stackPositions = document.getElementsByClassName("stackPos");
			var n = stackPositions.length;
			for (var i=0; i<n; i++) {
				var item = this.stack[l-1-i];
				if (typeof item == "object") {
					if ("inVector" in item)
						delete item.inVector;
					if ("inMatrix" in item)
						delete item.inMatrix;
				}
				stackPositions[n-1-i].innerHTML = display.stringForItem(item);
			}

			display.scrollToBottom(); // todo: doesn't always work: enter "1;2"
		}
	},

	draw1D: function(expressionOrFname, equationIndex) { // expressionOrFname is an algebraic expression or program name or name of function taking one arg
		var useHTML5CanvasText = false; // change to true as soon as .fillText is supported

		if (!(!useHTML5CanvasText && require("canvastext.js", true)))
			return;
		// alert("draw1D " + expressionOrFname + "; index: " + equationIndex);

		// make sure input is acceptable
		var isRPLProgram = this.isAnRPLProgram(expressionOrFname);
		var isAlgebraic = (this.isAName(expressionOrFname) && !this.isFunction(this.unquote(expressionOrFname)));

		expressionOrFname = this.unquote(expressionOrFname);

		// find function (and its collection), if not an RPL program or expression
		var func, functionCollection;
		if (!isAlgebraic && !isRPLProgram) {
			if (!this.isFunction(expressionOrFname))
				throw Error(expressionOrFname + " is not a known function");
			if (expressionOrFname in this.function_aliases)
				expressionOrFname = this.function_aliases[expressionOrFname];
			functionCollection = this.functions;
			func = functionCollection[expressionOrFname];
			if (func == undefined) {
				functionCollection = this.functions[this.currentDataCategory];
				func = functionCollection[expressionOrFname];
			}
			if (func == undefined)
				throw Error("Function must be real-valued and be built-in or exist in the current data folder.");
			var n_args = this.numberOfArgsForFunctionWithName(expressionOrFname);
			if (n_args != 1)
				throw Error("Function must take exactly one argument. " + expressionOrFname + " is taking " + n_args);
		}

		if (isAlgebraic)
			var expression = calculator.evaluableExpressionForExpression(expressionOrFname); // was: expressionOrFname = this.unquote(expressionOrFname);

		// input setup vars or defaults
		var params = this.vars[this.currentDataCategory]["PPAR"];
		var minParams = (params && params[0]) ? params[0].match(/\((.+),(.+)\)/) : [, 0, -1];
		var maxParams = (params && params[1]) ? params[1].match(/\((.+),(.+)\)/) : [, 1, +1];
		var independent = (params && params[2]) ? this.unquote(params[2]) : undefined;
		if (independent == undefined && isAlgebraic)
			independent = calculator.independentInExpression(expression);
		
		// optimization: if applicable, transform algebraic expression into JS function
		if (isAlgebraic) {
			func = calculator.functionForEvaluableExpression(expression, independent);
			isAlgebraic = false;
		}

		var width = canvas.width;
		var height = canvas.height;
		var x_start = parseFloat(minParams[1]);
		var x_end = parseFloat(maxParams[1]);
		var x_span = (x_end - x_start);
		var x_step = x_span / width;
		var y_start = parseFloat(minParams[2]);
		var y_end = parseFloat(maxParams[2]);
		var y_span = (y_end - y_start);

		var x2px = function(x) { return (x - x_start) / x_span * width; };
		var y2py = function(y) { return height - ((y - y_start) / y_span * height) };
		
		var ctx = canvas.getContext('2d');
		ctx.setLineWidth(0);
		var strokeStyle = (!equationIndex ? 'rgb(128, 128, 255)' : 'rgb(100, 215, 100)'); // first equation in blue, then green

		// draw axes and ticks
		ctx.strokeStyle = 'rgb(180, 180, 180)';
		ctx.beginPath();
		
		// axes
		ctx.moveTo(x2px(x_start), y2py(0));
		ctx.lineTo(x2px(x_end), y2py(0));
		ctx.moveTo(x2px(0), y2py(y_start));
		ctx.lineTo(x2px(0), y2py(y_end));
		
		// ticks
		var drawVerticalTickAt = function(x) {
			ctx.moveTo(x2px(x), y2py(0)-4);
			ctx.lineTo(x2px(x), y2py(0)+4);
			if (useHTML5CanvasText) {
				var text = display.stringForNumber(x, Math.max(-calculator.functions.exponent(x_span)+2, 3));
				if (x < 0) {
					var size = ctx.measureText(text).width;
					ctx.fillText(text, x2px(x)-width-3, y2py(0)+9);
				}
				else
					ctx.fillText(text, x2px(x)+3, y2py(0)+9);
			}
		}
		var drawHorizontalTickAt = function(y) {
			ctx.moveTo(x2px(0)-4, y2py(y));
			ctx.lineTo(x2px(0)+4, y2py(y));
			if (useHTML5CanvasText) {
				var text = display.stringForNumber(y, Math.max(-calculator.functions.exponent(y_span)+2, 3));
				var size = ctx.measureText(text).width;
				ctx.fillText(text, x2px(0)-size-3, y2py(y)-2);
			}
		}
		// horizontal
		var tick_spacing = x_span / 10;
		if (tick_spacing > 1.0)
			tick_spacing = Math.ceil(tick_spacing);
		for (var x = 0; x > x_start; x -= tick_spacing)
			drawVerticalTickAt(x);
		for (var x = tick_spacing; x < x_end; x += tick_spacing)
			drawVerticalTickAt(x);
		// vertical
		var tick_spacing = y_span / (10 * (height/width));
		if (tick_spacing > 1.0)
			tick_spacing = Math.ceil(tick_spacing);
		for (var y = 0; y > y_start; y -= tick_spacing)
			drawHorizontalTickAt(y);
		for (var y = tick_spacing; y < y_end; y += tick_spacing)
			drawHorizontalTickAt(y);

		// draw legend
		var drawLegendForIndex = function(index) {
			var y = (height > width ? 10 : 65) + 15 * index;
			if (useHTML5CanvasText) {
				var text = expressionOrFname;
				var size = ctx.measureText(text).width;
				var x = width - 8 - size;
				ctx.fillText(text, x, y);
			}
			var boxsize = 10;
			ctx.fillStyle = strokeStyle;
			ctx.fillRect(width - 12 + 3, y-boxsize+2, boxsize, boxsize);
		}
		drawLegendForIndex(equationIndex);

		ctx.stroke();
		
		// draw text labels; integral version above doesn't work, so needs to do this all over again
		if (!useHTML5CanvasText) {
			CanvasTextFunctions.enable(ctx);
			ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";

			// ticks
			drawVerticalTickAt = function(x) {
				var text = display.stringForNumber(x, Math.max(-calculator.functions.exponent(x_span)+2, 3));
				if (x < 0)
					ctx.drawTextRight("", 7, x2px(x)-3, y2py(0)+9, text);
				else
					ctx.drawText("", 7, x2px(x)+3, y2py(0)+9, text);
			}
			drawHorizontalTickAt = function(y) {
				var text = display.stringForNumber(y, Math.max(-calculator.functions.exponent(y_span)+2, 3));
				ctx.drawTextRight("", 7, x2px(0)-3, y2py(y)-2, text);
			}
			// horizontal
			var tick_spacing = x_span / 10;
			if (tick_spacing > 1.0)
				tick_spacing = Math.ceil(tick_spacing);
			for (var x = 0; x > x_start; x -= tick_spacing)
				drawVerticalTickAt(x);
			for (var x = tick_spacing; x < x_end; x += tick_spacing)
				drawVerticalTickAt(x);
			// vertical
			var tick_spacing = y_span / (10 * (height/width));
			if (tick_spacing > 1.0)
				tick_spacing = Math.ceil(tick_spacing);
			for (var y = 0; y > y_start; y -= tick_spacing)
				drawHorizontalTickAt(y);
			for (var y = tick_spacing; y < y_end; y += tick_spacing)
				drawHorizontalTickAt(y);

			// legend text
			var y = (height > width ? 10 : 65) + 15 * equationIndex;
			var text = expressionOrFname;
			ctx.drawTextRight("", 9, width - 8, y, text);
		}

		// optimize eval machinery (and make sure the expression evaluates)
		if (isAlgebraic) {
			this.analytics.reset();
			this.vars[independent] = x_start;
			var result;
			try {
				result = this.eval(expressionOrFname);
			}
			catch(e) {
				throw e;
			}
			finally {
				delete this.vars[independent];
			}
			if (typeof result != "number")
				throw Error("CannotGraphExpression");
			this.analytics.eval();
			if (this.analytics.canDoFastEval)
				expressionOrFname = calculator.mapStringsInString(expressionOrFname, calculator.function_aliases);
		}
		// calculator.exec("log", "Can do fast: " + this.analytics.canDoFastEval);

		// plot function
		ctx.strokeStyle = strokeStyle;
		ctx.beginPath();
		var isFirstPoint = true;
		for (var x = x_start; x < x_end; x += x_step) {
			var y;
			if (func)
				y = func.call(functionCollection, x);
			else if (isRPLProgram) {
				this.stack.push(x);
				this.RPLProgram.run(expressionOrFname); // was: this.functions["@eval"](expressionOrFname);
				y = this.stack.pop();
			}

			// plot point
			var px = x2px(x);
			var py = y2py(y);
			if (isFirstPoint) {
				ctx.moveTo(px, py);
				isFirstPoint = false;
			}
			else				
				ctx.lineTo(px, py);
		}
		
		ctx.stroke();

		// clean-up
		if (isAlgebraic)
			delete this.vars[independent];

		delete canvas.backing;
		canvas.knob = new Image();
		canvas.knob.src = "knob.png";

		// dynamic parameters used by touch event handlers
		var ppar = canvas.graph_params = {};
		ppar.x_span = x_span;
		ppar.y_span = y_span;
		ppar.x_start = x_start;
		ppar.y_start = y_start;

		// install touch handlers, if not previously installed (that is, on first draw)
		if (!canvas.hasTouchMoveHandlers[equationIndex]) {
			canvas.hasTouchMoveHandlers[equationIndex] = true;

			canvas.addEventListener("touchmove", function(event) {
				display.detectedMove = true; // this is a move
				
				var ppar = canvas.graph_params;

				if (event.touches.length == 2 && display.beginFirstTouchPos && display.beginSecondTouchPos) {
					event.preventDefault();

					var pointMath = calculator.functions.complex;
					var firstTouchPos = pointMath.fromReal(event.touches[0].clientX, event.touches[0].clientY);
					var secondTouchPos = pointMath.fromReal(event.touches[1].clientX, event.touches[1].clientY);
					// calculator.exec("log", "current pos: " + firstTouchPos);

					var delta = pointMath["-"](secondTouchPos, firstTouchPos);
					// calculator.exec("log", "delta: " + delta);
					var center = pointMath["+"](firstTouchPos, pointMath["*"](delta, 0.5));
					// calculator.exec("log", "center: " + center);
					var dist = pointMath["abs"](delta);
					// calculator.exec("log", "dist: " + dist);
					
					// don't entertain too close-by finger positions
					if (dist < 10)
						return;
					
					var beginDelta = pointMath["-"](display.beginSecondTouchPos, display.beginFirstTouchPos);
					// calculator.exec("log", "begin delta: " + beginDelta);
					var beginCenter = pointMath["+"](display.beginFirstTouchPos, pointMath["*"](beginDelta, 0.5));
					// calculator.exec("log", "begin center: " + beginCenter);
					var beginDist = pointMath["abs"](beginDelta);
					// calculator.exec("log", "begin mag: " + beginDist);

					// determine scale and offset relative to begin pos
					var scaler = dist / beginDist; // relative scale factor
					var offset = pointMath["-"](center, beginCenter); // offset in pixels
					var offsetVals = calculator.complexParts(offset);
					offset = pointMath.fromReal(ppar.x_span/width * offsetVals[0], -ppar.y_span/height * offsetVals[1]); // offset in drawing space
					
					// write scale and offset into PPAR
					var params = calculator.vars.beginPPAR;
					var pmin = calculator.unquote(params[0]), pmax = calculator.unquote(params[1]);
					var ppar_span = pointMath["-"](pmax, pmin);
					var ppar_center = pointMath["+"](pmin, pointMath["*"](ppar_span, 0.5));
					// transform according to determined offset and scaler
					ppar_center = pointMath["-"](ppar_center, offset);
					ppar_span = pointMath["/"](ppar_span, scaler);
					// convert back into pmin, pmax
					pmin = pointMath["-"](ppar_center, pointMath["*"](ppar_span, 0.5));
					pmax = pointMath["+"](ppar_center, pointMath["*"](ppar_span, 0.5));
					// write into PPAR
					calculator.functions.insertIntoDrawParams(pmin, 0);
					calculator.functions.insertIntoDrawParams(pmax, 1);
									
					if (!display.redrawTimer) {
						display.redrawTimer = setInterval(function() {
															  if (display.needsRedraw) {
																  calculator.functions["@draw"]();
																  display.needsRedraw = false;
															  }
														  }, 50);
					}
					display.needsRedraw = true;
				}
				else { // single-finger tracking
					var isFirstGraph = equationIndex == 0;
					var isLastGraph = (equationIndex == display.nCurrentGraphs-1);

					if (isFirstGraph) {
						if (canvas.backing) // subsequent draw of first graph
							ctx.putImageData(canvas.backing, 0, 0); // start with backing store contents
						else // first draw of first graph
							canvas.backing = ctx.getImageData(0, 0, width, height); // take snapshot of canvas
					}

					var px = event.touches[0].clientX - canvas.offsetLeft;
					///var py = event.touches[0].clientY - canvas.offsetTop;
					if (isLastGraph)
						event.preventDefault();

					// compute x
					var x = ppar.x_start + px * ppar.x_span / width;

					// compute y
					var y;
					if (func)
						y = func.call(functionCollection, x);
					else if (isAlgebraic) {
						calculator.vars[independent] = x;
						y = (calculator.analytics.canDoFastEval ? eval("with(calculator.vars[calculator.currentDataCategory]) with(calculator.vars) with(calculator.vars.local) with(calculator.functions) with(calculator.functions[calculator.currentDataCategory]) {" + expressionOrFname + "}")
																: calculator.eval(expressionOrFname) ); // was: y = this.functions["@eval"](expressionOrFname);
						delete calculator.vars[independent];
					}
					else if (isRPLProgram) {
						calculator.stack.push(x);
						calculator.RPLProgram.run(expressionOrFname); // was: this.functions["@eval"](expressionOrFname);
						y = calculator.stack.pop();
					}

					// form x and y strings
					var x_str = x.toFixed(Math.max(-calculator.functions.exponent(ppar.x_span), 3));
					var y_str = y.toFixed(Math.max(-calculator.functions.exponent(ppar.y_span), 3));

					// draw knob
					var py = (height - ((y - ppar.y_start) / ppar.y_span * height));
					ctx.drawImage(canvas.knob, px-(canvas.knob.width/2), py-(canvas.knob.height/2));

					// draw (x, y) in colored rects
					if (height > 100) {
						var coordText = "(" + x_str + ", " + y_str + ")";
						var rectWidth = 120;///Math.max(ctx.measureText(coordText)+20, 120);
						ctx.fillStyle = strokeStyle;
						ctx.fillRect(width-rectWidth, height-25-10 + 20*equationIndex, rectWidth, 13);
						ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
						ctx.drawTextRight("", 9, width-16, height-25 + 20*equationIndex, coordText);
					}

					// communicate (x, y) to host
					if (isFirstGraph)
						calculator.exec("setEditLine", "(" + x_str + ", " + y_str + ")");
				}
			}, false);
		}

		if (!canvas.hasTouchStartAndEndHandlers) {
			canvas.hasTouchStartAndEndHandlers = true;

			canvas.addEventListener("touchstart", function(e) {
				display.detectedMove = false;
				if (e.touches.length == 2) {
					display.beginFirstTouchPos = ME.complex.fromReal(e.touches[0].clientX, e.touches[0].clientY);
					display.beginSecondTouchPos = ME.complex.fromReal(e.touches[1].clientX, e.touches[1].clientY);
					calculator.vars.beginPPAR = ME.getDrawParams();
					calculator.wantsVarStoreToSyncToHost = false;
					// calculator.exec("log", "Two touch started");
				}
				else
					calculator.beginTouch1 = calculator.beginTouch2 = undefined;
			}, false);

			canvas.addEventListener("touchend", function(e) {
				calculator.wantsVarStoreToSyncToHost = true;
				if (display.redrawTimer) { // a redraw timer was created
					clearInterval(display.redrawTimer);
					delete display.redrawTimer;
				}
				if (display.detectedMove) { // graph was dragged
					// since host stores were suspended, do a store of the current PPARs now that we resumed them
					ME.storeCurrentDrawParams();
				}
				if (!display.detectedMove && display.numberOfTouches == 1)
					calculator.exec("pushCurrentEditLine");
			}, false);
		}
	},
	
	drawBarChart: function(data, xcol, ycol) { // data is a matrix, with the indepedent and dependent data columns indicated by xcol and ycol respectively
		var graph = new CanvasGraph("canvas");
		graph.setDataset("data", data);
        graph.padding = {top: 5, left: 5, bottom: 5, right: 5};
        graph.fontSize = 10;
        graph.ylabels = {1: "1", 4: "2", 9:"3", 16:"4", 25: "5"};
        graph.labelWidth = 40;
        graph.xOriginIsZero = false;
        graph.xlabels = {1: "1", 4: "2", 9:"3", 16:"4", 25: "5"};
        graph.xtickSeparation = 80;

		graph.drawBarChart({"data": Color.blueColor() });
	},
	drawPieChart: function(data, xcol, ycol) {
        var graph = new CanvasGraph("canvas");
        graph.setDataset("data", data);
    
        graph.padding = {top: 5, left: 5, bottom: 5, right: 5};
        graph.fontSize = 10;
        ///graph.ylabels = {1: "1", 4: "2", 9:"3", 16:"4", 25: "5"}
        graph.labelWidth = 40;
    
        graph.drawPieChart("data");
	},
	drawLineChart: function(data, xcol, ycol) {
		if (require("MochiKit.js") && require("CanvasGraph.js")) {
			var graph = new CanvasGraph("canvas");
			graph.setDataset("data", data);
			graph.padding = {top: 2, left: 14, bottom: 8, right: 2};
			graph.fontSize = 10;
			///graph.ylabels = {1: "1", 2: "2", 3:"3", 4:"4", 5: "5"}
			graph.labelWidth = 40;
			graph.xOriginIsZero = false;

			graph.drawLinePlot({"data": Color.blueColor() });
		}
	},

	drawData: function(data, xcol, ycol) { // data is a matrix, with the indepedent and dependent data columns indicated by xcol and ycol respectively
		// make sure input is acceptable
		if (!(typeof data === "object" && data[0] && data[0][0] && typeof xcol === 'number' && typeof ycol === 'number')) {
			throw Error("bad arg");
		}

		// input setup vars or defaults
		var params = this.vars[calculator.currentDataCategory]["PPAR"];
		var minParams = (params && params[0]) ? params[0].match(/\((.+),(.+)\)/) : [, 0, -1];
		var maxParams = (params && params[1]) ? params[1].match(/\((.+),(.+)\)/) : [, 1, +1];

		var width = canvas.width;
		var height = canvas.height;
		var x_start = parseInt(minParams[1]);
		var x_end = parseInt(maxParams[1]);
		var x_span = (x_end - x_start);
		var y_start = parseInt(minParams[2]);
		var y_end = parseInt(maxParams[2]);
		var y_span = (y_end - y_start);

		var x2px = function(x) { return (x - x_start) / x_span * width; };
		var y2py = function(y) { return height - ((y - y_start) / y_span * height) };
		
		var ctx = document.getElementById('canvas').getContext('2d');
		ctx.setLineWidth(0);
		
		// draw axes
		ctx.strokeStyle = 'rgb(150, 150, 150)';
		ctx.beginPath();
		ctx.moveTo(x2px(x_start), y2py(0));
		ctx.lineTo(x2px(x_end), y2py(0));
		ctx.moveTo(x2px(0), y2py(y_start));
		ctx.lineTo(x2px(0), y2py(y_end));
		ctx.stroke();

		// plot function
		ctx.strokeStyle = 'rgb(128, 128, 255)';
		ctx.beginPath();
		var isFirstPoint = true;
		for (var i=0; i<data.length; i++) {
			var x = data[i][ycol];
			var y = data[i][xcol];

			// plot point
			var px = x2px(x);
			var py = y2py(y);
			ctx.fillRect(px, py, 4, 4);
		}
		
		ctx.stroke();
	},

	undo_stack: [],
	wantsUndo: true,
	take_undo_snapshot: function() {
		if (this.wantsUndo && !this.RPLProgram.isRunning)
			this.undo_stack = this.stack.clone();
	},
	undo: function() {
        var tmp = this.stack;
        this.stack = this.undo_stack;
        this.undo_stack = tmp;
        this.show();
	},

	push: function(a) {
		// alert("Push " + a);
		this.take_undo_snapshot();

		if (calculator.analytics.isLogging) {
/*			if (calculator.analytics.ignoreNextPush)
				calculator.analytics.ignoreNextPush = false;
			else
*/				calculator.analytics.log.push(a);
		}

		var typeString = typeof a;
		if (typeString === "number" || typeString === "object" || typeString === "boolean" || typeString === "undefined" || typeString === "function")
			this.stack.push(a);
		else if (this.isFunction(a))
			this.operate(a);
		else { // a string
            var pushVal;

            if (this.isADecimalNumber(a)) // this needs to go before the next test to make a literal like ".7" work
                pushVal = +a; // unary + is quickest way to convert string to number
            else if (a[0] == ".") // special case treatment for .vars; these are not found through the new mechanism which uses expr eval to lookup variables, instead of variable()
                pushVal = this.variable(a, true);

/* the following, coupled with a previous universal pushVal = this.variable(a, true) (which had a different behavior, and can no longer be used like this),
                was necessary to enable GolfScript script execution
			if (pushVal && typeof pushVal === "object" && "type" in pushVal && calculator.customTypes[pushVal.type].isLoaded && calculator.customTypes[pushVal.type].wantsExecution && "eval" in calculator.customTypes[pushVal.type]) {
				calculator.customTypes[pushVal.type].eval(pushVal);
			}
			else */ {
				try { // a is a string
					if (pushVal === undefined) {
						// a custom type?
						for (var type in this.customTypes) {
							if ("isStringRepresentation" in this.customTypes[type] && this.customTypes[type].isStringRepresentation(a)) {
								// alert('push: "' + a + '"; type is ' + type);
								pushVal = this.customTypes[type].fromString(a);
								// alert('pushval: ' + pushVal + '; type is ' + typeof pushVal);
								break;
							}
						}
					}
					if (pushVal === undefined) {
						// a literal?
						if (this.isAName(a) || this.isAnRPLProgram(a) || this.isAFirmString(a) || this.isAComplexNumber(a) || this.isABinaryNumber(a))
							pushVal = a;
					}
					/* was: subsumed by @eval; not including this here implies that object strings are evaluated rather than errorneously assigned as string here (in default halfsym mode)
					if (pushVal === undefined)
						pushVal = this.variable(a, true);
					 */
					if (pushVal === undefined)
						pushVal = ME["@eval"](a);
					
					// ND0 stack shrinker (w/ deceptive name)
					if (this.analytics.shouldDetermineEntropy && this.stack.length >= 2) {
						var a = this.stack.pop();
						var b = this.stack.pop();
						this.stack = [ b, a, pushVal ];
					}
					else
						this.stack.push(pushVal);
				}
				catch(e) {
					// alert(e.message);
					if (e instanceof SyntaxError || e instanceof EvalError)
						return false;
					this.stack.push("'" + a + "'");
				}
			}
		}

		this.show();

		return true;
	},
	pushArraySilently: function(argArray) {
		var saved_wantsStackDisplay = this.mode.operation.wantsStackDisplay; this.mode.operation.wantsStackDisplay = false;
		var saved_wantsUndo = this.wantsUndo; this.wantsUndo = false;
		try {
			for (var i=0; i<argArray.length; i++) this.push(argArray[i]);
		}
		catch(e) { throw e; }
		finally {
			this.mode.operation.wantsStackDisplay = saved_wantsStackDisplay;
			this.wantsUndo = saved_wantsUndo;
		}
	},
	pop: function() {
		this.take_undo_snapshot();
		var retval = this.stack.pop();
		this.show();
		return retval;
	},

	itemFromString: function(s) {
		var saved_wantsStackDisplay = this.mode.operation.wantsStackDisplay; this.mode.operation.wantsStackDisplay = false;
		var saved_wantsUndo = this.wantsUndo; this.wantsUndo = false;
		try {
			this.push(s);
		}
		catch(e) { throw e; }
		finally {
			this.mode.operation.wantsStackDisplay = saved_wantsStackDisplay;
			this.wantsUndo = saved_wantsUndo;
		}
		return calculator.stack.pop();
	},
	stringValueOfItem: function(item) {
		return (typeof item === "object" ? (("type" in item || "length" in item) ? this.customTypes[item.type || "vector"].toString(item) : JSON.stringify(item)) : String(item));
	},
	stringOfFirstStackItem: function() {
		var l = this.stack.length;
		if (l < 1)
			return "";
		else {
			var item = this.stack[l-1];
			return this.stringValueOfItem(item);
		}
	},
	stackItemWithTag: function(tag) {
		for (var i=this.stack.length-1; i>=0; i--)
			if (this.stack[i].tag == tag)
				return this.stack[i];
		// if we reach this point, the tag specifies a vector inside of a vector
		// search again; this time descend into vectors
		for (var i=this.stack.length-1; i>=0; i--)
			if (this.stack[i] instanceof Array)
				for (var j=this.stack[i].length-1; j>=0; j--)
					if (this.stack[i][j].tag == tag)
						return this.stack[i][j];
	},
	parenthesize: function(x) { return (typeof x == "string") ? "(" + x + ")" : x; },
	quote: function(x) { return "'" + String(x) + "'"; },
	unquote: function(x) { return (typeof x == "string") ? x.replace(/(^['"]|['"]$)/g, "") : x; }, // regexp was: /['"] ; remove "'"s )));
	completeMatrixString: function(x) { return x.replace(/\d\s*\u005b/g, function(match) { return match.slice(0,-1).replace(/\s+/,"") + "]," + match.slice(-1); }).replace(/\s+/g,","); }, // todo: fix intentation broken through this line

	scaleForUnitPrefixFromName: function(name) {
        if (name.length == 1)
            return 1;
        var prefix = (name[0] == "'" /*'*/ ? 1 : 0);
        switch(name[prefix]) {
            case 'y': return 1e-24; case 'z': return 1e-21; case 'a': return 1e-18; case 'f': return 1e-15; case 'p': return 1e-12; case 'n': return 1e-9; case 'u': return 1e-6; case 'm': return 1e-3; case 'c': return 1e-2; case 'd': return 1e-1; case 'h': return 1e2; case 'k': return 1e3; case 'M': return 1e6; case 'G': return 1e9; case 'T': return 1e12; case 'P': return 1e15; case 'E': return 1e18; case 'Z': return 1e21; case 'Y': return 1e24;
        }
        //was: throw Error("unknown SI prefix: " + prefix);
        return 1;
    },
	unitObjectFor: function(name) {
        var hasPotentialSIPrefix = (this.scaleForUnitPrefixFromName(name) != 1);
		var conversionObj = {};
        
        for (var pass=1; pass<=2; ++pass) {
            var nameWithoutPrefix = (pass == 2 && hasPotentialSIPrefix ? name.slice(1) : "");

            for (var unitCategoryName in this.vars.Units) {
                try {
                    conversionObj.SIUnit = this.nameAndUnit(unitCategoryName)[2];
                }
                catch (e) {
                    continue; // skip over Units which don't declare an SI unit as part of their name
                }

                // see if name is SI unit w/o or w/ prefix
                if (name == conversionObj.SIUnit || nameWithoutPrefix == conversionObj.SIUnit) {
                    conversionObj.factor = (name == conversionObj.SIUnit ? 1.0 : this.scaleForUnitPrefixFromName(name));
                    return conversionObj;
                }

                // search for name in Units
                var unitCategory = this.vars.Units[unitCategoryName];
                for (var unitName in unitCategory) {
                    try {
                        var names = this.nameAndUnit(unitName);
                        if (name == names[1] || name == names[2] || nameWithoutPrefix == names[1] || nameWithoutPrefix == names[2]) {
                            var scaler = ((nameWithoutPrefix == names[1] || nameWithoutPrefix == names[2]) ? this.scaleForUnitPrefixFromName(name) : 1.0);
                            var unitDefinition = unitCategory[unitName];
                            if (typeof unitDefinition == "number")
                                conversionObj.factor = unitDefinition * scaler;
                            else if (typeof unitDefinition == "object" && this.isAnRPLProgram(unitDefinition["to"]) && this.isAnRPLProgram(unitDefinition["from"])) {
                                conversionObj.to = unitDefinition["to"];
                                conversionObj.from = unitDefinition["from"];
                            }
                            else
                                throw Error("invalid unit definition: " + unitDefinition);
                            return conversionObj;
                        }
                    }
                    catch (e) {
                        continue; // skip over definitions which don't include name and [unit] parts
                    }
                }
            }
		}
		return undefined;
	},
	convert: function(amount, from, to, dontTryInverseConversion) {
		// if conversion does not involve an SI unit, first convert 'from' to appropriate SI unit, then convert from SI unit to 'to'
		try {
			var fromObj = this.unitObjectFor(from);
			var toObj = this.unitObjectFor(to);
			if (fromObj && toObj) {
				if (fromObj.SIUnit == toObj.SIUnit) {
					if (fromObj.factor && toObj.factor)
						return (amount * fromObj.factor / toObj.factor);
					else if (fromObj.factor && toObj.to)
						return this.calc(amount * fromObj.factor, toObj.to, "@eval");
					else if (fromObj.from && toObj.factor)
						return this.calc(amount, fromObj.from, "@eval") / toObj.factor;
					else if (fromObj.from && toObj.to)
						return this.calc(this.calc(amount, fromObj.from, "@eval"), toObj.to, "@eval");
					else
						throw Error("unsupported unit definition(s): " + fromObj.factor + ", " + toObj.factor);
				}
				else
					throw Error("units do not share the same SI unit");
			}
			else
				throw Error("conversion unit(s) not defined.");
		}
		catch (e) {
			throw Error("inconsistent internal data: " + e.message);
		}
	},

	convertLogToRPLProgram: function() {
		return "\u226a " + this.analytics.log.join(" ") + " \u226b";
	},

	RPLProgram: {
		isRunning: false,
		isMorphing: false,
		wantsSingleStepping: false, 
		eval: function(x) { this.run(x); },
		buildFunctionWrapper: function(name, category) { eval("calculator.functions[\"" + category + "\"][\"" + name + "\"] = function() { calculator.pushArraySilently(arguments); return calculator.functions['@eval'](calculator.vars[\"" + category + "\"][\"" + name + "\"]); }"); },
		tokenizeWithDelimiters: function(beginChar, endChar, RPLProgram_text) {
			var tokens = [];
			var separationCharacters = [' ', ','];
			var standaloneCharacters = separationCharacters.concat(["\n", "\t", "\u21e2"]); // was: /*, "\u2192", can't do this because of ->ARRAY etc.*/ /* "*", "/", including these prevents STO*, STO/ and =*, =/ from working */ /*"^", "!", "\u221a" sqrt*/]);
			var openingCharacters = ['"', "'", "(", "[", "{", "\u226a"];
			var closingCharacters = ['"', "'", ")", "]", "}", "\u226b"];
			var length = RPLProgram_text.lastIndexOf(endChar);
			for (var i=1; i<length; ) {
				var c = RPLProgram_text[i++];
				var token = c;
				if (standaloneCharacters.indexOf(c) == -1) {
					var bi = openingCharacters.indexOf(c);
					if (bi != -1) {
						var openingCount = 1;
						do {
							c = RPLProgram_text[i++];
							if (c == closingCharacters[bi])
								--openingCount;
							else if (c == openingCharacters[bi])
								++openingCount;
							token += c;
						}
						while (openingCount>0 && i<length);
						if (openingCount>0)
							throw Error("missing delimiter: " + closingCharacters[bi]);
					}
					else {
						if ((token == "@" || (token == "/" && RPLProgram_text[i] == "/") ) && RPLProgram_text[i] == " ") { // a comment
							while ((c = RPLProgram_text[i]) != '\n' && i<length)
								++i;
						}
						else {
							while (standaloneCharacters.indexOf(c = RPLProgram_text[i]) == -1 && i<length) {
								++i;
								token += c;
																 
								var bi = openingCharacters.indexOf(c);
								if (bi != -1) {
									var openingCount = 1;
								do {
									c = RPLProgram_text[i++];
									if (c == closingCharacters[bi])
										--openingCount;
									else if (c == openingCharacters[bi])
										++openingCount;
									token += c;
								}
								while (openingCount>0 && i<length);
								if (openingCount>0)
									throw Error("missing delimiter: " + closingCharacters[bi]);
								}
							}
						}
					}
				}
				if (separationCharacters.indexOf(token) == -1 && token != "\n" && token != "\t" && token != "@")
					tokens.push(token);
			}
			return tokens;
		},
		tokenize: function(RPLProgram_text) { return this.tokenizeWithDelimiters('\u226a', '\u226b', RPLProgram_text); },
		compile: function(tokens) {
			// alert("RPL (" + tokens.length + "): " + tokens.join(" | "));
			function Instruction(text) {
			    this.text = text;
				this.type = "unknown";
			};
			var keywords = ["FOR", "START", "DO", "UNTIL", "CASE", "IF", "THEN", "ELSE", "END", "STEP", "NEXT", "BREAK", "IFTB", "CONTINUE", "IFTC", "REPEAT", "WHILE", "HALT", "\u21e2", "\u2192"];
			var instructions = [];
			for (var i=0; i<tokens.length; i++) {
				var token = tokens[i];

				var instruction = new Instruction(token);
				instructions.push(instruction);

				// tag instruction
				do {
					var lengthOfToken = token.length;
					if (keywords.indexOf(token) != -1) { // a keyword?
						instruction.type = "keyword";
						break;
					}
					else if (token[0] == "=" && lengthOfToken >= 2 && token[1] != "=") { // = or =: op and not ==
						var nameStart = 1;
						if (token[1] == ":") {
							if (lengthOfToken == 2)
								throw Error("missing var name after =:");
							instruction.shouldPeek = true;
							nameStart = 2;
						}
						instruction.type = "local_op";
						if (token[lengthOfToken-1] == "]") { // an array
							var components = token.slice(nameStart).match(/([^\u005b]+)\u005b(.+)\u005d$/);
							if (!components)
								throw Error("incorrect syntax involving array write accessor");
							instruction.command = "write_array";
							instruction.data = components[1];
							var subcomponents = components[2].match(/(.+):([01])$/);
							instruction.indexExpression = (subcomponents ? subcomponents[1] : components[2]);
							if (subcomponents)
								instruction.wantsZeroBasedIndexing = (subcomponents[2] == "0");
							var with_insert = "with (calculator.vars[\"" + calculator.currentDataCategory + "\"]) with (calculator.vars.local) with (calculator.functions) with (calculator.functions[\"" + calculator.currentDataCategory + "\"])";
							instruction.getIndex = new Function(with_insert + "{" + "return " + calculator.mapStringsInString(instruction.indexExpression, calculator.function_aliases) + "}");
						}
						else {
							if ("+-*/".indexOf(token[nameStart]) != -1) { instruction.extraOp = token[nameStart]; ++nameStart; }
							instruction.command = "assign";
							instruction.data = token.slice(nameStart); // name of local
						}
						break;
					}
					else if (lengthOfToken > 1 && ((token[0] == "+" && token[1] == "+") || (token[0] == "-" && token[1] == "-"))) { // ++ or -- op
						instruction.type = (lengthOfToken == 2 ? "stack_op" : "local_op");
						instruction.command = (token[0] == "+" ? "incr" : "decr");
						instruction.data = token.slice(2);
						break;
					}
					else if (token[lengthOfToken-1] == "]" && token[0] != "[") { // [] op
						var components = token.match(/([^\u005b]+)\u005b(.+)\u005d$/);
						if (!components) {
							if (token == "0[]") {
								instruction.type = "local_op";
								instruction.command = "select_zero_based_indexing";
								break;
							}
							if (token == "any[]") {
								instruction.type = "local_op";
								instruction.command = "select_any_based_indexing";
								break;
							}
							throw Error("incorrect syntax involving array accessor");
						}
						instruction.type = "local_op";
						instruction.command = "read_array";
						instruction.data = components[1];
						var subcomponents = components[2].match(/(.+):([01])$/);
						instruction.indexExpression = (subcomponents ? subcomponents[1] : components[2]);
						if (subcomponents)
							instruction.wantsZeroBasedIndexing = (subcomponents[2] == "0");
						var with_insert = "with (calculator.vars[\"" + calculator.currentDataCategory + "\"]) with (calculator.vars.local) with (calculator.functions) with (calculator.functions[\"" + calculator.currentDataCategory + "\"])";
						instruction.getIndex = new Function(with_insert + "{" + "return " + calculator.mapStringsInString(instruction.indexExpression, calculator.function_aliases) + "}");
						break;
					}
					else if (token == "0" && i<tokens.length-1) { // possible compare against zero
						var comparisons = ["<=", "\u2264", ">=", "\u2265", "<", ">", "==", "!=", "\u2260"];
						if (comparisons.indexOf(tokens[i+1]) != -1) {
							instruction.type = "stack_op";
							instruction.command = tokens[++i];
							instruction.arg = 0;
							break;
						}
					}
					else if (calculator.functions[(calculator.function_aliases[token] || token)] && (calculator.function_aliases[token] || token)[0] == "@") { // a catch-all function?
						instruction.type = "function";
						instruction.data = calculator.functions[(calculator.function_aliases[token] || token)];
						instruction.nArgs = calculator.numberOfArgsForFunctionWithName(token);
						break;
					}
					else if (calculator.isFunction(token)) { // a function/operator?
						instruction.type = "operator";
						instruction.nArgs = calculator.numberOfArgsForFunctionWithName(token);
						break;
					}
																 
					// a custom type literal?
					var isACustomLiteral = false;
					for (var type in calculator.customTypes) {
						if ("isStringRepresentation" in calculator.customTypes[type] && calculator.customTypes[type].isStringRepresentation(token)) {
							instruction.type = "literal";
							instruction.data = calculator.customTypes[type].fromString(token);
							isACustomLiteral = true;
							break;
						}
					}
					if (isACustomLiteral)
						break;

					// a built-in type literal?
					if (calculator.isADecimalNumber(token)) {
						instruction.type = "literal";
						instruction.data = parseFloat(token);
					}
					else if (calculator.isABinaryNumber(token)) {
						instruction.type = "literal";
						instruction.data = calculator.functions.binary.toDec(token);
					}
					// was: else if (calculator.isALikelyLiteral(token)) {
					else if (calculator.isAName(token) || calculator.isAFirmString(token) || calculator.isAnRPLProgram(token) || calculator.isAComplexNumber(token)) {
						instruction.type = "literal";
						instruction.data = instruction.text;
					}
					else // todo: remove when all functions that expect an expression, can take a function too (i.e., allow for both representations in expr data type and make this a private detail); as is, this "else" makes that explicit expressions (such as 'FP(x)') are left alone (not translated into a function)
					// an algebraic expression?
					// console.log("Unrecognized: " + token + "; isALikelyExpression: " + calculator.isALikelyExpression(token));
					if (calculator.isALikelyExpression(token)) {
						try {
							var expression = calculator.evaluableExpressionForExpression(token);
							// console.log("expr : " + expression + " (" + typeof expression + "); from token: " + token);
							if (typeof expression == "string" && !calculator.isAComplexNumber(expression)) {
								instruction.data = calculator.functionForEvaluableExpression(expression);
								instruction.type = "function";
								instruction.nArgs = 0;
							}
							else if (expression != undefined) { // a literal
								instruction.type = "literal";
								instruction.data = expression; // number, or boolean, or complex number, etc.
							}
						}
						catch(e) {} // do nothing; i.e. continue to default to "unknown"
					}

					break;
				}
				while (true);
			}
			// alert(JSON.stringify(instructions));
			return instructions;
		},
		run: function(instructions) {
			// console.log("run: " + instructions);
			try {
				var savedLocalVarStore = calculator.vars.local;
				var savedWantsStackDisplay = calculator.mode.operation.wantsStackDisplay;
				var savedIsRunning = this.isRunning;
				var savedWantsSingleStepping = this.wantsSingleStepping;
				var savedWantsEntropy = calculator.analytics.shouldDetermineEntropy; // ND0
				var savedIsLogging = calculator.analytics.isLogging;

				this.isRunning = true;

				if (typeof instructions == "string")
					instructions = this.compile(this.tokenize(instructions));

				// control structures needed below
				var conditionals = [];
				function ConditionalFrame() {
					this.shouldSkipELSEBlock = false;
					this.END = function(i, instructions) {
						if (this.endIndex)
							i = this.endIndex;
						else {
							var openStructures = 1;
							for (; i<instructions.length; i++) {
								if (instructions[i].text == "END")
									--openStructures;
								else if (instructions[i].text == "IF" || instructions[i].text == "WHILE" || instructions[i].text == "DO")
									++openStructures;
								if (!openStructures)
									return i;
							}
							throw Error("missing END");
						}
						return i;
					};
					this.ELSEorEND = function(i, instructions) {
						var openStructures = 1;
						for (; i<instructions.length; i++) {
							if (instructions[i].text == "END")
								--openStructures;
							else if (instructions[i].text == "THEN" || instructions[i].text == "WHILE" || instructions[i].text == "DO")
								++openStructures;
							
							if (!openStructures || (openStructures == 1 && instructions[i].text == "ELSE"))
								return i;
						}
						throw Error("missing ELSE or END");
					};
				}
				function getComparisonResult() {
					var comparisonVal = calculator.stack.pop(); /// was: calculator.pop(); todo: confirm this still works
					return ((typeof comparisonVal !== "number" && calculator.typeOf(comparisonVal) == 'expression or name') ? calculator.eval(calculator.unquote(comparisonVal)) != false : comparisonVal != false);
				}
																 
				var loops = [];
				function LoopFrame(from, to, index) {
					this.counter = this.from = from;
					this.to = to;
					this.instructionIndex = index;
					this.ENDLOOP = function(i, instructions) {
						if (this.endIndex)
							i = this.endIndex;
						else {
							var openStructures = 1;
							for (; i<instructions.length; i++) {
								if (instructions[i].text == "NEXT" || instructions[i].text == "STEP")
									--openStructures;
								else if (instructions[i].text == "FOR" || instructions[i].text == "START")
									++openStructures;
								if (!openStructures)
									return i+1;
							}
							throw Error("missing NEXT or STEP");
						}
						return i;
					};
				}

				// set up local var store;
				// the idea here is that new definitions are going to "blend" with the old ones, where new definitions of existing vars supersede the old ones (in this frame)
				var localVars = calculator.vars.local.clone(); // locally defined vars; take copy of existing locals
				calculator.vars.local = localVars; // alias our var store to the known name for locals
				// alert(JSON.stringify(localVars));

				calculator.mode.operation.wantsStackDisplay = false;
				calculator.analytics.shouldDetermineEntropy = false;
				calculator.analytics.isLogging = false;

				// iterate over instructions
				for (var i=0; i<instructions.length; ) {
					var instruction = instructions[i++];
					// if (!confirm("Instruction: " + instruction.text)) break;

					if (instruction.type == "keyword") {
						if (instruction.text == "HALT") {
							this.wantsSingleStepping = true;
						}
						else if (instruction.text == "\u21e2" || instruction.text == "\u2192") { // right arrow
							// alert("Hit right arrow");
							// define local execution environment, with local vars from stack entries and execute RPLProgram or algebraic expression

							// set up (block-)local var store;
							var blockVars = calculator.vars.local.clone(); // block-locally defined vars; take copy of existing locals
							calculator.vars.local = blockVars; // alias this var store to the known name for locals

							// collect var names
							var varNames = [];
							instruction = instructions[i++];
							var instructionIsEvaluable = false;
							while (!(instructionIsEvaluable = (instruction.text.charAt(0) == "\u226a" || instruction.text.charAt(0) == "'" /* ' */)) && i<instructions.length) {
								// alert("Collecting name: " + instruction.text);
								varNames.unshift(instruction.text);
								instruction = instructions[i++];
							}
							
							// error checking
							if (!instructionIsEvaluable)
								throw Error("missing expression or program in \u21e2 statement");
							/* todo: remove (probably); could do this, but wouldn't be compatible with 50g, which ignores how many vars are being assigned before an expression appears
							 if (instruction.text.charAt(0) == "'" && varNames.length != 1)
								throw Error("incorrect count of arguments for expression");*/
							if (varNames.length > calculator.stack.length)
								throw Error("too few arguments on stack");

							// define vars; get contents from stack
							for (var j=0; j<varNames.length; j++) {
								blockVars[varNames[j]] = calculator.pop();
								if (this.wantsSingleStepping)
									alert("RPL definition:\n" + varNames[j] + " is: " + blockVars[varNames[j]]);
							}
							
							// instruction is now an evaluable
							if (this.wantsSingleStepping)
								alert("RPL:\n" + "About to eval: " + instruction.text);
							var retVal = calculator.functions["@softnum"](instruction.text);
							if (retVal) // undefined (= no) return from eval'ed program is fine
								calculator.push(retVal);
								
							calculator.vars.local = localVars; // revert from block vars to local
						}

						// IF, CASE, THEN, ELSE
						else if (instruction.text == "IF") {
							conditionals.unshift(new ConditionalFrame());
						}
						else if (instruction.text == "CASE") {
							conditionals.unshift(new ConditionalFrame());
							conditionals[0].isCASE = true;
						}
						else if (instruction.text == "THEN") {
							if (conditionals[0] == undefined)
								throw Error("missing IF");
							if (calculator.stack.length < 1)
								throw Error("too few arguments on stack");
							var comparisonResult = getComparisonResult();
							if (comparisonResult)
								conditionals[0].shouldSkipELSEBlock = true;
							else {
								i = conditionals[0].ELSEorEND(i, instructions); // skip current (THEN) block until ELSE or END
								if (conditionals[0].isCASE)
									++i;
							}
							if (this.wantsSingleStepping)
								alert("RPL conditional:\n" + "Hit THEN [" + conditionals.length + "]\ncompare value: " + comparisonResult + (conditionals[0].shouldSkipELSEBlock ? "\n(will skip ELSE)" : ""));
						}
						else if (instruction.text == "ELSE") {
							if (conditionals[0] == undefined)
								throw Error("errant ELSE");
							if (this.wantsSingleStepping)
								alert("RPL conditional:\n" + "Hit ELSE [" + conditionals.length + "]" + (conditionals[0].shouldSkipELSEBlock ? "\n(will skip)" : ""));
							if (conditionals[0].shouldSkipELSEBlock)
								i = conditionals[0].END(i, instructions); // skip current (ELSE) block until END
						}

						// WHILE, REPEAT
						else if (instruction.text == "WHILE") {
							conditionals.unshift(new ConditionalFrame());
							conditionals[0].instructionIndex = i;
							conditionals[0].isWHILE = true;
						}
						else if (instruction.text == "REPEAT") {
							// alert(conditionals.length + "REPEAT: " + JSON.stringify(conditionals[0]));
							if (!(conditionals[0] && conditionals[0].instructionIndex))
								throw Error("missing WHILE");
							if (calculator.stack.length < 1)
								throw Error("too few arguments on stack");
							conditionals[0].hasREPEAT = true;
							var comparisonResult = getComparisonResult();
							if (this.wantsSingleStepping)
								if (!confirm("RPL while-loop:\n" + "REPEAT compare val: " + comparisonResult))
									this.wantsSingleStepping = false;

							if (comparisonResult)
								;
							else {
								i = conditionals[0].END(i, instructions); // skip until END
								// alert("Skipped to: " + i + ": " + instructions[i].text);
								delete conditionals[0].instructionIndex; // de-activate the while
							}
						}

						// DO, UNTIL
						else if (instruction.text == "DO") {
							// alert(conditionals.length + "DO: " + JSON.stringify(conditionals[0]));
							conditionals.unshift(new ConditionalFrame());
							conditionals[0].instructionIndex = i;
							conditionals[0].isDO = true;
						}
						else if (instruction.text == "UNTIL") {
							// alert(conditionals.length + "UNTIL: " + JSON.stringify(conditionals[0]));
							if (!(conditionals[0] && conditionals[0].instructionIndex))
								throw Error("missing DO");
							conditionals[0].hasUNTIL = true;
						}

						// END for IF, WHILE, DO
						else if (instruction.text == "END") {
							if (conditionals[0] == undefined)
								throw Error("errant END");
							
							if (conditionals[0].isDO) {
								// alert(conditionals.length + "END DO: " + JSON.stringify(conditionals[0]));
								if (conditionals[0].hasUNTIL) {
									if (calculator.stack.length < 1)
										throw Error("too few arguments on stack");
									var comparisonResult = getComparisonResult();
									if (this.wantsSingleStepping)
										if (!confirm("RPL do-loop:\n" + "UNTIL compare value: " + comparisonResult))
											this.wantsSingleStepping = false;

									if (comparisonResult)
										conditionals.shift();
									else
										i = conditionals[0].instructionIndex;
								}
								else
									throw Error("missing UNTIL");
							}
							else if (conditionals[0].isWHILE) {
								// alert(conditionals.length + "END WHILE: " + JSON.stringify(conditionals[0]));
								if (conditionals[0].hasREPEAT) {
									if (conditionals[0].instructionIndex) {
										conditionals[0].endIndex = i-1;
										i = conditionals[0].instructionIndex;
									}
									else // a previously de-activated WHILE
										conditionals.shift();
								}
								else
									throw Error("missing REPEAT");
							}
							else if (conditionals[0].isCASE) {
								if (conditionals[0].shouldSkipELSEBlock) // this case hasn't hit the default case
									i = conditionals[0].ELSEorEND(i, instructions)+1; // skip all subsequent cases until end of CASE
								conditionals.shift();
							}
							else // IF
								conditionals.shift();
						}

						// START|FOR, NEXT|STEP
						else if (instruction.text == "START" || instruction.text == "FOR") {
							// alert ("Hit START/FOR");
							if (calculator.stack.length < 2)
								throw Error(instruction.text + " lacks the 'from' and/or 'to' values on stack");
							var to = calculator.pop();
							var from = calculator.pop();
							loops.unshift(new LoopFrame(from, to, (instruction.text == "FOR" ? i+1 : i)));
							if (instruction.text == "FOR") {
								var varName = instructions[i++].text.toString(); /// todo: can remove toString()?
								loops[0].varName = varName;
								localVars[varName] = loops[0].counter;
								if (this.wantsSingleStepping)
									alert ("RPL loop:\n" + "counter variable: " + varName + "\nvalue: " + localVars[varName]);
							}
						}
						else if (instruction.text == "NEXT" || instruction.text == "STEP" || instruction.text == "CONTINUE" || instruction.text == "IFTC") {
							var isContinue = (instruction.text == "CONTINUE" || instruction.text == "IFTC");
							var thisFor = loops[0];
							if (thisFor == undefined)
								throw Error("missing FOR or START");
							var comparisonResult = true;
							var counterIncrement = 1;
							if (instruction.text == "STEP") {
								if (calculator.stack.length < 1)
									throw Error("too few arguments on stack");
								counterIncrement = calculator.pop();
							}
							else if (instruction.text == "IFTC") {
								comparisonResult = getComparisonResult();
							}
							if (comparisonResult) {
								if (this.wantsSingleStepping)
									if (!confirm("RPL loop:\n" + "Hit " + (isContinue ? "CONTINUE/IFTC" : "NEXT/STEP") + " of counter " + thisFor.varName + "\n(" + thisFor.from + " to " + thisFor.to + ")\nvalue: " + thisFor.counter + "\nincrement: " + counterIncrement))
										this.wantsSingleStepping = false;
								thisFor.endIndex = i;
								if ((counterIncrement > 0 ? (thisFor.counter < thisFor.to) : (thisFor.counter > thisFor.to))) {
									thisFor.counter += counterIncrement;
									localVars[thisFor.varName] = thisFor.counter;
									i = thisFor.instructionIndex; // reset program counter to beginning of loop
								}
								else
									loops.shift();
							}
						}
						else if (instruction.text == "BREAK" || instruction.text == "IFTB") {
							var thisFor = loops[0];
							if (thisFor == undefined)
								throw Error("missing loop");
							var conditionCode = 1;
							var comparisonResult = true;
							if (instruction.text == "IFTB") {
								if (calculator.stack.length < 1)
									throw Error("too few arguments on stack");
								comparisonResult = getComparisonResult();
							}
							if (comparisonResult) {
								if (this.wantsSingleStepping)
									alert("RPL loop:\n" + "Hit BREAK of counter " + thisFor.varName + "\n(" + thisFor.from + " to " + thisFor.to + ")\nvalue: " + thisFor.counter);
								i = thisFor.ENDLOOP(i, instructions); // reset program counter to end of loop
								loops.shift();
							}
						}
					}
					else { // not an RPL keyword
						function formattedStackItemForPosition(n) {
							if (!(n>=0 && n<calculator.stack.length))
								return "";

							var obj = calculator.stack[n];
							var s;
							if (typeof s == "string")
								s = obj;
							else if (typeof obj == "object" && "type" in obj && obj.type in calculator.customTypes && "toString" in calculator.customTypes[obj.type])
								s = calculator.customTypes[obj.type].toString(obj) + " (" + obj.type + ")";
							else
								s = calculator.unquote(JSON.stringify(obj)); // unquote: don't want to extra double quotes for string or expr
							return s.slice(0,35);
						}
						if (this.wantsSingleStepping) {
							if (!confirm("RPL step (" + i + "):\n"
										 + formattedStackItemForPosition(calculator.stack.length-3) + "\n"
										 + formattedStackItemForPosition(calculator.stack.length-2) + "\n"
										 + formattedStackItemForPosition(calculator.stack.length-1) + "\n"
										 + "next: " + instruction.text + (localVars[instruction.text] != undefined ? " (" + localVars[instruction.text] + ")" : "")))
								break;
							/// calculator.exec("alert", "Step", "Push", "'" + instruction.text + "'");
							/// calculator.mode.operation.wantsStackDisplay = false;
							/// calculator.show();
						}
						switch (instruction.type) {
							case "function": {
								var args = [];
								for (var k=instruction.nArgs; k>0; k--)
									args.unshift(calculator.stack.pop());
								var retval = instruction.data.apply(calculator.functions, args);
								if (retval != undefined)
									calculator.stack.push(retval);
							} break;
							case "operator": calculator.operate(instruction.text, instruction.nArgs); break;
							case "literal": calculator.stack.push(instruction.data); break;
							case "local": calculator.stack.push(localVars[instruction.text]); break;
							case "stack_op": {
								var index = calculator.stack.length-1;
								if (index < 0) throw Error("stack underrun on attempt to execute " + instruction.command);
								var val = calculator.stack[index];
								var functionCollection = (typeof val == "number" ? calculator.functions : ((typeof val == "object" && "type" in val && val.type in calculator.customTypes && calculator.customTypes[val.type].isLoaded) ? calculator.customTypes[val.type] : undefined));
								if (functionCollection && instruction.command in functionCollection) {
									var arg = (functionCollection == BigNum && instruction.arg == 0 ? BigInteger.ZERO : instruction.arg);
									calculator.stack[index] = functionCollection[instruction.command].call(functionCollection, val, arg);
								}
								else
									switch(instruction.command) {
										case "incr": calculator.stack.push(1); calculator.operate("+", 2); break;
										case "decr": calculator.stack.push(1); calculator.operate("-", 2); break;
										default: calculator.stack.push(instruction.arg); calculator.push(instruction.command);
									}
								}
								break;
							case "local_op": {
								switch (instruction.command) {
									case "assign": {
										var stackVal = (instruction.shouldPeek ? calculator.stack[calculator.stack.length-1] : calculator.stack.pop());
										// alert("Assign " + instruction.data + ": " + stackVal + "; extra op: " + instruction.extraOp);
										if (!instruction.extraOp) localVars[instruction.data] = stackVal; 
										else {
											if (! (instruction.data in localVars))
												throw Error("undefined local: " + instruction.data);
											var val = localVars[instruction.data];
											if (typeof val == "number") {
												stackVal = +stackVal;
												switch (instruction.extraOp) {
													case '+': localVars[instruction.data] = val + stackVal; break;
													case '-': localVars[instruction.data] = val - stackVal; break;
													case '*': localVars[instruction.data] = val * stackVal; break;
													case '/': localVars[instruction.data] = val / stackVal; break;
												}
											}
											else {
												if (calculator.typeOf(val) == calculator.typeOf(stackVal)) {
													var functionCollection = ((typeof val == "object" && "type" in val && val.type in calculator.customTypes && calculator.customTypes[val.type].isLoaded) ? calculator.customTypes[val.type] : undefined);
													if (functionCollection && instruction.extraOp in functionCollection)
														localVars[instruction.data] = functionCollection[instruction.extraOp].call(functionCollection, val, stackVal);
													else
														throw Error("'" + instruction.extraOp + " 'not defined on local: " + instruction.data);
												}
												else
													localVars[instruction.data] = calculator.calc(val, stackVal, instruction.extraOp);
											}
										}
									} break;
									case "incr": 
									case "decr": {
										if (! (instruction.data in localVars))
											throw Error("undefined local: " + instruction.data);
										var val = localVars[instruction.data];
										if (typeof val == "number")
											localVars[instruction.data] = val + (instruction.command == "incr" ? 1 : -1);
										else {
											var functionCollection = ((typeof val == "object" && "type" in val && val.type in calculator.customTypes && calculator.customTypes[val.type].isLoaded) ? calculator.customTypes[val.type] : undefined);
											if (functionCollection && instruction.command in functionCollection)
												localVars[instruction.data] = functionCollection[instruction.command].call(functionCollection, val);
											else
												throw Error("'" + instruction.command + " 'not defined on local: " + instruction.data);
										}
									} break;
									case "select_zero_based_indexing": localVars["wantsZeroBasedIndexing"] = true; break;
									case "select_any_based_indexing": localVars["wantsAnyBasedIndexing"] = true; break;
									case "read_array": 
										var isReadAccess = true;
									case "write_array": {
										if (! (instruction.data in localVars))
											throw Error("undefined local: " + instruction.data);
										var datum = localVars[instruction.data];
										var isArray = (datum instanceof Array);
										if (! (isArray || (isReadAccess && typeof datum == "string")))
											throw Error("local '" + instruction.data + "' (" + calculator.typeOf(datum) + ") is not an array or string");
													///		alert("read_array: " + instruction.data);
														///	alert("func: " + instruction.getIndex);
														///	alert("k: " + calculator.vars.local);
														///	alert("localVars: " + (calculator.vars.local == localVars));
														///	alert("at: " + instruction.getIndex());
										var index = (instruction.indexExpression in localVars ? localVars[instruction.indexExpression] : instruction.getIndex());
										if (!localVars["wantsAnyBasedIndexing"]) {
											var wantsOneBasedIndexing = ! (instruction.wantsZeroBasedIndexing || localVars["wantsZeroBasedIndexing"]);
											if (wantsOneBasedIndexing)
												index -= 1;
											var length = datum.length;
											if (length && isReadAccess && true/*wantsCircularBuffer*/) {
												index = index % length;
												if (index < 0)
													index += length;
											}
											else if (index < 0 || index >= (datum.length + (isReadAccess ? 0 : 1))) // write access allows the element following the last to be set
												throw Error("index for array '" + instruction.data + "' out of range: " + (wantsOneBasedIndexing ? index+1 : index));
										}
										if (isReadAccess)
											if (isArray)
												calculator.stack.push(localVars[instruction.data][index]);
											else // string
												calculator.stack.push('"' + localVars[instruction.data][index+1] + '"');
										else { // "write_array"
											if (! calculator.stack.length)
												throw Error("stack underrun on attempt to assign " + instruction.data);
											localVars[instruction.data][index] = (instruction.shouldPeek ? calculator.stack[calculator.stack.length-1] : calculator.stack.pop());
										}
										isReadAccess = undefined; // to prevent spurious bug where isReadAccess, having function scope, remains defined true for duration of run()
									} break;
								}
								} break;
							default: {
								var localName;
								if (instruction.text in localVars) { // first (as of yet untyped) reference to a local
									instruction.type = "local"; // set type for more efficient treatment when hitting it the next time
									calculator.stack.push(localVars[instruction.text]); // could use normal calculator.push() but this is a little faster and emulates the non-evaluated recall of local vars in the HP line
								}
								else if ((instruction.text == "STO" || instruction.text == "@var_store") && (localName = calculator.nameFromArg(calculator.stack[calculator.stack.length-1])) in localVars) { // check for local var store
									calculator.stack.pop();
									var val = calculator.stack.pop();
									/*if (this.isMorphing)
										alert(localName + " = " + val + ";");
									else*/
										localVars[localName] = val;
								}
								else
									calculator.push(instruction.text);
								///	was: calculator.push(instruction in localVars ? localVars[instruction] : instruction);
							}
						}
					}
				}
			}
			catch (e) {
				calculator.exec("alert", "Program execution error", "Detail", e.message);
			}
			finally {
				calculator.vars.local = savedLocalVarStore;
				calculator.mode.operation.wantsStackDisplay = savedWantsStackDisplay;
				this.isRunning = savedIsRunning;
				this.wantsSingleStepping = savedWantsSingleStepping;
				calculator.analytics.shouldDetermineEntropy = savedWantsEntropy;
				calculator.analytics.isLogging = savedIsLogging;
				
				if (!this.isRunning)
					calculator.show();
			}
		}
	},

	// returns whether name is known as function of any type or function alias
	isFunctionCache: {},
	isFunction: function(name) { if (typeof name != "string") return false;
		if (name in this.functions[this.currentDataCategory]) // current data category functions cannot be cached (as they're dynamic)
			return true;
		if (name in this.isFunctionCache)
			return this.isFunctionCache[name];

		if (   name in this.function_aliases
			|| name in this.functions			/*|| name.toLowerCase() in this.functions*/
			|| name in this.functions.complex	/*|| name.toLowerCase() in this.functions.complex*/
			|| name in this.functions.matrix	/*|| name.toLowerCase() in this.functions.matrix*/
			|| name in this.functions.vector	/*|| name.toLowerCase() in this.functions.vector*/
			|| name in this.functions.binary	/*|| name.toLowerCase() in this.functions.binary*/
			|| name in this.functions.string	/*|| name.toLowerCase() in this.functions.string*/
			)
			return this.isFunctionCache[name] = true;
		// in custom type function collection?
		for (var type in this.customTypes)
			if (name in this.customTypes[type])
				return this.isFunctionCache[name] = true;
		// scoped function name?
		var nameComponents = name.split(".");
		return this.isFunctionCache[name] = ((nameComponents.length == 2 && calculator.functions[nameComponents[0]] && calculator.functions[nameComponents[0]][nameComponents[1]] != undefined) ? true : false);
	},

	// returns a (quote-less) expression that can be used in eval() or as body of a JS function, given a parseable expression
	evaluableExpressionForExpression: function(expression) {
		function inner(expression) {
			var saved_evalMode = calculator.mode.operation.eval;
			calculator.mode.operation.eval = "func";
			try { expression = calculator.eval(calculator.unquote(expression)); }
			catch(e) { throw e; }
			finally { calculator.mode.operation.eval = saved_evalMode; }
			// console.log("expr after \"func\"-mode eval: " + expression);
			return (typeof expression == "string" && calculator.isAName(expression) ? calculator.unquote(expression) : expression);
		};
		if (expression.indexOf("=") && !expression.indexOf(":=")) // an equation?
			expression = expression.split(/[ ]*=[ ]*/).map(inner).join("="); // this will convert the result to a string and assume that evaluation will return a type that is correctly represented via String(type)
		else
			expression = inner(expression); // this may return any type; such as a matrix
		return expression;
	},
	// returns the (first-encountered) independent in a given expression, or throws an exception if there's a parse or other error when evaluating expression, other than "no such variable"
	independentInExpression: function(expression) {
		// console.log("independentInExpression: " + expression);
		if (typeof expression == "number") return null;
		var saved_evalMode = calculator.mode.operation.eval;
		calculator.mode.operation.eval = "numeric";
		var independent;
		try {
			this.eval(this.unquote(expression));
		}
		catch (e) {
			var unknownVarError = "no such variable: ";
			var pos = e.message.indexOf(unknownVarError);
			if (pos != -1)
				independent = e.message.slice(pos + unknownVarError.length);
			else
				throw e;
		}
		finally { calculator.mode.operation.eval = saved_evalMode; }
		return independent;
	},
	// returns a JS function for an evaluable expression and string of comma-separated variable names
	functionForEvaluableExpression: function(evaluableExpression, varNames) {
		if (typeof evaluableExpression != "string")
			return new Function("{ return " + evaluableExpression + "}");
		var with_insert = "with (calculator.vars[\"" + calculator.currentDataCategory + "\"]) with (calculator.vars.local) with (calculator.vars) with (calculator.functions) with (calculator.functions[\"" + calculator.currentDataCategory + "\"])";
		return new Function(varNames, with_insert + "{" + "return " + evaluableExpression /*was: not required as evaluable expr will have no classic names: calculator.mapStringsInString(calculator.unquote(evaluableExpression), calculator.function_aliases)*/ + "; }");
	},
	// returns a JS function for any calculator-computable expression
	functionForExpression: function(expression) {
		expression = this.evaluableExpressionForExpression(expression); // convert expression to evaluable expression; e.g. 'x^2' becomes 'pow(x,2)'
		return this.functionForEvaluableExpression(expression, this.independentInExpression(expression));
	},
	zeroArgFunctionForExpression: function(expression) {
		expression = this.evaluableExpressionForExpression(expression); // convert expression to evaluable expression; e.g. 'x^2' becomes 'pow(x,2)'
		return this.functionForEvaluableExpression(expression);
	},
	expressionForRPN: function(RPN_ProgramText) { // currently assumes one arg in, one output datum
		return calculator.calc("'_x'", '\u226a' + RPN_ProgramText + '\u226b', 'EVAL');
	},
														
	// returns number of args for function of given name or alias
	// lacking type info on args, this will find the first function matching name; we assume that real- and complex-valued functions of identical names take the same # of args
	numberOfArgsForFunctionWithNameCache: {},
	numberOfArgsForFunctionWithName: function(name) {
		if (name in this.numberOfArgsForFunctionWithNameCache)
			return this.numberOfArgsForFunctionWithNameCache[name];

		// map name, if alias
		if (name in this.function_aliases)
			name = this.function_aliases[name];

		var func = ME[name]
				|| ME[this.currentDataCategory][name]
				|| ME.complex[name]
				|| ME.matrix[name]
				|| ME.vector[name]
				|| ME.binary[name]
				|| ME.string[name]
				;
		if (func == undefined) {
			// in custom type function collection? 
			for (var type in this.customTypes)
				if (name in this.customTypes[type])
					func = this.customTypes[type][name];
		}
		if (func == undefined) {
			// scoped function name?
			var nameComponents = name.split(".");
			if (nameComponents.length == 2 && calculator.functions[nameComponents[0]])
				func = calculator.functions[nameComponents[0]][nameComponents[1]];
			if (func == undefined) // still undefined?
				return -1;
		}

		var n_args = func.length || func.arity;
		
		return this.numberOfArgsForFunctionWithNameCache[name] = n_args;
	},

	// return contents for a given variable; all stores will be examined and two-level names will be resolved; an exception will be thrown if var doesn't exist
	variable: function(name, undefinedIsOk) {
		if (calculator.mode.operation.eval == "sym")
			return name;
		var result = this.vars[this.currentDataCategory][name];
		if (result === undefined)
			result = this.vars.local[name];
		if (result === undefined && (name.length > 2 || calculator.mode.operation.eval != "halfsym"))
			result = this.vars[name];
		// console.log("variable " + name + "; mode: " + calculator.mode.operation.eval + "; val: " + result);
		// alert("Variable '" + name + "' recall. Val: " + result);
		if (result === undefined) {
			var nameComponents = name.split(".");
			if (nameComponents.length == 2) {
                if (nameComponents[0] in this.vars.local)
                    result = this.vars.local[nameComponents[0]][nameComponents[1]];
                else if (nameComponents[0] in this.vars)
                    result = this.vars[nameComponents[0]][nameComponents[1]];
            }
			else if (calculator.mode.operation.eval == "halfsym" || calculator.mode.operation.eval == "func")
				return name;
			else if (!undefinedIsOk)
				throw Error ("no such variable: " + name);
		}
		return result;///(undefinedIsOk ? result : (result instanceof Object ? JSON.stringify(result) : result)); // undefinedIsOk double-duties as "wantsStringResult"; there're two users of this function: eval and push. eval/__parse will need string result; push is fine with objects (arrays, etc.)
	},

	// call a function/operator that returns one result and takes a variable # of args
	calc: function() {
		// console.log("calc (" + calculator.mode.operation.eval + "): " + JSON.stringify(arguments));
		// in symbolic modes, don't try to eval; instead return f(x,y,..)
		if (calculator.mode.operation.eval == "sym" || calculator.mode.operation.eval == "halfsym") {
			var arr = Array.prototype.slice.call(arguments);
			var cmd = arr[arr.length-1];
			arr.length = arr.length-1;
															 
			var wantsSymbolicProcessing = true;
															 
			// for simple operators (but not divide) and if args are all numbers, do not process symbolically
			if (cmd in calculator.infixOperators && cmd != "/") {
				var argsAreAllNumbers = true;
				for (var i=0; i<arr.length; i++) {
					if (!(calculator.isADecimalNumber(arr[i]) || calculator.isAComplexNumber(arr[i]))) {
						argsAreAllNumbers = false;
						break;
					}
				}
				wantsSymbolicProcessing = !argsAreAllNumbers; 
			}

			if (0&&wantsSymbolicProcessing)/////
				return this.unquote(ME.expr.symbolic(cmd, arr));
		}
		if ((calculator.mode.operation.eval == "numeric" || calculator.mode.operation.eval == "func") && !calculator.isFunction(arguments[arguments.length-1]))
			throw Error("no such function: " + arguments[arguments.length-1]);
		// alert(JSON.stringify(arguments));
		this.pushArraySilently(arguments); // push args and function/operator (last)
		return this.stack.pop(); // return result
	},
	
	// eval a mathematical expression, which can contain user vars and functions, complex, vector, matrix, etc math
	eval: function(expression) {
		// console.log("calculator.eval: " + expression);
/*
		var nErrors = __parse(expression);
		if (nErrors)
			throw Error("error in expression");
*/
		return __parse(expression); // return result
	},

	expressionToWAexpression: function(expr) {
		// test case for the following was: "4+5x+d2y(x)".replace(/([^A-z])?[Dd]([0-9])(.)/g, function(m, pre, n, c) { return pre + c + (new Array(parseInt(n)+1)).join("\u0027"); })
		expr = expr.replace(/([^A-z])?[Dd]([0-9])(.)/g, function(m, pre, n, c) { return (pre ? pre : "") + c + (new Array(parseInt(n)+1)).join("\u0027"); }); // change d1y(x) to y'(x) etc.
		var translationTable = { "neg": "-", "log": "lg10" };
		return calculator.mapStringsInString(calculator.unquote(expr), translationTable);
	},
	// slight misnomer; the following takes a W|A expression or number and returns an expression or number
	WAexpressionToExpression: function(str, options) {
		if (options) {
			if (options.right)
				str = ME.expr.right(str);
//			if (options.erase)
//				str = str.replace(options.erase, "");
			if (options.approx)
				str = str.replace(/.+~~[ ]/, ""); // strip everything but numerical approximation
			else if (!(str[2] == "~" && str[3] == "~")) // if something like "x ~~ 20"
				str = str.replace(/[ ]?~~.+/, ""); // strip numerical approximation
		}
		str = str.replace(/[ @]*([+-/~*=!])[ @]*/g, "$1"); // remove spaces (tmp: and @) around common operators
		var translationTable = { " and ": "&&&&", " element ": "\u2208", " ": "*", "@": "*",/*tmp*/ "pi": "\u03c0", "Cos": "cos", "Sin": "sin", "sqrt": "\u221a", "log": "ln", "lambda": "\u03bb", "+constant": "" };
		str = calculator.mapStringsInString(str, translationTable);
		str = str.replace(/&&&&/g, " and ");
		return (calculator.isADecimalNumber(str.replace(/[.]+$/, "")) ? parseFloat(str) : "'" + str + "'");
	},
	isWAmatrix: function(str) {
		return (str[0] == "(" && str[str.length-1] == ")" && str.indexOf("|") != -1);
	},
	WAmatrixToMatrix: function(str, options) {
		var arr = str.slice(1,-1).split(/\n/);
		function mixedTypesToType(x) { // interpret W|A expressions and number formattings; leave already recognized types alone
			return (typeof x == "string" ? calculator.WAexpressionToExpression(x, options) : x);
		}
		arr = arr.map(function(x) { return x.split(" | ").map(mixedTypesToType) });
		return arr;
	},
	isWAvector: function(str) {
		return ((str[0] == "{" && str[str.length-1] == "}") || (str[0] == "(" && str[str.length-1] == ")" && str.indexOf(", ") != -1));
	},
	WAvectorToVector: function(str, options) {
		if (str[0] == "(" && str[str.length-1] == ")") // transform (...) into {...} so that fromString will make it a vector
			str = "{" + str.slice(1,-1) + "}";

		function mixedTypesToType(x) { // interpret W|A expressions and number formattings; leave already recognized types alone
			return (typeof x == "string" ? calculator.WAexpressionToExpression(x, options) : x);
		}
		str = str.replace(/[,][ ]/g, ","); // replace any spaces after commas
		str = str.replace(/[ ]/g, "@"); // work-around: tmp measure while separationCharacter " " is active
		var v = ME.vector.fromString(str);
		if (calculator.isAMatrix(v)) {
			for (var i=0; i<v.length; i++) {
				v[i] = v[i].map(mixedTypesToType);
				if (options && options.vec2elem && v[i].length == 1) v[i] = v[i][0];
			}
		}
		else if (calculator.isAVector(v)) {
			v = v.map(mixedTypesToType);
			if (options && options.vec2elem && v.length == 1) v = v[0];
		}
		return v;
	},
	isWAcomplexNumber: function(str) {
		return (str.match(/^([+-]?[0-9.]+)[.][.][.][ ]([+-])\n([+-]?[0-9.]+)[.][.][.][ ]i$/) != null);
	},
	WAcomplexNumberToComplex: function(str, options) {
		var parts = str.match(/^([+-]?[0-9.]+)[.][.][.][ ]([+-])\n([+-]?[0-9.]+)[.][.][.][ ]i$/);
		return ME.complex.fromReal(parseFloat(parts[1]), parseFloat(parts[2]+parts[3]));
	},
	WAtypeToType: function(str, options) {
		// alert("in: " + str + " (" + typeof str + ")");
		if (options) {
			if (options.erase)
				str = str.replace(options.erase, "");
			if (options.rright)
				str = ME.expr.right(str);
		}
		if (str == "(no solutions exist)")
			return ME.string.toString(str.slice(1,-1));

		if (calculator.isWAmatrix(str))
			return calculator.WAmatrixToMatrix(str, options);
		else if (calculator.isWAvector(str))
			return calculator.WAvectorToVector(str, options);
		else if (calculator.isWAcomplexNumber(str))
			return calculator.WAcomplexNumberToComplex(str, options);
		else if (options && (options.expr || options.right))
			return calculator.WAexpressionToExpression(str, options);
		else
			return str;
	},
	typeToWAType: function(x) {
		return JSON.stringify((function(x) {
			if (typeof x == "object" && "type" in x && x.type in calculator.customTypes && calculator.customTypes[x.type].isLoaded)
				return String(x);
			switch(calculator.typeOf(x)) {
				case "string": return ME.string.stripFirmDelimiters(x);
				case "complex number": var arr = calculator.complexParts(x); return ("(" + arr[0] + "+" + arr[1] + " i" + ")");
				case "matrix":
				case "vector": var arr = x.map(arguments.callee); return arr;
				case "expression or name": return calculator.expressionToWAexpression(ME.expr.eval(x));
				default: return x;
			}
		})(x)).replace(/["]/g, ""); // " comment to fix syntax coloring															 
	},
	callWA: function(cmd, arg, options) {
		if (!cmd) throw Error("bad arg");
		arg = arg || "";
		options = options || {};

		// install default options
		options.expr = options.expr || (calculator.typeOf(arg) == "expression or name"); // make sure "expr" is set if input is an expr
		options.pod = options.pod || "Result";
		options.brackets = options.brackets || (calculator.isAMatrix(arg) ? "[]" : "{}");

		arg = calculator.typeToWAType(arg);
		if (options.join) arg = arg.slice(1,-1); // slice the "[", "]" off the JSON result of an array
		if (options.brackets && options.brackets != "[]") {
			arg = arg.replace(new RegExp("\\" + "[", "g"), options.brackets[0]);
			arg = arg.replace(new RegExp("\\" + "]", "g"), options.brackets[1]);
		}
		if ("suffix" in options) arg += options.suffix;
		if (cmd[cmd.length-1] == "[") // a Mathematica command
			arg += "]"; // provide closing bracket
		if (options.show) alert("W|A query: " + cmd + " " + arg);
		// console.log("W|A query: " + cmd + " " + arg);

		var queryString = "http://api.wolframalpha.com/v2/query?appid=XXXXXX-YYYYYYYYYY&format=" + (options.image ? "image&plotwidth=130" : "plaintext") + "&input=" + cmd + "%20" + encodeURIComponent(arg) + (options.pod && options.pod != "all" ? "&includepodid=" + options.pod : "");
		// console.log(queryString);
		var res = requestURL(queryString);
		// var ser = new XMLSerializer(); alert(ser.serializeToString(res));
		if (res.firstChild.attributes["error"].nodeValue == "true") {
			throw Error("query failed"); // todo: extract error
		}
		if (res.firstChild.attributes["success"].nodeValue == "false") {
			throw Error("query didn't succeed; bad input?"); //'
		}
		if (res.firstChild.attributes["numpods"].nodeValue == 0 && res.firstChild.attributes["recalculate"].nodeValue != "") {
			var newURL = (typeof options.retry == "function" ? options.retry(queryString) : res.firstChild.attributes["recalculate"].nodeValue);
			res = requestURL(newURL);
		}
		if (res.firstChild.attributes["numpods"].nodeValue == 0) {
			throw Error("query produced no results for pod(s): " + options.pod);
		}
		if (options.image) {
			var imgs = res.getElementsByTagName("img");
			if (imgs && imgs.length >= 1)
				return imgs[0].attributes["src"].nodeValue;
		}
		else {
			var plaintexts = res.getElementsByTagName("plaintext");
			if (plaintexts) {
				var results = [];
				for (var i=0; i<plaintexts.length; i++) {
					var s = plaintexts[i].firstChild.nodeValue;
					if (options.show) alert("W|A plaintext result " + (i+1) + ": " + s);
					if (options.and)
						s = calculator.WAtypeToType(s, options);
					else {
						s = s.split(" and "); // roll multiple results into vector
						s = s.map(function(x) { return calculator.WAtypeToType(x, options); });
						if (s.length == 1) s = s[0]; // if there's only one result, convert back to scalar result delivery
					}
					results[i] = s;
                    results[i].wasProducedByWA = true;
				}
				return (results.length == 1 ? results[0] : results);
			}
		}
		throw Error("unexpected response");
	},

	operate: function(op_name, op_arg_count /*optional*/) {
		// console.log("operate: " + JSON.stringify(arguments));
		var funcName = this.function_aliases[op_name] || op_name; // the unaliased function name

		// determine # of args
		var n_args = op_arg_count || this.numberOfArgsForFunctionWithName(op_name);
		try {
			if (n_args == -1)
				throw Error("unknown function");
			if (this.stack.length < n_args)
				throw Error("too few arguments on stack");
		}
		catch(err) {
			calculator.exec("alert", "Error", op_name, err.message);
			return false;
		}

		// get args from stack
		var args = [];
		////var hasSymbolicArgs = false;
		var hasFirmStringArgs = false;
		var hasAComplexNumberArg = false;
		var hasAMatrixArg = false;
		var hasAVectorArg = false;
		var hasABinaryArg = false;
		var hasAnRPLProgramArg = false;
		var hasAnObjectArg = false;
		var hasAnExprArg = false;
		var objectArg;
		var hasAllRealArgs = true; // default
		var resultStoreName; // if set, will store result in variable with this name

		var ok = true;
		try {
			for (var i=0; i<n_args; i++) {
				var a = this.stack.pop();
				var type = typeof a;
															
				// if applicable, auto-recall variable
				if (i == n_args-1 && type === "string" && funcName in calculator.functionsOperatingOnName && this.isAName(a)) {
					if (calculator.functionsOperatingOnName[funcName])
						resultStoreName = a; // for use below
					var name = this.unquote(a);
					if (name in this.vars.local)
						a = this.vars.local[name];
					else if (name in this.vars[this.currentDataCategory])
						a = this.vars[this.currentDataCategory][name];
					else
						throw Error("undefined name: " + name);
					type = typeof a;
				}

				if (type === "string") {
					if (this.isAComplexNumber(a))
						hasAComplexNumberArg = true;
					else if (this.isABinaryNumber(a))
						hasABinaryArg = true;
					else if (this.isAFirmString(a))
						 hasFirmStringArgs = true;
					else if (this.isAnRPLProgram(a))
						 hasAnRPLProgramArg = true;
					else// if (this.isAName(a))
						 hasAnExprArg = true;
					hasAllRealArgs = false;
				}
				else if (type === "object") {
					if ("length" in a) { // an array
						if (this.isAMatrix(a))
							hasAMatrixArg = true;
						else
							hasAVectorArg = true;
					}
					else {
						objectArg = a;
						hasAnObjectArg = true;
					}
					hasAllRealArgs = false;
				}
				args.unshift(a);///op_name[0] == "@" ? a : calculator.functions["@eval"](a));
			}

			// special case treatment for last function
			if (n_args/* && !this.RPLProgram.isRunning*/) /// todo: optimize: don't do this when graphing
				this.lastArgs = args; // todo: what with objects/arrays?

			var retval;
			///if (hasSymbolicArgs && funcName[0] != "@" && this.mode.operation.wantsSymbolicMath && !hasFirmStringArgs && !hasAVectorArg && !hasAMatrixArg) { // test for conditions to do symbolic math
			if (hasAnExprArg && !(funcName in ME.expr) && funcName[0] != "@" && this.mode.operation.wantsSymbolicMath && !hasFirmStringArgs && !hasAVectorArg && !hasAMatrixArg) { // test for conditions to do symbolic math
				retval = ME.expr.symbolic(op_name, args);
			}
			else { // call operator on args
				// find function collection for type of argument(s)
				var functionCollection = ME; // default to real-valued
				if (funcName in ME[this.currentDataCategory]) // a user function
					functionCollection = ME[this.currentDataCategory];
				else while (!hasAllRealArgs && funcName[0] != '@') { // if not all real-valued and not a catch-all function
					var needsConversionBackIntoObject = false;
					if (hasAnExprArg && funcName in ME.expr)
						functionCollection = ME.expr;
					else if (hasAMatrixArg) // note, the order here matters; matrix must come before vector in order to allow m*v
						functionCollection = ME.matrix;
					else if (hasAVectorArg)
						functionCollection = ME.vector;
					else if (hasAnRPLProgramArg)
						functionCollection = calculator.RPLProgram;
					else if (hasAnObjectArg && ("type" in objectArg && this.customTypes[objectArg.type] && this.customTypes[objectArg.type].isLoaded)) {
						// was: validate object: find and ascertain object type, and make sure class is available
						//if (!("type" in objectArg && this.customTypes[objectArg.type] && this.customTypes[objectArg.type].isLoaded))
						//	throw Error("invalid arg");
						
						var customType = this.customTypes[objectArg.type];
						var isFunctionDefined = (funcName in customType || funcName in ME[this.currentDataCategory]);
						
						var areArgsOk = true;
						// convert other args to required type, if applicable
						if (customType.onlyOperatesOnOwnType && n_args && isFunctionDefined) {
							for (var i=0; i<n_args; i++) {
								if (!(typeof args[i] === "object" && "type" in args[i] && args[i].type == objectArg.type)) {
									if (typeof args[i] === "number" && "fromNumber" in customType)
										args[i] = customType.fromNumber(args[i]);
									else if (typeof args[i] === "object" && "fromObject" in customType)
										args[i] = customType.fromObject(args[i]);
									else { // try from string conversion
										var conversionCandidateString = String(args[i]);
										if (customType.isStringRepresentation(conversionCandidateString))
											args[i] = customType.fromString(conversionCandidateString);
										else
											areArgsOk = false;
									}
								}
							}
						}

						if (isFunctionDefined && areArgsOk) {
							functionCollection = customType; // identical to ME[objectArg.type]
							break;
						}
						else {
							if ("toArray" in customType) {
								args[args.indexOf(objectArg)] = customType.toArray(objectArg);
								hasAVectorArg = true;
								functionCollection = ME.vector;
								needsConversionBackIntoObject = ("fromArray" in customType);
								break;
							}
							// try fallback to catch-all function
						 /*
							if ("@"+funcName in ME) {
								// console.log("operate: fallback for obj arg to " + "@"+funcName);
								funcName = "@"+funcName;
								break;
							}
						 */
							// implied else: no break -> fall back to normal processing and auto-conversion of object to number via string // was: throw Error("wrong type of argument");
						}																 
					}
					else if (hasAComplexNumberArg)
						functionCollection = ME.complex;
					else if (hasABinaryArg)
						functionCollection = ME.binary;
					else if (hasFirmStringArgs)
						functionCollection = ME.string;
					/* /// if (!calculator.mode.wantsSymbolicMath) */
/*
					// if there're non-real args, evaluate them
					if (functionCollection != ME && functionCollection.eval) {
						// unless we have a vector /// and this is a basic math op (array-> cannot have args eval'ed)  ... (for now); todo: improve
						if (!(functionCollection == ME.vector) /// && op_name.length <= 2))
						for (var i=0; i<n_args; i++)
							args[i] = ME["@eval"](args[i]);
					}
*/
					break; // end while
				}

				// find function
				var func = functionCollection[funcName];
				while (func == undefined) {
					// scoped function name?
					var nameComponents = funcName.split(".");
					if (nameComponents.length == 2) {
						functionCollection = calculator.functions[nameComponents[0]];
						if (functionCollection) {
							func = functionCollection[nameComponents[1]];
							break; // found it; done
						}
					}

					// test for special cases that require the function collection to change
					
					// see if all args are real
					/*
					var argsAreAllReal = true;
					for (var i=0; i<n_args-1; i++)
						if (typeof args[i] != "number")
							argsAreAllReal = false;
					*/
					// real args provided to complex function?
					if (hasAllRealArgs/*argsAreAllReal*/) {
						functionCollection = ME.complex;
						if ((func = functionCollection[funcName] /*|| functionCollection[funcName.toLowerCase()]*/) != undefined)
							break;
						else { // real args (=Decimal notation) provided to binary function?
							functionCollection = ME.binary;
							if ((func = functionCollection[funcName] /*|| functionCollection[funcName.toLowerCase()]*/) != undefined)
								break;
						}
					}

					if (hasAMatrixArg && funcName in ME.vector) { // arg is matrix and func name is a vector function?
						functionCollection = ME.vector; // switch to vector collection; after all, matrices are vectors, too
						func = ME.vector[funcName];
						break;
					}

					if (n_args == 1 && /*funcName in ME*/ calculator.isFunction(funcName)) { // a single-valued, real function by the given name exists; /// todo: extend this to user functions, once we support typed function declarations // todo: see if this works with isFunction
						if (hasAMatrixArg) {
							// switch over to map function and add funcName as additional arg 
							func = ME.matrix.map;
							args[1] = funcName;
							break;
						}
						else if (hasAVectorArg) {
							// switch over to map function and add funcName as additional arg 
							func = ME.vector.map;
							args[1] = funcName;
							break;
						}
					}
					
					// try fallback to catch-all function
					if ("@"+funcName in ME) {
						// console.log("operate: fallback to " + "@"+funcName);
						func = ME["@"+funcName];
						break;
					}

					throw Error("wrong type of argument");
				}

				// update analytics
				if (functionCollection != ME && functionCollection != ME[this.currentDataCategory])
					calculator.analytics.usesNonRealFunctions = true;

				// if a non-catch-all function in calculator.functions is called with non-real args, coerce them into reals
				if (functionCollection == ME && !hasAllRealArgs && funcName[0] != '@' && !this.mode.operation.permitExpressionArgs) {
					for (var i=0; i<n_args; i++)
						args[i] = +args[i];
					argsAreAllReal = false;
				}
																 
				retval = func.apply(functionCollection, args); // apply operator / call function

				// special case of object that was previously converted into a vector and now needs to be converted back
				if (needsConversionBackIntoObject && calculator.typeOf(retval) == "vector")
					retval = this.customTypes[objectArg.type].fromArray(retval);
			}
			if (retval != undefined) {
				if (resultStoreName)
					ME["@var_store"](retval, resultStoreName);
				else
					this.stack.push(retval);
			}
			// ND0
			if (this.analytics.shouldDetermineEntropy && this.stack.length > 3)
				this.stack = [ this.stack[this.stack.length-3], this.stack[this.stack.length-2], this.stack[this.stack.length-1] ];
		}
		catch(e) {
			if (this.RPLProgram.isRunning) throw e;

			this.undo();
			calculator.functions.stopAnyGraphics();
			calculator.exec("alert", "Error", op_name, e.message);
			ok = false;
		}

		return ok;
	},

	customTypes: {},
	registerType: function(obj) {
		if (!(typeof obj.type == "string" && "toString" in obj))
			throw Error("incomplete type");

		this.functions[obj.type] = obj;
		this.customTypes[obj.type] = obj;
	},
	reviveObject: function(obj) {
		if ("stringValue" in obj && "type" in obj && obj.type in this.customTypes && "fromString" in this.customTypes[obj.type]) {
			try {
				obj = this.customTypes[obj.type].fromString.call(this.customTypes[obj.type], obj.stringValue);
				// was: obj = this.customTypes[obj.type].fromString(obj.stringValue);
			}
			catch(e) { /* alert("Error reviving: " + obj.stringValue + ", type: " + obj.type + ": " + e.message); */ }
		}
		return obj;
	},
	reviveObjectsIn: function(collection) {
		for (var i in collection)
			if (typeof collection[i] === 'object') {
				if ("needsRevival" in collection[i])
					collection[i] = calculator.reviveObject(collection[i]);
				else if ("length" in collection[i]) // an array
					arguments.callee(collection[i]);
			}
	},
	reviveStackObjects: function() {
		calculator.reviveObjectsIn(calculator.stack);
		calculator.show();
		calculator.reviveObjectsIn(calculator.undo_stack);
															 
		for (var category in calculator.vars)
			if (calculator.vars[category] instanceof Object)
		 // { alert("reviving category " + category);
				calculator.reviveObjectsIn(calculator.vars[category]);
		 // }
	},
	HTMLforTypeBadge: function(name, width) {
		var w = width || ((display.isLarge() ? 12 : 10) * name.length);
		var stringForLabel = "&nbsp;";
		stringForLabel += '<span style="position: absolute; font-size: ' + (display.isLarge() ? "14" : "12") + 'px; color: white">' + "&nbsp;" + name + '</span>';
		stringForLabel += '<img src="typeButton.png" width="' + w + '" height="' + (display.isLarge() ? "19" : "16") + '" style="position: relative; z-index: -1">';
		return stringForLabel;
	},
	onload: function() {
		if (!require("canvastext.js", true)) /// todo: remove this once require() in draw1D is working without artifacts
			return false;

		ME.prepIsPrime(100);
		for (var type in this.customTypes)
			if ("onload" in this.customTypes[type])
				this.customTypes[type].onload();
		setTimeout(this.reviveStackObjects, 800); /// todo: synchronize, instead of waiting an appropriate amount of time

		// create non-@ aliases for @-functions in ME that don't have non-@ names defined (in any function collection)
		for (var name in ME)
			if (name[0] == "@" && !(name.slice(1) in ME) && name != "@tag" && name != "@last") // special case of tag which has "tag" in a non-ME function collection (custom object), and @last, which mustn't supersede the definitions in string and vector
				calculator.function_aliases[name.slice(1)] = name;

		display.onload();
	}
};

// MorphEngine globals (aliases)
ME = me = calculator.functions;
vars = calculator.vars.local;
cons = calculator.vars;
push = function() { return calculator.push.apply(calculator, arguments); };
calc = function() { return calculator.calc.apply(calculator, arguments); };

calculator.registerType(ME.vector); //// todo: evaluate if this should be here; doesn't seem to do anything since functionByName hard-codes ME.vector
calculator.registerType(ME.expr);


/* Boolean converter type definition */
var BooleanConverter = {
	type: "boolean",
	isLoaded: true,

	isStringRepresentation: function(x) { return (x == "false" || x == "true"); },
	fromString: function(str) { return (str == "true"); },
};
calculator.registerType(BooleanConverter);																	  


/* HPList converter type definition */
var HPListToArrayConverter = {
	type: "HPList",
	isLoaded: true,

	isStringRepresentation: function(x) { return (x.match(/^\{[^\:]+\}$/) != null); }, // anything but ':' inbetween curly braces
	fromString: function(str) { // str is sure to satisfy isStringRepresentation
		str[0] = '['; str[str.length-1] = ']'; // change list string into vector string
		return calculator.functions.vector.fromString(str); // and return a normally constructed vector
	},

	onload: function() {
		calculator.vars["NOVAL"] = 0;
	}
};
calculator.registerType(HPListToArrayConverter);																	  


var NDImage = {
	type: "img",
	typeHP: 11,
	isLoaded: true,
	toString: function(obj) { return obj.name + " ("+ obj.width + "x" + obj.height + ")"; },

	toImage: function(name, data, w, h) {
		if (!(calculator.isAFirmString(name) && calculator.isAFirmString(data) && typeof w === 'number' && typeof h === 'number'))
			throw Error("wrong type of argument");
		if (!calculator.isADataURL(data)) {
			data = data.slice(1,-1); // remove firm string quotes
			if (!calculator.isAHexNumberString(data))
				throw Error("hexDataExpected");
			data = data.slice(2); // shave off "0x"
			var wantsBinaryInterpretation = false;
			if (data.length == w*h*2) // required data size for gray image
				;
			else if (!(w&7) && data.length == w/8*h*2) // required data size for binary image
				wantsBinaryInterpretation = true;
			else
				throw Error("invalidDimensionsForData");
		}

		// with inputs verified, it's time to construct the stack object
		function imageObj() {
			this.type = NDImage.type;
			this.name = name;
			this.width = w;
			this.height = h;
			this.data = data;
			this.isBinary = wantsBinaryInterpretation;
			/// this.toJSON = function(key) { return { "name": this.type, "stringValue": this.toString() }; };
		}
		return new imageObj();
	},
	toHTML: function(obj) {
		if (calculator.isADataURL(obj.data))
			return '<img src=' + obj.data + ' width="184" height="50" ' + '/>'; // todo: install a tool-tip showing this.toString(obj)
		if (obj.name) {
			var typeString = this.type;
			var stringForType = this.toString(obj);
/*
			var stringForImage = this.toString(obj);
			var stringForLabel = "&nbsp;";
			stringForLabel += '<span style="position: absolute; font-size: ' + (display.isLarge() ? "14" : "12") + 'px; color: white">' + "&nbsp;" + typeString + '</span>';
			stringForLabel += '<img src="typeButton.png" width="' + (display.isLarge() ? "37" : "30") + '" height="' + (display.isLarge() ? "19" : "16") + '" style="position: relative; z-index: -1">';
			return (stringForImage + stringForLabel);
*/
			return (stringForType + calculator.HTMLforTypeBadge(typeString, display.isLarge() ? 37 : 30));
		}
	},
	toDisplay: function(obj) {
		if (calculator.isADataURL(obj.data))
			display.showImage(obj);
		else {
			display.showGraphics(true);
			var ctx = canvas.getContext('2d');
			
			var image = ctx.createImageData(obj.width, obj.height);
			var imageData = image.data;
			var index = 0;
			for (var i=0; i<imageData.length; index+=2) {
				var val = parseInt(obj.data.substring(index,index+2), 16);
				if (obj.isBinary) {
					for (var s=7; s>=0; s--, i+=4) {
						var bitVal = val&(1<<s);
						imageData[i] = imageData[i+1] = imageData[i+2] = (bitVal ? 255 : 0);
						imageData[i+3] = 255; // alpha set to "opaque"
					}
				}
				else { // gray interpretation
					imageData[i] = imageData[i+1] = imageData[i+2] = val;
					imageData[i+3] = 255; // alpha set to "opaque"
					i += 4;
				}
			}
		    imageData = 0; // enable GC to recycle this pointer

			ctx.putImageData(image, 0, 0);
		}
	},
	eval: function(obj) { this.toDisplay(obj); },
	
	onload: function() {
		// extend built-in functions
		calculator.functions.string["toImage"] = NDImage.toImage;		
		// define function name aliases
		calculator.function_aliases["image"] = "toImage";
	}
};
calculator.registerType(NDImage);

var TaggedObject = {
	type: "tagged",
	typeHP: 12,
	isLoaded: true,
	separator: ":",

	instance: function(s, obj) { // the object's constructor function
		this.type = TaggedObject.type;
		this.name = s;
		this.obj = obj;
		this.toString = function() { return String(this.obj); }; // to permit auto-conversion to String in JS
	},
	fromNameAndObj: function(name, obj) { return new TaggedObject.instance(name, obj); },
	toObj: function(obj) { return obj.obj; },

	toString: function(obj) {
		return this.separator + obj.name + this.separator + calculator.stringValueOfItem(obj.obj);
	},
	toHTML: function(obj) {
		var parts = this.toString(obj).split(this.separator);
		var HTMLforType = parts[1] + this.separator + " " + parts[2];
		HTMLforType += calculator.HTMLforTypeBadge(obj.type, display.isLarge() ? 53 : 44);
		return HTMLforType;
	},
	isStringRepresentation: function(x) { return (!x.indexOf(TaggedObject.separator) && x.split(TaggedObject.separator).length == 3); },
	fromString: function(str) {
		var args = str.split(TaggedObject.separator);
		return this.fromNameAndObj(args[1], calculator.itemFromString(args[2]));
	},
																 
	// operators and functions
	"detag": function(x) { return this.toObj(x); },
	eval: function(x) { return this.toObj(x); },
	toComponents: function(x) { calculator.stack.push(x.obj); return x.name; },
	"tag": function(x) { return x.name; },
	"==": function(a, b) { +a == +b; },
	///"=": function(a, b) { return this["=="](a,b); },
	"!=": function(a, b) { return !this["=="](a,b); },
	">": function(a, b) { return (+a > +b); },
	"<": function(a, b) { return (+a < +b); },
	">=": function(a, b) { return (+a >= +b); },
	"<=": function(a, b) { return (+a <= +b); },
															 
	onload: function() {
		// extend prototype to permit auto-conversion to String and Number in JS
		TaggedObject.instance.prototype.toString = function() { return String(this.obj); };
		TaggedObject.instance.prototype.valueOf = function() { return +(this.obj); };

		calculator.functions["@tag"] = function(obj, tag) { return TaggedObject.fromNameAndObj(calculator.unquote(String(tag)), obj); };
		calculator.functions["detag"] = function(obj) { return (calculator.typeOf(obj) == "tagged" ? TaggedObject["detag"](obj) : obj); };

		// function name aliases
		calculator.function_aliases["\u2192TAG"] = "@tag";
		calculator.function_aliases["DTAG"] = "detag";
	}
};
calculator.registerType(TaggedObject);

var DotdotConverter = {
	type: "dotdot",
	isLoaded: true,
	isStringRepresentation: function(str) { return (str.match(/^(\w+)[.][.](\w+)$/) != null); },
	fromString: function(str) { var rng = str.match(/^(\w+)[.][.](\w+)$/);
		for (var i=1; i<=2; i++) { rng[i] = parseFloat(rng[i]) || vars[rng[i]] || calculator.vars[calculator.currentDataCategory][rng[i]]; }
		return ME.range(rng[1], rng[2]);
	}
};
calculator.registerType(DotdotConverter);

var URL = {
	type: "URL",
	// intentionally no isLoaded property, so type doesn't participate in normal operations; todo: check this is truly so and correct
	toString: function(str) { return str; },
	isStringRepresentation: function(str) { return (str.match(/^http:/) != null); },
	fromString: function(str) {
		if (this.isStringRepresentation(str)) {
			str = '"' + str + '"'; // this effectively converts the URL type into a FirmString type
			setTimeout(function() { calculator.push((str.indexOf("$$") != -1 ? "@loadURLArg" : "loadURL")); }, 0);
		}
		return str;
	}
};
calculator.registerType(URL);
																 
var BigNum = {
	type: "bignum",
	typeHP: 28,
	isLoaded: false,
	radix: 10,
	onlyOperatesOnOwnType: true,
	BC_modVal: 1,

	toString: function(bn) {
		if ("stringValue" in bn) { // a JSON object? (for example, in array)
			var str = bn.stringValue;
			return (str.slice(0,15) + (str.length > 15 ? "..." : ""));
		}
		else { // a BigInteger object
			var str = bn.toString(BigNum.radix);
			return (BigNum.radix == 16 ? (str[0] == "-" ? "-0x" + str.slice(1) : "0x" + str) : (BigNum.radix == 2 ? str + "b" : (BigNum.radix == 8 ? str + "o" : str)));
		}
	},
	toHTML: function(bn) {
		var typeString = "big"; // user-visible type name; could also be this.type
		var stringForType = BigNum.toString(bn);
		return (stringForType + calculator.HTMLforTypeBadge(typeString, display.isLarge() ? 33 : 27));
	},
	fromBigNum: function(bn) { return +(this.toString(bn)); },
	fromAny: function(x) { return (typeof x === 'number' ? BigNum.fromNumber(x) : BigNum.fromString(String(x))); },
	fromNumber: function(x) { x = Math.round(x); return BigNum.fromString(String(x)); },
	fromString: function(str) { var base = 10;
		if (BigNum.isStringRepresentation(str)) {
			if (calculator.isAHexNumberString(str)) {
				str = str.slice(2); // shave off "0x"
				base = 16;
			}
			else if (calculator.isATrueBinaryNumberString(str)) {
				str = str.slice(0, -1); // shave off trailing "b"
				base = 2;
			}
			else if (calculator.isAnOctNumberString(str)) {
				str = str.slice(0, -1); // shave off trailing "o"
				base = 8;
			}
			// default is dec / base 10
		}
		else if (calculator.isABinaryNumber(str))
			str = String(calculator.functions.binary.toDec(str));
		return new BigInteger(str, base);
	},
	isStringRepresentation: function(x) { return calculator.isABinaryNumber(x) && (x.length > (calculator.isATrueBinaryNumberString(x) ? 31 : 14)); },
	eval: function(obj) { return ("stringValue" in obj ? BigNum.fromString(obj.stringValue) : obj); },

	toBig: function(x) { return x; }, // to permit toBig to be called on self without ill effect
	toBigNum: function(x) { return x; }, // to permit toBigNum to be called on self without ill effect

	"==": function(a, b) { return a.equals(b); },
	"=": function(x, y) { return x + '=' + y; },
	// was: "=": function(a, b) { return this["=="](a,b); },
	"!=": function(a, b) { return !a.equals(b); },
	">": function(a, b) { return a.compareTo(b) > 0; },
	"<": function(a, b) { return a.compareTo(b) < 0; },
	">=": function(a, b) { return a.compareTo(b) >= 0; },
	"<=": function(a, b) { return a.compareTo(b) <= 0; },
	"+": function(a, b) { return a.add(b); },
	"-": function(a, b) { return a.subtract(b); },
	"*": function(a, b) { return a.multiply(b); },
	"/": function(a, b) { return a.divide(b); },
	"divrem": function(a, b) { return a.divideAndRemainder(b); },
	"quot": function(a, b) { return this.divrem(a,b)[0]; },
	"IDIV2": function(a, b) { var r = BigNum.divrem(a, b); calculator.stack.push(r[0]); return r[1]; },
	"toBin": function(a) { this.radix = 2; return a; },
	"toOct": function(a) { this.radix = 8; return a; },
	"toDec": function(a) { this.radix = 10; return a; },
	"toHex": function(a) { this.radix = 16; return a; },
	"neg": function(a) { return a.negate(); },
	"sign": function(a) { return a.signum(); },
	"rem": function(a, b) { if (a.signum() >= 0) return a.mod(b); else { return a.mod(b).subtract(b); } },
	"mod": function(a, b) { if (b.signum() >= 0) return a.mod(b); else { var q = a.divideAndRemainder(b); return a.subtract(b.multiply(q[1].signum() == 1 ? BigNum["decr"](q[0]) : q[0])); } },
	"max": function(a, b) { return a.max(b); },
	"min": function(a, b) { return a.min(b); },
	"abs": function(a) { return a.abs(); },
	"bits": function(a) { return a.bitLength(); },
	"size": function(a) { return (String(a).length - (a.signum() == -1)); },
	"combinations": function(n, m) { return (BigNum["/"](this.factorial(n), (BigNum["*"](this.factorial(m), this.factorial(BigNum["-"](n, m)))))); },
	"permutations": function(n, m) { return (BigNum["/"](this.factorial(n), this.factorial(BigNum["-"](n, m)))); },
	"gcd": function(a, b) { return a.gcd(b); },
	"lcm": function(a, b) { return BigNum["*"](BigNum["/"](a, BigNum.gcd(a,b)), b); },
	"pow": function(a, b) { return a.pow(b); },
	"squared": function(a) { return a.square(); },
	/// todo: delete "^": function(a, b) { return this["pow"](a,b); },
	"modpow": function(a, e, m) { return a.modPow(e, m); },
	"MODSTO": function(a) { BigNum.BC_modVal = a; },
	"POWMOD": function(a, e) { return BigNum.modpow(a, e, BigNum.BC_modVal); },
	"nextPrime": function(x) { if (this["<"](x, BigInteger.TWO))    return BigInteger.TWO; x = this.incr(x); if (x.isEven()) x = this.incr(x); while (!this.isPrime(x)) x = BigNum["+"](x, BigInteger.TWO); return x; },
	"prevPrime": function(x) { if (this["<="](x, BigInteger.THREE)) return BigInteger.TWO; x = this.decr(x); if (x.isEven()) x = this.decr(x); while (!this.isPrime(x)) x = BigNum["-"](x, BigInteger.TWO); return x; },
	"isPrime": function(a) { return a.isProbablePrime(4); },	// todo: provide non-probabilistic isPrime? 																																		 
	"isProbablePrime": function(a) { return a.isProbablePrime(2); },
	"isEven": function(a) { return a.isEven(); },
	"int": function(x) { return x; },
	"isInt": function(x) { return true; },
	"isSquare": function(x) { return ME.isInt(Math.sqrt(x)); },
	"isPowerOf2": function(x) { return !(this.and(x, this.decr(x))); },
	"shift_left": function(a) { return a.shiftLeft(1); },
	"shift_right": function(a) { return a.shiftRight(1); },
	"shift_left_byte": function(a) { return a.shiftLeft(8); },
	"shift_right_byte": function(a) { return a.shiftRight(8); },
	"and": function(a, b) { return a.and(b); },
	"or": function(a, b) { return a.or(b); },
	"xor": function(a, b) { return a.xor(b); },
	"not": function(a) { return a.not(); },
	
	"incr": function(bn) { return BigNum["+"](bn, BigInteger.ONE); },
	"decr": function(bn) { return BigNum["-"](bn, BigInteger.ONE); },
	"INCR": function(bn) { var r = this.incr(bn); calculator.stack.push(r); return r; },
	"DECR": function(bn) { var r = this.decr(bn); calculator.stack.push(r); return r; },

	"factorial": function(bn) { return (BigNum["<="](bn, BigInteger.ONE) ? BigInteger.ONE : BigNum["*"](bn, arguments.callee(BigNum["-"](bn, BigInteger.ONE)))); },
	"fib": function(bn) { return calculator.functions.matrix.pow([[BigInteger.ZERO,BigInteger.ONE], [BigInteger.ONE,BigInteger.ONE]], parseInt(bn.toString()))[1][0]; }
	"modfib": function(bn, m) { return calculator.functions.matrix.modpow([[BigInteger.ZERO,BigInteger.ONE], [BigInteger.ONE,BigInteger.ONE]], parseInt(bn.toString()), parseInt(m.toString()))[1][0]; },
	"divs": function(x) {
		// todo: validate; questionable heuristic to deal with input like 123456791*123456791
		if (this.isSquare(x)) { var sqrtX = this.fromNumber(Math.sqrt(x)); if (this.isPrime(sqrtX)) return [BigInteger.ONE,sqrtX,x]; }

		var result = []; result[0] = BigInteger.ONE;
		function cproduct(x, y) {
			var z = []; for (var i=0; i<x.length; i++) for (var j=0; j<y.length; j++) z.push(x[i].multiply(y[j]));
			return z;
		};
		var factors = this.factors(x);
		for (var i=factors.length-2; i>=0; i-=2) {
			var fac = factors[i];
			var nf = fac, multipliers = [];
			for (var j=factors[i+1]; j>0; j--) {
				multipliers.push(nf);
				nf = nf.multiply(fac);
			}
			result = result.concat(cproduct(result, multipliers));
		}
		return result.sort(function(a, b) { return BigNum[">"](a, b) ? 1 : -1; });
	},
	"factors": function(m) {
		if (!calculator.wantsExpressionResult && m.equals(BigInteger.ONE)) return []; 
		var wheel = new Array(BigInteger.ONE,BigInteger.TWO,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.FOURTEEN,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,
							  BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TWELVE,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.SIX,
							  BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.TEN,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWELVE,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,
							  BigInteger.TWELVE,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,
							  BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,
							  BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,
							  BigInteger.TEN,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.TEN,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.TEN,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,
							  BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,
							  BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,
							  BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.EIGHT,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TWELVE,BigInteger.SIX,
							  BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.TWELVE,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.TEN,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.SIX,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,
							  BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWELVE,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.SIX,BigInteger.TWO,BigInteger.TEN,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,
							  BigInteger.FOURTEEN,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.EIGHT,BigInteger.SIX,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.SIX,BigInteger.TWO,BigInteger.SIX,BigInteger.FOUR,BigInteger.TWO,BigInteger.FOUR,BigInteger.TWELVE,BigInteger.TWO,BigInteger.TWELVE );
		function addToResult(n, e) {
		if (calculator.wantsExpressionResult) {
			if (result.length)
				result += "*";
				result += n;
			if (e != 1)
				result += "^" + e;
			}
			else {
				result.unshift(e);
				result.unshift(n);
			}
		}

		var km = m;			
		var result = (calculator.wantsExpressionResult ? "" : []);
		function find_factors() {
			var wheel_max = wheel.length, wheel_start = 5; // wheel dimensions and entry point
			var i = 0, n = BigInteger.TWO;
			do {
				var e = 0, q = m.divide(n);
				while(m.equals(n.multiply(q))) {
					e++;
					m = q;
					q = m.divide(n);
				}
				if(e > 0) // this factor divided m?
					addToResult(n, e);

				// next position on the wheel
				n = n.add(wheel[i++]);
				if(i == wheel_max) i = wheel_start;
			}
			while (n.compareTo(q) <= 0);	
		}

		if (m.equals(BigInteger.ZERO) || BigNum.isPrime(m)) { // is "m" prime?
			if (calculator.wantsExpressionResult)
				return m; // special case behavior: primes return itself instead of expression
			addToResult(m, 1);
		}
		else {
			find_factors();
			if (!m.equals(BigInteger.ONE) || km.equals(BigInteger.ONE)) // is there a remainder?
				addToResult(m, 1);
		}
		return (calculator.wantsExpressionResult ? calculator.quote(result) : result);
	},
	"factor": function(x) { calculator.wantsExpressionResult = true; var s = this.factors(x, true); delete calculator.wantsExpressionResult; return s; },
	"split": function(x) { var v = [], s = String(x); var size = s.length; for (var i=0; i<size; i++) v.push(+s[i]); return v; },

	onload: function() {
		if (!require("jsbn.js", true))
			return;
		if (!require("jsbn2.js"))
			alert("cannot initialize BigNum!");

		// extend prototype
		BigInteger.prototype.type = BigNum.type;
		BigInteger.prototype.toJSON = function(key) { return { "type": BigNum.type, "needsRevival": true, "stringValue": this.toString() }; };
		BigInteger.prototype.valueOf = function() { return +String(this); };

		// blend type's functions into calculator
		calculator.functions["toBigNum"] = BigNum.fromAny;

		// Real no-op function to allow I->R to work with non-big input
		calculator.functions["fromBigNum"] = function(x) { return x; };

		// extend built-in functions
		calculator.functions.binary["toBigNum"] = BigNum.fromString;

		// use BigNum version for certain arg ranges to certain functions, use built-in otherwise
		calculator.functions["fib_real"] = calculator.functions["fib"]; // move built-in function to new place
		calculator.functions["fib"] = function(x) { return (x>77 ? BigNum.fib(BigNum.fromNumber(x)) : calculator.functions["fib_real"](x)); };
		calculator.functions["factorial_real"] = calculator.functions["factorial"]; // move built-in function to new place
		calculator.functions["factorial"] = function(x) { return (x>99 ? BigNum.factorial(BigNum.fromNumber(x)) : calculator.functions["factorial_real"].call(calculator.functions, x)); };
		calculator.functions["modpow_real"] = calculator.functions["modpow"]; // move built-in function to new place
		calculator.functions["modpow"] = function(x, e, m) { return (m>94906265 ? BigNum.modpow(BigNum.fromNumber(x), BigNum.fromNumber(e), BigNum.fromNumber(m)) : calculator.functions["modpow_real"].call(calculator.functions, x, e, m)); };
		calculator.functions["isPrime_real"] = calculator.functions["isPrime"]; // move built-in function to new place
		calculator.functions["isPrime"] = function(x) { return (x>94906265 /* todo: find correct number. This number sqrt(2^53) is for mod as per documentation; how high can we really go? 10^14 leads to infinite loop */ ? BigNum.isPrime(BigNum.fromNumber(x)) : calculator.functions["isPrime_real"].call(calculator.functions, x)); };

		// define function name aliases
		calculator.function_aliases["R\u2192I"] = "toBigNum";
		calculator.function_aliases["I\u2192R"] = "fromBigNum";
														
		// useful BigNum constants
		calculator.vars["big0"] = BigInteger.ZERO;
		calculator.vars["big1"] = BigInteger.ONE;
		calculator.vars["big2"] = BigInteger.TWO = BigNum.fromNumber(2);
		calculator.vars["big3"] = BigInteger.THREE = BigNum.fromNumber(3);
		calculator.vars["big4"] = BigInteger.FOUR = BigNum.fromNumber(4);
		calculator.vars["big5"] = BigInteger.FIVE = BigNum.fromNumber(5);
		calculator.vars["big6"] = BigInteger.SIX = BigNum.fromNumber(6);
		calculator.vars["big8"] = BigInteger.EIGHT = BigNum.fromNumber(8);
		calculator.vars["big10"] = BigInteger.TEN = BigNum.fromNumber(10);
		calculator.vars["big12"] = BigInteger.TWELVE = BigNum.fromNumber(12);
		calculator.vars["big14"] = BigInteger.FOURTEEN = BigNum.fromNumber(14);

		BigNum.isLoaded = true;
	}
};
calculator.registerType(BigNum);

var BigFloat = {
	type: "bigfloat",
	isLoaded: false,
	onlyOperatesOnOwnType: true,
	precision: 32,

	toString: function(bn) {
		if ("stringValue" in bn) { // a JSON object? (for example, in array)
			var str = bn.stringValue;
			return (str.slice(0,15) + (str.length > 15 ? "..." : ""));
		}
		else { // a BigNumber object
			var str = bn.toString();
			return str;
		}
	},
	toHTML: function(bn) {
		var typeString = "bigF"; // user-visible type name; could also be this.type
		var stringForType = BigFloat.toString(bn);
		return (stringForType + calculator.HTMLforTypeBadge(typeString, display.isLarge() ? 40 : 33));
	},
	toNumber: function(bn) { return +(this.toString(bn)); },
	fromAny: function(x) { return (typeof x === 'number' ? BigFloat.fromNumber(x) : BigFloat.fromString(String(x))); },
	fromNumber: function(x) { return new BigNumber(x); },
	fromString: function(str) { return new BigNumber(str);	},
	isStringRepresentation: function(x) {
		if (!(x.length > 16 && x.match(/\d*[.]\d+/) != null)) return false; // greater than 16 chars long and a "." framed by digits?
		var f = parseFloat(x); if (isNaN(f)) return false; else return (String(f) != x); // can input be represented as a float and is the string of that float not equal to the input?
		// was: return (x.match(/\d*[.]\d{16,}/) != null); /* was: (calculator.isADecimalNumber(x) && x.length > 16); */
	},
	eval: function(obj) { return ("stringValue" in obj ? BigFloat.fromString(obj.stringValue) : obj); },

	toBig: function(x) { return x; }, // to permit toBig to be called on self without ill effect
	toBigF: function(x) { return x; }, // to permit toBigF to be called on self without ill effect
	toBigNum: function(x) { return BigNum.fromString(x.intPart().toString()); }, // allow conversion from BigFloat to BigInt

	"==": function(a, b) { return a.compare(b) == 0; },
	"=": function(x, y) { return x + '=' + y; },
	// was: "=": function(a, b) { return BigFloat["=="](a,b); },
	"!=": function(a, b) { return !a.equals(b); },
	">": function(a, b) { return a.compare(b) > 0; },
	"<": function(a, b) { return a.compare(b) < 0; },
	">=": function(a, b) { return a.compare(b) >= 0; },
	"<=": function(a, b) { return a.compare(b) <= 0; },
	"+": function(a, b) { return a.add(b); },
	"-": function(a, b) { return a.subtract(b); },
	"*": function(a, b) { return a.multiply(b); },
	"/": function(a, b) { return a.divide(b); },
	"inv": function(a) { return BigNumber.ONE.divide(a); },
	"neg": function(a) { return a.negate(); },
	"sign": function(a) { return a.compare(BigNumber.ZERO); },
	"quot": function(a, b) { return this["/"](a,b).intPart(); },
	"rem": function(a, b) { return a.mod(b); },
	"mod": function(a, b) { if (BigFloat.sign(a) == BigFloat.sign(b)) return a.mod(b); else { var q = a.divide(b); return a.subtract(b.multiply(BigFloat.isInt(q) ? BigFloat["decr"](q) : q)); } },
	"max": function(a, b) { return (a.compare(b) ? a : b); },
	"min": function(a, b) { return (a.compare(b) ? b : a); },
	"abs": function(a) { return a.abs(); },
	"ceil": function(a) { var r = a.intPart(); var f = a.subtract(r); return (BigFloat.sign(a) >= 0 && BigFloat.sign(f) ? BigFloat["incr"](r) : r); },
	"floor": function(a) { var r = a.intPart(); if (BigFloat.sign(a) >= 0) return r; else { var f = a.subtract(r); return (BigFloat["sign"](f) ? BigFloat["decr"](r) : r); } },
	"fract": function(a) { return a.subtract(a.intPart()); },
	"int": function(a) { return a.intPart(); },
	"isInt": function(a) { return BigFloat["=="](a, a.intPart()); },
	"size": function(a) { return (String(a).length - (a.signum() == -1)); },
	"squared": function(a) { return a.multiply(a); },
	"pow": function(a, b) { return a.pow(b); },
	"modpow": function(a, b, m) { return a.modpow(b, m); },
	/// todo: delete "^": function(a, b) { return BigFloat["pow"](a,b); },
	"exp": function(a) { return a.exp(); },
	"incr": function(bn) { return BigFloat["+"](bn, BigNumber.ONE); },
	"decr": function(bn) { return BigFloat["-"](bn, BigNumber.ONE); },
	"INCR": function(bn) { var r = BigFloat.incr(bn); calculator.stack.push(r); return r; },
	"DECR": function(bn) { var r = BigFloat.decr(bn); calculator.stack.push(r); return r; },

	"sqrt": function(a) { return ContinuedFractionType.toDec(ContinuedFractionType.fromSqrtNumber(this.toNumber(a))); },
	"split": function(x) { var v = [], s = String(x).replace(".", ""); var size = s.length; for (var i=0; i<size; i++) v.push(+s[i]); return v; },

	onload: function() {
		if (!require("bignumber.js"))
			throw Error("missing bignumber.js");

		// improve prototype
		BigNumber.prototype["pow"] = function(exponent){
			exponent = +exponent; var result;
			if (BigFloat.sign(this) != 1) throw Error("bad arg"); // self negative?
			if (exponent < 0) throw Error("bad arg"); // exponent negative?
			if (ME.isInt(exponent)) {
				result = new BigNumber(BigNumber.ONE), base = this.clone();
				while (exponent > 0) {
					if ((exponent & 1))
						result.set(result.multiply(base));
					exponent >>= 1;
					base.set(base.multiply(base));
				}
			}
			else {
				exponent = (exponent * ME.ln(+this.toString()));
				result = BigFloat.fromNumber(exponent).exp();
			}
			return result;
		};
														
		// extend prototype
		BigNumber.prototype.type = BigFloat.type;
		BigNumber.prototype.toJSON = function(key) { return { "type": BigFloat.type, "needsRevival": true, "stringValue": this.toString() }; };
		BigNumber.prototype["modpow"] = function(exponent, modulus) {
			exponent = +exponent;
			if (!ME.isInt(exponent)) throw Error("bad arg");
			var result = new BigNumber(BigNumber.ONE), base = this;
			if (ME.isInt(exponent)) {
				while (exponent > 0) {
					if ((exponent & 1))
						result.set(result.multiply(base)).mod(modulus);
					exponent >>= 1;
					base.set(base.multiply(base)).mod(modulus);
				}
			}
			else {
				exponent = (exponent * ME.ln(base));
				result = BigFloat.fromNumber(exponent).exp().mod(modulus);
			}
			return result;
		};
		BigNumber.prototype["exp"] = function() {
			var result = BigFloat.fromNumber(1).add(this); // first two terms
			var n = new BigNumber(this), d = BigFloat.fromNumber(1);
			for (var i=2; i<100; i++) {
				n.set(n.multiply(this));
				d.set(d.multiply(BigFloat.fromNumber(i)));
				var previous = result.clone();
				result.set(result.add(n.divide(d)));
				if (result.compare(previous) == 0)
					break;
			}
			
			return result;
		}

		// extend BigNum to allow conversion from BigInt to BigFloat
		BigNum.toBigF = function(x) { return BigFloat.fromString(x.toString()); };

		calculator.functions["setBigFPrecision"] = function(x) { BigNumber.defaultPrecision = BigFloat.precision = +x; };
		calculator.functions["bigFPrecision"] = function() { return BigFloat.precision; };

		// blend type's functions into calculator
		calculator.functions["toBigF"] = BigFloat.fromAny;
		calculator.functions.binary["toBigF"] = BigFloat.fromString;

		// define function name aliases
		calculator.function_aliases["\u2192bigF"] = "toBigF";
		calculator.function_aliases["bigF\u2192"] = "toNumber";

		// useful BigFloat constants
		calculator.vars["bigF0"] = BigNumber.ZERO = BigFloat.fromNumber(0);
		calculator.vars["bigF1"] = BigNumber.ONE = BigFloat.fromNumber(1);
		calculator.vars["bigF2"] = BigNumber.TWO = BigFloat.fromNumber(2);

		BigFloat.isLoaded = true;
	}
}
calculator.registerType(BigFloat);														
														
var Code = {
	type: "code",
	isLoaded: true,

	toString: function(obj) { return obj.stringValue; },
	toHTML: function(obj) {
		var stringForType = obj.stringValue.slice(0, display.isLarge() ? 60 : 15) + " (" + obj.stringValue.length + "b)";		
		return (stringForType + calculator.HTMLforTypeBadge(obj.type, display.isLarge() ? 43 : 37));
	},
	isStringRepresentation: function(x) { return x.match(/^\/\*/); },
	fromString: function(str) {
		function codeObj() {
			this.type = Code.type;
			this.stringValue = str;
			this.toString = function() { return Code.toString(this); };
		}
		return new codeObj();
	},
	
	"==": function(a, b) { if (!(calculator.typeOf(a) == "code" && calculator.typeOf(b) == "code")) return false; return a.stringValue == b.stringValue; },
	"inject": function(name, obj) { if (calculator.typeOf(name) != "string") throw Error("bad arg"); /* use */ Code.eval(obj); /* inject */ calculator.exec("inject", obj.stringValue, calculator.unquote(name)); },

	eval: function(obj) {
		try {
			eval(obj.stringValue);
		}
		catch(e) {
			if (e instanceof SyntaxError)
				calculator.exec("alert", "SyntaxError", "in line", e.line);
			else if (e instanceof EvalError)
				calculator.exec("alert", "EvalError", "in line", e.line);
			else
				throw e;
			return obj; // have object go back on stack
		}
	},
	
	onload: function() {
		// add a global constant
		calculator.vars["noCode"] = Code.fromString("");
	}
};
calculator.registerType(Code);

calculator.registerType(FractionType);
calculator.registerType(ContinuedFractionType);
