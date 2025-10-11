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
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash("notice") 
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
 *  Build Add Inventory View
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList() // from utilities/index.js
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      messages: req.flash("notice"),
      formData: {} // sticky fields
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Handle POST Add Inventory Data
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    } = req.body

    const image = inv_image && inv_image.trim() ? inv_image.trim() : "/images/no-image-available.png"
    const thumbnail = inv_thumbnail && inv_thumbnail.trim() ? inv_thumbnail.trim() : "/images/no-image-available-thumb.png"

    const item = {
      classification_id,
      inv_make: inv_make.trim(),
      inv_model: inv_model.trim(),
      inv_description: inv_description ? inv_description.trim() : "",
      inv_image: image,
      inv_thumbnail: thumbnail,
      inv_price,
      inv_year,
      inv_miles: inv_miles || 0,
      inv_color,
    }

    const addResult = await invModel.addInventoryItem(item)

    if (addResult && addResult.rowCount > 0) {
      req.flash("notice", `Vehicle "${item.inv_make} ${item.inv_model}" added successfully!`)
      let nav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash("notice")
      })
    } else {
      req.flash("notice", "Failed to add inventory item.")
      let nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(item.classification_id)
      res.status(501).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        messages: req.flash("notice"),
        errors: null,
        formData: req.body
      })
    }
  } catch (error) {
    next(error)
  }
}

invCont.triggerError = async function (req, res, next){
    // This is intentionally crashing the route
    throw new Error("This is a test 500 error")
}

module.exports = invCont