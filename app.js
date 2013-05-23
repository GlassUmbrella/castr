
/**
 * Module dependencies.
 */

var express = require("express")
  , api = require("./api")
  , http = require("http")
  , path = require("path")
  , Bliss = require("bliss");

var viewControllers = {
	home: require("./view-controllers/index.js"),
	auth: require("./view-controllers/login.js")
};

var app = express();

// all environments
app.set("port", process.env.PORT || 3000);
app.set("views", __dirname + "/views");
app.set("view engine", "bliss");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.session({ secret: "some_secret" }));

app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));

// set view engine
var bliss = new Bliss();
app.engine("html", function(path, options, fn) {
	fn(null, bliss.render(path, options));
});

// development only
if ("development" == app.get("env")) {
	app.use(express.errorHandler());
}

app.get("/", viewControllers.home.index);
app.get("/api", api.index);
app.get("/api/users", api.users);

app.get("/login", viewControllers.auth.login);
app.post("/performLogin", viewControllers.auth.performLogin);
app.get("/logout", viewControllers.auth.logout);


http.createServer(app).listen(app.get("port"), function(){
	console.log("Express server listening on port " + app.get("port"));
});
