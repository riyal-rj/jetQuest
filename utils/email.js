const nodemailer=require('nodemailer');
const pug=require('pug');
const {htmlToText}=require('html-to-text');



module.exports=class Email{
    constructor(user,url)
    {
        this.to=user.email;
        this.firstName=user.name.split(' ')[0];
        this.url=url;
        this.from=`Ritankar Jana <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production')
            return 1;

        //for developemnt ----> use nodemailer
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
            //Activate in gmail "less secure app" option
        });
    }

    async send(template,subject){
        const html=pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName:this.firstName,
            url:this.url,
            subject
        });

        const mailOptions={
            from:this.from,
            to:this.to,
            subject,
            html,
            text:htmlToText(html)
        };
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome()
    {
        await this.send('Welcome','Welcome to the jetQuest family');
    }

    async sendPasswordReset()
    {
        await this.send('passwordReset','Your password reset token valid for only 10 mins');
    }
}

const sendEmail=async options=>{
    //Create a transporter
    //Define the email options
    
    //Actually send the email
    await transporter.sendMail(mailOptions);
};
