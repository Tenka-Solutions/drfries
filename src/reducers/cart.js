export const cartInitialState = JSON.parse(window.localStorage.getItem('cart')) || []

export const CART_ACTION_TYPES = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  DECREASE_QUANTITY: 'DECREASE_QUANTITY', // New action type
  CLEAR_CART: 'CLEAR_CART'
}

// update localStorage with state for cart
export const updateLocalStorage = state => {
  window.localStorage.setItem('cart', JSON.stringify(state))
}

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const UPDATE_STATE_BY_ACTION = {
  [CART_ACTION_TYPES.ADD_TO_CART]: (state, action) => {
    const newState = [
      ...state,
      {
        ...action.payload, // product
        quantity: 1,
        uniqueId: generateUniqueId() // Add unique identifier
      }
    ]

    updateLocalStorage(newState)
    return newState
  },
  [CART_ACTION_TYPES.REMOVE_FROM_CART]: (state, action) => {
    const { uniqueId } = action.payload
    const newState = state.filter(item => item.uniqueId !== uniqueId)
    updateLocalStorage(newState)
    return newState
  },
  [CART_ACTION_TYPES.DECREASE_QUANTITY]: (state, action) => {
    const { uniqueId } = action.payload
    const productInCartIndex = state.findIndex(item => item.uniqueId === uniqueId)

    if (productInCartIndex >= 0) {
      if (state[productInCartIndex].quantity === 1) {
        const newState = state.filter(item => item.uniqueId !== uniqueId)
        updateLocalStorage(newState)
        return newState
      }

      const newState = [
        ...state.slice(0, productInCartIndex),
        { ...state[productInCartIndex], quantity: state[productInCartIndex].quantity - 1 },
        ...state.slice(productInCartIndex + 1)
      ]

      updateLocalStorage(newState)
      return newState
    }

    return state
  },
  [CART_ACTION_TYPES.CLEAR_CART]: () => {
    updateLocalStorage([])
    return []
  }
}

export const cartReducer = (state, action) => {
  const { type: actionType } = action
  const updateState = UPDATE_STATE_BY_ACTION[actionType]
  return updateState ? updateState(state, action) : state
}
