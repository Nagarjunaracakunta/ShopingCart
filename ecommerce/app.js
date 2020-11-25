const express = require("express");
// import mongoose
const mongoose = require('mongoose');
const morgan = require("morgan");
const bodyParser = require('body-parser')
const app = express();
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator')
const cors = require('cors');
require("dotenv").config();

// import routes

const authRoutes = require('./routes/auth');

const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');

const razorpayRoutes = require('./routes/razorpay');
//db connection
mongoose.connect(
  process.env.MONGO_URI,
  {useNewUrlParser: true}
)
.then(() => console.log('DB Connected'))
 
mongoose.connection.on('error', err => {
  console.log(`DB connection error: ${err.message}`)
});
//middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
//routes middileware
app.use("/api",authRoutes);
app.use("/api",userRoutes);
app.use("/api",categoryRoutes);
app.use("/api",productRoutes);
app.use("/api",razorpayRoutes);

const port = process.env.PORT || 8000;

app.listen(port,() => {
    console.log(`Server is running on port ${port}`);
});