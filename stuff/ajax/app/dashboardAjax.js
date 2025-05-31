$(document).ready(function () {
    socket.emit('table', {
        melody1: melody.melody1,
        melody2: melody.melody2,
        param: 'transaction_table'
    });

    socket.on('dash_transaction_table', function (data) {
        if (data.type === 'error') {
            console.error('Transaction Load Error:', data.message);
        } else {
            // Render your EJS or HTML table with the transaction data
            console.log('Transaction Table Data:', data);
        }
    });
});
