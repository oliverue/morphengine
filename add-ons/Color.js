var Color = {
	type: "color",
	isLoaded: true,
	onlyOperatesOnOwnType: true,

	wantsNumericalRepresentation: true,
	denormalizer: 0xff, // max val of external color components representation
	normalizer: 1.0 / 0xff, // value that will normalize external color components

	instance: function(normalizedRGBAVector) { // the object's constructor function
		this.type = Color.type;
		this.components = normalizedRGBAVector;
		if (!(this.components.length == 4 && this.components[3] >= 0)) // no valid (non-NaN, non-undefined) alpha?
			this.components[3] = 1.0; // default alpha to "opaque"
		this.toString = function() { return Color.toString(this).replace("#", "0x"); }; // to permit auto-conversion to String in JS
		this.valueOf = function() { return Number(this.toString()); }; // to permit auto-conversion to Number in JS
	},

	toArray: function(obj) { return Color.components(obj); }, // array deconstructor; permits auto-conversion to vector
	fromArray: function(vec) { return Color.fromComponents(vec); }, // array constructor; permits auto-conversion from vector

	toString: function(obj) {
		var funcs = calculator.functions;
		return "#" + funcs.vector["*"](obj.components, Color.denormalizer).map(function(val) { val = funcs.binary.decimalToHex(Math.round(val)); if (val.length == 1) val = "0" + val; return val; }).join("");
	},
	toHTML: function(obj) {
		var colorString = Color.toString(obj);

		function colorBlock(color, width) {
			var RGBString = Color.toString(color).slice(0,-2); // shave off alpha
			return '<span style="display: inline-block; width: ' + width + '; height: ' + (display.isLarge() ? "20" : "15") + 'px; background-color: ' + RGBString + '; border: solid 1px"></span>';
		}

		var swatchWidth = (obj.inMatrix ? 10 : 36);
		var isOpaque = Color.isOpaque(obj);
		var HTMLforType = colorBlock(obj, String(isOpaque ? swatchWidth : swatchWidth/2) + "%");
		if (!isOpaque)
			HTMLforType += colorBlock(Color.alphaComposite(Color.fromString(colorString), calculator.vars.white), String(swatchWidth/2) + "%");

		if (!obj.inMatrix) {
			if (this.wantsNumericalRepresentation)
				HTMLforType += '<span style="font-family: monospace">&nbsp;' + colorString + '</span>';
			HTMLforType += calculator.HTMLforTypeBadge(obj.type, display.isLarge() ? 46 : 39);
		}

		return (HTMLforType);
	},
		
	isStringRepresentation: function(x) { return (x.match(/^#[0-9a-zA-Z]{6,8}$/) != null); },
	fromString: function(str) { // str is sure to satisfy isStringRepresentation
		var Binary = calculator.functions.binary;
		return new Color.instance([Number(Binary.hexToDecimal(str[1]+str[2])) * Color.normalizer,
								   Number(Binary.hexToDecimal(str[3]+str[4])) * Color.normalizer,
								   Number(Binary.hexToDecimal(str[5]+str[6])) * Color.normalizer,
								   Number(Binary.hexToDecimal(str[7]+str[8])) * Color.normalizer ]);
	},

	fromNumber: function(x) {
		return new Color.instance([x&0xff, x&0xff00 >> 8, x&ff0000 >> 16]);
	},
	fromRGBA: function(vec) { if (!(calculator.typeOf(vec) == "vector" && (vec.length == 3 || vec.length == 4))) throw Error("wrong type of argument");
		vec = vec.map(function(val) { if (val < 0 || val > 0xff) throw Error("bad arg"); return val; }); // make sure args are valid
		return new Color.instance(calculator.functions.vector["*"](vec, Color.normalizer));
	},
	fromComponents: function(vec) { if (!(calculator.typeOf(vec) == "vector" && (vec.length == 3 || vec.length == 4))) throw Error("wrong type of argument");
		return new Color.instance(vec.slice(0)); // slice() used to make a copy
	},
	
	// operators and functions
	"saturate": function(a) { a.components = a.components.map(function(val) { return (val < 0 ? 0 : val > 1.0 ? 1.0 : val); }); return a; },
	"add": function(a, b) { return this.fromArray(calculator.functions.vector["+"](a.components, b.components)); },
	"subtract": function(a, b) { return this.fromArray(calculator.functions.vector["-"](a.components, b.components)); },
	"alphaComposite": function(a, b) { var arr = []; var alpha = a.components[3]; for (var i=0; i<4; i++) arr[i] = b.components[i] + (a.components[i] - b.components[i]) * alpha; return new Color.instance(arr); },
	"mix": function(a, b) { var arr = []; var alpha = a.components[3]; for (var i=0; i<4; i++) arr[i] = (a.components[i] + b.components[i]) * 0.5; return new Color.instance(arr); },
	"+": function(a, b) { return this.saturate(this.add(a, b)); },
	"-": function(a, b) { return this.saturate(this.subtract(a, b)); },
	"*": function(a, b) { return this.alphaComposite(a, b); },
	"inv": function(a) { return new Color.instance([1.0 - a.components[0], 1.0 - a.components[1], 1.0 - a.components[2], a.components[3]]); },
	"==": function(a, b) { return calculator.functions.vector["=="](a.components, b.components); },
	"!=": function(a, b) { return calculator.functions.vector["!="](a.components, b.components); },
	"<": function(a, b) { return (calculator.functions.vector["abs"](a.components) < calculator.functions.vector["abs"](b.components)); },
	"<=": function(a, b) { return (calculator.functions.vector["abs"](a.components) <= calculator.functions.vector["abs"](b.components)); },
	">": function(a, b) { return (calculator.functions.vector["abs"](a.components) > calculator.functions.vector["abs"](b.components)); },
	">=": function(a, b) { return (calculator.functions.vector["abs"](a.components) >= calculator.functions.vector["abs"](b.components)); },
	"components": function(x) { return x.components.slice(0); },
	"alpha": function(x) { return x.components[3]; },
	"isOpaque": function(x) { return (this.alpha(x) == 1.0); },
	
	onload: function() {
		// add some global constants
		calculator.vars["transparent"] = Color.fromString("#00000000");
		calculator.vars["black"] = Color.fromString("#000000ff");
		calculator.vars["white"] = Color.fromString("#ffffffff");
		// add vector "constructors"
		calculator.functions.vector["toColor"] = Color.fromComponents;
		calculator.functions.vector["RGBAToColor"] = Color.fromRGBA;
		// add real "constructor"
		calculator.functions["toColor"] = Color.fromNumber;
		// add global object display configuration function
		calculator.functions["wantsValuesOnColors"] = function(b) { Color.wantsNumericalRepresentation = b; };
	}
};

calculator.registerType(Color);
