module.exports = function (socket, ViewModel) {
    socket.on('fetchDashboardData', async () => {
        try {
            const productCount = await ViewModel._ProductModel.count();
            const categoryCount = await ViewModel._CategoryModel.count();
            const merchantCount = await ViewModel._UserModel.countMerchants();
            const regionCount = await ViewModel._UserModel.countRegions();
            const totalTransactionAmount = await ViewModel._TransactionModel.getTotalAmount();
            const transactionRange = await ViewModel._TransactionModel.getDateRange();
            const recentTransactions = await ViewModel._TransactionModel.getRecentTransactions(7);

            socket.emit('dashboardData', {
                productCount,
                categoryCount,
                merchantCount,
                regionCount,
                totalTransactionAmount,
                transactionRange,
                recentTransactions
            });
        } catch (err) {
            socket.emit('dashboardError', 'Failed to load dashboard data.');
        }
    });
};
