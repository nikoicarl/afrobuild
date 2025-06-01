const ProductModel = require('../models/ProductModel');
const CategoryModel = require('../models/CategoryModel');
const TransactionModel = require('../models/TransactionModel');

module.exports = function (socket, Database) {
    const Product = new ProductModel(Database);
    const Category = new CategoryModel(Database);
    const Transaction = new TransactionModel(Database);

    socket.on('fetchDashboardData', async () => {
        try {
            // Start all promises at once
            const [
                productCountPromise,
                categoryCountPromise,
                totalAmountPromise,
                transactionCountPromise
            ] = [
                Product.count(),
                Category.count(),
                Transaction.getTotalAmount(),
                Transaction.count()
            ];

            // Wait for all promises to resolve in parallel
            const [
                productCount,
                categoryCount,
                totalTransactionAmount,
                transactionCount
            ] = await Promise.all([
                productCountPromise,
                categoryCountPromise,
                totalAmountPromise,
                transactionCountPromise
            ]);

            socket.emit('dashboardData', {
                productCount,
                categoryCount,
                totalTransactionAmount,
                transactionCount,
            });
        } catch (err) {
            console.error('[Dashboard Error]:', err);
            socket.emit('dashboardError', 'Failed to load dashboard data.');
        }
    });
};
