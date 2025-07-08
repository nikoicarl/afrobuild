const Service = require('../models/ServiceModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const SessionActivity = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const UploadFile = require('../models/UploadFileModel');

const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    const handleServiceCreateOrUpdate = async (browserblob, isUpdate) => {
        const {
            name,
            price: rawPrice,
            category,
            description,
            service_hiddenid,
            melody1,
            melody2,
            DocumentsForUpdate = []
        } = browserblob;

        const session = getSessionIDs(melody1);
        const userid = session.userid;
        const price = isNaN(parseFloat(rawPrice)) ? 0.00 : parseFloat(parseFloat(rawPrice).toFixed(2));

        const responseEvent = `${melody1}_${isUpdate ? 'update' : 'create'}_service`;

        try {
            if (md5(userid) !== melody2) {
                return socket.emit(responseEvent, {
                    success: false,
                    message: 'Session expired. Please refresh and try again.',
                    timeout: 'no'
                });
            }

            if (!name || name.trim() === '') {
                return socket.emit(responseEvent, {
                    success: false,
                    message: 'Service name is required!'
                });
            }

            const ServiceModel = new Service(Database);
            const PrivilegeModel = new Privilege(Database, userid);
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;

            const hasPrivilege = isUpdate
                ? privilegeData.afrobuild.update_service
                : privilegeData.afrobuild.add_service;

            if (hasPrivilege !== 'yes') {
                return socket.emit(responseEvent, {
                    success: false,
                    message: 'You do not have permission to perform this action.'
                });
            }

            const serviceId = isUpdate ? service_hiddenid : 0;
            const duplicateCheck = await ServiceModel.preparedFetch({
                sql: 'name = ? AND serviceid != ? AND status = ?',
                columns: [name, serviceId, 'active']
            });

            if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
                return socket.emit(responseEvent, {
                    success: false,
                    message: 'A service with the same name already exists.'
                });
            }

            const UploadFileHandler = new UploadFile(DocumentsForUpdate, name);
            const documentNames = UploadFileHandler.getRenamedFiles().toString();
            let result;

            if (!isUpdate) {
                const newId = gf.getTimeStamp();
                result = await ServiceModel.insertTable([
                    newId,
                    name,
                    description,
                    price,
                    category,
                    userid,
                    documentNames,
                    gf.getDateTime(),
                    'active'
                ]);
            } else {
                let updateSql = `
                    name = ?, 
                    description = ?,
                    categoryid = ?,
                    price = ?
                `.trim();

                const updateColumns = [
                    name,
                    description,
                    category,
                    price
                ];

                if (DocumentsForUpdate.length > 0) {
                    updateSql += ', documents = ?';
                    updateColumns.push(documentNames);
                }

                updateSql += ' WHERE serviceid = ? AND status = ?';
                updateColumns.push(service_hiddenid, 'active');

                result = await ServiceModel.updateTable({
                    sql: updateSql,
                    columns: updateColumns
                });
            }

            if (result && result.affectedRows !== undefined && result.affectedRows > 0) {
                if (DocumentsForUpdate.length > 0) {
                    UploadFileHandler.upload();
                }

                const SessionActivityModel = new SessionActivity(Database);
                const activityId = gf.getTimeStamp();
                const activityMsg = isUpdate
                    ? 'updated a service record'
                    : 'added a new service';

                await SessionActivityModel.insertTable([
                    activityId,
                    userid,
                    activityMsg,
                    gf.getDateTime(),
                    null
                ]);

                return socket.emit(responseEvent, {
                    success: true,
                    message: `Service has been ${isUpdate ? 'updated' : 'created'} successfully`
                });
            }

            return socket.emit(responseEvent, {
                success: false,
                message: isUpdate
                    ? 'No changes were made to the service.'
                    : 'Failed to create the service. Please try again.'
            });

        } catch (err) {
            console.error(`${isUpdate ? 'update' : 'create'}_service error:`, err);
            return socket.emit(responseEvent, {
                success: false,
                message: 'An internal error occurred. Please contact support.'
            });
        }
    };

    socket.on('create_service', (data) => handleServiceCreateOrUpdate(data, false));
    socket.on('update_service', (data) => handleServiceCreateOrUpdate(data, true));
};
