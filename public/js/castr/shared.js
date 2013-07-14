// js implementation of .NET String.Format
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