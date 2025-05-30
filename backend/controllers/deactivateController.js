const User = require('../models/UserModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const Role = require('../models/RoleModel');
const Product = require('../models/ProductModel');
const Service = require('../models/ServiceModel');
const Merchant = require('../models/MerchantModel');
const Vendor = require('../models/VendorModel');
const Category = require('../models/CategoryModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const SessionActivity = require('../models/SessionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');

const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('deactivate', async (browserblob) => {
        const { param, melody1, dataId, checker } = browserblob;

        if (!param || !dataId || !melody1) {
            return socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: 'Invalid parameters provided.'
            });
        }

        const session = getSessionIDs(melody1);
        const { userid, sessionid } = session;

        try {
            const PrivilegeModel = new Privilege(Database, userid);
            const { privilegeData } = await PrivilegeModel.getPrivileges();

            const entityMap = {
                deactivate_user: {
                    model: User,
                    idField: 'userid',
                    privilege: 'deactivate_user',
                    name: 'User'
                },
                deactivate_role: {
                    model: Role,
                    idField: 'roleid',
                    privilege: 'deactivate_role',
                    name: 'Role'
                },
                deactivate_product: {
                    model: Product,
                    idField: 'productid',
                    privilege: 'deactivate_product',
                    name: 'Product'
                },
                deactivate_service: {
                    model: Service,
                    idField: 'serviceid',
                    privilege: 'deactivate_service',
                    name: 'Service'
                },
                deactivate_merchant: {
                    model: Merchant,
                    idField: 'merchantid',
                    privilege: 'deactivate_merchant',
                    name: 'Merchant'
                },
                deactivate_vendor: {
                    model: Vendor,
                    idField: 'vendorid',
                    privilege: 'deactivate_vendor',
                    name: 'Vendor'
                },
                deactivate_category: {
                    model: Category,
                    idField: 'categoryid',
                    privilege: 'deactivate_category',
                    name: 'Category'
                }
            };

            if (!entityMap[param]) {
                return socket.emit(`${melody1}_${param}`, {
                    type: 'error',
                    message: 'Invalid parameter provided.'
                });
            }

            const { model, idField, privilege, name } = entityMap[param];

            if (privilegeData?.afrobuild?.[privilege] !== 'yes') {
                return socket.emit(`${melody1}_${param}`, {
                    type: 'error',
                    message: `You do not have the required privileges to deactivate ${name.toLowerCase()}s.`
                });
            }

            const status = checker === 'deactivate' ? 'deactivated' : 'active';
            const EntityModel = new model(Database);

            const result = await EntityModel.updateTable({
                sql: 'status=? WHERE ' + idField + '=?',
                columns: [status, dataId]
            });

            const actionMessage = result?.affectedRows
                ? `${name} with ID ${dataId} ${status}.`
                : `Attempt to update ${name.toLowerCase()} with ID ${dataId} failed.`;

            // Insert session activity
            const SessionActivityModel = new SessionActivity(Database);
            await SessionActivityModel.insertTable([
                sessionid,
                userid,
                actionMessage,
                gf.getDateTime(),
                null
            ]);

            // Send socket response
            socket.emit(`${melody1}_${param}`, {
                type: result?.affectedRows ? 'success' : 'caution',
                message: result?.affectedRows
                    ? `${name} status updated successfully.`
                    : `Failed to update ${name.toLowerCase()} status.`
            });

        } catch (error) {
            console.error('Error in deactivate:', error);
            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: 'An unexpected error occurred. Please try again later.'
            });
        }
    });
};
