$(document).ready(function () {
    // Initialize date range picker
    startDateRangePicker('.afrobuild_transaction_report_date_range', '.afrobuild_transaction_report_date');

    // Load transaction dropdown
    loadTransactionDropdown();

    // Handle form submission
    $(document).on('submit', 'form.afrobuild_transaction_report_form', function (e) {
        e.preventDefault();

        const $form = $(this);
        const transactionValue = $('.afrobuild_transaction_report_dropdown', $form).val() || '';
        const dateRange = $('.afrobuild_transaction_report_date', $form).val();

        const transaction = transactionValue.trim() ? transactionValue.split("**")[0] : '';

        // Set loading state on submit button
        const $submitBtn = $('.afrobuild_transaction_report_form_btn');
        $submitBtn.html('<div class="mr-2 spinner-border align-self-center loader-sm"></div>').attr('disabled', true);

        // Clean up any previous socket listeners
        socket.off('runPosReport');
        socket.off(`${melody.melody1}_transaction_report`);

        // Emit the report request
        setTimeout(() => {
            socket.emit('runPosReport', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: 'transaction_report',
                transaction,
                date_range: dateRange
            });
        }, 500);

        // Handle the response
        socket.on(`${melody.melody1}_transaction_report`, function (data) {
            if (data.type === "error" || data.type === "caution") {
                swal({
                    text: data.message,
                    type: data.type === "error" ? 'error' : 'warning',
                    padding: '1em'
                });
            } else {
                const pageHtml = data.reportType === 'transaction'
                    ? TransactionReportPageTransaction({
                        data: data.data,
                        setupData,
                        dateRange: dateRange.split("**"),
                        transaction: transactionValue
                    })
                    : TransactionReportPage({
                        data: data.data,
                        setupData,
                        dateRange: dateRange.split("**"),
                        transaction: transactionValue
                    });

                $('.afrobuild_transaction_report_display_page').html(pageHtml);
            }

            // Reset button
            $submitBtn.html('<i class="icon-stats-dots mr-2"></i> Run Report').removeAttr('disabled');
            socket.off(`${melody.melody1}_transaction_report`);
        });
    });

    // Handle report close
    $(document).on('click', 'button.afrobuild_report_close_btn', function (e) {
        e.preventDefault();
        $('.afrobuild_transaction_report_display_page').empty();
        $('.afrobuild_transaction_report_dropdown').val('').change();
    });

    // Load transaction dropdown
    function loadTransactionDropdown() {
        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "transaction"
        });

        socket.on(`${melody.melody1}_transaction`, function (data) {
            const $select = $('.afrobuild_transaction_report_dropdown');
            $select.html(`<option value="" selected>Select Transaction</option>`);

            if (data.type === "error") {
                console.warn(data.message);
                return;
            }

            data.forEach(item => {
                const optionValue = `${item.transactionid}`;
                $select.append(`<option value="${optionValue}">${item.transactionid}</option>`);
            });

            makeAllSelectLiveSearch('afrobuild_transaction_report_dropdown', 'Select Transaction');
        });
    }
});
