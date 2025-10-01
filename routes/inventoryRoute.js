// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")  

// Route to build inventory by classification view
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build detail view by vehicle id 
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));

router.get("/trigger-error", utilities.handleErrors(invController.triggerError))
module.exports = router;