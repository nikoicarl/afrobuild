const User = require('../models/UserModel');
const Role = require('../models/RoleModel');
const Product = require('../models/ProductModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const Service = require('../models/ServiceModel');
const Merchant = require('../models/MerchantModel');
const Vendor = require('../models/VendorModel');
const Category = require('../models/CategoryModel');
const ViewModel = require('../models/ViewModel');

const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const GeneralFunction = require('../models/GeneralFunctionModel');
const gf = new GeneralFunction();

const tableConfigs = {
    user_table: {
        model: User,
        permissions: ['add_user', 'update_user', 'deactivate_user'],
        sql: 'status != ? ORDER BY date_time DESC',
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
        method: 'getGeneral',  // Use instance method
        permissions: ['view_transaction'],
        sql: '1 ORDER BY datetime DESC',
        columns: [], // Not used here
        isViewModel: true
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
            const PrivilegeModel = new Privilege(Database, userid);
            const privilegeData = (await PrivilegeModel.getPrivileges()).privilegeData || {};
            const afrobuildPerms = privilegeData.afrobuild || {};

            const hasPermission = config.permissions.some(
                perm => afrobuildPerms[perm] === 'yes'
            );

            if (!hasPermission) {
                return socket.emit(`${melody1}_${param}`, []);
            }

            let data;
            if (config.isViewModel) {
                // Handle special view model instance method
                const View = new config.model(Database);
                data = await View[config.method]({
                    table: 'transaction_view',
                    sql: config.sql,
                    columns: config.columns
                });
            } else {
                // Handle regular fetch from models
                const Model = new config.model(Database);
                data = await Model.preparedFetch({
                    sql: config.sql,
                    columns: config.columns
                });
            }

            if (!Array.isArray(data)) {
                return socket.emit(`${melody1}_${param}`, {
                    type: 'error',
                    message: `Database error while fetching ${param.replace('_table', '')}.`
                });
            }

            return socket.emit(`${melody1}_${param}`, data);

        } catch (err) {
            console.error(err);
            return socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: err.message || 'An error occurred while fetching data.'
            });
        }
    });
};
