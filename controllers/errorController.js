const AppError=require('./../utils/appError');

const handleCastError=err=>
{
    const message=`Invalid ${err.path} :${err.value}.`;
    return new AppError(message,400);
};

const handleDuplicateError=err=>
{
    const val=err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message=`Duplicate field value: ${val} .Please use another value.`;
    return new AppError(message,400);
};

const handleValidationError=err=>
{
    const errors=Object.values(err.errors).map(el=>el.message);
    const message=`Invalid input data. ${errors.join('. ')}`;
    return new AppError(message,400);
}

const handleJWTError=()=>new AppError('Invalid Token. Please login again',401);

const handleTokenExpiredError=()=>new AppError('Your Token has expirerd. Please trye again.. ',401);
const errforDev=(err,req,res)=>
{
    if(req.originalUrl.startsWith('/api'))
   { 
    return res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack
    });
    }
        console.error('Error :( ',err);
        return res.status(err.statusCode).render('error',{
        title:'Something went wrong!',
        msg:err.message
        });
};
const errforProd=(err,req,res)=>
{
    if(req.originalUrl.startsWith('/api'))
    {
        if(err.isOperational)
        {
            return res.status(err.statusCode).json({
                status:err.status,
                message:err.message
            });
        }
            console.error('Error :(')
            return res.status(500).json({
                status:'error',
                message:'Something went wrong!'
            });
    }
        if(err.isOperational)
        {
            return res.status(err.statusCode).render('error',{
                title:'Something went wrong',
                msg:err.message
            });
        }
          console.error('Error :(')
            return res.status(err.statusCode).render('error',{
                title:'Something went wrong',
                msg:'Please try again later'
            });         
};

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status || 'error';
    err.message=err.message;
    if(process.env.NODE_ENV==='development')
    {
        errforDev(err,req,res);
    }
    else if(process.env.NODE_ENV==='production')
    {
        let error={...err};
        error.message=err.message;
        if(error.name==='CastError')
            error=handleCastError(error);
        if(error.code===11000)
            error=handleDuplicateError(error);
        if(error.name==='Validation Error')
            error=handleValidationError(error);
        if(error.name==='JsonWebTokenError')
            error=handleJWTError();
        if(error.name==='TokenExpiredError')
            error=handleTokenExpiredError();
        errforProd(error,req,res);
    }
    next();
}