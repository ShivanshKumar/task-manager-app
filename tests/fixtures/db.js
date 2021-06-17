const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const User = require('../../src/db/models/user');
const Task = require('../../src/db/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: "Alex",
    email: "alex@gmail.com",
    password: "pasrdforalex",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: "Alexa",
    email: "alexa@gmail.com",
    password: "pasrdforalexa",
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Three task',
    completed: false,
    owner: userTwo._id
}

const setupDatabase = async ()=>{
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();  
    await new Task(taskOne).save(); 
    await new Task(taskTwo).save(); 
    await new Task(taskThree).save(); 
}

const closeDatabase = async ()=>{
    await mongoose.connection.close();
}

module.exports = { 
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase,
    closeDatabase 
};
