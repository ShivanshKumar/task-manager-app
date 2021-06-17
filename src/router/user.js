const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../db/models/user');
const router = new express.Router();
const auth = require('../middlewares/auth');
const {sendWelcomeEmail, sendDeleteEmail} = require('../emails/account');

router.post('/users', async (req,res)=>{
    const user = new User(req.body);

    try{
        const token = await user.generateAuthTokens();
        await user.save();
        await sendWelcomeEmail(user.email, user.name);
        res.status(201).send({user,token});
    }catch(error){
        res.status(400).send(error);
    }
})

router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthTokens();
        res.send({user,token});
    }catch(error){
        res.status(400).send(error);
    }
})

router.post('/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        })

        await req.user.save();

        res.send();
    }catch(error){
        res.status(500).send()
    }
})

router.post('/users/logout-all', auth, async (req,res)=>{
    try{
        req.user.tokens = [];

        await req.user.save();

        res.send();
    }catch(error){
        res.status(500).send();
    }
})

router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user);
})


router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'age', 'password'];
    const isValidOperations = updates.every(update=>allowedUpdates.includes(update));

    if(!isValidOperations){
        return res.status(400).send({ error: "Invalid Update Operation"});
    }

    try{
        updates.forEach(update=>{req.user[update] = req.body[update]});
        await req.user.save();
        res.send(req.user);
    }catch(error){
        res.status(400).send(error);
    }
})

router.delete('/users/me', auth, async (req,res)=>{
    try{
        await req.user.remove();
        await sendDeleteEmail(req.user.email, req.user.name);
        res.send(req.user);
    }catch(error){
        res.status(500).send();
    }
});

const upload = multer({
    limits:{
        fileSize: 10**6
    },
    fileFilter(req,file,cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload an image file of type jpeg,jpg or png only"));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({ width:250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
},(error,req,res,next)=>{
    res.status(400).send({error:error.message});
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    }catch(error){
        res.status(500).send();
    }
})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error();
        }

        res.set('Content-Type','image/png');
        res.send(user.avatar);
    }catch(error){
        res.status(404).send()
    }
})

module.exports = router;