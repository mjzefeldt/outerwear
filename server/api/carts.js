const router = require('express').Router()
const {
  Cart,
  Product,
  User,
  CartProduct,
  OrderProduct,
  Order
} = require('../db/models')

router.get('/', async (req, res, next) => {
  try {
    const carts = await Cart.findAll({include: {all: true}})

    res.json(carts)
  } catch (err) {
    next(err)
  }
})
router.put('/guestCart', async (req, res, next) => {
  try {
    console.log('GUEST CART PUT REQ BODY >>>>>>>', req.body)
    console.log('GUEST CART PUT SESSION>>>>>>', req.session.cart)
    let {productId, inc} = req.body
    let cart = req.session.cart
    console.log(productId)
    if (inc === 1) {
      req.session.cart.push({id: productId})
    }
    if (inc === -1) {
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
          cart.splice(i, 1)
          break
        }
      }
    }
    if (inc === 0) {
      req.session.cart = cart.filter(obj => {
        return obj.id !== productId
      })
    }
    res.send('we did it')
  } catch (e) {
    console.error(e)
  }
})
router.get('/guestCart', async (req, res, next) => {
  try {
    if (req.session.cart === undefined) {
      req.session.cart = []
      res.json({})
    } else {
      let data = await Promise.all(
        req.session.cart.map(item => {
          return Product.findById(item.id)
        })
      )
      let ids = []
      let cart = {}
      for (let i = 0; i < data.length; i++) {
        let id = data[i].id
        if (ids.includes(id)) cart[id].quantity = cart[id].quantity + 1
        else {
          cart[id] = {...data[i].dataValues, quantity: 1}
          ids.push(id)
        }
      }
      console.log('req session ', req.session)
      res.json(cart)
    }
  } catch (err) {
    next(err)
  }
})
router.put('/guestAdd', (req, res, next) => {
  console.log('guest add body>>>>', req.body)
  req.session.cart === undefined
    ? (req.session.cart = [req.body])
    : req.session.cart.push(req.body)
  res.send('hello')
})

router.get('/usercart', async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: {userId: req.query.userId},
      include: {all: true}
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

router.put('/quantity', async (req, res, next) => {
  try {
    let {sign, productId, cartId} = req.body
    let join = await CartProduct.find({where: {productId, cartId}})
    if (sign === 'add') await join.update({quantity: join.quantity + 1})
    else {
      await join.update({quantity: join.quantity - 1})
    }
    let cart = await Cart.findOne({
      where: {
        id: cartId
      },
      include: {all: true}
    })
    res.json(cart)
  } catch (err) {
    next(err)
  }
})

router.put('/addToCart/:userId', async (req, res, next) => {
  let cart = await Cart.findOne({
    where: {userId: req.params.userId},
    include: {all: true}
  })
  let join = await CartProduct.findOrCreate({
    where: {cartId: cart.id, productId: req.body.productId}
  })
  if (!join[1]) await join[0].update({quantity: join[0].quantity + 1})
  let newCart = await Cart.findOne({
    where: {userId: req.params.userId},
    include: {all: true}
  })
  res.json(newCart)
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

router.delete('/delete/:cartId/:productId', async (req, res, next) => {
  try {
    await CartProduct.destroy({where: req.params})
    res.json('Item successfully deleted')
  } catch (err) {
    next(err)
  }
})

router.put('/submit/:cartId', async (req, res, next) => {
  try {
    let products = req.body.products
    let subTotal = products.reduce((acc, curr) => {
      return (acc += curr.price * curr.cartProduct.quantity)
    }, 0)
    const order = await Order.create({
      time: Date.now(),
      subTotal: subTotal,
      userId: 4
    })
    products.forEach(async product => {
      let orderProductRow = await OrderProduct.create({
        purchasedPrice: product.price,
        productId: product.id,
        orderId: order.id,
        quantity: product.cartProduct.quantity
      })
    })
    await CartProduct.destroy({
      where: {
        cartId: req.params.cartId
      }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
