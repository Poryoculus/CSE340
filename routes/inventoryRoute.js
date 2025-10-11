// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require('../utilities/inv-validation')
const utilities = require("../utilities/")  

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build detail view by vehicle id 
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));

router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

// Route to build the management view
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Route to build the add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Handle the add classification form submission
router.post(
  "/add-classification",
  invValidate.classificationRules(),  
  invValidate.checkClassificationData, 
  utilities.handleErrors(invController.addClassification)
);

// Add inventory (GET)
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory));

// Add inventory (POST)
router.post(
  '/add-inventory',
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router;