const UserModel = require('../models/UserModel');
const ProductModel = require('../models/ProductModel');
const CategoryModel = require('../models/CategoryModel');
const TransactionModel = require('../models/TransactionModel');

module.exports = function (socket, Database) {
    const User = new UserModel(Database);
    const Product = new ProductModel(Database);
    const Category = new CategoryModel(Database);
    const Transaction = new TransactionModel(Database);

    socket.on('fetchDashboardData', async () => {
        try {
            const productCount = await Product.count();
            const categoryCount = await Category.count();
            const totalTransactionAmount = await Transaction.getTotalAmount();
            const transactionRange = await Transaction.getDateRange();
            const recentTransactions = await Transaction.getRecentTransactions(7);

            socket.emit('dashboardData', {
                productCount,
                categoryCount,
                totalTransactionAmount,
                transactionRange,
                recentTransactions
            });
        } catch (err) {
            console.error('[Dashboard Error]:', err);
            socket.emit('dashboardError', 'Failed to load dashboard data.');
        }
    });
};
