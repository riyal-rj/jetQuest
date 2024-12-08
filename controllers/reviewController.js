const Review=require('./../models/reviewsModel');
const catchAsync=require('./../utils/catchAsync');
const factory=require('./handlerFactory.js');



exports.setTourUserIds=(req,res,next)=>{
    if(!req.body.tour)
        req.body.tour=req.params.tourId;
    if(!req.body.user)
        req.body.user=req.user.id;
    next();
}

exports.getAReview=factory.getOne(Review);

exports.createAReview=factory.createOne(Review);

exports.deleteReview=factory.deleteOne(Review);

exports.updateReview=factory.updateOne(Review);

exports.getAllReviews=factory.getAll(Review);