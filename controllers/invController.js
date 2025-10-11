const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by Vehicle ID view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getVehicleById(inv_id)
  const vehicle = data
  
  if (!vehicle) {
    return res.status(404).render("errors/error", {
      title: "Vehicle Not Found",
      message: "Sorry, the vehicle you requested does not exist.",
    })
  }

  const detail = await utilities.buildVehicleDetail(vehicle)
  let nav = await utilities.getNav()
  
  res.render("inventory/details", {
    title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
    nav,
    detail
  })
}

/* ***************************
 *  Build Add Management view
 * ************************** */

invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav() 
  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    messages: req.flash('notice') 
  })
}


/* ***************************
 *  Build Add Classification view
 * ************************** */

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    messages: req.flash("notice"),
    errors: null,
    classification_name: '' 
  })
}

/* ***************************
 * Handle POST add classification data 
 * ************************** */

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const addResult = await invModel.addClassification(classification_name)

  if (addResult) {
    req.flash("notice", "Classification added successfully!")
    let nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("notice")
    })
  } else {
    req.flash("notice", "Failed to add classification.")
    let nav = await utilities.getNav()
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      messages: req.flash("notice"),
      errors: null
    })
  }
}
/* ***************************
 * Handle POST add inventory data



invController.buildAddInventory = async (req, res) => {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationList,
    errors: null,
    messages: req.flash('notice'),
    formData: {}
  })
}
 * ************************** */


invCont.triggerError = async function (req, res, next){
    // This is intentionally crashing the route
    throw new Error("This is a test 500 error")
}

module.exports = invCont