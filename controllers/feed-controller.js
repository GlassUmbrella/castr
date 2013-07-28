var orm	= require("../lib/model");

exports.index = function(req, res, next) {
	var Podcast = orm.model("Podcast");
	var Episode = orm.model("Episode");
	var Follower = orm.model("Follower");
	var userId = req.session.user.id;

	var query = feedQuery(userId, 1, 10);

	orm.sequelizeInstance().query(query)
	.success(function(rows) {
		console.log("Found some rows.");
		Podcast.findAll({ where: { ownerUserId: userId }})
		.success(function(podcasts) {
			// orm.sequelizeInstance().query(followingQuery(userId))
			Follower.findAll({ 
				where: { UserId: userId }, 
				include: [Podcast] 
			}).success(function(following) {
				res.render("feed/index", { 
					title: "Feed",
					activeTab: "feed",
					episodes: rows,
					podcasts: podcasts,
					following: following
				});
			});
		});
	}).error(function(error) {

		console.log("Didn't find some rows " + error);
	});
};

exports.splash = function(req, res, next) {
	if(req.session.user) {
		res.redirect("/feed");
	} else {
		res.render("splash");
	}
}

function feedQuery(userId, pageNumber, pageSize) {
	if (!pageNumber) pageNumber = 1;
	if (!pageSize) pageSize = 10;

	var start = (pageNumber - 1) * pageSize;

	var query = "select Episodes.*, Podcasts.title as podcastTitle, Podcasts.coverLocation as podcastCoverLocation, `Files`.url as audioUrl from Episodes \
				inner join Podcasts on Episodes.PodcastId = Podcasts.id \
				inner join `Files` on Episodes.AudioFileId = `Files`.id \
				where Podcasts.id in (select PodcastId from Followers where Followers.UserId = {0}) \
				and Episodes.isPublished \
				order by publishDate desc \
				limit {1}, {2}".format(userId, start, pageSize);

	return query;
}

// function followingQuery(userId) {
// 	var query = "select Followers.PodcastId, Podcasts.title as podcastTitle, Podcasts.url as podcastUrl, count(Episodes.id) as episodeCount from Followers \
// 				inner join Podcasts on Followers.PodcastId = Podcasts.id \
// 				inner join Episodes on Followers.PodcastId = Episodes.PodcastId \
// 				where Followers.UserId = 1 and Episodes.isPublished".format(userId);

// 	return query;
// }