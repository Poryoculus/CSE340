const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* ****************************************
 *  Registration Data Validation Rules
 * *************************************** */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),
    body("account_email")
       .trim()
       .escape()
       .notEmpty()
       .isEmail()
       .normalizeEmail()
       .custom((value) => {
         if (value.endsWith(".edu") || value.match(/\.edu\.[a-z]{2}$/i)) {
           console.log("User registered with an EDU email:", value)
         }
         return true
       })
       .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ****************************************
 *  Check registration data and return errors
 * *************************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ****************************************
 *  Login Data Validation Rules
 * *************************************** */
validate.loginRules = () => {
  return [
    body("account_email")
       .trim()
       .escape()
       .notEmpty()
       .isEmail()
       .normalizeEmail()
       .custom((value) => {
         if (value.endsWith(".edu") || value.match(/\.edu\.[a-z]{2}$/i)) {
           console.log("User registered with an EDU email:", value)
         }
         return true
       })
       .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password."),
  ]
}

/* ****************************************
 *  Check login data
 * *************************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/* ****************************************
 *  Account Update Validation Rules
 * *************************************** */
validate.accountUpdateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
  ]
}

/* ****************************************
 *  Check account update data
 * *************************************** */
validate.checkAccountUpdateData = async (req, res, next) => {
  // Add safety check for req.body
  if (!req.body) {
    const nav = await utilities.getNav()
    return res.render("account/update", {
      errors: [{ msg: "Invalid form data. Please try again." }],
      title: "Update Account",
      nav,
      account: null
    })
  }

  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    // Create an account object to match what your view expects
    const account = {
      account_id,
      account_firstname,
      account_lastname,
      account_email
    }
    
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Account",
      nav,
      account // Pass as account object, not individual properties
    })
    return
  }
  next()
}
/* ****************************************
 *  Password Change Validation Rules
 * *************************************** */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ****************************************
 *  Check password data
 * *************************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      account_id
    })
    return
  }
  next()
}

/* ***************************
 * Check Update Data
 * ************************ */
validate.checkUpdateData = async (req, res, next) => {
  const { 
    inv_id,
    inv_make, 
    inv_model, 
    inv_year, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id 
  } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}

module.exports = validate