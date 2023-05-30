import React from "react";
import { createContext, useReducer } from "react";

export const Store = createContext();

const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
    cart: {
        shippingAddress: localStorage.getItem('shippingAddress')
            ? JSON.parse(localStorage.getItem('shippingAddress')) //stringify
            : {},
        paymentMethod: localStorage.getItem('paymentMethod')
            ? JSON.parse(localStorage.getItem('paymentMethod')) // blank
            : '',
        cartItems: localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : [],
    },
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'CART_ADD_ITEM':
            // add to cart
            const newItem = action.payload;
            const existItem = state.cart.cartItems.find((item) => item._id === newItem._id);

            const cartItems = existItem // Check if the new item already exists in the cartItems array
                ? state.cart.cartItems.map((item) =>
                    item._id === existItem._id ? newItem : item // If it does, replace the existing item with the new one
                )
                : [...state.cart.cartItems, newItem]; // If it doesn't, add the new item to the end of the cartItems array

            localStorage.setItem('cartItems', JSON.stringify(cartItems));

            return { ...state, cart: { ...state.cart, cartItems } };

        // return {
        //     ...state, //נשמור את כל הערכים הישנים מהשדה
        //     cart: {   // וניצור את אובייקט העגלה
        //     ...state.cart, // ולעגלה אנחנו שומרים את כל הערכים הישנים
        //     cartItems: [...state.cart.cartItems, action.payload], // "cartItems" ונעדכן רק את המוצרים בעגלה
        //     },   // action.payloadהמוצרים במערך העגלה, אנחנו נשמור את המוצרים הקודמים מהעגלה,ונוסיף את החדש מ
        // };
        case 'CART_REMOVE_ITEM': {
            const cartItems = state.cart.cartItems.filter((item) => item._id !== action.payload._id);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            return { ...state, cart: { ...state.cart, cartItems } };
        }
        case 'CART_CLEAR':
            return { ...state, cart: { ...state.cart, cartItems: [] } };
        case 'USER_SIGNIN':
            return { ...state, userInfo: action.payload };
        case 'USER_SIGNOUT':
            return {
                ...state,
                userInfo: null,
                cart: {
                    cartItems: [],
                    shippingAddress: {},
                    paymentMethod: '',
                },
            };
        case 'SAVE_SHIPPING_ADDRESS':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    shippingAddress: action.payload,
                },
            };
        case 'SAVE_PAYMENT_METHOD':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    paymentMethod: action.payload,
                },
            };
        default:
            return state;
    }
}

export const StoreProvider = (props) => {

    const [state, dispatch] = useReducer(reducer, initialState);
    const value = { state, dispatch };
    return <Store.Provider value={value}>{props.children}</Store.Provider>

}


