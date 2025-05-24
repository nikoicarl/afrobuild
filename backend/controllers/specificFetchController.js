const User = require('../models/UserModel');
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
    socket.on('specific', async (browserBlob) => {
        const { param, melody1, dataId } = browserBlob;

        // Ensure melody1 is defined
        const session = getSessionIDs(melody1 || '');
        const { userid, sessionid } = session;

        try {
            // Check for missing param
            if (!param) {
                return socket.emit(`${melody1}_${param || 'unknown_param'}`, {
                    type: 'error',
                    message: 'Oops, something went wrong: No param provided'
                });
            }

            // Handle the "specific_user" case
            if (param === 'specific_user') {
                // Initialize the user model
                const userModel = new User(Database);

                // Fetch user details by userId
                const userResult = await userModel.preparedFetch({
                    sql: 'userid = ?',
                    columns: [dataId]
                });


                if (Array.isArray(userResult) && userResult.length > 0) {
                    // Emit user data back to the client
                    socket.emit(`${melody1}_${param}`, {
                        userResult: userResult[0] // User data
                    });
                } else {
                    socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: `Oops, something went wrong: Error fetching user data => ${userResult.sqlMessage || 'Unknown error'}`
                    });
                }
            } else if (param === 'specific_role') {
                // Initialize the role model
                const RoleModel = new Role(Database);

                // Fetch role details by userId
                const roleResult = await RoleModel.preparedFetch({
                    sql: 'roleid = ?',
                    columns: [dataId]
                });


                if (Array.isArray(roleResult) && roleResult.length > 0) {
                    // Emit role data back to the client
                    socket.emit(`${melody1}_${param}`, {
                        roleResult: roleResult[0] // Role data
                    });
                } else {
                    socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: `Oops, something went wrong: Error fetching user data => ${userResult.sqlMessage || 'Unknown error'}`
                    });
                }
            } else if (param === 'specific_product') {
                // Initialize the product model
                const ProductModel = new Product(Database);

                // Fetch product details by userId
                const productResult = await ProductModel.preparedFetch({
                    sql: 'productid = ?',
                    columns: [dataId]
                });


                if (Array.isArray(productResult) && productResult.length > 0) {
                    // Emit product data back to the client
                    socket.emit(`${melody1}_${param}`, {
                        productResult: productResult[0] // Product data
                    });
                } else {
                    socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: `Oops, something went wrong: Error fetching user data => ${userResult.sqlMessage || 'Unknown error'}`
                    });
                }
            } else if (param === 'specific_service') {
                // Initialize the service model
                const ServiceModel = new Service(Database);

                // Fetch service details by userId
                const serviceResult = await ServiceModel.preparedFetch({
                    sql: 'serviceid = ?',
                    columns: [dataId]
                });


                if (Array.isArray(serviceResult) && serviceResult.length > 0) {
                    // Emit service data back to the client
                    socket.emit(`${melody1}_${param}`, {
                        serviceResult: serviceResult[0] // Service data
                    });
                } else {
                    socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: `Oops, something went wrong: Error fetching user data => ${userResult.sqlMessage || 'Unknown error'}`
                    });
                }
            } else if (param === 'specific_merchant') {
                // Initialize the merchant model
                const MerchantModel = new Merchant(Database);

                // Fetch merchant details by userId
                const merchantResult = await MerchantModel.preparedFetch({
                    sql: 'merchantid = ?',
                    columns: [dataId]
                });


                if (Array.isArray(merchantResult) && merchantResult.length > 0) {
                    // Emit merchant data back to the client
                    socket.emit(`${melody1}_${param}`, {
                        merchantResult: merchantResult[0] // Merchant data
                    });
                } else {
                    socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: `Oops, something went wrong: Error fetching user data => ${userResult.sqlMessage || 'Unknown error'}`
                    });
                }
            } else if (param === 'specific_vendor') {
                // Initialize the vendor model
                const VendorModel = new Vendor(Database);

                // Fetch vendor details by userId
                const vendorResult = await VendorModel.preparedFetch({
                    sql: 'vendorid = ?',
                    columns: [dataId]
                });


                if (Array.isArray(vendorResult) && vendorResult.length > 0) {
                    // Emit vendor data back to the client
                    socket.emit(`${melody1}_${param}`, {
                        vendorResult: vendorResult[0] // Vendor data
                    });
                } else {
                    socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: `Oops, something went wrong: Error fetching user data => ${userResult.sqlMessage || 'Unknown error'}`
                    });
                }
            }

        } catch (error) {
            console.error('Error handling specific user request:', error);
            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: `Error: ${error.message || error}`
            });
        }
    });
};
