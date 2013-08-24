// podcasts
var orm	= require("../lib/model");
var VerEx = require("verbal-expressions");

var MAX_FREE_PODCASTS = 5;

var podcasts = {
	
	isUrlUnique: function(url, callback) {
		var Podcasts = orm.model("Podcast");
		Podcasts.count({ where: { url: url }}).success(function (count) {
			callback(count == 0);
		});
	},

	isUrlAllowed: function(url) {
		//Is invalid?
		var subdomainValidator = VerEx()
            .startOfLine()
            .word()
            .endOfLine();
	    if(!subdomainValidator.test(url)) {
	    	return false;
		}

		//Is banned?
		var reservedSubdomains = require("../resources/reserved-subdomains");
		if(reservedSubdomains.indexOf(url) > -1) {
			return false;
		}

		return true;
	}
}

var users = {
	
	hasReachedPodcastCountLimit: function (userId, callback) {
		var Podcast = orm.model("Podcast");
		Podcast.count({ where: { ownerUserid: userId } }).success(function (result) {
			callback(result > MAX_FREE_PODCASTS);
		});
	}
	
}

module.exports.podcasts = podcasts;
module.exports.users = users;