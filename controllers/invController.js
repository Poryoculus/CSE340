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
  
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash("notice"),
    classificationSelect,
    errors: null
  })
}


/* ***************************
 *  Build Add Classification view
 * ************************** */

invCont.buildAddClassification = async function (req, res, next) {
  console.log(utilities.getNav())
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

invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = req.params.classification_id
  const data = await invModel.getInventoryByClassificationId(classification_id)
  res.json(data) // return JSON data for your JS fetch
}

invCont.triggerError = async function (req, res, next){
    // This is intentionally crashing the route
    throw new Error("This is a test 500 error")
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  // Fetch the current inventory item
  const itemData = await invModel.getInventoryById(inv_id)

  // Build classification select list, pre-select the item's current classification
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
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
      classification_id,
    });
  }
};

/* ***************************
 * Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 * Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult && deleteResult.rowCount > 0) {
    req.flash("notice", `Inventory item deleted successfully.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Failed to delete inventory item.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont