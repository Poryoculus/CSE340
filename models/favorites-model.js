const pool = require("../database/");

async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      RETURNING *`;
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rowCount === 1;
  } catch (error) {
    return false;
  }
}

async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `
      DELETE FROM favorites
      WHERE account_id = $1 AND inv_id = $2`;
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rowCount === 1;
  } catch (error) {
    return false;
  }
}

async function getFavoritesByAccount(account_id) {
  try {
    const sql = `
      SELECT inventory.*
      FROM favorites
      JOIN inventory ON favorites.inv_id = inventory.inv_id
      WHERE favorites.account_id = $1`;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function checkIfFavorite(account_id, inv_id) {
  try {
    const sql = `
      SELECT favorite_id 
      FROM favorites
      WHERE account_id = $1 AND inv_id = $2
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount > 0
  } catch (error) {
    return false
  }
}


module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByAccount,
  checkIfFavorite
};
