var orm	= require("../lib/model");

exports.index = function(req, res) {
	var Podcast = orm.model("Podcast");
	var Episode = orm.model("Episode");
	var Follower = orm.model("Follower");
	var userId = req.session.user.id;

	var query = feedQuery(userId, 1, 10);

	orm.sequelizeInstance().query(query)
	.success(function(rows) {
		Podcast.findAll({ where: { ownerUserId: userId }})
		.success(function(podcasts) {
			// orm.sequelizeInstance().query(followingQuery(userId))
			Follower.findAll({ 
				where: { UserId: userId }, 
				include: [Podcast] 
			}).success(function(following) {
				res.render("dashboard/index", { 
					title: "Dashboard",
					episodes: rows,
					podcasts: podcasts,
					following: following,
					host: req.headers.host,
					markdown: require("markdown").markdown,
					moment: require("moment")
				});
			});
		});
	});
};

exports.splash = function(req, res) {
	if(req.session.user) {
		res.redirect("/dashboard");
	} else {
		res.render("splash");
	}
}

function feedQuery(userId, pageNumber, pageSize) {
	if (!pageNumber) pageNumber = 1;
	if (!pageSize) pageSize = 10;

	var start = (pageNumber - 1) * pageSize;

	var query = "select episodes.*, podcasts.title as podcastTitle, podcasts.coverLocation as podcastCoverLocation, podcasts.url as podcastUrl from episodes \
				inner join `podcasts` on episodes.`PodcastId` = podcasts.id \
				where podcasts.id in  (select PodcastId from Followers where Followers.UserId = {0}) \
				and episodes.isPublished \
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