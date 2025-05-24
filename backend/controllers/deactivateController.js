const User = require('../models/UserModel');
const Privilege = require('../models/PrivilegeFeaturesModel');
const Role = require('../models/RoleModel');
const Product = require('../models/ProductModel');
const Service = require('../models/ServiceModel');
const Merchant = require('../models/MerchantModel');
const Vendor = require('../models/VendorModel');
const GeneralFunction = require('../models/GeneralFunctionModel');
const getSessionIDs = require('./getSessionIDs');
const md5 = require('md5');
const gf = new GeneralFunction();

module.exports = (socket, Database) => {
    socket.on('deactivate', async (browserblob) => {
        const { param, melody1, dataId, checker } = browserblob;

        if (!param) {
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

            let message = '';
            let result = null;

            if (param === "deactivate_user") {
                // Check user privilege for deactivating user
                if (privilegeData?.afrobuild.deactivate_user === "yes") {
                    const status = checker === "deactivate" ? 'deactivated' : 'active';
                    const UserModel = new User(Database);

                    // Update user status
                    result = await UserModel.updateTable({
                        sql: 'status=? WHERE userid=?',
                        columns: [status, dataId]
                    });
                    message = result?.affectedRows
                        ? 'User status updated successfully.'
                        : 'Failed to update user status.';
                } else {
                    message = 'You do not have the required privileges to perform this task.';
                }
            } else if (param === "deactivate_role") {
                // Check user privilege for deactivating roles
                if (privilegeData?.afrobuild.deactivate_role === "yes") {
                    const roleStatus = checker === "deactivate" ? 'deactivated' : 'active';
                    const RoleModel = new Role(Database);

                    // Update role status using RoleModel
                    result = await RoleModel.updateTable({
                        sql: 'status=? WHERE roleid=?',
                        columns: [roleStatus, dataId]
                    });
                    message = result?.affectedRows
                        ? 'Role status updated successfully.'
                        : 'Failed to update role status.';
                } else {
                    message = 'You do not have the required privileges to deactivate roles.';
                }
            } else if (param === "deactivate_product") {
                // Check user privilege for deactivating products
                if (privilegeData?.afrobuild.deactivate_product === "yes") {
                    const productStatus = checker === "deactivate" ? 'deactivated' : 'active';
                    const ProductModel = new Product(Database);

                    // Update product status using ProductModel
                    result = await ProductModel.updateTable({
                        sql: 'status=? WHERE productid=?',
                        columns: [productStatus, dataId]
                    });
                    message = result?.affectedRows
                        ? 'Product status updated successfully.'
                        : 'Failed to update product status.';
                } else {
                    message = 'You do not have the required privileges to deactivate products.';
                }
            } else if (param === "deactivate_service") {
                // Check user privilege for deactivating services
                if (privilegeData?.afrobuild.deactivate_service === "yes") {
                    const serviceStatus = checker === "deactivate" ? 'deactivated' : 'active';
                    const ServiceModel = new Service(Database);

                    // Update service status using ServiceModel
                    result = await ServiceModel.updateTable({
                        sql: 'status=? WHERE serviceid=?',
                        columns: [serviceStatus, dataId]
                    });
                    message = result?.affectedRows
                        ? 'Service status updated successfully.'
                        : 'Failed to update service status.';
                } else {
                    message = 'You do not have the required privileges to deactivate services.';
                }
            } else if (param === "deactivate_vendor") {
                // Check user privilege for deactivating vendors
                if (privilegeData?.afrobuild.deactivate_vendor === "yes") {
                    const vendorStatus = checker === "deactivate" ? 'deactivated' : 'active';
                    const VendorModel = new Vendor(Database);

                    // Update vendor status using VendorModel
                    result = await VendorModel.updateTable({
                        sql: 'status=? WHERE vendorid=?',
                        columns: [vendorStatus, dataId]
                    });
                    message = result?.affectedRows
                        ? 'Vendor status updated successfully.'
                        : 'Failed to update vendor status.';
                } else {
                    message = 'You do not have the required privileges to deactivate vendors.';
                }
            } else if (param === "deactivate_merchant") {
                // Check user privilege for deactivating merchants
                if (privilegeData?.afrobuild.deactivate_merchant === "yes") {
                    const merchantStatus = checker === "deactivate" ? 'deactivated' : 'active';
                    const MerchantModel = new Merchant(Database);

                    // Update merchant status using MerchantModel
                    result = await MerchantModel.updateTable({
                        sql: 'status=? WHERE merchantid=?',
                        columns: [merchantStatus, dataId]
                    });
                    message = result?.affectedRows
                        ? 'Merchant status updated successfully.'
                        : 'Failed to update merchant status.';
                } else {
                    message = 'You do not have the required privileges to deactivate merchants.';
                }
            } else {
                message = 'Invalid parameter provided.';
            }

            // Emit the response based on result
            socket.emit(`${melody1}_${param}`, {
                type: result?.affectedRows ? 'success' : 'caution',
                message: message
            });

        } catch (error) {
            // Log the error for debugging purposes (optional)
            console.error('Error in deactivate:', error);

            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: 'An unexpected error occurred. Please try again later.'
            });
        }
    });
};
