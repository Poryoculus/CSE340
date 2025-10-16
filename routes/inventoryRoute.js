const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require('../utilities/inv-validation');
const utilities = require("../utilities/");

// Public routes (accessible to all visitors)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

// Admin/Employee routes (restricted)
router.get("/", utilities.requireAdmin, utilities.handleErrors(invController.buildManagementView));

router.get("/add-classification", utilities.requireAdmin, utilities.handleErrors(invController.buildAddClassification));
router.post(
  "/add-classification",
  utilities.requireAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

router.get('/add-inventory', utilities.requireAdmin, utilities.handleErrors(invController.buildAddInventory));
router.post(
  '/add-inventory',
  utilities.requireAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

router.get("/edit/:inv_id", utilities.requireAdmin, utilities.handleErrors(invController.editInventoryView));
router.post("/update/", utilities.requireAdmin, utilities.handleErrors(invController.updateInventory));

router.get("/delete/:inv_id", utilities.requireAdmin, utilities.handleErrors(invController.buildDeleteView));
router.post("/delete", utilities.requireAdmin, utilities.handleErrors(invController.deleteInventory));

module.exports = router;