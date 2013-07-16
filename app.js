/**
 * Module dependencies.
 */

var express = require("express")
  , http = require("http")
  , path = require("path")
  , less = require("less-middleware")
  , orm = require("./lib/model")
  , mailer = require("./lib/mailer")
  , cookieSessions = require("./lib/cookie-sessions")
  , validation = require("./lib/validation")
  , azure = require("./lib/azure")
  , shared = require("./public/js/castr/shared.js")
  ,	config = require("./config");

var controllers = {
	error: require("./controllers/error-controller"),
	auth: require("./controllers/auth-controller"),
	dashboard: require("./controllers/dashboard-controller"),
	podcasts: require("./controllers/podcasts-controller"),
	site: require("./controllers/site-controller"),
	public: require("./controllers/public-controller"),
	admin: require("./controllers/admin-controller")
};

var api = {
	default: require("./api/default"),
	users: require("./api/users"),
	podcasts: require("./api/podcasts")
};


/**
 * Configuration.
 */

var app = express();


// global.baseUrl = "castr.dev:3000";

app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Handle form data
app.use(express.bodyParser());
app.use(express.methodOverride());

// Sessions
app.use(express.cookieParser("B50E1047-493E-41FA-9E31-03830CFEA5F0"));
app.use(cookieSessions("8FD0A82D-7ADE-433A-8CE1-F1020B545D36"));

// Middleware
app.use(function(req, res, next) {
	res.locals.session = req.session;
	next();
});

// Routing
app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.favicon(__dirname + "/public/images/favicon.ico"));

// Error handling
//app.use(controllers.error.handle500); //Custom error handlers
app.use(express.errorHandler()); //Default catch-all error handler

// Email
mailer.init(config.mailer);

console.log("Environment: " + app.settings.env);

// Dev configuration
var databaseUser = {};
if("development" == app.settings.env) {
	databaseUser = config.mysql.dev;
	global.baseUrl = "castr.dev:3000";

	app.use(less({
		force: true,
		debug: true,
		src: __dirname + "/public",
		compress: false
	}));
} else { // "development" == app.settings.env
	databaseUser = config.mysql.live;
	global.baseUrl = "castr.net";
	
	app.use(less({
		debug: false,
		src: __dirname + "/public",
		compress: true
	}));
}

app.use(express.logger(app.settings.env));
orm.setup("./models", databaseUser.database, databaseUser.username, databaseUser.password, { host: databaseUser.host }); 
// azure.setup(config.azure.account, config.azure.accessKey);


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
		return res.redirect("/dashboard");
	}
	next();
}

function adminOnly(req, res, next) {
	if(req.session.user == null || req.session.user.isAdmin == false) {
		//403 or 404
		return res.status(401);
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


// Subdomain routes

app.get("/", requiresSubdomain, controllers.site.index);
app.get("/page/:pageNumber", requiresSubdomain, controllers.site.index);
app.get("/episodes", requiresSubdomain, controllers.site.index);
app.get("/rss", requiresSubdomain, controllers.site.rss);
app.get("/itunes", requiresSubdomain, controllers.site.itunes);
app.get("/contact", requiresSubdomain, controllers.site.contact);
app.get("/episodes/:episodeNumber", requiresSubdomain, controllers.site.episode);

// Main app routes

app.get("/", controllers.public.home);

app.get("/dashboard", requiresAuth, controllers.dashboard.index);

app.get("/request-invite", anonymousOnly, controllers.auth.requestInvite);
app.post("/request-invite", anonymousOnly, controllers.auth.post_requestInvite);

app.get("/join:inviteCode?:emailAddress?:name?", anonymousOnly, controllers.auth.join);
app.post("/join", anonymousOnly, controllers.auth.post_join);

app.get("/login", anonymousOnly, controllers.auth.login);
app.post("/login", anonymousOnly, controllers.auth.post_login);
app.get("/logout", controllers.auth.logout);

app.get("/forgot", anonymousOnly, controllers.auth.forgot);
app.post("/forgot", anonymousOnly, controllers.auth.post_forgot);
app.get("/reset:resetCode?:emailAddress?", anonymousOnly, controllers.auth.reset);
app.post("/reset", anonymousOnly, controllers.auth.post_reset);

app.get("/api", api.default.home);
app.get("/api/podcasts", requiresAuth, api.podcasts.list);
app.get("/api/podcasts/:podcastId/episodes", requiresAuth, api.podcasts.episodes);
app.get("/api/podcasts/isUrlUnique", requiresAuth, api.podcasts.isUrlUnique);

app.get("/podcasts", requiresAuth, controllers.podcasts.index);
app.get("/podcasts/create", requiresAuth, controllers.podcasts.create);
app.post("/podcasts/create", requiresAuth, controllers.podcasts.post_create);
app.get("/podcasts/:podcastId", requiresAuth, controllers.podcasts.index);

app.get("/podcasts/:podcastId/episodes/create", requiresAuth, controllers.podcasts.episodeCreate);
app.post("/podcasts/:podcastId/episodes/create", requiresAuth, controllers.podcasts.post_episodeCreate);

app.get("/podcasts/:podcastId/episodes/:episodeId", requiresAuth, controllers.podcasts.episode);
app.post("/podcasts/:podcastId/episodes/:episodeId", requiresAuth, controllers.podcasts.post_episode);


//Admin routes
app.get("/admin/invites", adminOnly, controllers.admin.invites);
app.post("/admin/send-invite", adminOnly, controllers.admin.post_send_invite);

/**
 * Listen.
 */
 
http.createServer(app).listen(app.get("port"), function() {
	console.log("Node.js server listening on port " + app.get("port"));
});
