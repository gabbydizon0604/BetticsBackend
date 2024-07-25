const errorMiddleware = require('../middleware/errors')
const { getModel, conectionManager } = require('../config/connection');
const consta = require('../config/constantes')
var axios = require('axios');
const qs = require('qs');

const options = {
    page: 1,
    limit: 10,
    select: '_id nombres apellidos correoElectronico tipoCliente informacion'
}

const auth = { user: process.env.PAYPAL_CLIENT_ID, pass: process.env.PAYPAL_CLIENT_SECRET }

exports.crearSuscripcion = async (req, res, next) => {

    try {

        let data = {
            "plan_id": req.body.plan_id,
            "start_time": req.body.start_time,
            "quantity": "1",
            "shipping_amount": {
                "currency_code": "USD",
                "value": "3.00"
            },
            "subscriber": {
                "name": {
                    "given_name": "John",
                    "surname": "Doe"
                },
                "email_address": "customer@example.com",
                "shipping_address": {
                    "name": {
                        "full_name": "John Doe"
                    },
                    "address": {
                        "address_line_1": "2211 N First Street",
                        "address_line_2": "Building 17",
                        "admin_area_2": "San Jose",
                        "admin_area_1": "CA",
                        "postal_code": "95131",
                        "country_code": "US"
                    }
                }
            },
            "application_context": {
                "brand_name": "Bettics Sac",
                "locale": "en-US",
                "shipping_preference": "SET_PROVIDED_ADDRESS",
                "user_action": "SUBSCRIBE_NOW",
                "payment_method": {
                    "payer_selected": "PAYPAL",
                    "payee_preferred": "IMMEDIATE_PAYMENT_REQUIRED"
                },
                "return_url": process.env.PAYPAL_SUCESSS_URL,
                "cancel_url": process.env.PAYPAL_ERROR_URL
            }
        };

        const accessToken = await getTokenPaypal();

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.PAYPAL_URL + '/v1/billing/subscriptions',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Prefer': 'return=representation'
            } 
        };

        // const resSuscription = wa axios.request(config);
        // const resSuscription = await axios.post(process.env.PAYPAL_URL + '/v1/billing/subscriptions', data, config);
        // const { status, data = {} } = await axios(options);

        const resSuscription = await axios.post(
            `${process.env.PAYPAL_URL}/v1/billing/subscriptions`,
            data,
            config
        );

        console.log("resSuscription data");
        // console.log(resSuscription.data);
        console.log(resSuscription.data.details);

        return res.json({
            resultado: 'ok',
            data: resSuscription.data
        })
    } catch (err) {
        console.log("err.data.details");
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
          } else if (err.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(err.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', err.message);
          }

        // console.log(err)
        return errorMiddleware(err, req, res, next);
    } finally { }
}


exports.webhook = async (req, res, next) => {

    try {
        console.log(req.body.event_type);
        if(req.body.event_type == "BILLING.SUBSCRIPTION.ACTIVATED"){
            console.log("BILLING.SUBSCRIPTION.ACTIVATED");
            const email = req.body.resource.subscriber.email_address;

            const dataSuscripcion = {
                email: email,
                suscriptionId : req.body.id,
                event_type : req.body.event_type,
                shipping_amount: {
                    currency_code : req.body.shipping_amount.currency_code,
                    value : req.body.shipping_amount.value,
                },
                
            }

        }
        console.log("req.body");
        console.log(req.body);
        return res.json({
            resultado: 'ok'
        })
    } catch (err) {
        return errorMiddleware(err, req, res, next);
    } finally { }
}


const getTokenPaypal = async () => {

    let data = qs.stringify({
        'grant_type': 'client_credentials'
    });

    var basicAuth = 'Basic ' + btoa(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': basicAuth
        },
        data: data
    };
    const response = await axios.post(process.env.PAYPAL_URL + '/v1/oauth2/token', data, config);

    console.log("response access_token");
    console.log(response.data.access_token);

    return response.data.access_token
}

exports.getSuscripcion = async (req, res, next) => {

    try {

        const accessToken = await getTokenPaypal();

        let config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            } 
        };

        console.log("req.params.suscriptionId")
        console.log(req.params.suscriptionId)

        const responseGet = await axios.get( process.env.PAYPAL_URL + '/v1/billing/subscriptions/'  + req.params.suscriptionId, config);
        console.log("responseGet")
        return res.json(responseGet.data);

    } catch (err) {
        console.log("err.data.details");
        console.log(err);
        if (err.response) {
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
          } else if (err.request) {
            console.log(err.request);
          } else {
            console.log('Error', err.message);
          }

        return errorMiddleware(err, req, res, next);
    } finally { }
}



// export const createOrder = async (req, res) => {
//     try {
//         const order = {
//             intent: "CAPTURE",
//             purchase_units: [
//                 {
//                     amount: {
//                         currency_code: "USD",
//                         value: "105.70",
//                     },
//                 },
//             ],
//             application_context: {
//                 brand_name: "mycompany.com",
//                 landing_page: "NO_PREFERENCE",
//                 user_action: "PAY_NOW",
//                 return_url: `${HOST}/capture-order`,
//                 cancel_url: `${HOST}/cancel-payment`,
//             },
//         };

//         // format the body
//         const params = new URLSearchParams();
//         params.append("grant_type", "client_credentials");

//         // Generate an access token
//         const {
//             data: { access_token },
//         } = await axios.post(
//             "https://api-m.sandbox.paypal.com/v1/oauth2/token",
//             params,
//             {
//                 headers: {
//                     "Content-Type": "application/x-www-form-urlencoded",
//                 },
//                 auth: {
//                     username: PAYPAL_API_CLIENT,
//                     password: PAYPAL_API_SECRET,
//                 },
//             }
//         );

//         console.log(access_token);

//         // make a request
//         const response = await axios.post(
//             `${PAYPAL_API}/v2/checkout/orders`,
//             order,
//             {
//                 headers: {
//                     Authorization: `Bearer ${access_token}`,
//                 },
//             }
//         );

//         console.log(response.data);

//         return res.json(response.data);
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json("Something goes wrong");
//     }
// };

// export const captureOrder = async (req, res) => {
//     const { token } = req.query;

//     try {
//         const response = await axios.post(
//             `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
//             {},
//             {
//                 auth: {
//                     username: PAYPAL_API_CLIENT,
//                     password: PAYPAL_API_SECRET,
//                 },
//             }
//         );

//         console.log(response.data);

//         res.redirect("/payed.html");
//     } catch (error) {
//         console.log(error.message);
//         return res.status(500).json({ message: "Internal Server error" });
//     }
// };