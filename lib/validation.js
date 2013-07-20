// podcasts
var orm	= require("../lib/model");

var MAX_FREE_PODCASTS = 5;

var podcasts = {
	
	isUrlUnique: function(url, callback) {
		var Podcasts = orm.model("Podcast");
		Podcasts.count({ where: { url: url }}).success(function (count) {
			callback(count == 0);
		});
	},

	isUrlAllowed: function(url) {
		var reservedSubdomains = require("../resources/reserved-subdomains");
		return (reservedSubdomains.indexOf(url) < 0);
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