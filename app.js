/**
 * Module dependencies.
 */

var express = require("express")
  , http = require("http")
  , path = require("path")
  , less = require("less-middleware")
  , orm = require("./lib/model")
  , mailer = require("./lib/mailer")
  , MySQLSessionStore = require('connect-mysql-session')(express);

var controllers = {
	error: require("./controllers/error-controller"),
	auth: require("./controllers/auth-controller"),
	dashboard: require("./controllers/dashboard-controller")
};

var api = {
	default: require("./api/default"),
	users: require("./api/users")
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
app.use(express.session({
    store: new MySQLSessionStore("Castr", "root", "pY1ofAvG"),
    secret: "8FD0A82D-7ADE-433A-8CE1-F1020B545D36" //Just a GUID
}));



// Routing
app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.favicon(__dirname + "/public/images/favicon.ico"));


// Error handling
app.use(controllers.error.handle500); //Custom error handlers
app.use(express.errorHandler()); //Default catch-all error handler

// Email
mailer.init({
    service: "Mandrill",
    auth: {
        user: "weiran@castr.net",
        pass: "fnAY7SkbVK_oX5AI3J7WoA"
    }
});


// Dev configuration
if ("development" == app.get("env")) {
	orm.setup("./models", "Castr", "root", "pY1ofAvG"); //Local details
	orm.sync();
	
	app.use(express.logger("dev"));
	
	app.use(less({
		force: true,
		debug: true,
		src: __dirname + "/public",
		compress: false
	}));
}

// Live configuration
if ("production" == app.get("env")) {
	orm.setup("./models", "castr.c2h3rmbudmwv.eu-west-1.rds.amazonaws.com:3306", "castr", "y2E2FdGaEfsUKj"); //Not tested this
	
	app.use(less({
		debug: false,
		src: __dirname + "/public",
		compress: true
	}));
}


/**
 * Routes.
 */
 
function secure(req, res, next) {
    if(req.session.user == null) {
    	return res.redirect("/login");
    }
    next();
}


// Basic subdomain routing
app.get("/*", function(req, res, next) {
	var baseUrl = "castr.dev:3000";

	var requestUrl = req.headers.host;
	requestUrl = requestUrl.replace(baseUrl, "baseUrl");
	var parts = requestUrl.split(".");
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

app.get("/signup", controllers.auth.signup);
app.post("/signup", controllers.auth.post_signup);

app.get("/login", controllers.auth.login);
app.post("/login", controllers.auth.post_login);
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
