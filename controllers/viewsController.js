const Tour=require('./../models/tourModel');
const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync')
const AppError=require('./../utils/appError');

exports.getOverview=catchAsync(async (req,res)=>{
    //Get the tour data from the collections
    const allTours=await Tour.find();
    //Build the template

    //Render the template using the data from 1
    res.status(200).render('overview',{
        title:'Where Every Yatra Becomes a Saga',
        tours:allTours
    });
});

exports.getTour=catchAsync(async (req,res)=>{
    //Get the data for the requested tour including reviews and guides
    const tour =await Tour.findOne({slug:req.params.slug}).populate(
        {path:'reviews',
        fields:'review rating user'}
    );
    if(!tour)
        return next(new AppError('The tour name doesnt exists',404))
    //Build the template
    //Render the template using the data
    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      )
      .render('tour',{
        title:`${tour.name}`,
        tour
    });
});


exports.LoginForm=(req,res)=>{
    res.status(200).render('login',{
        title: 'Log in your account'
    })
}

exports.getMyProfile=(req,res)=>{
    res.status(200).render('account',{
        title: 'Your Account'
    });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
  