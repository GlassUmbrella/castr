/**
 * Module dependencies.
 */

var express = require("express")
  , http = require("http")
  , https = require("https")
  , fs = require("fs")
  , path = require("path")
  , less = require("less-middleware")
  , orm = require("./lib/model")
  , mailer = require("./lib/mailer")
  , cookieSessions = require("./lib/cookie-sessions")
  , validation = require("./lib/validation")
  , shared = require("./public/js/castr/shared.js")
  ,	config = require("./config");

require("log-timestamp");

var controllers = {
	auth: require("./controllers/auth-controller"),
	feed: require("./controllers/feed-controller"),
	podcasts: require("./controllers/podcasts-controller"),
	site: require("./controllers/site-controller"),
	public: require("./controllers/public-controller"),
	admin: require("./controllers/admin-controller")
};

var api = {
	default: require("./api/default"),
	users: require("./api/users"),
	podcasts: require("./api/podcasts"),
	progress: require("./api/progress"),
	follow: require("./api/follow"),
	file: require("./api/file")
};


/**
 * Configuration.
 */

var app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.enable("verbose errors");

// Handle form data
app.use(express.bodyParser());
app.use(express.methodOverride());

// Sessions
app.use(express.cookieParser("B50E1047-493E-41FA-9E31-03830CFEA5F0"));

var cookieDomain = ".castr.net";
if("development" == app.settings.env) {
	cookieDomain = ".castr.dev"
}
app.use(express.cookieSession({
	cookie: { domain: cookieDomain }
}));

app.use(cookieSessions("8FD0A82D-7ADE-433A-8CE1-F1020B545D36", cookieDomain));

// Dev configuration
var databaseUser = {};
if("development" == app.settings.env) {
	databaseUser = config.mysql.dev;
	global.protocol = "http://";
	global.baseUrl = "castr.dev:3000";

	app.use(less({
		force: true,
		src: __dirname + "/public",
		compress: false
	}));
} else {
	databaseUser = config.mysql.live;
	global.protocol = "http://";
	global.baseUrl = "castr.net";
	
	app.use(less({
		force: true,
		src: __dirname + "/public",
		once: true,
		compress: true
	}));
}

// Local vars
app.use(function(req, res, next) {
	res.locals.session = req.session;
	res.locals.baseUrl = global.baseUrl;
	res.locals.moment = require("moment");
	res.locals.markdown = require("markdown").markdown;
	res.locals.debug = app.settings.env == "development";
	next();
});

// Routing
app.use(app.router);
app.use(express.favicon(__dirname + "/public/images/favicon.ico"));

// Email
mailer.init(config.mailer);

console.log("Environment: " + app.settings.env);


// static middleware
app.use(express.static(path.join(__dirname, "public")));

app.use(express.logger(app.settings.env));
orm.setup("./models", databaseUser.database, databaseUser.username, databaseUser.password, { host: databaseUser.host }); 


// Error handling
app.use(function(req, res, next) {
	res.status(404);
	res.render("error/404", {
		title: "Page not found"
	});
	return;
});

if("development" != app.settings.env) {
	app.use(function(err, req, res, next){
		res.status(err.status || 500);
		res.render("error/500", {
			title: "Something went wrong"
		});
	});
}


/**
 * Routes.
 */
 
function requiresAuth(req, res, next) {
    if(req.session.user == null) {
    	return res.redirect("/login");
    }
    next();
}

function anonymousOnly(req, res, next) {
	if(req.session.user != null) {
		return res.redirect("/feed");
	}
	next();
}

function adminOnly(req, res, next) {
	if(req.session.user == null || req.session.user.isAdmin == false) {
		res.status(401);
		res.render("error/401", {
			title: "Unauthorized"
		});
		return;
	}
	next();
}

function requiresSubdomain(req, res, next) {
	console.log("Host: " + req.headers.host);
	var requestUrl = req.headers.host;
	requestUrl = requestUrl.replace(global.baseUrl, "baseUrl");
	var parts = requestUrl.split(".");
	if(parts.indexOf("baseUrl") == 1) {
		req.subdomain = parts[0];
		next();
	} else {
		next("route");
	}
}

function noSubdomain(req, res, next) {
	var requestUrl = req.headers.host;
	requestUrl = requestUrl.replace(global.baseUrl, "baseUrl");
	var parts = requestUrl.split(".");
	if(parts.indexOf("baseUrl") == 0) {
		next();
	} else {
		next("route");
	}
}

// Subdomain routes

app.get("/", requiresSubdomain, controllers.site.index);
app.get("/page/:pageNumber", requiresSubdomain, controllers.site.index);
app.get("/episodes", requiresSubdomain, controllers.site.index);
app.get("/rss", requiresSubdomain, controllers.site.rss);
app.get("/itunes", requiresSubdomain, controllers.site.itunes);
app.get("/contact", requiresSubdomain, controllers.site.contact);
app.get("/episodes/:episodeNumber", requiresSubdomain, controllers.site.episode);

// API routes

app.get("/api", noSubdomain, api.default.home);
app.get("/api/podcasts", noSubdomain, requiresAuth, api.podcasts.list);
app.get("/api/podcasts/:podcastId/episodes", noSubdomain, requiresAuth, api.podcasts.episodes);
app.get("/api/podcasts/isUrlUnique", noSubdomain, requiresAuth, api.podcasts.isUrlUnique);

app.get("/api/podcasts/:podcastId/follow", noSubdomain, requiresAuth, api.follow.follow);
app.get("/api/podcasts/:podcastId/unfollow", noSubdomain, requiresAuth, api.follow.unfollow);
app.get("/api/podcasts/:podcastId/isFollowing", noSubdomain, requiresAuth, api.follow.isFollowing);

app.get("/api/podcasts/:podcastId/episodes/:episodeId/progress", noSubdomain, requiresAuth, api.progress.progress);
app.post("/api/podcasts/:podcastId/episodes/:episodeId/progress", noSubdomain, requiresAuth, api.progress.post_progress);

app.get("/api/file/:fileId", noSubdomain, requiresAuth, api.file.file);
app.post("/api/file", noSubdomain, requiresAuth, api.file.post_file);
app.delete("/api/file/:fileId", noSubdomain, requiresAuth, api.file.delete_file);

// Main app routes

app.get("/", noSubdomain, controllers.public.home);

app.get("/feed", noSubdomain, requiresAuth, controllers.feed.index);

app.get("/request-invite", noSubdomain, anonymousOnly, controllers.auth.requestInvite);
app.post("/request-invite", noSubdomain, anonymousOnly, controllers.auth.post_requestInvite);

app.get("/join:inviteCode?:emailAddress?:name?", noSubdomain, anonymousOnly, controllers.auth.join);
app.post("/join", noSubdomain, anonymousOnly, controllers.auth.post_join);

app.get("/login", noSubdomain, anonymousOnly, controllers.auth.login);
app.post("/login", noSubdomain, anonymousOnly, controllers.auth.post_login);
app.get("/logout", noSubdomain, controllers.auth.logout);

app.get("/forgot", noSubdomain, anonymousOnly, controllers.auth.forgot);
app.post("/forgot", noSubdomain, anonymousOnly, controllers.auth.post_forgot);
app.get("/reset:resetCode?:emailAddress?", noSubdomain, anonymousOnly, controllers.auth.reset);
app.post("/reset", noSubdomain, anonymousOnly, controllers.auth.post_reset);

app.get("/profile", noSubdomain, requiresAuth, controllers.auth.profile);
app.post("/profile", noSubdomain, requiresAuth, controllers.auth.post_profile);

app.get("/podcasts", noSubdomain, requiresAuth, controllers.podcasts.index);
app.get("/podcasts/create", noSubdomain, requiresAuth, controllers.podcasts.create);
app.post("/podcasts/create", noSubdomain, requiresAuth, controllers.podcasts.post_create);
app.get("/podcasts/:podcastId/stats", noSubdomain, requiresAuth, controllers.podcasts.stats);
app.get("/podcasts/:podcastId/settings", noSubdomain, requiresAuth, controllers.podcasts.settings);

app.get("/podcasts/:podcastId/episodes", noSubdomain, requiresAuth, controllers.podcasts.episodeList);
app.get("/podcasts/:podcastId/episodes/create", noSubdomain, requiresAuth, controllers.podcasts.episodeCreate);
app.post("/podcasts/:podcastId/episodes/create", noSubdomain, requiresAuth, controllers.podcasts.post_episodeCreate);
app.get("/podcasts/:podcastId/episodes/:episodeId", noSubdomain, requiresAuth, controllers.podcasts.episodeEdit);
app.post("/podcasts/:podcastId/episodes/:episodeId", noSubdomain, requiresAuth, controllers.podcasts.post_episodeEdit);


//Admin routes
app.get("/admin/about", noSubdomain, adminOnly, controllers.admin.about);
app.get("/admin/users", noSubdomain, adminOnly, controllers.admin.users);
app.get("/admin/invites", noSubdomain, adminOnly, controllers.admin.invites);
app.post("/admin/send-invite", noSubdomain, adminOnly, controllers.admin.post_send_invite);

/**
 * Listen.
 */

// var sslkey = fs.readFileSync('ssl-key.pem');
// var sslcert = fs.readFileSync('ssl-cert.pem')
// var options = {
//     key: sslkey,
//     cert: sslcert
// };
 
http.createServer(app).listen(app.get("port"), function() {
	console.log("Node.js server listening on port " + app.get("port"));
});
