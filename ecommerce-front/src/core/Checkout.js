import { API } from '../config';
import React, { useState, useEffect } from 'react';
import { getProducts } from './apiCore';
import { emptyCart } from './cartHelpers';
import Card from './Card';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
import axios from "axios";
import logo from "../logo.svg";

const Checkout = ({products,setRun = f => f, run = undefined }) => {
    const [data, setData] = useState({
        loading: false,
        success: false,
        error: '',
        instance: {},
        address: ''
    });

    
    const getTotal = () => {
        return products.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.count * nextValue.price;
        }, 0);
    };
    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }

    async function displayRazorpay() {
        const res = await loadScript(
            "https://checkout.razorpay.com/v1/checkout.js"
        );
        console.error("Result of displayRozerPay ", res);

        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }
        console.log(`{getTotal(products)}`);
        const result = await axios.post(`${API}/orders`, { amount: `${getTotal()}` });

        console.error("Result of orders ", result);

        if (!result) {
            alert("Server error. Are you online?");
            return;
        }

        const { amount, id: order_id, currency } = result.data;

        const options = {
            key: "rzp_test_lB0leaI1WYsdoz", // Enter the Key ID generated from the Dashboard
            amount: getTotal(products),
            currency: currency,
            name: "Morning Basket India LLP",
            description: "Test Transaction",
            image: { logo },
            order_id: order_id,
            handler: async function (response) {
                console.error('Handler response ', response);
                const data = {
                    orderCreationId: order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                    address: deliveryAddress
                };

                const result = await axios.post(`${API}/success`, data);

                alert(result.data.msg);
            },
            prefill: {
                name: "",
                email: "",
                contact: "",
            },
            notes: {
                address: "Mornring Basket",
            },
            theme: {
                color: "#61dafb",
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    }
    const handleAddress = event => {
        setData({ ...data, address: event.target.value });
    };
    let deliveryAddress = data.address;

    const showError = error => (
        <div className="alert alert-danger" style={{ display: error ? '' : 'none' }}>
            {error}
        </div>
    );

    const showSuccess = success => (
        <div className="alert alert-info" style={{ display: success ? '' : 'none' }}>
            Thanks! Your payment was successful!
        </div>
    );

    const showLoading = loading => loading && <h2 className="text-danger">Loading...</h2>;

    const showDropIn = () => (
        <div onBlur={() => setData({ ...data, error: '' })}>
            {products.length > 0 ? (
                <div>
                    <div className="gorm-group mb-3">
                        <label className="text-muted">Delivery address:</label>
                        <textarea
                            onChange={handleAddress}
                            className="form-control"
                            value={data.address}
                            placeholder="Type your delivery address here..."
                        />
                    </div>
                    <button onClick={displayRazorpay} className="btn btn-success btn-block">
                        Pay
                    </button>
                </div>
            ) : null}
        </div>
    );
    const showCheckout = () => {
        return isAuthenticated() ? (
            <div>

            {showLoading(data.loading)}
            {showSuccess(data.success)}
            {showError(data.error)}
                <div>{showDropIn()}</div>
            </div>
        ) : (
            <Link to="/signin">
                <button className="btn btn-primary">Sign in to checkout</button>
            </Link>
        );
    };

    return <div>
    <h2>Total: ${getTotal()}</h2>

    {showCheckout()}
    </div>
}
export default Checkout;