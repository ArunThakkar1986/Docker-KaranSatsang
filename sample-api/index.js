const { app, sequelize } = require ('./app')

app.listen({port:8080}, () => {
    try{
        sequelize.authenticate();
        sequelize.sync({ alter:true});
        console.log("connected to the database")
    } catch (error) {
        console.log('Failed to connect to the database');
    }
    console.log('Server started')
})