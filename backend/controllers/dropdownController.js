const User = require('../models/UserModel');
const Category = require('../models/CategoryModel');

module.exports = (socket, Database) => {
    socket.on('dropdown', async (browserblob) => {
        const { param = '', melody1 = '' } = browserblob;

        const emitError = (message) => {
            socket.emit(`${melody1}_${param}`, { type: 'error', message });
        };

        if (!param) {
            return emitError('No parameter provided.');
        }

        const fetchData = async (ModelClass, sql, columns) => {
            const model = new ModelClass(Database);
            const result = await model.preparedFetch({ sql, columns });

            if (Array.isArray(result)) {
                socket.emit(`${melody1}_${param}`, result);
            } else {
                emitError(`Error fetching ${param}s: ${result?.sqlMessage || 'Unknown database error'}`);
            }
        };

        try {
            switch (param) {
                case 'user':
                    await fetchData(User, 'status = ? ORDER BY first_name ASC', ['active']);
                    break;
                case 'category':
                    await fetchData(Category, 'status = ? ORDER BY name ASC', ['active']);
                    break;
                default:
                    emitError(`Invalid parameter: ${param}`);
            }
        } catch (error) {
            emitError(`Exception occurred: ${error.message || error}`);
        }
    });
};
