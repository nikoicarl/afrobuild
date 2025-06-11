require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');


// Model & Route Imports
const DatabaseModel = require('./backend/models/DatabaseModel');
const homeRouter = require('./backend/routers/homeRouter');
const dashboardRouter = require('./backend/routers/dashboardRouter');

// Controller Imports
const setupController = require('./backend/controllers/setupController');
const loginController = require('./backend/controllers/loginController');
const logoutController = require('./backend/controllers/logoutController');
const userController = require('./backend/controllers/userController');
const tableFetchController = require('./backend/controllers/tableFetchController');
const specificFetchController = require('./backend/controllers/specificFetchController');
const deactivateController = require('./backend/controllers/deactivateController');
const roleController = require('./backend/controllers/roleController');
const categoryController = require('./backend/controllers/categoryController');
const productController = require('./backend/controllers/productController');
const serviceController = require('./backend/controllers/serviceController');
const vendorController = require('./backend/controllers/vendorController');
const merchantController = require('./backend/controllers/merchantController');
const FileUploadHandler = require('./backend/controllers/FileUploadHandler');
const PrivilegeController = require('./backend/controllers/privilegeController');
const DropdownController = require('./backend/controllers/dropdownController');
const dashboardFetchController = require('./backend/controllers/dashboardFetchController');
const reportController = require('./backend/controllers/reportController');


// Initialize the server
async function startServer() {
    try {
        const app = express();
        const server = http.createServer(app); // Use HTTP server for socket.io
        const io = socketIo(server);

        // Set EJS as template engine
        app.set('view engine', 'ejs');

        // Middleware
        app.use(express.static(path.join(__dirname, 'stuff')));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Initialize database
        const Database = new DatabaseModel();
        await Database.createConnection();

        // Register routers with database dependency
        homeRouter(app, Database);
        dashboardRouter(app, Database);

        // Socket.IO connection handling
        io.on('connection', (socket) => {
            console.log('A user connected');

            try {
                setupController(socket, Database);
                loginController(socket, Database);
                logoutController(socket, Database, io);
                userController(socket, Database);
                tableFetchController(socket, Database);
                specificFetchController(socket, Database);
                deactivateController(socket, Database);
                roleController(socket, Database);
                productController(socket, Database);
                serviceController(socket, Database);
                FileUploadHandler(socket);
                vendorController(socket, Database);
                merchantController(socket, Database);
                categoryController(socket, Database);
                PrivilegeController(socket, Database);
                DropdownController(socket, Database);
                dashboardFetchController(socket, Database);
                reportController(socket, Database);
            } catch (err) {
                console.error('Error in socket controller:', err);
            }

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });

        // Start server
        const PORT = process.env.PORT || 6080;
        const ENV = process.env.NODE_ENV || 'development';

        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });

    } catch (err) {
        console.error('Server initialization error:', err);
        process.exit(1);
    }
}

startServer();
