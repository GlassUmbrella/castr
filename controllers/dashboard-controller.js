var orm	= require("../lib/model");

exports.index = function(req, res) {
	var Podcast = orm.model("Podcast");
	var Episode = orm.model("Episode");
	var Follower = orm.model("Follower");

	var query = queryBuilder(req.session.user.id, 1, 10);

	orm.sequelizeInstance().query(query)
	.success(function(rows) {
		Podcast.findAll({ where: { ownerUserId: req.session.user.id }})
		.success(function(podcasts) {
			Follower.findAll({ where: { UserId: req.session.user.id }})
			.success(function(following) {
				res.render("dashboard/index", { 
					title: "Dashboard",
					episodes: rows,
					podcasts: podcasts,
					following: following,
					markdown: require("markdown").markdown
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

function queryBuilder(userId, pageNumber, pageSize) {
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