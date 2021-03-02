require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });


    const todo = {
      'todo': 'code',
      'completed': false,
    };

    const dbTodo = {
      ...todo,
      owner_id: 2,
      id: 4,
    };

    test('create todo', async() => {

      const todo = {
        'todo': 'code',
        'completed': false,
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(todo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([dbTodo]);
    });

    test('return all todos from a given user', async() => {
     

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([dbTodo]);
    });

    test('updates completed on a specified todo', async() => {
      
      const todo = {
        'completed': true
      };
      const putTodo = {
        'todo': 'code',
        ...todo,
        owner_id: 2,
        id: 4,

      };
      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .send(todo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([putTodo]);
    });
  });
});
