
try {
    const express = require('express')
    const start = express()
    const socketIo = require('socket.io')


    //Model Router Imports
    const DatabaseModel = require('./backend/model/models/DatabaseModel')
    const homeRouter = require('./backend/routes/homeRouter')
    const dashboardRouter = require('./backend/routes/dashboardRouter')

    //set template engine
    start.set('view engine', 'ejs')

    //set static files folder
    start.use(express.static('./stuff'))

    //use models here
    const Database = new DatabaseModel()
    Database.createConnection()
    homeRouter(start, Database)
    dashboardRouter(start, Database)


    //Create port server
    const server = start.listen(6030, function() {
        console.log('You are listening to port 6030')
    })

    const mainSocket = socketIo(server)


    mainSocket.on('connection', function(socket) {
        console.log('A user is connected')

        try {
            //Stores initialization
            

        } catch (error) {
            console.log(error)
        }

        socket.on('disconnect', function () {
            console.log('A user has disconnected')
        });
    });
} catch (error) {
    console.log(error)
}