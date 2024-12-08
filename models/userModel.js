const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');//required for hashing the passowrd
const catchAsync = require('../utils/catchAsync');
const crypto=require('crypto');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name..'],
        trim:true,
        maxlength:[200,'Please provide the name withing 200 characters'],
        minlength:[5,'Please provide  a name of atleast 5 characters']
    },
    email:{
        type:String,
        unique:true,
        required:[true,'Please enter your email id'],
        lowercase:true,
        validate:[validator.isEmail,'Please enter a valid email id']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true, 'Please enter password'],
        minlength:[8,'Password must have atleast 8 characters'],
        select:false,
        validate: {
            validator: function (value) {
                return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one number, and one special character',
        }
    },
    confirmPassword:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            //this only works for save and create only but not for update
            validator: function(el){
                return el===this.password;
            },
            message:'Passwords do NOT match!!'
        }
    },
    passwordChangedAt:{
        type:Date
    },
    passwordResetToken:{
        type:String
    },
    passwordResetExpires:{
        type:Date
    },
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    //hash the password
    this.password=await bcrypt.hash(this.password,10);
    //coz we are not required to save the confirmed in the database
    this.confirmPassword=undefined;
    next();
});

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew)
        return next();

    this.passwordChangedAt=Date.now()-1000;
    next();
});

userSchema.pre(/^find/,function(next){
    //it is a query middleware -> therefore this points to the current query
    this.find({active:{$ne:false}});
    next();
});

userSchema.methods.comparePassword=async function(candidatePassword,userPassword)
{
    return await bcrypt.compare(candidatePassword,userPassword);
};

userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
    if(this.passwordChangedAt)
    {
        const changedTimeStamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTimestamp<changedTimeStamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.
    randomBytes(32).
    toString('hex');
    this.passwordResetToken=crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.passwordResetExpires=Date.now()+10*60*1000;//2 mins buffer time to reset password

    return resetToken;
}
const User=mongoose.model('User',userSchema);

module.exports=User;