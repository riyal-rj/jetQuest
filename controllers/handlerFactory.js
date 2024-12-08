const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
const APIFeatures=require('./../utils/apiFeatures');

exports.deleteOne=Model=>catchAsync(async (req,res,next)=>{
    const document=await Model.findByIdAndDelete(req.params.id);
    if(!document)
        return next(new AppError('Invalid id! No document found with that ID',404));
    res.status(204).json(
        {
            status:'success',
            data:null
        });
});


exports.updateOne=Model=>catchAsync(async (req,res,next)=>{
    const updatedDoc=await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,//-----> return the modified document rather than the original
        runValidators:true//----> runs update validators and check that 
                        //        whether it is against model schema or not
    });
    if(!updatedDoc)
        return next(new AppError('Invalid id! No document found with that ID',404));
    res.status(200).json(
    {
        status:'success',
        data:
        {
            data:updatedDoc
        }
    });    
})

exports.createOne=Model=>catchAsync(async (req,res,next)=>{
    const newDoc=await Model.create(req.body);
    res.status(201).json(
        {
            status:'success',
            data:{
                    data:newDoc
                 }
        });
});

exports.getOne=(Model,populateOptions)=>catchAsync(async (req,res,next)=>{  
    let query=Model.findById(req.params.id);
    if(populateOptions)
        query=query.populate(populateOptions); 
    const aDoc=await query;
    //Tour.findOne({_id:req.params.id})  ---> mongoDb equivalent
    if(!aDoc)
        return next(new AppError('Invalid id!',404));
    res.status(200).json(
        {
            status:'Success',
            data:{
            aDoc
            }
        });
});

exports.getAll=Model=>catchAsync(async (req,res,next)=>
    {
        let filter={};
        if(req.params.tourId)
        filter={tour:req.params.tourId};
        const features=new APIFeatures(Model.find(filter),req.query)
        .filter()
        .sort()
        .projectionofFields()
        .pageinate();
        //Execute the Query ie query
        const allDocs=await features.query;

        res.status(200).json(
            {
                status:'Success',
                results:allDocs.length,
                data:{
                    allDocs
                }
            });
                
    }
);


