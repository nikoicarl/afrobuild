const dateFormat = require('dateformat');
const getSessionIDs = require('./getSessionIDs');
const Session = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const md5 = require('md5');

const gf = new GeneralFunction();

module.exports = function (socket, Database) {
    socket.on('logoutAction', async function (browserblob) {

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
            if (md5(userid.toString()) === melody2) {
                console.log('true');
                const result = await SessionModel.updateTable({
                    sql: 'logout=? WHERE sessionid=?',
                    columns: [gf.getDateTime(), sessionid]
                });

                console.log(sessionid);

                if (result.affectedRows) {
                    return socket.emit(`${melody1}_logoutAction`, {
                        type: 'success',
                        message: 'Logging out...'
                    });
                }

                socket.emit(`${melody1}_logoutAction`, {
                    type: 'error',
                    message: 'Could not complete logout.'
                });

            } else {
                socket.emit(`${melody1}_logoutAction`, {
                    type: 'caution',
                    message: 'Session mismatch. Logging out...',
                    timeout: 'yes'
                });
            }

        } catch (err) {
            console.error('Logout error:', err);
            socket.emit(`${melody1}_logoutAction`, {
                type: 'error',
                message: 'An error occurred while logging out.'
            });
        }
    });
};
