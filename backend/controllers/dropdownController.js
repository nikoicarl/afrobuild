const User = require('../models/UserModel');

module.exports = (socket, Database) => {
    socket.on('dropdown', async (browserblob) => {
        const { param = '', melody1 = '' } = browserblob;

        if (!param) {
            return socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: 'Oops, something went wrong. No parameter provided.'
            });
        }

        try {
            if (param === 'user') {
                const UserModel = new User(Database);

                const result = await UserModel.preparedFetch({
                    sql: 'status = ? ORDER BY first_name ASC',
                    columns: ['active']
                });

                if (Array.isArray(result)) {
                    socket.emit(`${melody1}_${param}`, result);
                } else {
                    socket.emit(`${melody1}_${param}`, {
                        type: 'error',
                        message: `Error fetching users: ${result?.sqlMessage || 'Unknown database error'}`
                    });
                }
            } else {
                socket.emit(`${melody1}_${param}`, {
                    type: 'error',
                    message: `Invalid parameter: ${param}`
                });
            }
        } catch (error) {
            socket.emit(`${melody1}_${param}`, {
                type: 'error',
                message: `Exception occurred: ${error.message || error}`
            });
        }
    });
};
