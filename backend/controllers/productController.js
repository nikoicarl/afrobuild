const Product = require('../models/ProductModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const SessionActivity = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();
const UploadFile = require('../models/UploadFileModel');

module.exports = (socket, Database) => {
    socket.on('create_product', async (browserblob) => {
        const {
            name,
            price,
            description,
            product_hiddenid,
            melody1,
            melody2,
            DocumentsForUpdate = []
        } = browserblob;

        const session = getSessionIDs(melody1);
        const userid = session.userid;
        const sessionid = session.sessionid;

        try {
            if (md5(userid) === melody2) {
                const ProductModel = new Product(Database);
                const PrivilegeModel = new Privilege(Database, userid);

                if (!name || name.trim() === '') {
                    return socket.emit(`${melody1}_create_product`, {
                        success: false,
                        message: 'Product name is required!'
                    });
                }

                const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;
                const isNew = !product_hiddenid;
                const hasPrivilege = isNew
                    ? privilegeData.afrobuild.add_product
                    : privilegeData.afrobuild.update_product;



                if (hasPrivilege !== 'yes') {
                    return socket.emit(`${melody1}_create_product`, {
                        success: false,
                        message: 'You do not have permission to perform this action.'
                    });
                }

                const productId = isNew ? 0 : product_hiddenid;
                const duplicateCheck = await ProductModel.preparedFetch({
                    sql: 'name = ? AND productid != ? AND status = ?',
                    columns: [name, productId, 'active']
                });

                if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
                    return socket.emit(`${melody1}_create_product`, {
                        success: false,
                        message: 'A product with the same name already exists.'
                    });
                }

                const UploadFileHandler = new UploadFile(DocumentsForUpdate, '');
                const documentNames = UploadFileHandler._getFileNames().toString();
                let result;

                if (isNew) {
                    const newId = gf.getTimeStamp();
                    result = await ProductModel.insertTable([
                        newId,
                        name,
                        description,
                        price,
                        documentNames,
                        gf.getDateTime(),
                        'active'
                    ]);
                    

                    
                } else {
                    const updateColumns = [
                        name,
                        description,
                        price,
                        ...(DocumentsForUpdate.length > 0 ? [documentNames] : []),
                        product_hiddenid,
                        'active'
                    ];

                    const updateSql = `
                        name = ?, 
                        description = ?,
                        price = ?${DocumentsForUpdate.length > 0 ? ', documents = ?' : ''} 
                        WHERE productid = ? AND status = ?
                    `.replace(/\s+/g, ' ').trim();

                    result = await ProductModel.updateTable({
                        sql: updateSql,
                        columns: updateColumns
                    });
                }

                if (result && result.affectedRows !== undefined) {
                    if (DocumentsForUpdate.length > 0) {
                        UploadFileHandler._uploadFiles();
                    }

                    const SessionActivityModel = new SessionActivity(Database);
                    const activityId = gf.getTimeStamp();
                    const activityMsg = isNew
                        ? 'added a new product'
                        : 'updated a product record';

                    await SessionActivityModel.insertTable([
                        activityId,
                        sessionid,
                        activityMsg,
                        'active',
                        gf.getDateTime()
                    ]);

                    return socket.emit(`${melody1}_create_product`, {
                        success: true,
                        message: `Product has been ${isNew ? 'created' : 'updated'} successfully`
                    });
                }

                return socket.emit(`${melody1}_create_product`, {
                    success: false,
                    message: 'Database error. Please try again later.'
                });
            } else {
                return socket.emit(`${melody1}_create_product`, {
                    success: false,
                    message: 'Session expired. Please refresh and try again.',
                    timeout: 'no'
                });
            }
        } catch (err) {
            console.error('create_product error:', err);
            return socket.emit(`${melody1}_create_product`, {
                success: false,
                message: 'An internal error occurred. Please contact support.'
            });
        }
    });
};
