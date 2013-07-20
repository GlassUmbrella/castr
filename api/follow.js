var orm	= require("../lib/model");

exports.isFollowing = function(req, res) {
	var Follower = orm.model("Follower");
	var userId = req.session.user.id;
	var podcastId = req.params.podcastId;

	Follower.count({ 
		where: { 
			UserId: userId, 
			PodcastId: podcastId
		}
	}).success(function (count) {
		res.json({ result: count == 0 });
	});
}

exports.follow = function(req, res) {
	var Follower = orm.model("Follower");
	var userId = req.session.user.id;
	var podcastId = req.params.podcastId;

	console.log("Follow...");

	Follower.findOrCreate({ UserId: userId }, {	PodcastId: podcastId })
	.success(function (follower, created) {
		res.json({ result: true });
	});
}

exports.unfollow = function(req, res) {
	var Follower = orm.model("Follower");
	var userId = req.session.user.id;
	var podcastId = req.params.podcastId;

	Follower.find({ where: {
		UserId: userId,
		PodcastId: podcastId
	}}).success(function (follower) {
		follower.destroy().success(function() {
			res.json({ result: true });
		});
	});
}