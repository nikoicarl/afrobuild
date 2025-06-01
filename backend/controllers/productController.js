const Product = require('../models/ProductModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const SessionActivity = require('../models/SessionModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const UploadFile = require('../models/UploadFileModel');

const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    const handleProductCreateOrUpdate = async (browserblob, isUpdate) => {
        const {
            name,
            price: rawPrice,
            category,
            description,
            product_hiddenid,
            melody1,
            melody2,
            DocumentsForUpdate = []
        } = browserblob;

        const session = getSessionIDs(melody1);
        const userid = session.userid;
        const price = isNaN(parseFloat(rawPrice)) ? 0.00 : parseFloat(parseFloat(rawPrice).toFixed(2));


        const responseEvent = `${melody1}_${isUpdate ? 'update' : 'create'}_product`;

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
                    message: 'Product name is required!'
                });
            }

            const ProductModel = new Product(Database);
            const PrivilegeModel = new Privilege(Database, userid);
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData;

            const hasPrivilege = isUpdate
                ? privilegeData.afrobuild.update_product
                : privilegeData.afrobuild.add_product;

            if (hasPrivilege !== 'yes') {
                return socket.emit(responseEvent, {
                    success: false,
                    message: 'You do not have permission to perform this action.'
                });
            }

            const productId = isUpdate ? product_hiddenid : 0;
            const duplicateCheck = await ProductModel.preparedFetch({
                sql: 'name = ? AND productid != ? AND status = ?',
                columns: [name, productId, 'active']
            });

            if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
                return socket.emit(responseEvent, {
                    success: false,
                    message: 'A product with the same name already exists.'
                });
            }

            const UploadFileHandler = new UploadFile(DocumentsForUpdate, name);
            const documentNames = UploadFileHandler.getRenamedFiles().toString();
            let result;

            if (!isUpdate) {
                const newId = gf.getTimeStamp();
                result = await ProductModel.insertTable([
                    newId,
                    name,
                    description,
                    price,
                    category,
                    documentNames,
                    gf.getDateTime(),
                    'active'
                ]);
            } else {
                const updateColumns = [
                    name,
                    description,
                    category,
                    price,
                    ...(DocumentsForUpdate.length > 0 ? [documentNames] : []),
                    product_hiddenid,
                    'active'
                ];

                const updateSql = `
                    name = ?, 
                    description = ?,
                    categoryid = ?,
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
                    UploadFileHandler.upload();
                }

                const SessionActivityModel = new SessionActivity(Database);
                const activityId = gf.getTimeStamp();
                const activityMsg = isUpdate
                    ? 'updated a product record'
                    : 'added a new product';

                await SessionActivityModel.insertTable([
                    activityId,
                    userid,
                    activityMsg,
                    gf.getDateTime(),
                    null
                ]);

                return socket.emit(responseEvent, {
                    success: true,
                    message: `Product has been ${isUpdate ? 'updated' : 'created'} successfully`
                });
            }

            return socket.emit(responseEvent, {
                success: false,
                message: isUpdate
                    ? 'No changes were made to the product.'
                    : 'Failed to create the product. Please try again.'
            });

        } catch (err) {
            console.error(`${isUpdate ? 'update' : 'create'}_product error:`, err);
            return socket.emit(responseEvent, {
                success: false,
                message: 'An internal error occurred. Please contact support.'
            });
        }
    };

    socket.on('create_product', (data) => handleProductCreateOrUpdate(data, false));
    socket.on('update_product', (data) => handleProductCreateOrUpdate(data, true));
};
