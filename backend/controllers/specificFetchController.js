const User = require('../models/UserModel');
const Role = require('../models/RoleModel');
const Product = require('../models/ProductModel');
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
