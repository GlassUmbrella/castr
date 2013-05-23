
/**
 * Module dependencies.
 */

var express = require("express")
  , api = require("./api")
  , http = require("http")
  , path = require("path")
  , Bliss = require("bliss")
  , lessMiddleware = require('less-middleware')

var viewControllers = {
	auth: require("./view-controllers/auth-controller.js"),
	dashboard: require("./view-controllers/dashboard-controller.js")
};

var app = express();

// all environments
app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");
app.set("view engine", "bliss");

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: "8FD0A82D-7ADE-433A-8CE1-F1020B545D36" })); //Just a GUID
app.use(app.router);

app.use(express.static(path.join(__dirname, "public")));

var bliss = new Bliss();
app.engine("html", function(path, options, fn) {
	fn(null, bliss.render(path, options));
});

// development only
if ('development' == app.get('env')) {
	app.use(express.logger());
	app.use(express.errorHandler());
	app.use(lessMiddleware({
		debug: true,
		src: __dirname + '/public',
		compress: false
	}));
}

// production only
if ('production' == app.get('env')) {
	app.use(lessMiddleware({
		debug: false,
		src: __dirname + '/public',
		compress: true
	}));
}

// Basic subdomain routing
app.get('/*', function(req, res, next) {
	var baseUrl = "castr.dev:3000";

	var requestUrl = req.headers.host;
	requestUrl = requestUrl.replace(baseUrl, 'baseUrl');
	var parts = requestUrl.split('.');
	if(parts.indexOf("baseUrl") == 1) {
		req.subdomain = parts[0];
	}

	next();
});

// Routes
app.get("/", viewControllers.dashboard.index);

app.get("/login", viewControllers.auth.login);
app.post("/performLogin", viewControllers.auth.performLogin);
app.get("/logout", viewControllers.auth.logout);

app.get("/api", api.index);
app.get("/api/users", api.users);


// Start server
http.createServer(app).listen(app.get("port"), function(){
	console.log("Node.js server listening on port " + app.get("port"));
});
