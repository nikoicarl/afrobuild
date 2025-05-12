const express = require('express');
const socketIo = require('socket.io');
const path = require('path');

// Model & Route Imports
const DatabaseModel = require('./backend/model/models/DatabaseModel');
const homeRouter = require('./backend/routes/homeRouter');
const dashboardRouter = require('./backend/routes/dashboardRouter');
const setupController = require('./backend/controllers/setupController');

async function startServer() {
    try {
        const app = express();

        // Set EJS as template engine
        app.set('view engine', 'ejs');

        // Set static folder
        app.use(express.static(path.join(__dirname, 'stuff')));

        // Optional: Use body parsers if needed
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Initialize database
        const Database = new DatabaseModel();
        await Database.createConnection();
        // Register routers
        homeRouter(app, Database);
        dashboardRouter(app, Database);

        // Create server and attach socket.io
        const server = app.listen(6030, () => {
            console.log('Server is listening on port 6030');
        });

        const io = socketIo(server);

        io.on('connection', (socket) => {
            console.log('A user connected');

            try {
                
            } catch (err) {
                console.error('Socket handler error:', err);
            }

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });

    } catch (err) {
        console.error('Server initialization error:', err);
    }
}

// Start the server
startServer();
