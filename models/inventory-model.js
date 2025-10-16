const pool = require("../database/")

const { get } = require("../routes/static")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 * Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Add a classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("Database error adding classification:", error)
    return null
  }
}

async function addInventoryItem(item) {
  try {
    const sql = `
  INSERT INTO public.inventory
    (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  RETURNING inv_id
`
    const params = [
      item.classification_id,
      item.inv_make,
      item.inv_model,
      item.inv_description,
      item.inv_image,
      item.inv_thumbnail,
      item.inv_price,
      item.inv_year,
      item.inv_miles,
      item.inv_color,
    ]
    return await pool.query(sql, params)
  } catch (error) {
    console.error('addInventoryItem error: ', error)
    throw error
  }
}



async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0] // single vehicle, not array
  } catch (error) {
    console.error("getVehicleById error " + error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make = $1,
          inv_model = $2,
          inv_description = $3,
          inv_image = $4,
          inv_thumbnail = $5,
          inv_price = $6,
          inv_year = $7,
          inv_miles = $8,
          inv_color = $9,
          classification_id = $10
      WHERE inv_id = $11
      RETURNING *`;
    const data = await pool.query(sql, [
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
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}
/* ***************************
 * Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory Error: " + error)
  }
}

module.exports = { deleteInventoryItem, updateInventory, addInventoryItem, addClassification ,getClassifications, getInventoryByClassificationId, getVehicleById  }


