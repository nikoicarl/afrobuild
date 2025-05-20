const User = require('../models/UserModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('specific', async (browserBlob) => {
        const { param, melody1, dataId } = browserBlob;

        // Ensure melody1 is defined
        const session = getSessionIDs(melody1 || '');
        const { userid, sessionid } = session;

        try {
            // Check for missing param
            if (!param) {
                return socket.emit(`${melody1}_${param || 'unknown_param'}`, {
                    type: 'error',
                    message: 'Oops, something went wrong: No param provided'
                });
            }

            // Handle the "specific_user" case
            if (param === 'specific_user') {
                // Initialize the user model
                const userModel = new User(Database);

                // Fetch user details by userId
                const userResult = await userModel.preparedFetch({
                    sql: 'userid = ?',
                    columns: [dataId]
                });


                if (Array.isArray(userResult) && userResult.length > 0) {
                    // Emit user data back to the client
                    socket.emit(`${melody1}_${param}`, {
                        userResult: userResult[0] // User data
                    });
                } else {
                    socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: `Oops, something went wrong: Error fetching user data => ${userResult.sqlMessage || 'Unknown error'}`
                    });
                }
            }

        } catch (error) {
            console.error('Error handling specific user request:', error);
            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: `Error: ${error.message || error}`
            });
        }
    });
};
