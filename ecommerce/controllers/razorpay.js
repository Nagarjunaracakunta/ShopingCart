const User = require('../models/user')
require('dotenv').config()

exports.paymentMethod = (req,res) => {
   
    if (err) {
        return res.status(400).json({
            error: errorHandler(err)
        });
    }
    res.json({
        message: ' payment successfully'
    });
}

