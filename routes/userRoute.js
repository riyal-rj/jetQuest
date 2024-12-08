const express=require('express');
const multer=require('multer');


const userController=require('./../controllers/userControllers');
const authController=require('./../controllers/authController');

//Router for users
const router=express.Router();


//For all these operations bellow user did not need to be logged in
router
        .post('/signup',authController.signUp);
router
        .post('/login',authController.login);
router
        .get('/logout',authController.logOut);

router
        .post('/forgotPassword',authController.forgotPassword);
router
        .patch('/resetPassword/:token',authController.resetPassword);

//For all these uperations bellow user need to be logged in.
router.use(authController.protect);

router
        .patch('/updateMyPassword',authController.updatePassword);
router
        .delete('/deleteMyProfile',userController.deleteMyProfile);

router
        .patch('/updateMyProfile'
                ,userController.uploadUserPhoto,
                userController.resizeUserPhoto,
                userController.updateMyProfile);
router
     .get('/myProfile',
      userController.getMyProfile,
      userController.getUser);   

//Routes for admin and not for normal user. Normal user cannot access these operations even being logged in.
router.use(authController.restrictTo('admin'));
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);


router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);


module.exports=router;