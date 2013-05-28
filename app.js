/**
 * Module dependencies.
 */

var express = require("express")
  , http = require("http")
  , path = require("path")
  , less = require("less-middleware")
  , orm = require("./lib/model")
  , mailer = require("./lib/mailer")
  , cookieSessions = require('./lib/cookie-sessions');

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

global.baseUrl = "castr.dev:3000";

app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Handle form data
app.use(express.bodyParser());
app.use(express.methodOverride());

// Sessions
app.use(express.cookieParser("B50E1047-493E-41FA-9E31-03830CFEA5F0"));
app.use(cookieSessions("8FD0A82D-7ADE-433A-8CE1-F1020B545D36"));

// Routing
app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.favicon(__dirname + "/public/images/favicon.ico"));

// Error handling
//app.use(controllers.error.handle500); //Custom error handlers
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
 
function requiresAuth(req, res, next) {
    if(req.session.user == null) {
    	return res.redirect("/login");
    }
    next();
}

function anonymousOnly(req, res, next) {
	if(req.session.user != null) {
		return res.redirect("/");
	}
	next();
}

function requiresSubDomain(req, res, next) {
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


// Routes
app.get("/", requiresSubDomain, function(req, res) {
	res.end("This is the subdomain: " + req.subdomain);
});

app.get("/", function(req, res) {
	res.redirect("/dashboard");
});

app.get("/dashboard", requiresAuth, controllers.dashboard.index);

app.get("/signup", anonymousOnly, controllers.auth.signup);
app.post("/signup", anonymousOnly, controllers.auth.post_signup);

app.get("/login", anonymousOnly, controllers.auth.login);
app.post("/login", anonymousOnly, controllers.auth.post_login);
app.get("/logout", controllers.auth.logout);

app.get("/forgot", anonymousOnly, controllers.auth.forgot);
app.post("/forgot", anonymousOnly, controllers.auth.post_forgot);
app.get("/reset:resetCode?:emailAddress?", anonymousOnly, controllers.auth.reset);
app.post("/reset", anonymousOnly, controllers.auth.post_reset);

app.get("/api", api.default.home);
app.get("/api/users", api.users.list);


/**
 * Listen.
 */
 
http.createServer(app).listen(app.get("port"), function(){
	console.log("Node.js server listening on port " + app.get("port"));
});
