const dotenv=require('dotenv');
const mongoose=require('mongoose');
const fs=require('fs');

const Tour=require('./../models/tourModel');
const Review=require('./../models/reviewsModel');
const User=require('./../models/userModel');

dotenv.config({path:'./../config.env'});
// console.log(process.env);


const db=process.env.DATABASE_ATLAS.replace('<DB_PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(db,
    {
    }
).then(con=>
{
    console.log('Remote mongoDB altas database connection done successfully...... ');
})


const tours=JSON.parse(fs.readFileSync('./tours.json','utf-8'));
const users=JSON.parse(fs.readFileSync('./users.json','utf-8'));
const reviews=JSON.parse(fs.readFileSync('./reviews.json','utf-8'));
const importData=async ()=>
{
    try {
        await Tour.create(tours);
        await Review.create(reviews);
        await User.create(users);
        console.log('Importing of Data is succesfull');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData=async ()=>
    {
        try {
            await Tour.deleteMany();
            await Review.deleteMany();
            await User.deleteMany();
            console.log('Deletion of Data is succesfull');
        } catch (err) {
            console.log(err);
        }
        process.exit();
    };

if(process.argv[2]==='--import')
    importData();
else if(process.argv[2]==='--delete')
    deleteData();
console.log(process.argv);

