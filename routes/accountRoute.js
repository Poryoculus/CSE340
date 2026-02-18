const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const accountValidate = require("../utilities/account-validation");

// Route to build account management view
router.get(
  "/management",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement),
);

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build register view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister),
);

// Route to deliver account update view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateAccountView),
);

// Process account update form submission
router.post(
  "/update",
  utilities.checkLogin,
  accountValidate.accountUpdateRules(),
  accountValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo),
);

// Process password change form submission
router.post(
  "/password",
  utilities.checkLogin,
  accountValidate.passwordRules(),
  accountValidate.checkPasswordData,
  utilities.handleErrors(accountController.updateAccountPassword),
);

// Process the login request
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin),
);

// Process the registration data
router.post(
  "/register",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount),
);
// Logout route
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router;

