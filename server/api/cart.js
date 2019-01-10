const router = require('express').Router()
const {Cart, Product, User} = require('../db/models')

router.get('/', async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: {userId: req.query.userId}
    })

    // If cart does not exist... create cart and set to user

    if (cart === null) {
      cart = await Cart.create()
      const user = await User.findById(req.query.userId)
      await user.setCart(cart)
    }
    res.json(cart)
  } catch (err) {
    next(err)
  }
})

router.post('/add', async (req, res, next) => {
  try {
    //find or create instance of cart specific to user
    const cart = await Cart.findOne({
      where: {
        userId: req.body.id
      }
    })
    const addItem = await cart.addProduct(req.body)
    res.json(addItem)
  } catch (err) {
    next(err)
  }
})

router.put('/edit', async (req, res, next) => {
  try {
    const updatedCart = await Cart.update(req.body, {
      returning: true,
      where: {
        id: req.body.id
      }
    })
    res.json(updatedCart[1][0])
  } catch (err) {
    next(err)
  }
})

router.delete('/deleteItem/:itemId', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: {
        userId: req.body.id
      }
    })
    const product = await Product.findOne({
      where: {
        productId: req.body.id
      }
    })
    await cart.removeProduct({
      where: {
        id: req.params.id
      }
    })
    res.json('Item successfully deleted')
  } catch (err) {
    next(err)
  }
})

module.exports = router
