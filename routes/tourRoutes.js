const express=require('express')

const tourController=require('./../controllers/tourControllers');
const authController=require('./../controllers/authController');

const reviewRouter=require('./../routes/reviewRoute');

const router=express.Router()
//param middleware
// router.param('id',tourController.checkID)

router
        .route('/top-5-Tours')
        .get(tourController.aliasTopTours,tourController.getAllTours);

router
        .route('/tour-Stats')
        .get(tourController.getTourStats);

router.
        route('/Monthly-Plan/:year')
        .get(
        authController.protect,
        authController.restrictTo('admin','lead-guide','guide'),
        tourController.getMonthlyPlan
        );

router
        .route('/')
        .get(authController.protect,tourController.getAllTours)
        .post(authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.createATour);

// app.use(myMiddleware) ---> cant access the middleware since the responce ends due to the route middleware


//Routes for Geosptial Query
router
      .route('/tours-within/:distance/center/:latlong/unit/:unit')
      .get(tourController.getToursWithin);
router
      .route('/distancesOfTours/:latlong/unit/:unit')
      .get(tourController.getAllDistances);
router
        .route('/:id')
        .get(tourController.getATour)
        .patch(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateATour
        )
        .delete(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.deleteATour
        );


// POST /tour/tourId/reviews --->create review
// GET /tour/tourId/reviews ---> get all reviews
// GET /tour/tourId/reviews/reviewId ---> get the specified review 

router
        .use('/:tourId/reviews',reviewRouter);
        
                       

module.exports=router;