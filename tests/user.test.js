const request = require('supertest');
const app = require('../src/app');
const User = require('../src/db/models/user');
const { userOne,userOneId,setupDatabase,closeDatabase } = require('./fixtures/db');


beforeEach(setupDatabase);

afterAll(closeDatabase);

test('Should Signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Shivansh',
        email: 'shivansh@gmail.com',
        password: 'Wellthisismypass'
    }).expect(201)

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    expect(response.body).toMatchObject({
        user:{
            name: "Shivansh",
            email: "shivansh@gmail.com"
        },
        token: user.tokens[0].token
    });

    expect(user.password).not.toBe('Wellthisismypass');
});

test('Should login an existing user',async ()=>{
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token);
})

test('Should not login nonexistent user', async ()=>{
    await request(app).post('/users/login').send({
        email: 'wrongemail.com',
        password: 'whatever@whatever'
    }).expect(400)
});

test('Should get profile for user',async ()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not get profile for unauthenticated users', async ()=>{
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
})

test('Should delete account for user', async ()=>{
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete account for unauthenticated user', async()=>{
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

        const user = await User.findById(userOneId);
        expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Andrew'
        })
        .expect(200)

    const user =  await User.findById(userOneId);
    expect(user.name).toBe('Andrew');
})

test('Should not update invalid user fields', async () => {
    await request(app)
            .patch('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                location: 'Ahmedabad'
            })
            .expect(400)
})