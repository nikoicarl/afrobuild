let dateformat = require('dateformat');
let getSessionIDs = require('./getSessionIDs');
const Session = require('../../models/administration/SessionModel');
const SessionActivity = require('../../models/administration/SessionActivityModel');
const GeneralFunction = require('../../models/administration/GeneralFunctionModel');
const gf = new GeneralFunction();
const md5 = require('md5');

module.exports = function(socket, Database) {
    socket.on('logoutAction', async function(browserblob) {
        let melody1 = browserblob.melody1;

        let session = getSessionIDs(melody1);
        let userid = session.userid;
        let sessionid = session.sessionid;
        
        const SessionModel = new Session(Database);
        const SessionActivityModel = new SessionActivity(Database);

        if (md5(userid) == browserblob.melody2) {
            let result = await SessionModel.updateTable({
                sql: 'logout=? WHERE sessionid=?',
                columns: [gf.getDateTime(), sessionid]
            });
            if (result.affectedRows) {
                let session_activityid = gf.getTimeStamp();
                result = await SessionActivityModel.insertTable([session_activityid, sessionid, 'logged out of system', 'active', gf.getDateTime()]);
                if (result.affectedRows) {
                    socket.emit(melody1+'_logoutAction', {
                        'type': 'success',
                        'message': 'Logging out...'
                    });
                } else {
                    socket.emit(melody1+'_logoutAction', {
                        type: 'error',
                        message: 'Oops, something went wrong, try again later...'
                    });
                }
            } else {
                socket.emit(melody1+'_logoutAction', {
                    type: 'error',
                    message: 'Oops, something went wrong, try again later: '+result
                });
            }
        } else {
            socket.emit(melody1+'_logoutAction', {
                'type': 'caution',
                'message': 'Sorry your session has expired, you are being logged out...',
                'timeout': 'yes'
            });
        }
    });
}