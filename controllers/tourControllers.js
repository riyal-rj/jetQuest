const multer=require('multer');
const sharp=require('sharp');

const Tour=require('./../models/tourModel');
const APIFeatures=require('./../utils/apiFeatures');
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError.js');
const factory=require('./handlerFactory.js');
const Review = require('../models/reviewsModel.js');


exports.aliasTopTours=(req,res,next)=>
{
    req.query.limit=5;
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty,duration';
    next();
}


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

exports.uploadTourImages=upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
])

exports.resizeTourImages=async (req,res,next)=>{

    if(!req.files.imageCover || !req.files.images)
        return next();

    req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
    sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tourImages/${req.body.imageCover}`);

    req.body.images=[];
    await Promise.all(
        req.files.images.map(async (file,id) => {
        const filename=`tour-${req.params.id}-${Date.now()}-${id+1}.jpeg`;
        await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tourImages/${filename}`);

        req.body.images.push(filename);
    }));

    next();
}

//Router handlers for tours
exports.getAllTours=factory.getAll(Tour);

exports.getATour= factory.getOne(Tour,{path:'reviews'});

exports.createATour=factory.createOne(Tour);

exports.updateATour=factory.updateOne(Tour);

exports.deleteATour=factory.deleteOne(Tour);

exports.getTourStats=catchAsync(async (req,res,next)=>
{
        const stats=await Tour.aggregate(
           [
            {
                $match:{ ratingsAverage : { $gte: 4.5 }}
            },
            {
                $group:
                {
                    _id:{$toUpper:'$difficulty'},
                    numOFTours:{$sum:1},
                    numOfRatings:{$sum:'$ratingsQuantity'},
                    avgRating :{$avg: '$ratingsAverage'},
                    avgPrice  :{$avg: '$price'},
                    minPrice  :{$min: '$price'},
                    maxPrice  :{$max: '$price'},
                }
            },
            {
                $sort: {avgPrice:1}
            }
           ]);
           res.status(200).json(
            {
                status:'success',
                data:
                {
                    TourStatistics:stats
                }
            });
});

exports.getMonthlyPlan=catchAsync(async (req,res,next)=>
{
        const year=req.params.year *1;
        const plan=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numOfTourStarts:{$sum:1},
                    // tours:{$push:'$name'}
                    tours:{$addToSet:'$name'}// it leads to unique names 
                }
            },
            {
                $addFields :{month:'$_id'}
            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort:{numOfTourStarts:-1}
            }
        ]);
        res.status(200).json({
            status:'Success',
            data:
            {
                Plan:plan
            }
        });
});

///tours-within/:distance/center/:latlong/unit/:unit
exports.getToursWithin=catchAsync(async (req,res,next)=>{
    const {distance,latlong,unit}=req.params;
    const [latitude,longitude]=latlong.split(',');
    const radius=unit==='mi'?distance/3963:distance/6378;
    if(!latitude | !longitude)
    {
        next(new AppError('Please provide latitude and longitude in the format lat,long.',400));
    }
    console.log(distance,latitude,longitude,unit,radius);
    const tours=await Tour.find({
        startLocation:{$geoWithin:{$centerSphere:[[longitude,latitude],radius]}}
    });
    res.status(200).json({
        status:'success',
        results:tours.length,
        data:{
            data:tours
        }
    });
});

exports.getAllDistances=catchAsync(async (req,res,next)=>{
    const {latlong,unit}=req.params;
    const [latitude,longitude]=latlong.split(',');
    const multiplier=unit==='mi'?0.0006:0.001;
    if(!latitude | !longitude)
    {
        next(new AppError('Please provide latitude and longitude in the format lat,long.',400));
    }
    const distanceStats=await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[longitude*1,latitude*1]
                },
                distanceField:'distance',
                distanceMultiplier:multiplier
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ]);
    res.status(200).json({
        status:'success',
        data:{
            data:distanceStats
        }
    });
});