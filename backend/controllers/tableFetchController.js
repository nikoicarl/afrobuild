const User = require('../models/UserModel');
const Role = require('../models/RoleModel');
const Product = require('../models/ProductModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const Service = require('../models/ServiceModel');
const Merchant = require('../models/MerchantModel');
const Vendor = require('../models/VendorModel');
const Category = require('../models/CategoryModel');
const Session = require('../models/SessionModel');
const ViewModel = require('../models/ViewModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const GeneralFunction = require('../models/GeneralFunctionModel');
const gf = new GeneralFunction();

const tableConfigs = {
    user_table: {
        model: User,
        method: 'joinFetch',
        permissions: ['add_user', 'update_user', 'deactivate_user'],
        sql: 't1.status != ? ORDER BY t1.date_time DESC',
        columns: ['inactive']
    },
    role_table: {
        model: Role,
        permissions: ['add_role', 'update_role', 'deactivate_role'],
        sql: 'status != ? ORDER BY name ASC',
        columns: ['inactive']
    },
    product_table: {
        model: Product,
        permissions: ['add_product', 'update_product', 'deactivate_product'],
        sql: 'status != ? ORDER BY name ASC',
        columns: ['inactive']
    },
    service_table: {
        model: Service,
        permissions: ['add_service', 'update_service', 'deactivate_service'],
        sql: 'status != ? ORDER BY name ASC',
        columns: ['inactive']
    },
    merchant_table: {
        model: Merchant,
        permissions: ['add_merchant', 'update_merchant', 'deactivate_merchant'],
        sql: 'status != ? ORDER BY name ASC',
        columns: ['inactive']
    },
    vendor_table: {
        model: Vendor,
        permissions: ['add_vendor', 'update_vendor', 'deactivate_vendor'],
        sql: 'status != ? ORDER BY name ASC',
        columns: ['inactive']
    },
    category_table: {
        model: Category,
        permissions: ['add_category', 'update_category', 'deactivate_category'],
        sql: 'status != ? ORDER BY name ASC',
        columns: ['inactive']
    },
    transaction_table: {
        model: ViewModel,
        method: 'getGeneral',
        permissions: ['view_transaction'],
        sql: '1 ORDER BY datetime DESC',
        columns: [],
        isViewModel: true
    },
    activity_table: {
        model: Session,
        permissions: [],
        sql: '1',
        columns: []
    }
};

module.exports = (socket, Database) => {
    socket.on('table', async (browserblob) => {
        const { param, melody1 = '' } = browserblob;
        const config = tableConfigs[param];
        if (!config) return;

        try {
            const session = getSessionIDs(melody1);
            if (!session?.userid) {
                return socket.emit(`${melody1}_${param}`, {
                    type: 'error',
                    message: 'Invalid session.'
                });
            }

            const userid = session.userid;

            // Skip privilege check for activity_table
            if (param !== 'activity_table') {
                const PrivilegeModel = new Privilege(Database, userid);
                const { privilegeData = {} } = await PrivilegeModel.getPrivileges();
                const afrobuildPerms = privilegeData.afrobuild || {};

                const hasPermission = config.permissions.some(
                    perm => afrobuildPerms[perm] === 'yes'
                );

                if (!hasPermission) {
                    return socket.emit(`${melody1}_${param}`, []);
                }
            }

            let data;
            const ModelInstance = new config.model(Database);

            if (config.isViewModel && config.method && typeof ModelInstance[config.method] === 'function') {
                data = await ModelInstance[config.method]({
                    table: 'transaction_view',
                    sql: config.sql,
                    columns: config.columns
                });
            } else if (config.method && typeof ModelInstance[config.method] === 'function') {
                data = await ModelInstance[config.method]({
                    sql: config.sql,
                    columns: config.columns
                });
            } else if (typeof ModelInstance.preparedFetch === 'function') {
                data = await ModelInstance.preparedFetch({
                    sql: config.sql,
                    columns: config.columns
                });
            } else {
                throw new Error(`No valid method found for ${param}`);
            }

            if (!Array.isArray(data)) {
                return socket.emit(`${melody1}_${param}`, {
                    type: 'error',
                    message: `Database error while fetching ${param.replace('_table', '')}.`
                });
            }

            socket.emit(`${melody1}_${param}`, data);
        } catch (err) {
            console.error(err);
            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: err.message || 'An unexpected error occurred.'
            });
        }
    });
};
