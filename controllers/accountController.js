const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")  
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", { title: "Registration", nav, errors: null })
    return
  }

  const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword)

  if (regResult) {
    req.flash("notice", `Congratulations, you\'re registered ${account_firstname}. Please log in.`)
    res.status(201).render("account/login", { title: "Login", nav })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", { title: "Registration", nav })
  }
}

/* ****************************************
*  Process login request
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/management")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
* Build account management view   
* *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData.account_id
    const account = await accountModel.getAccountById(account_id)
    res.status(201).render("account/management", {
      title: "Account Management",
      nav,
      account,
      errors: null,         
      messages: req.flash(),
    })
  } catch (err) {
    next(err);
  }
}

/* ****************************************
* Deliver account update view
* *************************************** */
async function updateAccountView(req, res) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const account = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account",
    nav,
    account,
    errors: null,
    messages: req.flash()
  })
}

/* ****************************************
* Handle account info update
* *************************************** */
async function updateAccountInfo(req, res) {
  const { account_id, first_name, last_name, email } = req.body
  const errors = req.validationErrors ? req.validationErrors() : null

  if (errors) {
    return res.render("account/update", {
      title: "Update Account",
      account: { account_id, first_name, last_name, email },
      errors,
      messages: req.flash()
    })
  }

  const result = await accountModel.updateAccountInfo({ account_id, first_name, last_name, email })

  if (result) req.flash("notice", "Account information updated successfully")
  else req.flash("notice", "Failed to update account information")

  const updatedAccount = await accountModel.getAccountById(account_id)

  res.render("account/management", {
    title: "Account Management",
    account: updatedAccount,
    errors: null,
    messages: req.flash()
  })
}

/* ****************************************
* Handle password change
* *************************************** */
async function changePassword(req, res) {
  const { account_id, new_password } = req.body
  const errors = req.validationErrors ? req.validationErrors() : null

  if (errors) {
    return res.render("account/update", {
      title: "Update Account",
      account: { account_id },
      errors,
      messages: req.flash()
    })
  }

  const hashedPassword = await bcrypt.hash(new_password, 10)
  const result = await accountModel.updateAccountPassword({ account_id, hashedPassword })

  if (result) req.flash("notice", "Password updated successfully")
  else req.flash("notice", "Failed to update password")

  const updatedAccount = await accountModel.getAccountById(account_id)

  res.render("account/management", {
    title: "Account Management",
    account: updatedAccount,
    errors: null,
    messages: req.flash()
  })
}

/* ****************************************
 *  Process logout
 * *************************************** */
async function accountLogout(req, res) {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt")
    
    // Optional: flash message
    req.flash("notice", "You have been logged out successfully.")

    // Redirect to home page
    res.redirect("/")
  } catch (error) {
    throw new Error("Logout failed")
  }
}

/* ****************************************
* Export controller functions
* *************************************** */
module.exports = {
  accountLogout,
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  updateAccountView,
  updateAccountInfo,
  changePassword
}