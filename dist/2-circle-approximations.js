/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!************************************************!*\
  !*** ./demos/2-circle-approximations/index.js ***!
  \************************************************/
/***/ function(module, exports, __webpack_require__) {

	//TODO fix this
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(/*! babel-runtime/helpers/to-consumable-array */ 6)['default'];
	
	var _slicedToArray = __webpack_require__(/*! babel-runtime/helpers/sliced-to-array */ 7)['default'];
	
	var _core = __webpack_require__(/*! babel-runtime/core-js */ 4)['default'];
	
	var canvas = document.querySelector('canvas');
	var gl = WebGLUtils.setupWebGL(canvas);
	var points = [];
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0, 0, 0, 1);
	
	if (!WebGLUtils.Shaders.initFromElems(gl, document.getElementById('vshader'), document.getElementById('fshader'))) {
	  throw new Error('Failed to initialize shaders');
	}
	
	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	
	/**
	 * Generates a circle by approximating its
	 * points by rectangle subdivision.
	 *
	 * Remember:
	 * - Circle eq:
	 *     (x-a)^2 + (y-b)^2 = r^2
	 *        a: center_x
	 *        b: center_y
	 *        r: radius
	 * - by pytagorean triangle eq:
	 *   - apothem: (r*sqrt(2))/2
	 *   - side: r*sqrt(2)
	 *
	 *  a       b
	 *   |-----|
	 *   |     |
	 *   |-----|
	 *  d       c
	 *
	 * @param  {number} r radius
	 */
	function gen_circle(r) {
	  var SQRT_2 = Math.sqrt(2);
	  var apo = r * SQRT_2 / 2;
	  var side = r * SQRT_2;
	  var vertices = [MV.vec2(-apo, side / 2), // a
	  MV.vec2(apo, side / 2), // b
	  MV.vec2(-apo, -side / 2), // d
	  MV.vec2(apo, -side / 2)];
	
	  var count = 3;
	
	  recurse(vertices[0], vertices[1], count);
	  recurse(vertices[1], vertices[2], count);
	  recurse(vertices[2], vertices[3], count);
	  recurse(vertices[3], vertices[0], count);
	}
	
	function recurse(a, b, count) {
	  if (! count--) {
	    return add_to_points(a, b);
	  }recurse(normalize_point(MV.bisect(a, b, 0.5)), b, count);
	}
	
	function normalize_point(_ref) {
	  var _ref2 = _slicedToArray(_ref, 2);
	
	  var a = _ref2[0];
	  var b = _ref2[1];
	
	  console.log(a, b);
	  var norm = Math.sqrt(a * a + b * b);
	
	  return [a / norm, b / norm];
	}
	
	function add_to_points() {
	  points.push.apply(points, _toConsumableArray(_core.Array.from(arguments)));
	}
	
	gen_circle(1);
	console.log(points);
	
	function render() {
	  gl.clear(gl.COLOR_BUFFER_BIT);
	  gl.bufferData(gl.ARRAY_BUFFER, MV.flatten32f(points), gl.STATIC_DRAW);
	  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length);
	}
	
	(function loop() {
	  window.requestAnimationFrame(loop);
	  render();
	})();
	// c

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/*!************************************!*\
  !*** ./~/babel-runtime/core-js.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  "default": __webpack_require__(/*! core-js/library */ 10),
	  __esModule: true
	};


/***/ },
/* 5 */,
/* 6 */
/*!********************************************************!*\
  !*** ./~/babel-runtime/helpers/to-consumable-array.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(/*! babel-runtime/core-js */ 4)["default"];
	
	exports["default"] = function (arr) {
	  if (_core.Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
	
	    return arr2;
	  } else {
	    return _core.Array.from(arr);
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 7 */
/*!****************************************************!*\
  !*** ./~/babel-runtime/helpers/sliced-to-array.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(/*! babel-runtime/core-js */ 4)["default"];
	
	exports["default"] = function (arr, i) {
	  if (_core.Array.isArray(arr)) {
	    return arr;
	  } else if (_core.isIterable(Object(arr))) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;
	
	    try {
	      for (var _i = _core.getIterator(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);
	
	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }
	
	    return _arr;
	  } else {
	    throw new TypeError("Invalid attempt to destructure non-iterable instance");
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 8 */,
/* 9 */,
/* 10 */
/*!****************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/index.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./shim */ 12);
	__webpack_require__(/*! ./modules/core.dict */ 26);
	__webpack_require__(/*! ./modules/core.iter-helpers */ 13);
	__webpack_require__(/*! ./modules/core.$for */ 14);
	__webpack_require__(/*! ./modules/core.delay */ 15);
	__webpack_require__(/*! ./modules/core.binding */ 16);
	__webpack_require__(/*! ./modules/core.object */ 17);
	__webpack_require__(/*! ./modules/core.array.turn */ 18);
	__webpack_require__(/*! ./modules/core.number.iterator */ 19);
	__webpack_require__(/*! ./modules/core.number.math */ 20);
	__webpack_require__(/*! ./modules/core.string.escape-html */ 21);
	__webpack_require__(/*! ./modules/core.date */ 22);
	__webpack_require__(/*! ./modules/core.global */ 23);
	__webpack_require__(/*! ./modules/core.log */ 24);
	module.exports = __webpack_require__(/*! ./modules/$ */ 25).core;

/***/ },
/* 11 */,
/* 12 */
/*!***************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/shim.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./modules/es5 */ 28);
	__webpack_require__(/*! ./modules/es6.symbol */ 29);
	__webpack_require__(/*! ./modules/es6.object.assign */ 30);
	__webpack_require__(/*! ./modules/es6.object.is */ 31);
	__webpack_require__(/*! ./modules/es6.object.set-prototype-of */ 32);
	__webpack_require__(/*! ./modules/es6.object.to-string */ 33);
	__webpack_require__(/*! ./modules/es6.object.statics-accept-primitives */ 34);
	__webpack_require__(/*! ./modules/es6.function.name */ 35);
	__webpack_require__(/*! ./modules/es6.number.constructor */ 36);
	__webpack_require__(/*! ./modules/es6.number.statics */ 37);
	__webpack_require__(/*! ./modules/es6.math */ 38);
	__webpack_require__(/*! ./modules/es6.string.from-code-point */ 39);
	__webpack_require__(/*! ./modules/es6.string.raw */ 40);
	__webpack_require__(/*! ./modules/es6.string.iterator */ 41);
	__webpack_require__(/*! ./modules/es6.string.code-point-at */ 42);
	__webpack_require__(/*! ./modules/es6.string.ends-with */ 43);
	__webpack_require__(/*! ./modules/es6.string.includes */ 44);
	__webpack_require__(/*! ./modules/es6.string.repeat */ 45);
	__webpack_require__(/*! ./modules/es6.string.starts-with */ 46);
	__webpack_require__(/*! ./modules/es6.array.from */ 47);
	__webpack_require__(/*! ./modules/es6.array.of */ 48);
	__webpack_require__(/*! ./modules/es6.array.iterator */ 49);
	__webpack_require__(/*! ./modules/es6.array.species */ 50);
	__webpack_require__(/*! ./modules/es6.array.copy-within */ 51);
	__webpack_require__(/*! ./modules/es6.array.fill */ 52);
	__webpack_require__(/*! ./modules/es6.array.find */ 53);
	__webpack_require__(/*! ./modules/es6.array.find-index */ 54);
	__webpack_require__(/*! ./modules/es6.regexp */ 55);
	__webpack_require__(/*! ./modules/es6.promise */ 56);
	__webpack_require__(/*! ./modules/es6.map */ 57);
	__webpack_require__(/*! ./modules/es6.set */ 58);
	__webpack_require__(/*! ./modules/es6.weak-map */ 59);
	__webpack_require__(/*! ./modules/es6.weak-set */ 60);
	__webpack_require__(/*! ./modules/es6.reflect */ 61);
	__webpack_require__(/*! ./modules/es7.array.includes */ 62);
	__webpack_require__(/*! ./modules/es7.string.at */ 63);
	__webpack_require__(/*! ./modules/es7.regexp.escape */ 64);
	__webpack_require__(/*! ./modules/es7.object.get-own-property-descriptors */ 65);
	__webpack_require__(/*! ./modules/es7.object.to-array */ 66);
	__webpack_require__(/*! ./modules/js.array.statics */ 67);
	__webpack_require__(/*! ./modules/web.timers */ 68);
	__webpack_require__(/*! ./modules/web.immediate */ 69);
	__webpack_require__(/*! ./modules/web.dom.iterable */ 70);
	module.exports = __webpack_require__(/*! ./modules/$ */ 25).core;

/***/ },
/* 13 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.iter-helpers.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(/*! ./$ */ 25).core
	  , $iter = __webpack_require__(/*! ./$.iter */ 71);
	core.isIterable  = $iter.is;
	core.getIterator = $iter.get;

/***/ },
/* 14 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.$for.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , ctx     = __webpack_require__(/*! ./$.ctx */ 74)
	  , safe    = __webpack_require__(/*! ./$.uid */ 77).safe
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , $iter   = __webpack_require__(/*! ./$.iter */ 71)
	  , ENTRIES = safe('entries')
	  , FN      = safe('fn')
	  , ITER    = safe('iter')
	  , forOf          = $iter.forOf
	  , stepCall       = $iter.stepCall
	  , getIterator    = $iter.get
	  , setIterator    = $iter.set
	  , createIterator = $iter.create;
	function $for(iterable, entries){
	  if(!(this instanceof $for))return new $for(iterable, entries);
	  this[ITER]    = getIterator(iterable);
	  this[ENTRIES] = !!entries;
	}
	
	createIterator($for, 'Wrapper', function(){
	  return this[ITER].next();
	});
	var $forProto = $for.prototype;
	setIterator($forProto, function(){
	  return this[ITER]; // unwrap
	});
	
	function createChainIterator(next){
	  function Iterator(iter, fn, that){
	    this[ITER]    = getIterator(iter);
	    this[ENTRIES] = iter[ENTRIES];
	    this[FN]      = ctx(fn, that, iter[ENTRIES] ? 2 : 1);
	  }
	  createIterator(Iterator, 'Chain', next, $forProto);
	  setIterator(Iterator.prototype, $.that); // override $forProto iterator
	  return Iterator;
	}
	
	var MapIter = createChainIterator(function(){
	  var step = this[ITER].next();
	  return step.done
	    ? step
	    : $iter.step(0, stepCall(this[ITER], this[FN], step.value, this[ENTRIES]));
	});
	
	var FilterIter = createChainIterator(function(){
	  for(;;){
	    var step = this[ITER].next();
	    if(step.done || stepCall(this[ITER], this[FN], step.value, this[ENTRIES]))return step;
	  }
	});
	
	$.mix($forProto, {
	  of: function(fn, that){
	    forOf(this, this[ENTRIES], fn, that);
	  },
	  array: function(fn, that){
	    var result = [];
	    forOf(fn != undefined ? this.map(fn, that) : this, false, result.push, result);
	    return result;
	  },
	  filter: function(fn, that){
	    return new FilterIter(this, fn, that);
	  },
	  map: function(fn, that){
	    return new MapIter(this, fn, that);
	  }
	});
	
	$for.isIterable  = $iter.is;
	$for.getIterator = getIterator;
	
	$def($def.G + $def.F, {$for: $for});

/***/ },
/* 15 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.delay.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , partial = __webpack_require__(/*! ./$.partial */ 73);
	// https://esdiscuss.org/topic/promise-returning-delay-function
	$def($def.G + $def.F, {
	  delay: function(time){
	    return new ($.core.Promise || $.g.Promise)(function(resolve){
	      setTimeout(partial.call(resolve, true), time);
	    });
	  }
	});

/***/ },
/* 16 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.binding.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $      = __webpack_require__(/*! ./$ */ 25)
	  , ctx    = __webpack_require__(/*! ./$.ctx */ 74)
	  , $def   = __webpack_require__(/*! ./$.def */ 72)
	  , invoke = __webpack_require__(/*! ./$.invoke */ 75)
	  , hide   = $.hide
	  , assertFunction = __webpack_require__(/*! ./$.assert */ 76).fn
	  // IE8- dirty hack - redefined toLocaleString is not enumerable
	  , _ = $.DESC ? __webpack_require__(/*! ./$.uid */ 77)('tie') : 'toLocaleString'
	  , toLocaleString = {}.toLocaleString;
	
	// Placeholder
	$.core._ = $.path._ = $.path._ || {};
	
	$def($def.P + $def.F, 'Function', {
	  part: __webpack_require__(/*! ./$.partial */ 73),
	  only: function(numberArguments, that /* = @ */){
	    var fn     = assertFunction(this)
	      , n      = $.toLength(numberArguments)
	      , isThat = arguments.length > 1;
	    return function(/* ...args */){
	      var length = Math.min(n, arguments.length)
	        , args   = Array(length)
	        , i      = 0;
	      while(length > i)args[i] = arguments[i++];
	      return invoke(fn, args, isThat ? that : this);
	    };
	  }
	});
	
	function tie(key){
	  var that  = this
	    , bound = {};
	  return hide(that, _, function(key){ // eslint-disable-line no-shadow
	    if(key === undefined || !(key in that))return toLocaleString.call(that);
	    return $.has(bound, key) ? bound[key] : bound[key] = ctx(that[key], that, -1);
	  })[_](key);
	}
	
	hide($.path._, 'toString', function(){
	  return _;
	});
	
	hide(Object.prototype, _, tie);
	$.DESC || hide(Array.prototype, _, tie);

/***/ },
/* 17 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.object.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , ownKeys = __webpack_require__(/*! ./$.own-keys */ 78);
	function define(target, mixin){
	  var keys   = ownKeys($.toObject(mixin))
	    , length = keys.length
	    , i = 0, key;
	  while(length > i)$.setDesc(target, key = keys[i++], $.getDesc(mixin, key));
	  return target;
	}
	$def($def.S + $def.F, 'Object', {
	  isObject: $.isObject,
	  classof: __webpack_require__(/*! ./$.cof */ 79).classof,
	  define: define,
	  make: function(proto, mixin){
	    return define($.create(proto), mixin);
	  }
	});

/***/ },
/* 18 */
/*!**********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.array.turn.js ***!
  \**********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(/*! ./$ */ 25)
	  , $def           = __webpack_require__(/*! ./$.def */ 72)
	  , assertFunction = __webpack_require__(/*! ./$.assert */ 76).fn;
	$def($def.P + $def.F, 'Array', {
	  turn: function(fn, target /* = [] */){
	    assertFunction(fn);
	    var memo   = target == undefined ? [] : Object(target)
	      , O      = $.ES5Object(this)
	      , length = $.toLength(O.length)
	      , index  = 0;
	    while(length > index)if(fn(memo, O[index], index++, this) === false)break;
	    return memo;
	  }
	});
	__webpack_require__(/*! ./$.unscope */ 80)('turn');

/***/ },
/* 19 */
/*!***************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.number.iterator.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , ITER    = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , $iter   = __webpack_require__(/*! ./$.iter */ 71)
	  , step    = $iter.step
	  , NUMBER  = 'Number';
	function NumberIterator(iterated){
	  $.set(this, ITER, {l: $.toLength(iterated), i: 0});
	}
	$iter.create(NumberIterator, NUMBER, function(){
	  var iter = this[ITER]
	    , i    = iter.i++;
	  return i < iter.l ? step(0, i) : step(1);
	});
	$iter.define(Number, NUMBER, function(){
	  return new NumberIterator(this);
	});

/***/ },
/* 20 */
/*!***********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.number.math.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , invoke  = __webpack_require__(/*! ./$.invoke */ 75)
	  , methods = {};
	
	methods.random = function(lim /* = 0 */){
	  var a = +this
	    , b = lim == undefined ? 0 : +lim
	    , m = Math.min(a, b);
	  return Math.random() * (Math.max(a, b) - m) + m;
	};
	
	if($.FW)$.each.call((
	    // ES3:
	    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
	    // ES6:
	    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
	  ).split(','), function(key){
	    var fn = Math[key];
	    if(fn)methods[key] = function(/* ...args */){
	      // ie9- dont support strict mode & convert `this` to object -> convert it to number
	      var args = [+this]
	        , i    = 0;
	      while(arguments.length > i)args.push(arguments[i++]);
	      return invoke(fn, args);
	    };
	  }
	);
	
	$def($def.P + $def.F, 'Number', methods);

/***/ },
/* 21 */
/*!******************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.string.escape-html.js ***!
  \******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def     = __webpack_require__(/*! ./$.def */ 72)
	  , replacer = __webpack_require__(/*! ./$.replacer */ 81);
	var escapeHTMLDict = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&apos;'
	}, unescapeHTMLDict = {}, key;
	for(key in escapeHTMLDict)unescapeHTMLDict[escapeHTMLDict[key]] = key;
	$def($def.P + $def.F, 'String', {
	  escapeHTML:   replacer(/[&<>"']/g, escapeHTMLDict),
	  unescapeHTML: replacer(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)
	});

/***/ },
/* 22 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.date.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $            = __webpack_require__(/*! ./$ */ 25)
	  , $def         = __webpack_require__(/*! ./$.def */ 72)
	  , core         = $.core
	  , formatRegExp = /\b\w\w?\b/g
	  , flexioRegExp = /:(.*)\|(.*)$/
	  , locales      = {}
	  , current      = 'en'
	  , SECONDS      = 'Seconds'
	  , MINUTES      = 'Minutes'
	  , HOURS        = 'Hours'
	  , DATE         = 'Date'
	  , MONTH        = 'Month'
	  , YEAR         = 'FullYear';
	function lz(num){
	  return num > 9 ? num : '0' + num;
	}
	function createFormat(prefix){
	  return function(template, locale /* = current */){
	    var that = this
	      , dict = locales[$.has(locales, locale) ? locale : current];
	    function get(unit){
	      return that[prefix + unit]();
	    }
	    return String(template).replace(formatRegExp, function(part){
	      switch(part){
	        case 's'  : return get(SECONDS);                  // Seconds : 0-59
	        case 'ss' : return lz(get(SECONDS));              // Seconds : 00-59
	        case 'm'  : return get(MINUTES);                  // Minutes : 0-59
	        case 'mm' : return lz(get(MINUTES));              // Minutes : 00-59
	        case 'h'  : return get(HOURS);                    // Hours   : 0-23
	        case 'hh' : return lz(get(HOURS));                // Hours   : 00-23
	        case 'D'  : return get(DATE);                     // Date    : 1-31
	        case 'DD' : return lz(get(DATE));                 // Date    : 01-31
	        case 'W'  : return dict[0][get('Day')];           // Day     : Понедельник
	        case 'N'  : return get(MONTH) + 1;                // Month   : 1-12
	        case 'NN' : return lz(get(MONTH) + 1);            // Month   : 01-12
	        case 'M'  : return dict[2][get(MONTH)];           // Month   : Январь
	        case 'MM' : return dict[1][get(MONTH)];           // Month   : Января
	        case 'Y'  : return get(YEAR);                     // Year    : 2014
	        case 'YY' : return lz(get(YEAR) % 100);           // Year    : 14
	      } return part;
	    });
	  };
	}
	function addLocale(lang, locale){
	  function split(index){
	    var result = [];
	    $.each.call(locale.months.split(','), function(it){
	      result.push(it.replace(flexioRegExp, '$' + index));
	    });
	    return result;
	  }
	  locales[lang] = [locale.weekdays.split(','), split(1), split(2)];
	  return core;
	}
	$def($def.P + $def.F, DATE, {
	  format:    createFormat('get'),
	  formatUTC: createFormat('getUTC')
	});
	addLocale(current, {
	  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
	  months: 'January,February,March,April,May,June,July,August,September,October,November,December'
	});
	addLocale('ru', {
	  weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
	  months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,' +
	          'Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
	});
	core.locale = function(locale){
	  return $.has(locales, locale) ? current = locale : current;
	};
	core.addLocale = addLocale;

/***/ },
/* 23 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.global.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.G + $def.F, {global: __webpack_require__(/*! ./$ */ 25).g});

/***/ },
/* 24 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.log.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $    = __webpack_require__(/*! ./$ */ 25)
	  , $def = __webpack_require__(/*! ./$.def */ 72)
	  , log  = {}
	  , enabled = true;
	// Methods from https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
	$.each.call(('assert,clear,count,debug,dir,dirxml,error,exception,' +
	    'group,groupCollapsed,groupEnd,info,isIndependentlyComposed,log,' +
	    'markTimeline,profile,profileEnd,table,time,timeEnd,timeline,' +
	    'timelineEnd,timeStamp,trace,warn').split(','), function(key){
	  log[key] = function(){
	    if(enabled && $.g.console && $.isFunction(console[key])){
	      return Function.apply.call(console[key], console, arguments);
	    }
	  };
	});
	$def($def.G + $def.F, {log: __webpack_require__(/*! ./$.assign */ 82)(log.log, log, {
	  enable: function(){
	    enabled = true;
	  },
	  disable: function(){
	    enabled = false;
	  }
	})});

/***/ },
/* 25 */
/*!********************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global = typeof self != 'undefined' ? self : Function('return this')()
	  , core   = {}
	  , defineProperty = Object.defineProperty
	  , hasOwnProperty = {}.hasOwnProperty
	  , ceil  = Math.ceil
	  , floor = Math.floor
	  , max   = Math.max
	  , min   = Math.min;
	// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
	var DESC = !!function(){
	  try {
	    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
	  } catch(e){ /* empty */ }
	}();
	var hide = createDefiner(1);
	// 7.1.4 ToInteger
	function toInteger(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	}
	function desc(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	}
	function simpleSet(object, key, value){
	  object[key] = value;
	  return object;
	}
	function createDefiner(bitmap){
	  return DESC ? function(object, key, value){
	    return $.setDesc(object, key, desc(bitmap, value)); // eslint-disable-line no-use-before-define
	  } : simpleSet;
	}
	
	function isObject(it){
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	}
	function isFunction(it){
	  return typeof it == 'function';
	}
	function assertDefined(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	}
	
	var $ = module.exports = __webpack_require__(/*! ./$.fw */ 84)({
	  g: global,
	  core: core,
	  html: global.document && document.documentElement,
	  // http://jsperf.com/core-js-isobject
	  isObject:   isObject,
	  isFunction: isFunction,
	  it: function(it){
	    return it;
	  },
	  that: function(){
	    return this;
	  },
	  // 7.1.4 ToInteger
	  toInteger: toInteger,
	  // 7.1.15 ToLength
	  toLength: function(it){
	    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	  },
	  toIndex: function(index, length){
	    index = toInteger(index);
	    return index < 0 ? max(index + length, 0) : min(index, length);
	  },
	  has: function(it, key){
	    return hasOwnProperty.call(it, key);
	  },
	  create:     Object.create,
	  getProto:   Object.getPrototypeOf,
	  DESC:       DESC,
	  desc:       desc,
	  getDesc:    Object.getOwnPropertyDescriptor,
	  setDesc:    defineProperty,
	  getKeys:    Object.keys,
	  getNames:   Object.getOwnPropertyNames,
	  getSymbols: Object.getOwnPropertySymbols,
	  // Dummy, fix for not array-like ES3 string in es5 module
	  assertDefined: assertDefined,
	  ES5Object: Object,
	  toObject: function(it){
	    return $.ES5Object(assertDefined(it));
	  },
	  hide: hide,
	  def: createDefiner(0),
	  set: global.Symbol ? simpleSet : hide,
	  mix: function(target, src){
	    for(var key in src)hide(target, key, src[key]);
	    return target;
	  },
	  each: [].forEach
	});
	if(typeof __e != 'undefined')__e = core;
	if(typeof __g != 'undefined')__g = global;

/***/ },
/* 26 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.dict.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(/*! ./$ */ 25)
	  , ctx      = __webpack_require__(/*! ./$.ctx */ 74)
	  , $def     = __webpack_require__(/*! ./$.def */ 72)
	  , assign   = __webpack_require__(/*! ./$.assign */ 82)
	  , keyOf    = __webpack_require__(/*! ./$.keyof */ 83)
	  , ITER     = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , assert   = __webpack_require__(/*! ./$.assert */ 76)
	  , $iter    = __webpack_require__(/*! ./$.iter */ 71)
	  , step     = $iter.step
	  , getKeys  = $.getKeys
	  , toObject = $.toObject
	  , has      = $.has;
	
	function Dict(iterable){
	  var dict = $.create(null);
	  if(iterable != undefined){
	    if($iter.is(iterable)){
	      $iter.forOf(iterable, true, function(key, value){
	        dict[key] = value;
	      });
	    } else assign(dict, iterable);
	  }
	  return dict;
	}
	Dict.prototype = null;
	
	function DictIterator(iterated, kind){
	  $.set(this, ITER, {o: toObject(iterated), a: getKeys(iterated), i: 0, k: kind});
	}
	$iter.create(DictIterator, 'Dict', function(){
	  var iter = this[ITER]
	    , O    = iter.o
	    , keys = iter.a
	    , kind = iter.k
	    , key;
	  do {
	    if(iter.i >= keys.length){
	      iter.o = undefined;
	      return step(1);
	    }
	  } while(!has(O, key = keys[iter.i++]));
	  if(kind == 'key'  )return step(0, key);
	  if(kind == 'value')return step(0, O[key]);
	  return step(0, [key, O[key]]);
	});
	function createDictIter(kind){
	  return function(it){
	    return new DictIterator(it, kind);
	  };
	}
	function generic(A, B){
	  // strange IE quirks mode bug -> use typeof instead of isFunction
	  return typeof A == 'function' ? A : B;
	}
	
	// 0 -> Dict.forEach
	// 1 -> Dict.map
	// 2 -> Dict.filter
	// 3 -> Dict.some
	// 4 -> Dict.every
	// 5 -> Dict.find
	// 6 -> Dict.findKey
	// 7 -> Dict.mapPairs
	function createDictMethod(TYPE){
	  var IS_MAP   = TYPE == 1
	    , IS_EVERY = TYPE == 4;
	  return function(object, callbackfn, that /* = undefined */){
	    var f      = ctx(callbackfn, that, 3)
	      , O      = toObject(object)
	      , result = IS_MAP || TYPE == 7 || TYPE == 2 ? new (generic(this, Dict)) : undefined
	      , key, val, res;
	    for(key in O)if(has(O, key)){
	      val = O[key];
	      res = f(val, key, object);
	      if(TYPE){
	        if(IS_MAP)result[key] = res;            // map
	        else if(res)switch(TYPE){
	          case 2: result[key] = val; break;     // filter
	          case 3: return true;                  // some
	          case 5: return val;                   // find
	          case 6: return key;                   // findKey
	          case 7: result[res[0]] = res[1];      // mapPairs
	        } else if(IS_EVERY)return false;        // every
	      }
	    }
	    return TYPE == 3 || IS_EVERY ? IS_EVERY : result;
	  };
	}
	
	// true  -> Dict.turn
	// false -> Dict.reduce
	function createDictReduce(IS_TURN){
	  return function(object, mapfn, init){
	    assert.fn(mapfn);
	    var O      = toObject(object)
	      , keys   = getKeys(O)
	      , length = keys.length
	      , i      = 0
	      , memo, key, result;
	    if(IS_TURN){
	      memo = init == undefined ? new (generic(this, Dict)) : Object(init);
	    } else if(arguments.length < 3){
	      assert(length, 'Reduce of empty object with no initial value');
	      memo = O[keys[i++]];
	    } else memo = Object(init);
	    while(length > i)if(has(O, key = keys[i++])){
	      result = mapfn(memo, O[key], key, object);
	      if(IS_TURN){
	        if(result === false)break;
	      } else memo = result;
	    }
	    return memo;
	  };
	}
	var findKey = createDictMethod(6);
	
	$def($def.G + $def.F, {Dict: $.mix(Dict, {
	  keys:     createDictIter('key'),
	  values:   createDictIter('value'),
	  entries:  createDictIter('key+value'),
	  forEach:  createDictMethod(0),
	  map:      createDictMethod(1),
	  filter:   createDictMethod(2),
	  some:     createDictMethod(3),
	  every:    createDictMethod(4),
	  find:     createDictMethod(5),
	  findKey:  findKey,
	  mapPairs: createDictMethod(7),
	  reduce:   createDictReduce(false),
	  turn:     createDictReduce(true),
	  keyOf:    keyOf,
	  includes: function(object, el){
	    return (el == el ? keyOf(object, el) : findKey(object, function(it){
	      return it != it;
	    })) !== undefined;
	  },
	  // Has / get / set own property
	  has: has,
	  get: function(object, key){
	    if(has(object, key))return object[key];
	  },
	  set: $.def,
	  isDict: function(it){
	    return $.isObject(it) && $.getProto(it) === Dict.prototype;
	  }
	})});

/***/ },
/* 27 */,
/* 28 */
/*!**********************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es5.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $                = __webpack_require__(/*! ./$ */ 25)
	  , cof              = __webpack_require__(/*! ./$.cof */ 79)
	  , $def             = __webpack_require__(/*! ./$.def */ 72)
	  , invoke           = __webpack_require__(/*! ./$.invoke */ 75)
	  , arrayMethod      = __webpack_require__(/*! ./$.array-methods */ 86)
	  , IE_PROTO         = __webpack_require__(/*! ./$.uid */ 77).safe('__proto__')
	  , assert           = __webpack_require__(/*! ./$.assert */ 76)
	  , assertObject     = assert.obj
	  , ObjectProto      = Object.prototype
	  , A                = []
	  , slice            = A.slice
	  , indexOf          = A.indexOf
	  , classof          = cof.classof
	  , defineProperties = Object.defineProperties
	  , has              = $.has
	  , defineProperty   = $.setDesc
	  , getOwnDescriptor = $.getDesc
	  , isFunction       = $.isFunction
	  , toObject         = $.toObject
	  , toLength         = $.toLength
	  , IE8_DOM_DEFINE   = false;
	
	if(!$.DESC){
	  try {
	    IE8_DOM_DEFINE = defineProperty(document.createElement('div'), 'x',
	      {get: function(){ return 8; }}
	    ).x == 8;
	  } catch(e){ /* empty */ }
	  $.setDesc = function(O, P, Attributes){
	    if(IE8_DOM_DEFINE)try {
	      return defineProperty(O, P, Attributes);
	    } catch(e){ /* empty */ }
	    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
	    return O;
	  };
	  $.getDesc = function(O, P){
	    if(IE8_DOM_DEFINE)try {
	      return getOwnDescriptor(O, P);
	    } catch(e){ /* empty */ }
	    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
	  };
	  defineProperties = function(O, Properties){
	    assertObject(O);
	    var keys   = $.getKeys(Properties)
	      , length = keys.length
	      , i = 0
	      , P;
	    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
	    return O;
	  };
	}
	$def($def.S + $def.F * !$.DESC, 'Object', {
	  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $.getDesc,
	  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	  defineProperty: $.setDesc,
	  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
	  defineProperties: defineProperties
	});
	
	  // IE 8- don't enum bug keys
	var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
	            'toLocaleString,toString,valueOf').split(',')
	  // Additional keys for getOwnPropertyNames
	  , keys2 = keys1.concat('length', 'prototype')
	  , keysLen1 = keys1.length;
	
	// Create object with `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = document.createElement('iframe')
	    , i      = keysLen1
	    , iframeDocument;
	  iframe.style.display = 'none';
	  $.html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write('<script>document.F=Object</script>');
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict.prototype[keys1[i]];
	  return createDict();
	};
	function createGetKeys(names, length){
	  return function(object){
	    var O      = toObject(object)
	      , i      = 0
	      , result = []
	      , key;
	    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	    // Don't enum bug & hidden keys
	    while(length > i)if(has(O, key = names[i++])){
	      ~indexOf.call(result, key) || result.push(key);
	    }
	    return result;
	  };
	}
	function isPrimitive(it){ return !$.isObject(it); }
	function Empty(){}
	$def($def.S, 'Object', {
	  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	  getPrototypeOf: $.getProto = $.getProto || function(O){
	    O = Object(assert.def(O));
	    if(has(O, IE_PROTO))return O[IE_PROTO];
	    if(isFunction(O.constructor) && O instanceof O.constructor){
	      return O.constructor.prototype;
	    } return O instanceof Object ? ObjectProto : null;
	  },
	  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
	  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	  create: $.create = $.create || function(O, /*?*/Properties){
	    var result;
	    if(O !== null){
	      Empty.prototype = assertObject(O);
	      result = new Empty();
	      Empty.prototype = null;
	      // add "__proto__" for Object.getPrototypeOf shim
	      result[IE_PROTO] = O;
	    } else result = createDict();
	    return Properties === undefined ? result : defineProperties(result, Properties);
	  },
	  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
	  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
	  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
	  seal: $.it, // <- cap
	  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
	  freeze: $.it, // <- cap
	  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
	  preventExtensions: $.it, // <- cap
	  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
	  isSealed: isPrimitive, // <- cap
	  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
	  isFrozen: isPrimitive, // <- cap
	  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
	  isExtensible: $.isObject // <- cap
	});
	
	// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
	$def($def.P, 'Function', {
	  bind: function(that /*, args... */){
	    var fn       = assert.fn(this)
	      , partArgs = slice.call(arguments, 1);
	    function bound(/* args... */){
	      var args = partArgs.concat(slice.call(arguments));
	      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
	    }
	    if(fn.prototype)bound.prototype = fn.prototype;
	    return bound;
	  }
	});
	
	// Fix for not array-like ES3 string
	function arrayMethodFix(fn){
	  return function(){
	    return fn.apply($.ES5Object(this), arguments);
	  };
	}
	if(!(0 in Object('z') && 'z'[0] == 'z')){
	  $.ES5Object = function(it){
	    return cof(it) == 'String' ? it.split('') : Object(it);
	  };
	}
	$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
	  slice: arrayMethodFix(slice),
	  join: arrayMethodFix(A.join)
	});
	
	// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
	$def($def.S, 'Array', {
	  isArray: function(arg){
	    return cof(arg) == 'Array';
	  }
	});
	function createArrayReduce(isRight){
	  return function(callbackfn, memo){
	    assert.fn(callbackfn);
	    var O      = toObject(this)
	      , length = toLength(O.length)
	      , index  = isRight ? length - 1 : 0
	      , i      = isRight ? -1 : 1;
	    if(arguments.length < 2)for(;;){
	      if(index in O){
	        memo = O[index];
	        index += i;
	        break;
	      }
	      index += i;
	      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
	    }
	    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
	      memo = callbackfn(memo, O[index], index, this);
	    }
	    return memo;
	  };
	}
	$def($def.P, 'Array', {
	  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
	  forEach: $.each = $.each || arrayMethod(0),
	  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
	  map: arrayMethod(1),
	  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
	  filter: arrayMethod(2),
	  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
	  some: arrayMethod(3),
	  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
	  every: arrayMethod(4),
	  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
	  reduce: createArrayReduce(false),
	  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
	  reduceRight: createArrayReduce(true),
	  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
	  indexOf: indexOf = indexOf || __webpack_require__(/*! ./$.array-includes */ 87)(false),
	  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
	  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
	    var O      = toObject(this)
	      , length = toLength(O.length)
	      , index  = length - 1;
	    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
	    if(index < 0)index = toLength(length + index);
	    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
	    return -1;
	  }
	});
	
	// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
	$def($def.P, 'String', {trim: __webpack_require__(/*! ./$.replacer */ 81)(/^\s*([\s\S]*\S)?\s*$/, '$1')});
	
	// 20.3.3.1 / 15.9.4.4 Date.now()
	$def($def.S, 'Date', {now: function(){
	  return +new Date;
	}});
	
	function lz(num){
	  return num > 9 ? num : '0' + num;
	}
	// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
	$def($def.P, 'Date', {toISOString: function(){
	  if(!isFinite(this))throw RangeError('Invalid time value');
	  var d = this
	    , y = d.getUTCFullYear()
	    , m = d.getUTCMilliseconds()
	    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
	  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
	    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
	    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
	    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
	}});
	
	if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
	  var tag = classof(it);
	  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
	};

/***/ },
/* 29 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.symbol.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $        = __webpack_require__(/*! ./$ */ 25)
	  , setTag   = __webpack_require__(/*! ./$.cof */ 79).set
	  , uid      = __webpack_require__(/*! ./$.uid */ 77)
	  , $def     = __webpack_require__(/*! ./$.def */ 72)
	  , keyOf    = __webpack_require__(/*! ./$.keyof */ 83)
	  , has      = $.has
	  , hide     = $.hide
	  , getNames = $.getNames
	  , toObject = $.toObject
	  , Symbol   = $.g.Symbol
	  , Base     = Symbol
	  , setter   = false
	  , TAG      = uid.safe('tag')
	  , SymbolRegistry = {}
	  , AllSymbols     = {};
	
	function wrap(tag){
	  var sym = AllSymbols[tag] = $.set($.create(Symbol.prototype), TAG, tag);
	  $.DESC && setter && $.setDesc(Object.prototype, tag, {
	    configurable: true,
	    set: function(value){
	      hide(this, tag, value);
	    }
	  });
	  return sym;
	}
	
	// 19.4.1.1 Symbol([description])
	if(!$.isFunction(Symbol)){
	  Symbol = function(description){
	    if(this instanceof Symbol)throw TypeError('Symbol is not a constructor');
	    return wrap(uid(description));
	  };
	  hide(Symbol.prototype, 'toString', function(){
	    return this[TAG];
	  });
	}
	$def($def.G + $def.W, {Symbol: Symbol});
	
	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  pure: uid.safe,
	  set: $.set,
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	    'species,split,toPrimitive,toStringTag,unscopables'
	  ).split(','), function(it){
	    var sym = __webpack_require__(/*! ./$.wks */ 85)(it);
	    symbolStatics[it] = Symbol === Base ? sym : wrap(sym);
	  }
	);
	
	setter = true;
	
	$def($def.S, 'Symbol', symbolStatics);
	
	$def($def.S + $def.F * (Symbol != Base), 'Object', {
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: function(it){
	    var names = getNames(toObject(it)), result = [], key, i = 0;
	    while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
	    return result;
	  },
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: function(it){
	    var names = getNames(toObject(it)), result = [], key, i = 0;
	    while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
	    return result;
	  }
	});
	
	setTag(Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setTag($.g.JSON, 'JSON', true);

/***/ },
/* 30 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.assign.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'Object', {assign: __webpack_require__(/*! ./$.assign */ 82)});

/***/ },
/* 31 */
/*!********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.is.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.10 Object.is(value1, value2)
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'Object', {
	  is: function(x, y){
	    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	  }
	});

/***/ },
/* 32 */
/*!**********************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.set-prototype-of.js ***!
  \**********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'Object', {setPrototypeOf: __webpack_require__(/*! ./$.set-proto */ 88)});

/***/ },
/* 33 */
/*!***************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.to-string.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.3.6 Object.prototype.toString()
	var $   = __webpack_require__(/*! ./$ */ 25)
	  , cof = __webpack_require__(/*! ./$.cof */ 79)
	  , tmp = {};
	tmp[__webpack_require__(/*! ./$.wks */ 85)('toStringTag')] = 'z';
	if($.FW && cof(tmp) != 'z')$.hide(Object.prototype, 'toString', function(){
	  return '[object ' + cof.classof(this) + ']';
	});

/***/ },
/* 34 */
/*!*******************************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.statics-accept-primitives.js ***!
  \*******************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(/*! ./$ */ 25)
	  , $def     = __webpack_require__(/*! ./$.def */ 72)
	  , isObject = $.isObject
	  , toObject = $.toObject;
	function wrapObjectMethod(METHOD, MODE){
	  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
	    , f   = 0
	    , o   = {};
	  o[METHOD] = MODE == 1 ? function(it){
	    return isObject(it) ? fn(it) : it;
	  } : MODE == 2 ? function(it){
	    return isObject(it) ? fn(it) : true;
	  } : MODE == 3 ? function(it){
	    return isObject(it) ? fn(it) : false;
	  } : MODE == 4 ? function(it, key){
	    return fn(toObject(it), key);
	  } : MODE == 5 ? function(it){
	    return fn(Object($.assertDefined(it)));
	  } : function(it){
	    return fn(toObject(it));
	  };
	  try {
	    fn('z');
	  } catch(e){
	    f = 1;
	  }
	  $def($def.S + $def.F * f, 'Object', o);
	}
	wrapObjectMethod('freeze', 1);
	wrapObjectMethod('seal', 1);
	wrapObjectMethod('preventExtensions', 1);
	wrapObjectMethod('isFrozen', 2);
	wrapObjectMethod('isSealed', 2);
	wrapObjectMethod('isExtensible', 3);
	wrapObjectMethod('getOwnPropertyDescriptor', 4);
	wrapObjectMethod('getPrototypeOf', 5);
	wrapObjectMethod('keys');
	wrapObjectMethod('getOwnPropertyNames');

/***/ },
/* 35 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.function.name.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , NAME = 'name'
	  , setDesc = $.setDesc
	  , FunctionProto = Function.prototype;
	// 19.2.4.2 name
	NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
	  configurable: true,
	  get: function(){
	    var match = String(this).match(/^\s*function ([^ (]*)/)
	      , name  = match ? match[1] : '';
	    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
	    return name;
	  },
	  set: function(value){
	    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
	  }
	});

/***/ },
/* 36 */
/*!*****************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.number.constructor.js ***!
  \*****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $          = __webpack_require__(/*! ./$ */ 25)
	  , isObject   = $.isObject
	  , isFunction = $.isFunction
	  , NUMBER     = 'Number'
	  , Number     = $.g[NUMBER]
	  , Base       = Number
	  , proto      = Number.prototype;
	function toPrimitive(it){
	  var fn, val;
	  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
	  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to number");
	}
	function toNumber(it){
	  if(isObject(it))it = toPrimitive(it);
	  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
	    var binary = false;
	    switch(it.charCodeAt(1)){
	      case 66 : case 98  : binary = true;
	      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
	    }
	  } return +it;
	}
	if($.FW && !(Number('0o1') && Number('0b1'))){
	  Number = function Number(it){
	    return this instanceof Number ? new Base(toNumber(it)) : toNumber(it);
	  };
	  $.each.call($.DESC ? $.getNames(Base) : (
	      // ES3:
	      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	      // ES6 (in case, if modules with ES6 Number statics required before):
	      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	    ).split(','), function(key){
	      if($.has(Base, key) && !$.has(Number, key)){
	        $.setDesc(Number, key, $.getDesc(Base, key));
	      }
	    }
	  );
	  Number.prototype = proto;
	  proto.constructor = Number;
	  $.hide($.g, NUMBER, Number);
	}

/***/ },
/* 37 */
/*!*************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.number.statics.js ***!
  \*************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $     = __webpack_require__(/*! ./$ */ 25)
	  , $def  = __webpack_require__(/*! ./$.def */ 72)
	  , abs   = Math.abs
	  , floor = Math.floor
	  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
	function isInteger(it){
	  return !$.isObject(it) && isFinite(it) && floor(it) === it;
	}
	$def($def.S, 'Number', {
	  // 20.1.2.1 Number.EPSILON
	  EPSILON: Math.pow(2, -52),
	  // 20.1.2.2 Number.isFinite(number)
	  isFinite: function(it){
	    return typeof it == 'number' && isFinite(it);
	  },
	  // 20.1.2.3 Number.isInteger(number)
	  isInteger: isInteger,
	  // 20.1.2.4 Number.isNaN(number)
	  isNaN: function(number){
	    return number != number;
	  },
	  // 20.1.2.5 Number.isSafeInteger(number)
	  isSafeInteger: function(number){
	    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
	  },
	  // 20.1.2.6 Number.MAX_SAFE_INTEGER
	  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
	  // 20.1.2.10 Number.MIN_SAFE_INTEGER
	  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
	  // 20.1.2.12 Number.parseFloat(string)
	  parseFloat: parseFloat,
	  // 20.1.2.13 Number.parseInt(string, radix)
	  parseInt: parseInt
	});

/***/ },
/* 38 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.math.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Infinity = 1 / 0
	  , $def  = __webpack_require__(/*! ./$.def */ 72)
	  , E     = Math.E
	  , pow   = Math.pow
	  , abs   = Math.abs
	  , exp   = Math.exp
	  , log   = Math.log
	  , sqrt  = Math.sqrt
	  , ceil  = Math.ceil
	  , floor = Math.floor
	  , sign  = Math.sign || function(x){
	      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
	    };
	
	// 20.2.2.5 Math.asinh(x)
	function asinh(x){
	  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
	}
	// 20.2.2.14 Math.expm1(x)
	function expm1(x){
	  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
	}
	
	$def($def.S, 'Math', {
	  // 20.2.2.3 Math.acosh(x)
	  acosh: function(x){
	    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
	  },
	  // 20.2.2.5 Math.asinh(x)
	  asinh: asinh,
	  // 20.2.2.7 Math.atanh(x)
	  atanh: function(x){
	    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
	  },
	  // 20.2.2.9 Math.cbrt(x)
	  cbrt: function(x){
	    return sign(x = +x) * pow(abs(x), 1 / 3);
	  },
	  // 20.2.2.11 Math.clz32(x)
	  clz32: function(x){
	    return (x >>>= 0) ? 32 - x.toString(2).length : 32;
	  },
	  // 20.2.2.12 Math.cosh(x)
	  cosh: function(x){
	    return (exp(x = +x) + exp(-x)) / 2;
	  },
	  // 20.2.2.14 Math.expm1(x)
	  expm1: expm1,
	  // 20.2.2.16 Math.fround(x)
	  // TODO: fallback for IE9-
	  fround: function(x){
	    return new Float32Array([x])[0];
	  },
	  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
	  hypot: function(value1, value2){ // eslint-disable-line no-unused-vars
	    var sum  = 0
	      , len1 = arguments.length
	      , len2 = len1
	      , args = Array(len1)
	      , larg = -Infinity
	      , arg;
	    while(len1--){
	      arg = args[len1] = +arguments[len1];
	      if(arg == Infinity || arg == -Infinity)return Infinity;
	      if(arg > larg)larg = arg;
	    }
	    larg = arg || 1;
	    while(len2--)sum += pow(args[len2] / larg, 2);
	    return larg * sqrt(sum);
	  },
	  // 20.2.2.18 Math.imul(x, y)
	  imul: function(x, y){
	    var UInt16 = 0xffff
	      , xn = +x
	      , yn = +y
	      , xl = UInt16 & xn
	      , yl = UInt16 & yn;
	    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
	  },
	  // 20.2.2.20 Math.log1p(x)
	  log1p: function(x){
	    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
	  },
	  // 20.2.2.21 Math.log10(x)
	  log10: function(x){
	    return log(x) / Math.LN10;
	  },
	  // 20.2.2.22 Math.log2(x)
	  log2: function(x){
	    return log(x) / Math.LN2;
	  },
	  // 20.2.2.28 Math.sign(x)
	  sign: sign,
	  // 20.2.2.30 Math.sinh(x)
	  sinh: function(x){
	    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
	  },
	  // 20.2.2.33 Math.tanh(x)
	  tanh: function(x){
	    var a = expm1(x = +x)
	      , b = expm1(-x);
	    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
	  },
	  // 20.2.2.34 Math.trunc(x)
	  trunc: function(it){
	    return (it > 0 ? floor : ceil)(it);
	  }
	});

/***/ },
/* 39 */
/*!*********************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.from-code-point.js ***!
  \*********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def    = __webpack_require__(/*! ./$.def */ 72)
	  , toIndex = __webpack_require__(/*! ./$ */ 25).toIndex
	  , fromCharCode = String.fromCharCode;
	
	$def($def.S, 'String', {
	  // 21.1.2.2 String.fromCodePoint(...codePoints)
	  fromCodePoint: function(x){ // eslint-disable-line no-unused-vars
	    var res = []
	      , len = arguments.length
	      , i   = 0
	      , code;
	    while(len > i){
	      code = +arguments[i++];
	      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
	      res.push(code < 0x10000
	        ? fromCharCode(code)
	        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
	      );
	    } return res.join('');
	  }
	});

/***/ },
/* 40 */
/*!*********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.raw.js ***!
  \*********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $    = __webpack_require__(/*! ./$ */ 25)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	
	$def($def.S, 'String', {
	  // 21.1.2.4 String.raw(callSite, ...substitutions)
	  raw: function(callSite){
	    var raw = $.toObject(callSite.raw)
	      , len = $.toLength(raw.length)
	      , sln = arguments.length
	      , res = []
	      , i   = 0;
	    while(len > i){
	      res.push(String(raw[i++]));
	      if(i < sln)res.push(String(arguments[i]));
	    } return res.join('');
	  }
	});

/***/ },
/* 41 */
/*!**************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.iterator.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var set   = __webpack_require__(/*! ./$ */ 25).set
	  , at    = __webpack_require__(/*! ./$.string-at */ 89)(true)
	  , ITER  = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , $iter = __webpack_require__(/*! ./$.iter */ 71)
	  , step  = $iter.step;
	
	// 21.1.3.27 String.prototype[@@iterator]()
	$iter.std(String, 'String', function(iterated){
	  set(this, ITER, {o: String(iterated), i: 0});
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var iter  = this[ITER]
	    , O     = iter.o
	    , index = iter.i
	    , point;
	  if(index >= O.length)return step(1);
	  point = at.call(O, index);
	  iter.i += point.length;
	  return step(0, point);
	});

/***/ },
/* 42 */
/*!*******************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.code-point-at.js ***!
  \*******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'String', {
	  // 21.1.3.3 String.prototype.codePointAt(pos)
	  codePointAt: __webpack_require__(/*! ./$.string-at */ 89)(false)
	});

/***/ },
/* 43 */
/*!***************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.ends-with.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , cof  = __webpack_require__(/*! ./$.cof */ 79)
	  , $def = __webpack_require__(/*! ./$.def */ 72)
	  , toLength = $.toLength;
	
	$def($def.P, 'String', {
	  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
	  endsWith: function(searchString /*, endPosition = @length */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    var that = String($.assertDefined(this))
	      , endPosition = arguments[1]
	      , len = toLength(that.length)
	      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
	    searchString += '';
	    return that.slice(end - searchString.length, end) === searchString;
	  }
	});

/***/ },
/* 44 */
/*!**************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.includes.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , cof  = __webpack_require__(/*! ./$.cof */ 79)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	
	$def($def.P, 'String', {
	  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
	  includes: function(searchString /*, position = 0 */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
	  }
	});

/***/ },
/* 45 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.repeat.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	
	$def($def.P, 'String', {
	  // 21.1.3.13 String.prototype.repeat(count)
	  repeat: function(count){
	    var str = String($.assertDefined(this))
	      , res = ''
	      , n   = $.toInteger(count);
	    if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
	    for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
	    return res;
	  }
	});

/***/ },
/* 46 */
/*!*****************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.starts-with.js ***!
  \*****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , cof  = __webpack_require__(/*! ./$.cof */ 79)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	
	$def($def.P, 'String', {
	  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
	  startsWith: function(searchString /*, position = 0 */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    var that  = String($.assertDefined(this))
	      , index = $.toLength(Math.min(arguments[1], that.length));
	    searchString += '';
	    return that.slice(index, index + searchString.length) === searchString;
	  }
	});

/***/ },
/* 47 */
/*!*********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.from.js ***!
  \*********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $     = __webpack_require__(/*! ./$ */ 25)
	  , ctx   = __webpack_require__(/*! ./$.ctx */ 74)
	  , $def  = __webpack_require__(/*! ./$.def */ 72)
	  , $iter = __webpack_require__(/*! ./$.iter */ 71)
	  , stepCall = $iter.stepCall;
	$def($def.S + $def.F * $iter.DANGER_CLOSING, 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = Object($.assertDefined(arrayLike))
	      , mapfn   = arguments[1]
	      , mapping = mapfn !== undefined
	      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
	      , index   = 0
	      , length, result, step, iterator;
	    if($iter.is(O)){
	      iterator = $iter.get(O);
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      result   = new (typeof this == 'function' ? this : Array);
	      for(; !(step = iterator.next()).done; index++){
	        result[index] = mapping ? stepCall(iterator, f, [step.value, index], true) : step.value;
	      }
	    } else {
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
	      for(; length > index; index++){
	        result[index] = mapping ? f(O[index], index) : O[index];
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});

/***/ },
/* 48 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.of.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'Array', {
	  // 22.1.2.3 Array.of( ...items)
	  of: function(/* ...args */){
	    var index  = 0
	      , length = arguments.length
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      , result = new (typeof this == 'function' ? this : Array)(length);
	    while(length > index)result[index] = arguments[index++];
	    result.length = length;
	    return result;
	  }
	});

/***/ },
/* 49 */
/*!*************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.iterator.js ***!
  \*************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(/*! ./$ */ 25)
	  , setUnscope = __webpack_require__(/*! ./$.unscope */ 80)
	  , ITER       = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , $iter      = __webpack_require__(/*! ./$.iter */ 71)
	  , step       = $iter.step
	  , Iterators  = $iter.Iterators;
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	$iter.std(Array, 'Array', function(iterated, kind){
	  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var iter  = this[ITER]
	    , O     = iter.o
	    , kind  = iter.k
	    , index = iter.i++;
	  if(!O || index >= O.length){
	    iter.o = undefined;
	    return step(1);
	  }
	  if(kind == 'key'  )return step(0, index);
	  if(kind == 'value')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'value');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	setUnscope('keys');
	setUnscope('values');
	setUnscope('entries');

/***/ },
/* 50 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.species.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./$.species */ 90)(Array);

/***/ },
/* 51 */
/*!****************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.copy-within.js ***!
  \****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , toIndex = $.toIndex;
	$def($def.P, 'Array', {
	  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
	  copyWithin: function(target/* = 0 */, start /* = 0, end = @length */){
	    var O     = Object($.assertDefined(this))
	      , len   = $.toLength(O.length)
	      , to    = toIndex(target, len)
	      , from  = toIndex(start, len)
	      , end   = arguments[2]
	      , fin   = end === undefined ? len : toIndex(end, len)
	      , count = Math.min(fin - from, len - to)
	      , inc   = 1;
	    if(from < to && to < from + count){
	      inc  = -1;
	      from = from + count - 1;
	      to   = to   + count - 1;
	    }
	    while(count-- > 0){
	      if(from in O)O[to] = O[from];
	      else delete O[to];
	      to   += inc;
	      from += inc;
	    } return O;
	  }
	});
	__webpack_require__(/*! ./$.unscope */ 80)('copyWithin');

/***/ },
/* 52 */
/*!*********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.fill.js ***!
  \*********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , toIndex = $.toIndex;
	$def($def.P, 'Array', {
	  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
	  fill: function(value /*, start = 0, end = @length */){
	    var O      = Object($.assertDefined(this))
	      , length = $.toLength(O.length)
	      , index  = toIndex(arguments[1], length)
	      , end    = arguments[2]
	      , endPos = end === undefined ? length : toIndex(end, length);
	    while(endPos > index)O[index++] = value;
	    return O;
	  }
	});
	__webpack_require__(/*! ./$.unscope */ 80)('fill');

/***/ },
/* 53 */
/*!*********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.find.js ***!
  \*********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'Array', {
	  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
	  find: __webpack_require__(/*! ./$.array-methods */ 86)(5)
	});
	__webpack_require__(/*! ./$.unscope */ 80)('find');

/***/ },
/* 54 */
/*!***************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.find-index.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'Array', {
	  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
	  findIndex: __webpack_require__(/*! ./$.array-methods */ 86)(6)
	});
	__webpack_require__(/*! ./$.unscope */ 80)('findIndex');

/***/ },
/* 55 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.regexp.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $      = __webpack_require__(/*! ./$ */ 25)
	  , cof    = __webpack_require__(/*! ./$.cof */ 79)
	  , RegExp = $.g.RegExp
	  , Base   = RegExp
	  , proto  = RegExp.prototype;
	if($.FW && $.DESC){
	  // RegExp allows a regex with flags as the pattern
	  if(!function(){try{ return RegExp(/a/g, 'i') == '/a/i'; }catch(e){ /* empty */ }}()){
	    RegExp = function RegExp(pattern, flags){
	      return new Base(cof(pattern) == 'RegExp' && flags !== undefined
	        ? pattern.source : pattern, flags);
	    };
	    $.each.call($.getNames(Base), function(key){
	      key in RegExp || $.setDesc(RegExp, key, {
	        configurable: true,
	        get: function(){ return Base[key]; },
	        set: function(it){ Base[key] = it; }
	      });
	    });
	    proto.constructor = RegExp;
	    RegExp.prototype = proto;
	    $.hide($.g, 'RegExp', RegExp);
	  }
	  // 21.2.5.3 get RegExp.prototype.flags()
	  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
	    configurable: true,
	    get: __webpack_require__(/*! ./$.replacer */ 81)(/^.*\/(\w*)$/, '$1')
	  });
	}
	__webpack_require__(/*! ./$.species */ 90)(RegExp);

/***/ },
/* 56 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.promise.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , ctx     = __webpack_require__(/*! ./$.ctx */ 74)
	  , cof     = __webpack_require__(/*! ./$.cof */ 79)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , assert  = __webpack_require__(/*! ./$.assert */ 76)
	  , $iter   = __webpack_require__(/*! ./$.iter */ 71)
	  , SPECIES = __webpack_require__(/*! ./$.wks */ 85)('species')
	  , RECORD  = __webpack_require__(/*! ./$.uid */ 77).safe('record')
	  , forOf   = $iter.forOf
	  , PROMISE = 'Promise'
	  , global  = $.g
	  , process = global.process
	  , asap    = process && process.nextTick || __webpack_require__(/*! ./$.task */ 91).set
	  , Promise = global[PROMISE]
	  , Base    = Promise
	  , isFunction     = $.isFunction
	  , isObject       = $.isObject
	  , assertFunction = assert.fn
	  , assertObject   = assert.obj
	  , test;
	function getConstructor(C){
	  var S = assertObject(C)[SPECIES];
	  return S != undefined ? S : C;
	}
	isFunction(Promise) && isFunction(Promise.resolve)
	&& Promise.resolve(test = new Promise(function(){})) == test
	|| function(){
	  function isThenable(it){
	    var then;
	    if(isObject(it))then = it.then;
	    return isFunction(then) ? then : false;
	  }
	  function handledRejectionOrHasOnRejected(promise){
	    var record = promise[RECORD]
	      , chain  = record.c
	      , i      = 0
	      , react;
	    if(record.h)return true;
	    while(chain.length > i){
	      react = chain[i++];
	      if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
	    }
	  }
	  function notify(record, isReject){
	    var chain = record.c;
	    if(isReject || chain.length)asap(function(){
	      var promise = record.p
	        , value   = record.v
	        , ok      = record.s == 1
	        , i       = 0;
	      if(isReject && !handledRejectionOrHasOnRejected(promise)){
	        setTimeout(function(){
	          if(!handledRejectionOrHasOnRejected(promise)){
	            if(cof(process) == 'process'){
	              process.emit('unhandledRejection', value, promise);
	            } else if(global.console && isFunction(console.error)){
	              console.error('Unhandled promise rejection', value);
	            }
	          }
	        }, 1e3);
	      } else while(chain.length > i)!function(react){
	        var cb = ok ? react.ok : react.fail
	          , ret, then;
	        try {
	          if(cb){
	            if(!ok)record.h = true;
	            ret = cb === true ? value : cb(value);
	            if(ret === react.P){
	              react.rej(TypeError(PROMISE + '-chain cycle'));
	            } else if(then = isThenable(ret)){
	              then.call(ret, react.res, react.rej);
	            } else react.res(ret);
	          } else react.rej(value);
	        } catch(err){
	          react.rej(err);
	        }
	      }(chain[i++]);
	      chain.length = 0;
	    });
	  }
	  function reject(value){
	    var record = this;
	    if(record.d)return;
	    record.d = true;
	    record = record.r || record; // unwrap
	    record.v = value;
	    record.s = 2;
	    notify(record, true);
	  }
	  function resolve(value){
	    var record = this
	      , then, wrapper;
	    if(record.d)return;
	    record.d = true;
	    record = record.r || record; // unwrap
	    try {
	      if(then = isThenable(value)){
	        wrapper = {r: record, d: false}; // wrap
	        then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
	      } else {
	        record.v = value;
	        record.s = 1;
	        notify(record);
	      }
	    } catch(err){
	      reject.call(wrapper || {r: record, d: false}, err); // wrap
	    }
	  }
	  // 25.4.3.1 Promise(executor)
	  Promise = function(executor){
	    assertFunction(executor);
	    var record = {
	      p: assert.inst(this, Promise, PROMISE), // <- promise
	      c: [],                                  // <- chain
	      s: 0,                                   // <- state
	      d: false,                               // <- done
	      v: undefined,                           // <- value
	      h: false                                // <- handled rejection
	    };
	    $.hide(this, RECORD, record);
	    try {
	      executor(ctx(resolve, record, 1), ctx(reject, record, 1));
	    } catch(err){
	      reject.call(record, err);
	    }
	  };
	  $.mix(Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function(onFulfilled, onRejected){
	      var S = assertObject(assertObject(this).constructor)[SPECIES];
	      var react = {
	        ok:   isFunction(onFulfilled) ? onFulfilled : true,
	        fail: isFunction(onRejected)  ? onRejected  : false
	      };
	      var P = react.P = new (S != undefined ? S : Promise)(function(res, rej){
	        react.res = assertFunction(res);
	        react.rej = assertFunction(rej);
	      });
	      var record = this[RECORD];
	      record.c.push(react);
	      record.s && notify(record);
	      return P;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	}();
	$def($def.G + $def.W + $def.F * (Promise != Base), {Promise: Promise});
	$def($def.S, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function(r){
	    return new (getConstructor(this))(function(res, rej){
	      rej(r);
	    });
	  },
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function(x){
	    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
	      ? x : new (getConstructor(this))(function(res){
	        res(x);
	      });
	  }
	});
	$def($def.S + $def.F * ($iter.fail(function(iter){
	  Promise.all(iter)['catch'](function(){});
	}) || $iter.DANGER_CLOSING), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function(iterable){
	    var C      = getConstructor(this)
	      , values = [];
	    return new C(function(resolve, reject){
	      forOf(iterable, false, values.push, values);
	      var remaining = values.length
	        , results   = Array(remaining);
	      if(remaining)$.each.call(values, function(promise, index){
	        C.resolve(promise).then(function(value){
	          results[index] = value;
	          --remaining || resolve(results);
	        }, reject);
	      });
	      else resolve(results);
	    });
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function(iterable){
	    var C = getConstructor(this);
	    return new C(function(resolve, reject){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(resolve, reject);
	      });
	    });
	  }
	});
	cof.set(Promise, PROMISE);
	__webpack_require__(/*! ./$.species */ 90)(Promise);

/***/ },
/* 57 */
/*!**************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.map.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(/*! ./$.collection-strong */ 92);
	
	// 23.1 Map Objects
	__webpack_require__(/*! ./$.collection */ 93)('Map', {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function(key){
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function(key, value){
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ },
/* 58 */
/*!**************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.set.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(/*! ./$.collection-strong */ 92);
	
	// 23.2 Set Objects
	__webpack_require__(/*! ./$.collection */ 93)('Set', {
	  // 23.2.3.1 Set.prototype.add(value)
	  add: function(value){
	    return strong.def(this, value = value === 0 ? 0 : value, value);
	  }
	}, strong);

/***/ },
/* 59 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.weak-map.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $         = __webpack_require__(/*! ./$ */ 25)
	  , weak      = __webpack_require__(/*! ./$.collection-weak */ 94)
	  , leakStore = weak.leakStore
	  , ID        = weak.ID
	  , WEAK      = weak.WEAK
	  , has       = $.has
	  , isObject  = $.isObject
	  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
	  , tmp       = {};
	
	// 23.3 WeakMap Objects
	var WeakMap = __webpack_require__(/*! ./$.collection */ 93)('WeakMap', {
	  // 23.3.3.3 WeakMap.prototype.get(key)
	  get: function(key){
	    if(isObject(key)){
	      if(isFrozen(key))return leakStore(this).get(key);
	      if(has(key, WEAK))return key[WEAK][this[ID]];
	    }
	  },
	  // 23.3.3.5 WeakMap.prototype.set(key, value)
	  set: function(key, value){
	    return weak.def(this, key, value);
	  }
	}, weak, true, true);
	
	// IE11 WeakMap frozen keys fix
	if($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
	  $.each.call(['delete', 'has', 'get', 'set'], function(key){
	    var method = WeakMap.prototype[key];
	    WeakMap.prototype[key] = function(a, b){
	      // store frozen objects on leaky map
	      if(isObject(a) && isFrozen(a)){
	        var result = leakStore(this)[key](a, b);
	        return key == 'set' ? this : result;
	      // store all the rest on native weakmap
	      } return method.call(this, a, b);
	    };
	  });
	}

/***/ },
/* 60 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.weak-set.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var weak = __webpack_require__(/*! ./$.collection-weak */ 94);
	
	// 23.4 WeakSet Objects
	__webpack_require__(/*! ./$.collection */ 93)('WeakSet', {
	  // 23.4.3.1 WeakSet.prototype.add(value)
	  add: function(value){
	    return weak.def(this, value, true);
	  }
	}, weak, false, true);

/***/ },
/* 61 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.reflect.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(/*! ./$ */ 25)
	  , $def      = __webpack_require__(/*! ./$.def */ 72)
	  , setProto  = __webpack_require__(/*! ./$.set-proto */ 88)
	  , $iter     = __webpack_require__(/*! ./$.iter */ 71)
	  , ITER      = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , step      = $iter.step
	  , assert    = __webpack_require__(/*! ./$.assert */ 76)
	  , isObject  = $.isObject
	  , getDesc   = $.getDesc
	  , setDesc   = $.setDesc
	  , getProto  = $.getProto
	  , apply     = Function.apply
	  , assertObject = assert.obj
	  , isExtensible = Object.isExtensible || $.it;
	function Enumerate(iterated){
	  var keys = [], key;
	  for(key in iterated)keys.push(key);
	  $.set(this, ITER, {o: iterated, a: keys, i: 0});
	}
	$iter.create(Enumerate, 'Object', function(){
	  var iter = this[ITER]
	    , keys = iter.a
	    , key;
	  do {
	    if(iter.i >= keys.length)return step(1);
	  } while(!((key = keys[iter.i++]) in iter.o));
	  return step(0, key);
	});
	
	function wrap(fn){
	  return function(it){
	    assertObject(it);
	    try {
	      fn.apply(undefined, arguments);
	      return true;
	    } catch(e){
	      return false;
	    }
	  };
	}
	
	function reflectGet(target, propertyKey/*, receiver*/){
	  var receiver = arguments.length < 3 ? target : arguments[2]
	    , desc = getDesc(assertObject(target), propertyKey), proto;
	  if(desc)return $.has(desc, 'value')
	    ? desc.value
	    : desc.get === undefined
	      ? undefined
	      : desc.get.call(receiver);
	  return isObject(proto = getProto(target))
	    ? reflectGet(proto, propertyKey, receiver)
	    : undefined;
	}
	function reflectSet(target, propertyKey, V/*, receiver*/){
	  var receiver = arguments.length < 4 ? target : arguments[3]
	    , ownDesc  = getDesc(assertObject(target), propertyKey)
	    , existingDescriptor, proto;
	  if(!ownDesc){
	    if(isObject(proto = getProto(target))){
	      return reflectSet(proto, propertyKey, V, receiver);
	    }
	    ownDesc = $.desc(0);
	  }
	  if($.has(ownDesc, 'value')){
	    if(ownDesc.writable === false || !isObject(receiver))return false;
	    existingDescriptor = getDesc(receiver, propertyKey) || $.desc(0);
	    existingDescriptor.value = V;
	    setDesc(receiver, propertyKey, existingDescriptor);
	    return true;
	  }
	  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
	}
	
	var reflect = {
	  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
	  apply: __webpack_require__(/*! ./$.ctx */ 74)(Function.call, apply, 3),
	  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
	  construct: function(target, argumentsList /*, newTarget*/){
	    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
	      , instance = $.create(isObject(proto) ? proto : Object.prototype)
	      , result   = apply.call(target, instance, argumentsList);
	    return isObject(result) ? result : instance;
	  },
	  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
	  defineProperty: wrap(setDesc),
	  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
	  deleteProperty: function(target, propertyKey){
	    var desc = getDesc(assertObject(target), propertyKey);
	    return desc && !desc.configurable ? false : delete target[propertyKey];
	  },
	  // 26.1.5 Reflect.enumerate(target)
	  enumerate: function(target){
	    return new Enumerate(assertObject(target));
	  },
	  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
	  get: reflectGet,
	  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
	  getOwnPropertyDescriptor: function(target, propertyKey){
	    return getDesc(assertObject(target), propertyKey);
	  },
	  // 26.1.8 Reflect.getPrototypeOf(target)
	  getPrototypeOf: function(target){
	    return getProto(assertObject(target));
	  },
	  // 26.1.9 Reflect.has(target, propertyKey)
	  has: function(target, propertyKey){
	    return propertyKey in target;
	  },
	  // 26.1.10 Reflect.isExtensible(target)
	  isExtensible: function(target){
	    return !!isExtensible(assertObject(target));
	  },
	  // 26.1.11 Reflect.ownKeys(target)
	  ownKeys: __webpack_require__(/*! ./$.own-keys */ 78),
	  // 26.1.12 Reflect.preventExtensions(target)
	  preventExtensions: wrap(Object.preventExtensions || $.it),
	  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
	  set: reflectSet
	};
	// 26.1.14 Reflect.setPrototypeOf(target, proto)
	if(setProto)reflect.setPrototypeOf = function(target, proto){
	  setProto(assertObject(target), proto);
	  return true;
	};
	
	$def($def.G, {Reflect: {}});
	$def($def.S, 'Reflect', reflect);

/***/ },
/* 62 */
/*!*************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.array.includes.js ***!
  \*************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/domenic/Array.prototype.includes
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'Array', {
	  includes: __webpack_require__(/*! ./$.array-includes */ 87)(true)
	});
	__webpack_require__(/*! ./$.unscope */ 80)('includes');

/***/ },
/* 63 */
/*!********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.string.at.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/mathiasbynens/String.prototype.at
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'String', {
	  at: __webpack_require__(/*! ./$.string-at */ 89)(true)
	});

/***/ },
/* 64 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.regexp.escape.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/kangax/9698100
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'RegExp', {
	  escape: __webpack_require__(/*! ./$.replacer */ 81)(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
	});

/***/ },
/* 65 */
/*!**********************************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.object.get-own-property-descriptors.js ***!
  \**********************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/WebReflection/9353781
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , ownKeys = __webpack_require__(/*! ./$.own-keys */ 78);
	
	$def($def.S, 'Object', {
	  getOwnPropertyDescriptors: function(object){
	    var O      = $.toObject(object)
	      , result = {};
	    $.each.call(ownKeys(O), function(key){
	      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
	    });
	    return result;
	  }
	});

/***/ },
/* 66 */
/*!**************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.object.to-array.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// http://goo.gl/XkBrjD
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	function createObjectToArray(isEntries){
	  return function(object){
	    var O      = $.toObject(object)
	      , keys   = $.getKeys(object)
	      , length = keys.length
	      , i      = 0
	      , result = Array(length)
	      , key;
	    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
	    else while(length > i)result[i] = O[keys[i++]];
	    return result;
	  };
	}
	$def($def.S, 'Object', {
	  values:  createObjectToArray(false),
	  entries: createObjectToArray(true)
	});

/***/ },
/* 67 */
/*!***********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/js.array.statics.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// JavaScript 1.6 / Strawman array statics shim
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , core    = $.core
	  , statics = {};
	function setStatics(keys, length){
	  $.each.call(keys.split(','), function(key){
	    if(length == undefined && key in core.Array)statics[key] = core.Array[key];
	    else if(key in [])statics[key] = __webpack_require__(/*! ./$.ctx */ 74)(Function.call, [][key], length);
	  });
	}
	setStatics('pop,reverse,shift,keys,values,entries', 1);
	setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
	setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
	           'reduce,reduceRight,copyWithin,fill,turn');
	$def($def.S, 'Array', statics);

/***/ },
/* 68 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/web.timers.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// ie9- setTimeout & setInterval additional parameters fix
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , invoke  = __webpack_require__(/*! ./$.invoke */ 75)
	  , partial = __webpack_require__(/*! ./$.partial */ 73)
	  , MSIE    = !!$.g.navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
	function wrap(set){
	  return MSIE ? function(fn, time /*, ...args */){
	    return set(invoke(
	      partial,
	      [].slice.call(arguments, 2),
	      $.isFunction(fn) ? fn : Function(fn)
	    ), time);
	  } : set;
	}
	$def($def.G + $def.B + $def.F * MSIE, {
	  setTimeout:  wrap($.g.setTimeout),
	  setInterval: wrap($.g.setInterval)
	});

/***/ },
/* 69 */
/*!********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/web.immediate.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def  = __webpack_require__(/*! ./$.def */ 72)
	  , $task = __webpack_require__(/*! ./$.task */ 91);
	$def($def.G + $def.B, {
	  setImmediate:   $task.set,
	  clearImmediate: $task.clear
	});

/***/ },
/* 70 */
/*!***********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/web.dom.iterable.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./es6.array.iterator */ 49);
	var $         = __webpack_require__(/*! ./$ */ 25)
	  , Iterators = __webpack_require__(/*! ./$.iter */ 71).Iterators
	  , ITERATOR  = __webpack_require__(/*! ./$.wks */ 85)('iterator')
	  , NodeList  = $.g.NodeList;
	if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
	  $.hide(NodeList.prototype, ITERATOR, Iterators.Array);
	}
	Iterators.NodeList = Iterators.Array;

/***/ },
/* 71 */
/*!*************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.iter.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $                 = __webpack_require__(/*! ./$ */ 25)
	  , ctx               = __webpack_require__(/*! ./$.ctx */ 74)
	  , cof               = __webpack_require__(/*! ./$.cof */ 79)
	  , $def              = __webpack_require__(/*! ./$.def */ 72)
	  , assertObject      = __webpack_require__(/*! ./$.assert */ 76).obj
	  , SYMBOL_ITERATOR   = __webpack_require__(/*! ./$.wks */ 85)('iterator')
	  , FF_ITERATOR       = '@@iterator'
	  , Iterators         = {}
	  , IteratorPrototype = {};
	// Safari has byggy iterators w/o `next`
	var BUGGY = 'keys' in [] && !('next' in [].keys());
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	setIterator(IteratorPrototype, $.that);
	function setIterator(O, value){
	  $.hide(O, SYMBOL_ITERATOR, value);
	  // Add iterator for FF iterator protocol
	  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
	}
	function defineIterator(Constructor, NAME, value, DEFAULT){
	  var proto = Constructor.prototype
	    , iter  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT] || value;
	  // Define iterator
	  if($.FW)setIterator(proto, iter);
	  if(iter !== value){
	    var iterProto = $.getProto(iter.call(new Constructor));
	    // Set @@toStringTag to native iterators
	    cof.set(iterProto, NAME + ' Iterator', true);
	    // FF fix
	    if($.FW)$.has(proto, FF_ITERATOR) && setIterator(iterProto, $.that);
	  }
	  // Plug for library
	  Iterators[NAME] = iter;
	  // FF & v8 fix
	  Iterators[NAME + ' Iterator'] = $.that;
	  return iter;
	}
	function getIterator(it){
	  var Symbol  = $.g.Symbol
	    , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
	    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
	  return assertObject(getIter.call(it));
	}
	function closeIterator(iterator){
	  var ret = iterator['return'];
	  if(ret !== undefined)assertObject(ret.call(iterator));
	}
	function stepCall(iterator, fn, value, entries){
	  try {
	    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
	  } catch(e){
	    closeIterator(iterator);
	    throw e;
	  }
	}
	var DANGER_CLOSING = true;
	!function(){
	  try {
	    var iter = [1].keys();
	    iter['return'] = function(){ DANGER_CLOSING = false; };
	    Array.from(iter, function(){ throw 2; });
	  } catch(e){ /* empty */ }
	}();
	var $iter = module.exports = {
	  BUGGY: BUGGY,
	  DANGER_CLOSING: DANGER_CLOSING,
	  fail: function(exec){
	    var fail = true;
	    try {
	      var arr  = [[{}, 1]]
	        , iter = arr[SYMBOL_ITERATOR]()
	        , next = iter.next;
	      iter.next = function(){
	        fail = false;
	        return next.call(this);
	      };
	      arr[SYMBOL_ITERATOR] = function(){
	        return iter;
	      };
	      exec(arr);
	    } catch(e){ /* empty */ }
	    return fail;
	  },
	  Iterators: Iterators,
	  prototype: IteratorPrototype,
	  step: function(done, value){
	    return {value: value, done: !!done};
	  },
	  stepCall: stepCall,
	  close: closeIterator,
	  is: function(it){
	    var O      = Object(it)
	      , Symbol = $.g.Symbol
	      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
	    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
	  },
	  get: getIterator,
	  set: setIterator,
	  create: function(Constructor, NAME, next, proto){
	    Constructor.prototype = $.create(proto || $iter.prototype, {next: $.desc(1, next)});
	    cof.set(Constructor, NAME + ' Iterator');
	  },
	  define: defineIterator,
	  std: function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
	    function createIter(kind){
	      return function(){
	        return new Constructor(this, kind);
	      };
	    }
	    $iter.create(Constructor, NAME, next);
	    var entries = createIter('key+value')
	      , values  = createIter('value')
	      , proto   = Base.prototype
	      , methods, key;
	    if(DEFAULT == 'value')values = defineIterator(Base, NAME, values, 'values');
	    else entries = defineIterator(Base, NAME, entries, 'entries');
	    if(DEFAULT){
	      methods = {
	        entries: entries,
	        keys:    IS_SET ? values : createIter('key'),
	        values:  values
	      };
	      $def($def.P + $def.F * BUGGY, NAME, methods);
	      if(FORCE)for(key in methods){
	        if(!(key in proto))$.hide(proto, key, methods[key]);
	      }
	    }
	  },
	  forOf: function(iterable, entries, fn, that){
	    var iterator = getIterator(iterable)
	      , f = ctx(fn, that, entries ? 2 : 1)
	      , step;
	    while(!(step = iterator.next()).done){
	      if(stepCall(iterator, f, step.value, entries) === false){
	        return closeIterator(iterator);
	      }
	    }
	  }
	};

/***/ },
/* 72 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.def.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(/*! ./$ */ 25)
	  , global     = $.g
	  , core       = $.core
	  , isFunction = $.isFunction;
	function ctx(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	}
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	function $def(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {}).prototype
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if(isGlobal && !isFunction(target[key]))exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & $def.B && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & $def.W && target[key] == out)!function(C){
	      exp = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      exp.prototype = C.prototype;
	    }(out);
	    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
	    // export
	    $.hide(exports, key, exp);
	  }
	}
	module.exports = $def;

/***/ },
/* 73 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.partial.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $      = __webpack_require__(/*! ./$ */ 25)
	  , invoke = __webpack_require__(/*! ./$.invoke */ 75)
	  , assertFunction = __webpack_require__(/*! ./$.assert */ 76).fn;
	module.exports = function(/* ...pargs */){
	  var fn     = assertFunction(this)
	    , length = arguments.length
	    , pargs  = Array(length)
	    , i      = 0
	    , _      = $.path._
	    , holder = false;
	  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
	  return function(/* ...args */){
	    var that    = this
	      , _length = arguments.length
	      , j = 0, k = 0, args;
	    if(!holder && !_length)return invoke(fn, pargs, that);
	    args = pargs.slice();
	    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
	    while(_length > k)args.push(arguments[k++]);
	    return invoke(fn, args, that);
	  };
	};

/***/ },
/* 74 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.ctx.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Optional / simple context binding
	var assertFunction = __webpack_require__(/*! ./$.assert */ 76).fn;
	module.exports = function(fn, that, length){
	  assertFunction(fn);
	  if(~length && that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  } return function(/* ...args */){
	      return fn.apply(that, arguments);
	    };
	};

/***/ },
/* 75 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.invoke.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Fast apply
	// http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
	                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 76 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.assert.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 25);
	function assert(condition, msg1, msg2){
	  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
	}
	assert.def = $.assertDefined;
	assert.fn = function(it){
	  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
	  return it;
	};
	assert.obj = function(it){
	  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};
	assert.inst = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};
	module.exports = assert;

/***/ },
/* 77 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.uid.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var sid = 0;
	function uid(key){
	  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
	}
	uid.safe = __webpack_require__(/*! ./$ */ 25).g.Symbol || uid;
	module.exports = uid;

/***/ },
/* 78 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.own-keys.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $            = __webpack_require__(/*! ./$ */ 25)
	  , assertObject = __webpack_require__(/*! ./$.assert */ 76).obj;
	module.exports = function(it){
	  assertObject(it);
	  return $.getSymbols ? $.getNames(it).concat($.getSymbols(it)) : $.getNames(it);
	};

/***/ },
/* 79 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.cof.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(/*! ./$ */ 25)
	  , TAG      = __webpack_require__(/*! ./$.wks */ 85)('toStringTag')
	  , toString = {}.toString;
	function cof(it){
	  return toString.call(it).slice(8, -1);
	}
	cof.classof = function(it){
	  var O, T;
	  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
	};
	cof.set = function(it, tag, stat){
	  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
	};
	module.exports = cof;

/***/ },
/* 80 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.unscope.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.31 Array.prototype[@@unscopables]
	var $           = __webpack_require__(/*! ./$ */ 25)
	  , UNSCOPABLES = __webpack_require__(/*! ./$.wks */ 85)('unscopables');
	if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
	module.exports = function(key){
	  if($.FW)[][UNSCOPABLES][key] = true;
	};

/***/ },
/* 81 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.replacer.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	module.exports = function(regExp, replace, isStatic){
	  var replacer = replace === Object(replace) ? function(part){
	    return replace[part];
	  } : replace;
	  return function(it){
	    return String(isStatic ? it : this).replace(regExp, replacer);
	  };
	};

/***/ },
/* 82 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.assign.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 25);
	// 19.1.2.1 Object.assign(target, source, ...)
	module.exports = Object.assign || function(target, source){ // eslint-disable-line no-unused-vars
	  var T = Object($.assertDefined(target))
	    , l = arguments.length
	    , i = 1;
	  while(l > i){
	    var S      = $.ES5Object(arguments[i++])
	      , keys   = $.getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)T[key = keys[j++]] = S[key];
	  }
	  return T;
	};

/***/ },
/* 83 */
/*!**************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.keyof.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 25);
	module.exports = function(object, el){
	  var O      = $.toObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 84 */
/*!***********************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.fw.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = function($){
	  $.FW   = false;
	  $.path = $.core;
	  return $;
	};

/***/ },
/* 85 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.wks.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(/*! ./$ */ 25).g
	  , store  = {};
	module.exports = function(name){
	  return store[name] || (store[name] =
	    global.Symbol && global.Symbol[name] || __webpack_require__(/*! ./$.uid */ 77).safe('Symbol.' + name));
	};

/***/ },
/* 86 */
/*!**********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.array-methods.js ***!
  \**********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var $   = __webpack_require__(/*! ./$ */ 25)
	  , ctx = __webpack_require__(/*! ./$.ctx */ 74);
	module.exports = function(TYPE){
	  var IS_MAP        = TYPE == 1
	    , IS_FILTER     = TYPE == 2
	    , IS_SOME       = TYPE == 3
	    , IS_EVERY      = TYPE == 4
	    , IS_FIND_INDEX = TYPE == 6
	    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
	  return function(callbackfn/*, that = undefined */){
	    var O      = Object($.assertDefined(this))
	      , self   = $.ES5Object(O)
	      , f      = ctx(callbackfn, arguments[1], 3)
	      , length = $.toLength(self.length)
	      , index  = 0
	      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
	      , val, res;
	    for(;length > index; index++)if(NO_HOLES || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(TYPE){
	        if(IS_MAP)result[index] = res;            // map
	        else if(res)switch(TYPE){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(IS_EVERY)return false;          // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

/***/ },
/* 87 */
/*!***********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.array-includes.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// false -> Array#indexOf
	// true  -> Array#includes
	var $ = __webpack_require__(/*! ./$ */ 25);
	module.exports = function(IS_INCLUDES){
	  return function(el /*, fromIndex = 0 */){
	    var O      = $.toObject(this)
	      , length = $.toLength(O.length)
	      , index  = $.toIndex(arguments[1], length)
	      , value;
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 88 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.set-proto.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't works with null proto objects.
	/*eslint-disable no-proto */
	var $      = __webpack_require__(/*! ./$ */ 25)
	  , assert = __webpack_require__(/*! ./$.assert */ 76);
	module.exports = Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
	  ? function(buggy, set){
	      try {
	        set = __webpack_require__(/*! ./$.ctx */ 74)(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
	        set({}, []);
	      } catch(e){ buggy = true; }
	      return function(O, proto){
	        assert.obj(O);
	        assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }()
	  : undefined);

/***/ },
/* 89 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.string-at.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// true  -> String#at
	// false -> String#codePointAt
	var $ = __webpack_require__(/*! ./$ */ 25);
	module.exports = function(TO_STRING){
	  return function(pos){
	    var s = String($.assertDefined(this))
	      , i = $.toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l
	      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	        ? TO_STRING ? s.charAt(i) : a
	        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 90 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.species.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 25);
	module.exports = function(C){
	  if($.DESC && $.FW)$.setDesc(C, __webpack_require__(/*! ./$.wks */ 85)('species'), {
	    configurable: true,
	    get: $.that
	  });
	};

/***/ },
/* 91 */
/*!*************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.task.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $      = __webpack_require__(/*! ./$ */ 25)
	  , ctx    = __webpack_require__(/*! ./$.ctx */ 74)
	  , cof    = __webpack_require__(/*! ./$.cof */ 79)
	  , invoke = __webpack_require__(/*! ./$.invoke */ 75)
	  , global             = $.g
	  , isFunction         = $.isFunction
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , postMessage        = global.postMessage
	  , addEventListener   = global.addEventListener
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	function run(){
	  var id = +this;
	  if($.has(queue, id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	}
	function listner(event){
	  run.call(event.data);
	}
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!isFunction(setTask) || !isFunction(clearTask)){
	  setTask = function(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(isFunction(fn) ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(cof(global.process) == 'process'){
	    defer = function(id){
	      global.process.nextTick(ctx(run, id, 1));
	    };
	  // Modern browsers, skip implementation for WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is object
	  } else if(addEventListener && isFunction(postMessage) && !$.g.importScripts){
	    defer = function(id){
	      postMessage(id, '*');
	    };
	    addEventListener('message', listner, false);
	  // WebWorkers
	  } else if(isFunction(MessageChannel)){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listner;
	    defer = ctx(port.postMessage, port, 1);
	  // IE8-
	  } else if($.g.document && ONREADYSTATECHANGE in document.createElement('script')){
	    defer = function(id){
	      $.html.appendChild(document.createElement('script'))[ONREADYSTATECHANGE] = function(){
	        $.html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 92 */
/*!**************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.collection-strong.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $        = __webpack_require__(/*! ./$ */ 25)
	  , ctx      = __webpack_require__(/*! ./$.ctx */ 74)
	  , safe     = __webpack_require__(/*! ./$.uid */ 77).safe
	  , assert   = __webpack_require__(/*! ./$.assert */ 76)
	  , $iter    = __webpack_require__(/*! ./$.iter */ 71)
	  , has      = $.has
	  , set      = $.set
	  , isObject = $.isObject
	  , hide     = $.hide
	  , step     = $iter.step
	  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
	  , ID       = safe('id')
	  , O1       = safe('O1')
	  , LAST     = safe('last')
	  , FIRST    = safe('first')
	  , ITER     = safe('iter')
	  , SIZE     = $.DESC ? safe('size') : 'size'
	  , id       = 0;
	
	function fastKey(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
	  // can't set id to frozen object
	  if(isFrozen(it))return 'F';
	  if(!has(it, ID)){
	    // not necessary to add id
	    if(!create)return 'E';
	    // add missing object id
	    hide(it, ID, ++id);
	  // return object id with prefix
	  } return 'O' + it[ID];
	}
	
	function getEntry(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index != 'F')return that[O1][index];
	  // frozen object case
	  for(entry = that[FIRST]; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	}
	
	module.exports = {
	  getConstructor: function(NAME, IS_MAP, ADDER){
	    function C(iterable){
	      var that = assert.inst(this, C, NAME);
	      set(that, O1, $.create(null));
	      set(that, SIZE, 0);
	      set(that, LAST, undefined);
	      set(that, FIRST, undefined);
	      if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
	    }
	    $.mix(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function(){
	        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that[FIRST] = that[LAST] = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that[O1][entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that[FIRST] == entry)that[FIRST] = next;
	          if(that[LAST] == entry)that[LAST] = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function(callbackfn /*, that = undefined */){
	        var f = ctx(callbackfn, arguments[1], 3)
	          , entry;
	        while(entry = entry ? entry.n : this[FIRST]){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if($.DESC)$.setDesc(C.prototype, 'size', {
	      get: function(){
	        return assert.def(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that[LAST] = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that[LAST],          // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that[FIRST])that[FIRST] = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index != 'F')that[O1][index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  getIterConstructor: function(){
	    return function(iterated, kind){
	      set(this, ITER, {o: iterated, k: kind});
	    };
	  },
	  next: function(){
	    var iter  = this[ITER]
	      , kind  = iter.k
	      , entry = iter.l;
	    // revert to the last existing entry
	    while(entry && entry.r)entry = entry.p;
	    // get next entry
	    if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
	      // or finish the iteration
	      iter.o = undefined;
	      return step(1);
	    }
	    // return step by kind
	    if(kind == 'key'  )return step(0, entry.k);
	    if(kind == 'value')return step(0, entry.v);
	    return step(0, [entry.k, entry.v]);
	  }
	};

/***/ },
/* 93 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.collection.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $     = __webpack_require__(/*! ./$ */ 25)
	  , $def  = __webpack_require__(/*! ./$.def */ 72)
	  , $iter = __webpack_require__(/*! ./$.iter */ 71)
	  , assertInstance = __webpack_require__(/*! ./$.assert */ 76).inst;
	
	module.exports = function(NAME, methods, common, IS_MAP, isWeak){
	  var Base  = $.g[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  function fixMethod(KEY, CHAIN){
	    var method = proto[KEY];
	    if($.FW)proto[KEY] = function(a, b){
	      var result = method.call(this, a === 0 ? 0 : a, b);
	      return CHAIN ? this : result;
	    };
	  }
	  if(!$.isFunction(C) || !(isWeak || !$iter.BUGGY && proto.forEach && proto.entries)){
	    // create collection constructor
	    C = common.getConstructor(NAME, IS_MAP, ADDER);
	    $.mix(C.prototype, methods);
	  } else {
	    var inst  = new C
	      , chain = inst[ADDER](isWeak ? {} : -0, 1)
	      , buggyZero;
	    // wrap for init collections from iterable
	    if($iter.fail(function(iter){
	      new C(iter); // eslint-disable-line no-new
	    }) || $iter.DANGER_CLOSING){
	      C = function(iterable){
	        assertInstance(this, C, NAME);
	        var that = new Base;
	        if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
	        return that;
	      };
	      C.prototype = proto;
	      if($.FW)proto.constructor = C;
	    }
	    isWeak || inst.forEach(function(val, key){
	      buggyZero = 1 / key === -Infinity;
	    });
	    // fix converting -0 key to +0
	    if(buggyZero){
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }
	    // + fix .add & .set for chaining
	    if(buggyZero || chain !== inst)fixMethod(ADDER, true);
	  }
	
	  __webpack_require__(/*! ./$.cof */ 79).set(C, NAME);
	  __webpack_require__(/*! ./$.species */ 90)(C);
	
	  O[NAME] = C;
	  $def($def.G + $def.W + $def.F * (C != Base), O);
	
	  // add .keys, .values, .entries, [@@iterator]
	  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	  if(!isWeak)$iter.std(
	    C, NAME,
	    common.getIterConstructor(), common.next,
	    IS_MAP ? 'key+value' : 'value' , !IS_MAP, true
	  );
	
	  return C;
	};

/***/ },
/* 94 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.collection-weak.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $         = __webpack_require__(/*! ./$ */ 25)
	  , safe      = __webpack_require__(/*! ./$.uid */ 77).safe
	  , assert    = __webpack_require__(/*! ./$.assert */ 76)
	  , forOf     = __webpack_require__(/*! ./$.iter */ 71).forOf
	  , has       = $.has
	  , isObject  = $.isObject
	  , hide      = $.hide
	  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
	  , id        = 0
	  , ID        = safe('id')
	  , WEAK      = safe('weak')
	  , LEAK      = safe('leak')
	  , method    = __webpack_require__(/*! ./$.array-methods */ 86)
	  , find      = method(5)
	  , findIndex = method(6);
	function findFrozen(store, key){
	  return find.call(store.array, function(it){
	    return it[0] === key;
	  });
	}
	// fallback for frozen keys
	function leakStore(that){
	  return that[LEAK] || hide(that, LEAK, {
	    array: [],
	    get: function(key){
	      var entry = findFrozen(this, key);
	      if(entry)return entry[1];
	    },
	    has: function(key){
	      return !!findFrozen(this, key);
	    },
	    set: function(key, value){
	      var entry = findFrozen(this, key);
	      if(entry)entry[1] = value;
	      else this.array.push([key, value]);
	    },
	    'delete': function(key){
	      var index = findIndex.call(this.array, function(it){
	        return it[0] === key;
	      });
	      if(~index)this.array.splice(index, 1);
	      return !!~index;
	    }
	  })[LEAK];
	}
	
	module.exports = {
	  getConstructor: function(NAME, IS_MAP, ADDER){
	    function C(iterable){
	      $.set(assert.inst(this, C, NAME), ID, id++);
	      if(iterable != undefined)forOf(iterable, IS_MAP, this[ADDER], this);
	    }
	    $.mix(C.prototype, {
	      // 23.3.3.2 WeakMap.prototype.delete(key)
	      // 23.4.3.3 WeakSet.prototype.delete(value)
	      'delete': function(key){
	        if(!isObject(key))return false;
	        if(isFrozen(key))return leakStore(this)['delete'](key);
	        return has(key, WEAK) && has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
	      },
	      // 23.3.3.4 WeakMap.prototype.has(key)
	      // 23.4.3.4 WeakSet.prototype.has(value)
	      has: function(key){
	        if(!isObject(key))return false;
	        if(isFrozen(key))return leakStore(this).has(key);
	        return has(key, WEAK) && has(key[WEAK], this[ID]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    if(isFrozen(assert.obj(key))){
	      leakStore(that).set(key, value);
	    } else {
	      has(key, WEAK) || hide(key, WEAK, {});
	      key[WEAK][that[ID]] = value;
	    } return that;
	  },
	  leakStore: leakStore,
	  WEAK: WEAK,
	  ID: ID
	};

/***/ }
/******/ ]);
//# sourceMappingURL=2-circle-approximations.js.map