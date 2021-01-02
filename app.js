const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const PORT = process.env.PORT || 4400;
const colors = require('colors');
const connectDb = require('./config/db');
const cors = require('cors')

//Routes files
const products = require('./routes/products');
//const auth = require('./routes/auth');
const morgan = require('morgan');
const errorHandler = require('./middlewares/error');
const fileupload = require('express-fileupload');

//Load env vars

dotenv.config({ path: './config/config.env' });
//Connect to database
connectDb();

const app = express();
app.use(cors())
//body parser
app.use(express.json());

//dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//File uploading
app.use(fileupload());
//set static folder for static files
app.use(express.static(path.join(__dirname, 'public/uploads')));
//Mount routers
app.get('/api/v1',(req,res)=>
{
res.status(200).json({message:"Server is healthy"})
});
app.use('/api/v1/products',products);
//app.use('/api/v1/auth', auth);
app.use(errorHandler);
const server = app.listen(PORT, () => {
  console.log(
    `server running in ${process.env.NODE_ENV} mode on ports ${PORT}`.blue.bold
  );
});
//handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //close server & exit
  server.close(() => process.exit(1));
});
