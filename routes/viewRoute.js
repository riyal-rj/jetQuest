const express=require('express');

const authController=require('./../controllers/authController');
const viewsController=require('./../controllers/viewsController');


const router=express.Router();



router.get('/',authController.isLoggedIn,viewsController.getOverview);

router.get('/tour/:slug',authController.isLoggedIn,viewsController.getTour);

router.get('/login',authController.isLoggedIn,viewsController.LoginForm);

router.get('/myProfile',authController.protect,viewsController.getMyProfile);

router.post('/submit-user-data',
    authController.protect,
    viewsController.updateUserData);

module.exports=router;