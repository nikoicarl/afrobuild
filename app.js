// ==== Log File Setup (MUST be at the very top) ====
const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function (...args) {
    originalConsoleLog.apply(console, args);
    logStream.write(`${new Date().toISOString()} LOG: ${args.join(' ')}\n`);
};

console.error = function (...args) {
    originalConsoleError.apply(console, args);
    logStream.write(`${new Date().toISOString()} ERROR: ${args.join(' ')}\n`);
};

// ==== Global Error Handling for Uncaught Exceptions and Rejections ====
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// ==== Standard Server Setup ====
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Path setup
const stuffPath = path.join(__dirname, 'stuff');

// ==== Model & Route Imports ====
const DatabaseModel = require('./backend/models/DatabaseModel');
const homeRouter = require('./backend/routers/homeRouter');
const dashboardRouter = require('./backend/routers/dashboardRouter');

// ==== Controller Imports ====
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

// ==== Server Initialization ====
async function startServer() {
    try {
        const app = express();
        const server = http.createServer(app);
        const io = socketIo(server);

        // View engine
        app.set('view engine', 'ejs');

        // Middleware
        app.use(express.static(stuffPath));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }));

        // Initialize database
        const Database = new DatabaseModel();
        await Database.createConnection();
        console.log('Database connected successfully');

        // Register routers
        homeRouter(app, Database);
        dashboardRouter(app, Database);

        // Socket.IO
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
        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });

    } catch (err) {
        console.error('Server initialization error:', err);
        process.exit(1);
    }
}

startServer();
