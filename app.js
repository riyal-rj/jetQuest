//import mdoules 
const path=require('path');
const express=require('express');
const morgan=require('morgan');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const cookieParser=require('cookie-parser');

const AppError=require('./utils/appError.js');
const globalErrorHandler=require('./controllers/errorController.js');

const tourRouter=require('./routes/tourRoutes.js');
const userRouter=require('./routes/userRoute.js');
const reviewRouter=require('./routes/reviewRoute.js');
const viewRouter=require('./routes/viewRoute.js');




const app=express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
//Middlewares: 

console.log(process.env.NODE_ENV);
//Global Middlewares

//middleware for security purpose http headers
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );


//middleware to perform http parameter pollution
app.use(hpp({
    whitelist:[
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// Using third party middleware for development logging
if(process.env.NODE_ENV==='development')
    app.use(morgan('dev'))

//Implementing rate limiting for a particular API
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too many requests from this IP, Please try again in an hour !'
})

app.use('/api',limiter);

//Middleware for body parser --> reading data from body (req.body)
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(cookieParser());

//Data Santization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//midileware to access the static files like css or html
app.use(express.static(path.join(__dirname,'public')));

//custom middleware 2
app.use((req,res,next)=>
    {
        req.requestedAt=new Date().toISOString();
        next();
    });

//Routes

app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);

//Handling code for the unknown URLs
app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server !!`,404));
});

//Handling the errors using the global middleware
app.use(globalErrorHandler);

module.exports=app;