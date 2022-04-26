// Depends on BigNum type being registered

function eBig(nDigits) {
	var numerator = BigNum["pow"](BigNum.fromNumber(10), BigNum.fromNumber(nDigits));
	var bigE = BigNum["+"](numerator, numerator); // first two terms
	var factorial = BigInteger.ONE;
	var counter = BigInteger.ONE;
	var seriesVal;
	do {
		factorial = BigNum["*"](factorial, counter = BigNum.incr(counter));
		seriesVal = BigNum["/"](numerator, factorial);
		bigE = BigNum["+"](bigE, seriesVal);
	}
	while (BigNum[">"](seriesVal, BigInteger.ZERO));

	return "2." + BigNum.toString(bigE).slice(1,-2);
}

function fibtriangle(maxNum) {
	var padWidth = Math.ceil((BigNum.toString(BigNum.toHex(BigNum.fib(BigNum.fromAny(maxNum+1)))).length-2)/2)*2;
	var data = "0x";
	var STR = calculator.functions.string;
	var padChar = STR.toString("0");
	var a = BigInteger.ZERO; var one = BigInteger.ONE; var b = one;
	for (var i=0; i<maxNum; i++) {
		var val = BigNum["+"](a, b);
		a = b; b = val;
		data += STR.pad(STR.toString(BigNum.toString(BigNum.toHex(val)).slice(2)), padWidth, padChar).slice(1, -1); // convert number to hex, string, slice off 0x, pad w/ zeroes, and concatenate with data string
	}
	
	NDImage.toDisplay(NDImage.toImage(STR.toString("FibTri" + maxNum), STR.toString(data), padWidth*4, maxNum));
}
