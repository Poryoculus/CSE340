/* ******************************************
 * server.js - Primary file of the application
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const connectFlash = require("connect-flash");
const pgSession = require("connect-pg-simple")(session);
const env = require("dotenv").config();

const pool = require("./database/");
const utilities = require("./utilities/");
const baseController = require("./controllers/baseController");
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");

/* ***********************
 * Express App Setup
 *************************/
const app = express();

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // layout not at view root

/* ***********************
 * Middleware
 *************************/
// Session Middleware
app.use(
  session({
    store: new pgSession({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Body Parsing Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// JWT Token Check Middleware
app.use(utilities.checkJWTToken);

// Flash Messages Middleware
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

/* ***********************
 * Routes
 *************************/
// Home Page
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory Routes
app.use("/inv", utilities.handleErrors(inventoryRoute));

// Account Routes
app.use("/account", accountRoute);

// Static Routes
app.use(staticRoutes);

// File Not Found Route (must be last)
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";

  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Server Info & Startup
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});