const AppError = require('../utils/appError');
const User=require('./../models/userModel');

const catchAsync=require('./../utils/catchAsync');
const factory=require('./handlerFactory');

const multer=require('multer');
const sharp=require('sharp');

// const multerStorage=multer.diskStorage(
//     {
//         destination:(req,file,cb)=>{
//             cb(null,'public/img/users');
//         },
//         filename:(req,file,cb)=>{
//             const extension=file.mimetype.split('/')[1];
//             cb(null,`user-${req.user.id}-${Date.now()}.${extension}`);
//         }
//     }
// );
const multerStorage=multer.memoryStorage();

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image'))
        cb(null,true);
    else
        cb(new AppError('Not an image! Please upload an image',400),false)
};

const upload=multer({
   storage:multerStorage,
   fileFilter:multerFilter
});

exports.uploadUserPhoto=upload.single('photo');


exports.resizeUserPhoto=(req,res,next)=>{
    if(!req.file)
        return next();

    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`

    sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${req.file.filename}`);

    next();
}

const filterObj=(Obj, ...allowedFields)=>{
    const newObj={};
    Object.keys(Obj).forEach(el=>{
        if(allowedFields.includes(el))
            newObj[el]=Obj[el];
    });
    return newObj;
};

//Route Handlers for users
exports.getAllUsers=factory.getAll(User);

exports.updateMyProfile=async (req,res,next)=>{
    //Generate error if the user tried to  POST
    console.log(req.body);
    console.log(req.file);
    if(req.body.password || req.body.confirmPassword)
        return next(new AppError('This route is not for updating the password',400));
    //filtered out the unwanted field names
    const filteredBody=filterObj(req.body,'name','email');
    if(req.file)
        filteredBody.photo=req.file.filename;
    // Update the user document
    const updatedUser= await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        status:'Success',
        data:{
            user:updatedUser
        }
    });
};

exports.deleteMyProfile=catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});

    res.status(204).json({
        status:'Success',
        data:null
    });
});


exports.createUser=(req,res)=>
    {
        res.status(500).json(
            {
                status:'error',
                message:'This route still not defined. Please use sign-up instead.'
            });
}; 

exports.getMyProfile=(req,res,next)=>{
    req.body.id=req.user.id;
    next();
};

         
exports.getUser=factory.getOne(User); 

//for admin explicitly
exports.updateUser=factory.updateOne(User); 

exports.deleteUser=factory.deleteOne(User);
