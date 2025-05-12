const md5 = require('md5');
const Session = require('../backend/model/models/SessionModel');
const GeneralFunction = require('../backend/model/models/GeneralFunctionModel');
const getSessionIDs = require('../backend/app/getSessionIDs');

const gf = new GeneralFunction();

async function insertOrUpdateHandler({
    socket,
    Database,
    ModelClass,
    socketData,
    requiredFields = [],
    uniqueCheck = {},
    columnsToInsert = [],
    columnsToUpdate = [],
    eventName = ''
}) {
    try {
        // Validate session
        const session = getSessionIDs(socketData.sessionid);
        if (!session) {
            return socket.emit(eventName, {
                type: 'caution',
                message: 'Session not found or expired.',
                timeout: 'no'
            });
        }

        const { userid, sessionid } = session;
        console.log('Session:', session); // Log session for debugging (remove in production)

        const model = new ModelClass(Database);

        // Required field check
        const emptyCheck = await gf.ifEmpty(requiredFields.map(field => field.trim())); // Trim spaces
        if (emptyCheck.includes('empty')) {
            return socket.emit(eventName, {
                type: 'caution',
                message: 'Some fields are required!'
            });
        }

        // Duplicate check (if uniqueCheck is provided)
        if (Object.keys(uniqueCheck).length > 0) {
            const existing = await model.preparedFetch({
                sql: `${Object.keys(uniqueCheck).map(k => `${k} = ?`).join(' AND ')} AND status = ?`,
                columns: [...Object.values(uniqueCheck), 'active']
            });

            if (Array.isArray(existing) && existing.length > 0) {
                return socket.emit(eventName, {
                    type: 'caution',
                    message: `Sorry, setup with the same information already exists`
                });
            }
        }

        // Insert or update record
        let result;
        const itemid = socketData.hiddenid || gf.getTimeStamp();

        if (!socketData.hiddenid) {
            // Inserting a new setup
            result = await model.insertTable([itemid, ...columnsToInsert, 'active', gf.getDateTime(), sessionid]);
        } else {
            // Updating an existing setup
            result = await model.updateTable({
                sql: `${columnsToUpdate.map(field => `${field.name} = ?`).join(', ')} WHERE setupid = ? AND status = ?`,
                columns: [...columnsToUpdate.map(field => field.value), itemid, 'active']
            });
        }

        // Log session activity after insert/update
        if (result.affectedRows) {
            const sessionModel = new Session(Database);
            const activityid = gf.getTimeStamp();
            await sessionModel.insertTable([
                activityid,
                sessionid,
                socketData.hiddenid ? `updated a setup` : `added a new setup`,
                'active',
                gf.getDateTime()
            ]);

            // Emit success response
            return socket.emit(eventName, {
                type: 'success',
                message: `Setup has been ${socketData.hiddenid ? 'updated' : 'created'} successfully`
            });
        } else {
            throw new Error('Database update failed');
        }

    } catch (err) {
        console.error('Error in insertOrUpdateHandler:', err); // Log full error
        return socket.emit(eventName, {
            type: 'error',
            message: `Oops, something went wrong: ${err.message}`
        });
    }
}

module.exports = insertOrUpdateHandler;
