import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Route, Switch} from 'react-router-dom'
import PropTypes from 'prop-types'
import {Login, Signup, HomePage, SingleProduct, Cart} from './components'
import {me} from './store'
import dashboard from './components/dashboard'
import NewProduct from './components/NewProduct'
import editproduct from './components/editproduct'
import OrderHistory from './components/OrderHistory'
import DashboardOrders from './components/DashboardOrders'

/**
 * COMPONENT
 */
class Routes extends Component {
  componentDidMount() {
    this.props.loadInitialData()
  }

  render() {
    const {isLoggedIn} = this.props

    return (
      <React.Fragment>
        <Switch>
          {/* Routes placed here are available to all visitors */}
          <Route exact path="/" component={HomePage} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/products/:productId" component={SingleProduct} />
          <Route exact path="/cart" component={Cart} />
          <Route exact path="/dashboard" component={dashboard} />
          <Route exact path="/newproduct" component={NewProduct} />
          <Route exact path="/editproduct/:id" component={editproduct} />

          {/* Displays our Login component as a fallback */}
        </Switch>
        {isLoggedIn ? (
          <Switch>
            {/* Routes placed here are only available after logging in */}
            <Route exact path="/cart/:userId" component={Cart} />
            <Route
              exact
              path="/orderhistory/:userId"
              component={OrderHistory}
            />
            <Route exact path="/dashboardorders" component={DashboardOrders} />
          </Switch>
        ) : null}
      </React.Fragment>
    )
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    // Being 'logged in' for our purposes will be defined has having a state.user that has a truthy id.
    // Otherwise, state.user will be an empty object, and state.user.id will be falsey
    isLoggedIn: !!state.user.id
  }
}

const mapDispatch = dispatch => {
  return {
    loadInitialData() {
      dispatch(me())
    }
  }
}

// The `withRouter` wrapper makes sure that updates are not blocked
// when the url changes
export default withRouter(connect(mapState, mapDispatch)(Routes))

/**
 * PROP TYPES
 */
Routes.propTypes = {
  loadInitialData: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}
