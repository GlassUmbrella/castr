// js implementation of .NET String methods
if(!String.prototype.format) {
	String.prototype.format = function() {
	    var args = arguments;
	    return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != "undefined" ? args[number] : match;
	    });
	};
}

if(!String.prototype.beginsWith) {
	String.prototype.beginsWith = function(input) {
		return this.slice(0, input.length) == input;
	};
}

if(!String.prototype.endsWith) {
	String.prototype.endsWith = function(input) {
		return this.slice(-input.length) == input;
	};
}

if(!String.prototype.replaceAll) {
	String.prototype.replaceAll = function (find, replace) {
	    return this.replace(new RegExp(find, 'g'), replace);
	};
}

// Implementation of Array.filter for old browsers
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    "use strict";

    if (this == null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}
