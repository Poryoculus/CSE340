const utilities = require('.') // require the utilities folder (index.js)
const { body, validationResult } = require('express-validator')

const invValidate = {}

invValidate.classificationRules = () => {
  return [
    // sanitize then validate
    body('classification_name')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Please provide a classification name.')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('Classification name must not contain spaces or special characters.')
  ]
}

invValidate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render('inventory/add-classification', {
      title: 'Add New Classification',
      nav,
      errors: errors.array(),            
      messages: req.flash('notice'),
      classification_name                 
    })
  }
  next()
}

invValidate.inventoryRules = () => {
  return [
    // classification must be chosen and numeric
    body('classification_id')
      .trim()
      .notEmpty()
      .withMessage('Please choose a classification.')
      .isInt()
      .withMessage('Invalid classification.')
      .toInt(),

    // Make and model required
    body('inv_make')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Make is required.'),

    body('inv_model')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Model is required.'),

    // Year required and a reasonable integer
    body('inv_year')
      .trim()
      .notEmpty()
      .withMessage('Year is required.')
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage('Enter a valid year.')
      .toInt(),

    // Price required and positive number
    body('inv_price')
      .trim()
      .notEmpty()
      .withMessage('Price is required.')
      .isFloat({ min: 0 })
      .withMessage('Enter a valid positive price.')
      .toFloat(),

    // Miles optional, if present must be positive integer
    body('inv_miles')
      .optional({ checkFalsy: true })
      .trim()
      .isInt({ min: 0 })
      .withMessage('Miles must be a positive integer.')
      .toInt(),

    // Description / image fields - sanitize, optional
    body('inv_description')
      .optional({ checkFalsy: true })
      .trim()
      .escape(),

    body('inv_image')
      .optional({ checkFalsy: true })
      .trim(),

    body('inv_thumbnail')
      .optional({ checkFalsy: true })
      .trim(),
    
    body('inv_color')
      .trim()
      .notEmpty()
      .withMessage('Color is required.')
      .matches(/^[A-Za-z0-9 ]+$/)
      .withMessage('Color must only contain letters, numbers, and spaces.')
      .escape()

  ]
}

invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const formData = { ...req.body }

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)

    return res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      errors: errors.array(),   
      messages: req.flash('notice'),
      formData                  
    })
  }
  next()
}

invValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)

  const {
    inv_id,
    classification_id,
    ...formData
  } = req.body

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)

    return res.render("inventory/edit-inventory", {
      title: "Edit Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      messages: req.flash("notice"),
      formData,
      inv_id
    })
  }

  next()
}

module.exports = invValidate