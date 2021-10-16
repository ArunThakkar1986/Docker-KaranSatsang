
const request = require('supertest')
const { app, sequelize } = require('./app')

// test('test', () => {
//     expect(1).toBe(1);
// })

describe('GET /new-releases', () => {
    beforeAll(() => {
         sequelize.authenticate();
         sequelize.sync({ alter: true });
    })

    it('responds with json with key', (done) => {
        request(app)
        .get('/new-releases?key=12345')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(200, done)
    });
})