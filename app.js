/**
 * Module dependencies.
 */

var express = require("express")
  , api = require("./api")
  , http = require("http")
  , path = require("path")
  , Bliss = require("bliss")
  , less = require('less-middleware')

var controllers = {
	error: require("./view-controllers/error-controller.js"),
	auth: require("./view-controllers/auth-controller.js"),
	dashboard: require("./view-controllers/dashboard-controller.js")
};


/**
 * Configuration.
 */

var app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.bodyParser());
app.use(express.methodOverride());


// Sessions
app.use(express.cookieParser());
app.use(express.session({ secret: "8FD0A82D-7ADE-433A-8CE1-F1020B545D36" })); //Just a GUID


// Routing
app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));


// Error handling
app.use(controllers.error.handle500); //Custom error handlers
app.use(express.errorHandler()); //Default catch-all error handler


// Live vs Dev settings
if ('development' == app.get('env')) {
	app.use(express.logger("dev"));
	app.use(less({
		debug: true,
		src: __dirname + '/public',
		compress: false
	}));
} else if ('production' == app.get('env')) {
	app.use(less({
		debug: false,
		src: __dirname + '/public',
		compress: true
	}));
}

function secure(req, res, next) {
    if(req.session.user == null) {
    	return res.redirect("/login");
    }
    next();
}


/**
 * Routes.
 */

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
app.get("/", function(req, res) {
	res.redirect("/dashboard");
});

app.get("/dashboard", secure, controllers.dashboard.index);

app.get("/login", controllers.auth.login);
app.post("/performLogin", controllers.auth.performLogin);
app.get("/logout", controllers.auth.logout);

app.get("/api", api.index);
app.get("/api/users", api.users);

app.get("/make-error", function(req, res) {
	throw new Error("Bang!");
});


/**
 * Listen.
 */
 
http.createServer(app).listen(app.get("port"), function(){
	console.log("Node.js server listening on port " + app.get("port"));
});
