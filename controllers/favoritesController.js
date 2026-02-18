const favoritesModel = require("../models/favorites-model")
const utilities = require("../utilities/")

async function addFavorite(req, res) {
  const { inv_id } = req.body
  const account_id = res.locals.accountData.account_id

  const result = await favoritesModel.addFavorite(account_id, inv_id)

  if (result) {
    req.flash("notice", "Added to favorites")
  } else {
    req.flash("notice", "Unable to add favorite")
  }

  res.redirect(`/inv/detail/${inv_id}`)
}

async function removeFavorite(req, res) {
  const { inv_id } = req.body
  const account_id = res.locals.accountData.account_id

  const result = await favoritesModel.removeFavorite(account_id, inv_id)

  if (result) {
    req.flash("notice", "Removed from favorites")
  } else {
    req.flash("notice", "Unable to remove favorite")
  }

  res.redirect("/favorites")
}

async function buildFavorites(req, res) {
  const account_id = res.locals.accountData.account_id
  const nav = await utilities.getNav()

  const favorites = await favoritesModel.getFavoritesByAccount(account_id)

  res.render("favorites/index", {
    title: "My Favorites",
    nav,
    favorites,
    messages: req.flash()
  })
}





module.exports = {
  addFavorite,
  removeFavorite,
  buildFavorites
}
