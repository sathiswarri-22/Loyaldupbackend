const express = require ('express');
const crypto = require ('crypto');
const nodemailer = require ('nodemailer');
const CommonTeam = require ('../Model/CommonTeam');
const router = express.Router();
const bcrypt = require('bcryptjs');

const transmailer = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.REQUESTEMAIL,
        pass:process.env.REQUESTPASSWORD
    }
});

router.post('/forgetpassword-request',async(req,res)=>{
    const {email} =req.body;
    console.log(req.body);
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try{
    const user = await CommonTeam.findOne({email});
    if(!user){
        res.status(400).json({message:'User with this email does not exist.'});
    }

    const resettoken = crypto.randomBytes(32).toString('hex');
       user.resettoken = resettoken;
       user.resettokenexpiration = Date.now() + 2000000;
       await user.save();

    const reseturl = `http://localhost:5173/passwordrest/${resettoken}`;   


    const mailInformation = {
        from:'gokulsree1618@gmail.com',
        to:email,
        subject:'Password Reset Request',
        text:`Click the link below to reset your password:\n\n${reseturl}`
    }
     try{ 
         await transmailer.sendMail(mailInformation)
           res.status(200).json({ message: 'Password reset email sent.' });

    }catch (emailErr) {
        console.error('Email sending error:', emailErr);
        return res.status(500).json({ message: 'Error sending password reset email.' });
    }
}catch(err){
    console.error('Server error:', err);
        res.status(500).json({ message: 'Server error.' });
}


});

router.put('/reset-password/:resettoken', async (req, res) => {
    const { resettoken } = req.params; 
    const { password, confirmPassword } = req.body; 

    
    if (!password || !confirmPassword) {
        return res.status(400).json({ message: 'Password and confirmation are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    try {
       
        const user = await CommonTeam.findOne({ resettoken, resettokenexpiration: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

    
        user.password = hashedPassword;
        user.resettoken = undefined;
        user.resettokenexpiration = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});
module.exports = router;