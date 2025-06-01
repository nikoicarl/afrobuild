const dateFormat = require('dateformat');
const getSessionIDs = require('./getSessionIDs');
const Session = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const md5 = require('md5');

const gf = new GeneralFunction();

module.exports = function (socket, Database) {
    socket.on('logoutAction', async (browserblob) => {
        const { melody1, melody2 } = browserblob;
        const session = getSessionIDs(melody1);

        if (!session || !session.userid || !session.sessionid) {
            return socket.emit(`${melody1}_logoutAction`, {
                type: 'caution',
                message: 'Invalid session. You are being logged out...',
                timeout: 'yes'
            });
        }

        const { userid, sessionid } = session;
        const SessionModel = new Session(Database);

        try {
            const logoutTime = gf.getDateTime();

            // Update logout time for the session
            const updateResult = await SessionModel.updateTable({
                sql: 'logout=? WHERE sessionid=?',
                columns: [logoutTime, sessionid]
            });

            if (updateResult.affectedRows) {
                console.log(`Session ${sessionid} logged out at ${logoutTime}`);

                return socket.emit(`${melody1}_logoutAction`, {
                    type: 'success',
                    message: 'Logging out...'
                });
            }

            return socket.emit(`${melody1}_logoutAction`, {
                type: 'error',
                message: 'Could not complete logout.'
            });

        } catch (err) {
            console.error('Logout error:', err);
            return socket.emit(`${melody1}_logoutAction`, {
                type: 'error',
                message: 'An error occurred while logging out.'
            });
        }
    });
};
