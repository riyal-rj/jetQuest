const AppError = require('../utils/appError');
const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const jwt=require('jsonwebtoken');
const {promisify}=require('util');
const Email=require('./../utils/email');
const crypto=require('crypto');  


const generateToken= id =>{
    return  jwt.sign({ id},
    process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRES_IN})};

    const createSendToken=(user,statusCode,res)=>{
        const token=generateToken(user._id);
        const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
          };
          if (process.env.NODE_ENV === 'production') 
            cookieOptions.secure = true;
        
          res.cookie('jwt', token, cookieOptions);
        
          // Remove password from output
          user.password = undefined;
        
          res.status(statusCode).json({
            status: 'success',
            token,
            data: {
              user
            }
          });       
        
    };

exports.signUp=catchAsync(async (req,res,next)=>{
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        passwordChangedAt:req.body.passwordChangedAt ,
        role:req.body.role,
        // resetPassword:req.body.resetPassword,
        // passwordResetToken:req.body.passwordResetToken,
        // passwordResetExpires:req.body.passwordResetExpires
    });
    const url= `${req.protocol}://${req.get('host')}/myProfile`;
    new Email(newUser,url).sendWelcome();
    createSendToken(newUser,201,res);
});

exports.login=catchAsync(async (req,res,next)=>{
    const {email,password}=req.body;

    //Check whether the email or password exists or not
    if(!email || !password)
        return next(new AppError('Please enter your email and password',400));

    //Check if user exists or the password is correct or not
    const user=await User.findOne({email}).select('+password');
    if(!user || !(await user.comparePassword(password,user.password)))
        return next(new AppError('Incorrect email or pasword',401));
    
    //If everything is ok send the token to the client
    createSendToken(user,200,res);
});

exports.logOut=(req,res)=>{
    res.cookie('jwt','loggedout',{
        expires:new Date(Date.now()+10*1000),
        httpOnly:true
    });
    res.status(200).json({
        status:'success'
    })
};

exports.protect=catchAsync(async (req,res,next)=>{
    //Getting the token whether if it exists.
    let authToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
       {
        authToken=req.headers.authorization.split(' ')[1];
       } 
       else if(req.cookies.jwt)
       {
        authToken=req.cookies.jwt;
       }
       if(!authToken){
        return next(new AppError('You are not logged in. Please login to get access',401));
       }
    //Verify the token
       const decoded=await promisify(jwt.verify)(authToken,process.env.JWT_SECRET);
    //Check if the user exists or not
       const currUser=await User.findById(decoded.id);
       if(!currUser)
        return next(new AppError('The user belonging to this token does not exists.',401));
    //Check if the user changed password after the token was issued
    if(currUser.changedPasswordAfter(decoded.iat))
        return next(new AppError('User recently changed password! Please login again',401));
    //Grasnt access to the protected route
    req.user=currUser;
    res.locals.user=currUser;
    next();
});

//restriction of delete tour operation ----> only can be done by admin and user
exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        //roles--> admin , lead-guide
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have the permission to perform the action',403));
        };
        next();
    };
}


exports.forgotPassword=catchAsync(async (req,res,next)=>{
    //Get user nased on email
    const user=await User.findOne({email:req.body.email})
    if(!user)
        return next(new AppError('There is no user with the entered email id',404));
    //Generate the test token
    const resetToken=user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    //Send it to the user's email
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    //const message=`Hi ${user.name} \n Click this link to reset your password \n ${resetURL}. \n The link will expire after 10 miniutes \n This message is sent from a computer system; please do not reply to this email..`;
    try{
        // await sendEmail({
        //     email:user.email,
        //     subject:'Reset your password for your candidate account',
        //     message
        // });

        new Email(user,resetURL).sendPasswordReset();
        res.status(200).json({
            status:'Success',
            message:'Password reset token sent to email id'
        });
    }
    catch(err)
    {
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false});
        return next(new AppError('There was an error sending an email. Try again later!',500));
    }
    
});

exports.resetPassword= catchAsync(async (req,res,next)=>{
    //Get user based on the token
    const hashedToken=crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user=await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt :Date.now()},
    });
    //If the token has not expired and there is a user,set the new pasword
    if(!user)
        return next(new AppError('Token is invalid or has expired',400));

    user.password=req.body.password;
    user.confirmPassword=req.body.confirmPassword;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save(user._id);
    
    //Update changedPasswordAt property for the current user

    //Log the user in, send the JWT
    createSendToken(user,200,res);
});


exports.updatePassword=catchAsync(async (req,res,next)=>{
    //Get the user from collection
    const user= await User.findById(req.user.id).select('+password');
    //Check if the POST ed current passowrd is correct or not
    if(! ( await user.comparePassword(req.body.passwordCurrent,user.password)))
        return next(new AppError('Your passowrd is wrong.',401));
    //If so, update the password
    user.password=req.body.password;
    user.confirmPassword=req.body.confirmPassword;
    await user.save();
    //Log in user, send JWT
    createSendToken(user,200,res);
});


exports.isLoggedIn=async (req,res,next)=>{
    //Getting the token whether if it exists.
    if (req.cookies.jwt) {
        try {
          // 1) verify token
          const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            process.env.JWT_SECRET
          );
    
          // 2) Check if user still exists
          const currentUser = await User.findById(decoded.id);
          if (!currentUser) {
            return next();
          }
    
          // 3) Check if user changed password after the token was issued
          if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
          }
    
          // THERE IS A LOGGED IN USER
          res.locals.user = currentUser;
          return next();
        } catch (err) {
          return next();
        }
      }
      next();
};