import React, {Component} from 'react'
import CartItem from './CartItem'
import {connect} from 'react-redux'
import {fetchCart, submitCart} from '../store/cart'

class Cart extends Component {
  constructor() {
    super()
    this.state = {
      item: '',
      quantity: []
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    this.props.setCart(this.props.match.params)
  }

  handleChange(event) {
    this.setState({
      item: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    this.props.cart.products.map(product => {})
    // event.target.quantity5.value
    this.props.submitCart(this.props.cart.id, this.props.cart.products)
  }

  render() {
    const cart = this.props.cart
    return (
      <form onSubmit={this.handleSubmit}>
        {cart.products.map(product => {
          return (
            <div>
              <h1>CART ITEM: {product.title}</h1>
              <input type="number" name={`quantity${product.id}`} />
            </div>
          )
        })}
        <button type="submit">Checkout</button>
      </form>
    )
  }
}

const mapStateToProps = state => {
  return {
    cart: state.cart.currentCart
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setCart: userId => dispatch(fetchCart(userId)),
    submitCart: (cartId, products, quantity) =>
      dispatch(submitCart(cartId, products, quantity))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart)
