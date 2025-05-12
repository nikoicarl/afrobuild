const md5 = require('md5');
const Session = require('../backend/model/models/SessionModel');
const GeneralFunction = require('../backend/model/models/GeneralFunctionModel');
const getSessionIDs = require('../backend/app/getSessionIDs');

const gf = new GeneralFunction();

async function insertOrUpdateHandler({
    socket,
    Database,
    ModelClass,
    PrivilegeClass,
    socketData,
    requiredFields = [],
    uniqueCheck = {},
    columnsToInsert = [],
    columnsToUpdate = [],
    privilegeName = '',
    eventName = '',
    melody1 = '',
}) {
    try {
        const session = getSessionIDs(socketData.melody1);
        const userid = session.userid;
        const sessionid = session.sessionid;

        // Session validation
        if (md5(userid) !== socketData.melody2) {
            return socket.emit(`${melody1}_${eventName}`, {
                type: 'caution',
                message: 'Sorry your session has expired, wait for about 18 seconds and try again...',
                timeout: 'no'
            });
        }

        const model = new ModelClass(Database);
        const privilegeModel = new PrivilegeClass(Database, userid);

        // Required field check
        const emptyCheck = await gf.ifEmpty(requiredFields);
        if (emptyCheck.includes('empty')) {
            return socket.emit(`${melody1}_${eventName}`, {
                type: 'caution',
                message: 'Some fields are required!'
            });
        }

        // Privilege check
        const privilegeData = (await privilegeModel.getPrivileges()).privilegeData;
        const hiddenid = socketData.hiddenid;
        const privilegeKey = hiddenid ? `update_${privilegeName}` : `add_${privilegeName}`;
        if (privilegeData[privilegeKey] !== 'yes') {
            return socket.emit(`${melody1}_${eventName}`, {
                type: 'caution',
                message: `You have no privilege to ${hiddenid ? 'update' : 'add'} ${privilegeName}`
            });
        }

        // Duplicate check
        if (uniqueCheck && Object.keys(uniqueCheck).length > 0) {
            const existing = await model.preparedFetch({
                sql: `${Object.keys(uniqueCheck).map(k => `${k} = ?`).join(' AND ')} AND ${privilegeName}id != ? AND status = ?`,
                columns: [...Object.values(uniqueCheck), hiddenid || 0, 'active']
            });

            if (Array.isArray(existing) && existing.length > 0) {
                return socket.emit(`${melody1}_${eventName}`, {
                    type: 'caution',
                    message: `Sorry, ${privilegeName} with the same information already exists`
                });
            }
        }

        let result;
        let itemid = hiddenid || gf.getTimeStamp();
        if (!hiddenid) {
            result = await model.insertTable([itemid, ...columnsToInsert, 'active', gf.getDateTime(), sessionid]);
        } else {
            result = await model.updateTable({
                sql: `${columnsToUpdate.map(field => `${field.name} = ?`).join(', ')} WHERE ${privilegeName}id = ? AND status = ?`,
                columns: [...columnsToUpdate.map(field => field.value), itemid, 'active']
            });
        }

        if (result.affectedRows) {
            const sessionModel = new Session(Database);
            const activityid = gf.getTimeStamp();
            await sessionModel.insertTable([
                activityid,
                sessionid,
                hiddenid ? `updated a ${privilegeName}` : `added a new ${privilegeName}`,
                'active',
                gf.getDateTime()
            ]);

            return socket.emit(`${melody1}_${eventName}`, {
                type: 'success',
                message: `${privilegeName.charAt(0).toUpperCase() + privilegeName.slice(1)} has been ${hiddenid ? 'updated' : 'created'} successfully`
            });
        } else {
            throw new Error('Database update failed');
        }

    } catch (err) {
        console.error(err);
        return socket.emit(`${melody1}_${eventName}`, {
            type: 'error',
            message: `Oops, something went wrong: ${err.message}`
        });
    }
}

module.exports = insertOrUpdateHandler;
