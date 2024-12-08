const dotenv=require('dotenv');
const mongoose=require('mongoose');

process.on('uncaughtException',err=>
    {
        console.log(err.name,err.message);
        console.log('Uncaught Exception!! Shutting Down...');
        process.exit(1);
    });

dotenv.config({path:'./config.env'});
// console.log(process.env);

const app=require('./app')


const db=process.env.DATABASE_ATLAS.replace(
    '<DB_PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(db,
    {
        
    }
).then(con=>
{
    console.log('Remote mongoDB altas database connection done successfully...... ');
})



//Start the Server
const portNo=process.env.PORT;
const server=app.listen(portNo,()=>
{
    console.log(`App running on port ${portNo}`);
});


process.on('unhandledRejection',err=>
{
    console.log(err.name,err.message);
    console.log('Unhandled Rejection!! Shutting Down...');
    server.close(()=>{
        process.exit();
    });
});



//console.log(x);