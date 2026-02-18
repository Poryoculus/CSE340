const invModel = require("../models/inventory-model");
jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      // clickable image
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';

      // divider under image
      grid += "<hr>";

      // text info box
      grid += '<div class="namePrice">';
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildVehicleDetail = async function (vehicle, isFavorite = false) {
  let detail = "";
  if (vehicle) {
    detail = '<section class="vehicle-detail">';

    detail +=
      "<h2>" +
      vehicle.inv_year +
      " " +
      vehicle.inv_make +
      " " +
      vehicle.inv_model +
      "</h2>";

    detail +=
      '<img src="' +
      vehicle.inv_image +
      '" alt="Image of ' +
      vehicle.inv_make +
      " " +
      vehicle.inv_model +
      ' on CSE Motors" />';

    detail += '<div class="vehicle-info">';
    detail +=
      "<h3>" + vehicle.inv_make + " " + vehicle.inv_model + " Details</h3>";
    detail +=
      "<p><strong>Price:</strong> $" +
      new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
      "</p>";
    detail +=
      "<p><strong>Mileage:</strong> " +
      new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
      " miles</p>";
    detail +=
      "<p><strong>Description:</strong> " + vehicle.inv_description + "</p>";

    //new Favorites form
    if (isFavorite) {
      detail += `
        <form action="/favorites/remove" method="POST">
         <input type="hidden" name="inv_id" value="${vehicle.inv_id}">
         <button type="submit">❌ Remove from Favorites</button>
        </form>
      `
    } else {
      detail += `
        <form action="/favorites/add" method="POST">
          <input type="hidden" name="inv_id" value="${vehicle.inv_id}">
          <button type="submit">❤️ Add to Favorites</button>
        </form>
      `
}

    detail += "</div>";
    detail += "</section>";
  } else {
    detail = '<p class="notice">Sorry, vehicle details could not be found.</p>';
  }

  return detail;
}; /* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

Util.requireAdmin = (req, res, next) => {
  if (!req.cookies.jwt) return res.redirect("/account/login");

  jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    (err, accountData) => {
      if (err || !["Admin", "Employee"].includes(accountData.account_type)) {
        req.flash(
          "notice",
          "You must be logged in with sufficient privileges.",
        );
        return res.redirect("/account/login");
      }
      res.locals.accountData = accountData;
      res.locals.loggedin = true;
      next();
    },
  );
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      },
    );
  } else {
    next();
  }
};

Util.buildClassificationList = async function (selectedId = null) {
  const data = await invModel.getClassifications();
  let classificationList = `<select name="classification_id" id="classificationList" required>`;
  classificationList += `<option value="">Choose a Classification</option>`;
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" ${
      selectedId == row.classification_id ? "selected" : ""
    }>${row.classification_name}</option>`;
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
