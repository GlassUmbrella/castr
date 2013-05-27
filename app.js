/**
 * Module dependencies.
 */

var express = require("express")
  , http = require("http")
  , path = require("path")
  , less = require('less-middleware')
  , Sequelize = require("sequelize-mysql").sequelize
  , MySQL = require('sequelize-mysql').mysql

var controllers = {
	error: require("./view-controllers/error-controller.js"),
	auth: require("./view-controllers/auth-controller.js"),
	dashboard: require("./view-controllers/dashboard-controller.js")
};

var api = {
	default: require("./api/default.js"),
	users: require("./api/users.js")
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


// Database
var sequelize = new Sequelize("Castr", "root", "pY1ofAvG");

var User = sequelize.define('User', {
  emailAddress: Sequelize.STRING,
  password: Sequelize.TEXT
});


sequelize.sync({ force: true }).success(function() {
	console.log("Database dropped and recreated");
}).error(function(error) {
	console.log("FAILED! Database was not created");
});


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

app.get("/api", api.default.home);
app.get("/api/users", api.users.list);

app.get("/make-error", function(req, res) {
	throw new Error("Bang!");
});


/**
 * Listen.
 */
 
http.createServer(app).listen(app.get("port"), function(){
	console.log("Node.js server listening on port " + app.get("port"));
});
