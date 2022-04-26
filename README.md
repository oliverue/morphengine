# MorphEngine

MorphEngine is a JavaScript collection of ~2,000 math functions over a variety of data types, and a high-level language interpreter and code morpher on top of it.

Types supported include
- Real numbers (FP64)
- Complex numbers
- Binary numbers (octal, binary, hex)
- BigInt (arbitrary precision integers)
- BigFloat (arbitrary precision floats)
- Fractions
- Continuous Fractions
- Vectors/lists (of numbers, or arbitrary collections of other types)
- Matrices (same)
- Algebraic expressions (with very limited support for symbolic manipulation)
- Program fragments (a sequence of operands and operators)
- Code (JS code that can be injected into the runtime)
- Image (one-channel gray only)

The runtime has a `require` and extensions mechanism and additional types can be added.
You find some in the [add-ons](/add-ons) folder: [Color](add-ons/Color.js), [ChemFormula](add-ons/ChemFormula.js), ...

MorphEngine is the math engine inside of [ND1](https://github.com/oliverue/nd1), an iOS app, but can also run stand-alone in the browser or any WebView.

The list of functions is quite big and includes things like
- trigs, logs (for real and complex numbers, and, via "array processing", of arrays containing such numbers)
- conversions (between types like binary/oct/hex to/from dec, HMS <-> decimal, angles, units, ...)
- integers (prime numbers, factorization, modpow, and various number theory functions like phi, squareFree, moebius, omega, etc.)
- vector and matrix math (dot/cross/scalar/Euclidean products, rank, inversion, set functions, zip, fold, map, ...)

Here's a simple MorphEngine "program"

    << 1..10 divs >>
    
This calculates the lists of divisors for the numbers from 1 to 10 and will output

    [[1], [1,2], [1,3], [1, 2, 4], [1, 5], [1, 2, 3, 6], [1, 7], [1, 2, 4, 8], [1, 3, 9], [1, 2, 5, 10]]

You could also do that for a million numbers and then filter for the numbers that have exactly 3 divisors like so:

    << 1..1e6 dup divs { size } map { 3 == } select >>

or (more efficiently)

    << 1..1e6 dup ndivs { 3 == } select >>

and that will return an array of 167 numbers, the last being 994009.

On top of the core set of types and functions sits an interpreter that works with the RPN principle: args/operands first, followed by operator.
There's type inference: depending on the operand types, the right operator for the right type is invoked. Sometimes, this needs and implies casting, which conditionally takes place as well.

Fragments of code are a type itself and understood by specific functions that operate on them.
This includes operators from the world of functional programming like "map", "fold" (reduce), and "doUntil".

At an even higher level, control structures are provided for program flow, like "IF-THEN-ELSE" and "FOR"-loops.

The inspiration for this style of stack and object-oriented processing comes from HP calculators from yesteryear, and the engine kind of re-implements the command set of the old HP-28C and HP50g calculators.
This support is additional to base functionality and happens through a table of aliases that maps the old/classic names of these calculators to new/modern ones.
(For a new user, you want to steer clear of the classic names. It's easy enough to throw away the table, as well.)

The engine has a visualizer for its stack in HTML5 (though you could use the engine absolutely without that).
It also supports graphing (and follows here awkward and weird conventions from the old calculators) and plotting and image display via HTML5 Canvas.

The name-giving feature is the engine's ability to transform ("morph") some (not all) high-level code fragments into JavaScript.
That then allows a program like this

    << 1..100 { real isPowerOf2 } filter >>
    
to run at native (JS VM) speeds, without any appreciable interpreter overhead.

#### CAS

There's integration of the engine with WolframAlpha API. This adds support for a CAS (Computer Algebra System) and a ton of math and symbolic abilities (like symbolic integration). **BUT**, you need an API key (which is not provided) to activate this and it's not free.
Also, I think Wolfram moved on to the Wolfram Language and no longer encourages the use of the WA API. (But I don't know.) (In the code, search for XXX-YYY to find where the API key goes.)

Example:

    calculator.push("≪ 20 Cyclotomic ≫"); calculator.push("@eval");
    
Returns `'x^8-x^6+x^4-x^2+1'`, a symbolic algebraic expression.

This code was never released into the ND1 iOS app. You may or may not be able to do something with it.

#### GolfScript

One of the crazier experiments with MorphEngine was to reimplement [GolfScript](http://golfscript.com/golfscript/), the (original?) code golfing language, and fold the power of ME functions into it.
You'll find the code for the experiment in [add-ons/GolfScript.js](add-ons/GolfScript.js).

Example:

    calculator.push("gs:'' 6666,-2%{2+.2/@*\/10.3??2*+}*");
    
Returns the first 1000 digits of Pi. (As per example from the GolfScript website.) You find more examples in its unit tests.

#### Algebraic expressions

The engine supports algebraic expressions like `sin(x)+cos(x^2)` and uses a [parser](dependencies/generated/parser.js) for that, which was generated with the LALR(1) compiler compiler [JS/CC](https://jscc.brobston.com/index.html) using the BNF grammar [CalculateParserDefinition.txt](CalculateParserDefinition.txt).

## Documentation

Presently, there's only documentation [here](https://naivedesign.com/ND1/ND1_Reference.html).
I will work to distill this and add a doc folder in this repo.

[Concepts and code organization](https://naivedesign.com/ND1/ND1_Reference__JavaScript_API.html), [Custom Types](https://naivedesign.com/ND1/ND1_Reference__Custom_Types.html), [Function reference](https://naivedesign.com/docs/ND1_Reference_Functions.pdf), Examples, [Data Types](https://naivedesign.com/ND1/ND1_Reference__Data_Types.html)

I called the scripting language [RPL+](https://naivedesign.com/ND1/ND1_Reference__RPL+_Quick_Ref.html). Here's a [tutorial](https://naivedesign.com/ND1/Learning_RPL+.html).

## Install & Usage

Clone. Review [calc.js](calc.js) and decide which parts you want/need for your project.

Copy the file and any needed dependencies (search for "require(" in calc.js and see which ones you need) into your project's .js resources directory.
Decide whether you want to use the calc's poor man's `require` or switch to `import` (if you're in a ES6 environment). And decide how you want to load calc.js itself.

To just try out MorphEngine with the minimalistic stack HTML5 UI, copy `calc.{js,html}` and *all* of the files in [dependencies](dependencies) into a directory and point your browser at [calc.html](calc.html). (Also copy the [parser](dependencies/generated/parser.js) into that same directory.)

Then try some of the commands in [Examples](Examples.txt) and see the [unit tests](Unit%20Tests.txt).

The principal entry points into the engine are `calculator.push()` (to push args and ops) and `calculator.eval()` (to evaluate expressions).

Instead of calc.html, you can also try [contrib/icalc.html](contrib/icalc.html), which is a self-contained, hard-coded calculator UI that I tried on Kindle. It's just a start but suggests a possible direction.

## Unit Testing

There's currently no automated unit testing, but [Unit Tests](Unit%20Tests.txt) contains a thousand or so snippets that could be absorbed by a proper unit testing framework/methodology.
The ND1 calculator has a sharable folder for Unit testing, where such a framework is proposed.
(Yes, shame on me. I prioritized development speed and fun over doing the right, but mundane, thing to build and maintain unit testing.)

There's some separate [CAS unit testing](CAS%20Unit%20Tests.txt) as well. There you can see that it quickly gets hairy.

There're also separate [unit tests for the Golfscript/ME](GolfScriptME%20Unit%20Tests.txt) mash-up.

## Future & Thoughts

The future is uncertain. (Isn't it always?)

MorphEngine will remain part of ND1, which will continue to get published.

But, I've no big plans and no idea if it's a good or bad idea for someone to pick this up and/or borrow parts.

JavaScript is not a good language for math (which will likely not change). This project was a bit of a fun experiment with code morphing and exploiting the power and dynamism of a VM to implement a language on top of, but I'm not sure there're *serious* uses for it, as-is.
I still like the concept, but, for math use, you're probably better off looking elsewhere.

Unless, that is, you like to play and like the idea of *short* code snippets that can be quite powerful.

The code is plain, old ES5. One could upgrade this to ES6.
A real nice gain could be had from implementing iterators via iterator generators. Similarly to Python's going from a lame (immediate, list-producing) to a supercool (lazy, delayed) `range` operator from version 2.7 to 3.0, so could benefit MorphEngine's `range` and `a..b` notation. MorphEngine has no problem with a few million items in arrays, but expressing a whole array processing chain (=the best paradigm for scripting code in ME), and consuming basically no memory, would be awesome. (And help with some of the tougher [Project Euler](https://projecteuler.net) problems. Speaking of, there's an incomplete PE study guide showing ME examples [here](https://naivedesign.com/ND1/Project_Euler.html).)

I hope I'll get around to implementing what I thought would be the next cool thing: using WebGL/GLSL as computational backend for a further extended scripting language.
I have the 5 lines of code I want to be able to write to implement an interactive Mandelbrot explorer from scratch. For things like that, I think MorphEngine actually *is* a great test/development bed.

## See also

The incredible [Fabrice Bellard](https://bellard.org) implemented a similarly comprehensive math collection in JavaScript.
And he went much further and integrated these extensions directly into his own [JavaScript VM](https://bellard.org/quickjs/). Pretty rad.
(There's no scripting language, or code morphing, on top of that; but that apparently wasn't a design goal of his.)

Other than that, there appears to be not much action in the "Math for JavaScript" space, but please drop me a note if you want to be referenced here.
