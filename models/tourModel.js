const mongoose=require('mongoose');
const slugify=require('slugify');
const User=require('./userModel');

const tourSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,'A tour must have name'],//validator
            unique:true,
            trim:true,
            maxlength:[100, 'A tour must have name within 100 characters'],//validator
            minlength:[20,'A tour must have name within 20 characters']//validator
        },
        slug:{type: String},
        duration:{
            type:Number,
            required:[true,'A tour must have duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum:{
                values:['easy','medium','moderate','difficult'],
                message:'Difficulty must be within easy, medium, moderate, difficult'
        }//validator
    },
        ratingsAverage: {
            type: Number,
            default: 2.5,
            max:[5,'A tour must have maximum 5.0 as averageRatings'],//validator
            min:[1,'A tour must have minimum 1.0 as averageRatings'],//validator
            set:val=>Math.round(val*10)/10 //rounding upto 1 dp
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price:{
            type:Number,
            required:[true,'A tour must have price']
        },
        priceDiscount:{
            type:Number,
            validate:{
                validator:function(val)
                {
                    //this here refers to the current doc during new document creation
                    //the validator dont work during update
                    return val<this.price;
                },
                message:'Discount must be less than the original price'
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        startDates: [Date],
        secretTour:{
            type:Boolean,
            default:false
        },
        startLocation:{
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String
        },
        locations:[{
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }],
        guides:[
            {
                type:mongoose.Schema.ObjectId,
                ref:'User'
            }
        ]
    },

    // addons to showcase the virtual properties
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
);

//indexing for better read performance
tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
//to enable geospatial query
tourSchema.index({startLocation:'2dsphere'});

//Virtual populate
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
});

//Virtual Properties--> these properties are not actually created in the database.
tourSchema.virtual('durationWeeks').get(function()
{
    return this.duration/7;
});

//Document Mongoose Middleware --> it runs before .save() and .create() and not .update()
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true});
    next();
});



//Query Middleware
tourSchema.pre(/^find/,function(next){//all the operation that starts with find
    this.find({secretTour:{ $ne:true}});
    this.start=Date.now()
    next();
});

//middleware to embed the 'guide or lead-guide as role ' documents in the tourModel while new creation
// tourSchema.pre('save',async function(next){
//     const guidePromises=this.guides.map(async id => await User.findById(id));
//     this.guides=await Promise.all(guidePromises);
//     next();
// });

//Aggregation Middleware
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
//     console.log(this.pipeline());
//     next();
// });

//Populating the Tour Guides
tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChnangedAt'
    });
    next();
});


tourSchema.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now()-this.start} milliseconds!`);
    next();
});


const Tour=mongoose.model('Tour',tourSchema);

module.exports=Tour;