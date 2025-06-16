$(document).ready(function () {
    // Initialize date range picker
    startDateRangePicker('.afrobuild_merchant_report_date_range', '.afrobuild_merchant_report_date');
    const setupData = JSON.parse($('.hidden_setup_data').val());

    // Load merchant dropdown
    loadMerchantDropdown();

    // Handle form submission
    $(document).on('submit', 'form.afrobuild_merchant_report_form', function (e) {
        e.preventDefault();

        const $form = $(this);
        const merchantValue = $('.afrobuild_merchant_report_dropdown', $form).val() || '';
        const dateRange = $('.afrobuild_merchant_report_date', $form).val();
        const merchant = merchantValue.trim() ? merchantValue.split("**")[0] : '';

        // Set loading state on submit button
        const $submitBtn = $('.afrobuild_merchant_report_form_btn');
        $submitBtn.html('<div class="mr-2 spinner-border align-self-center loader-sm"></div>').attr('disabled', true);

        // Remove any existing listeners
        socket.off('runReport');
        socket.off(`${melody.melody1}_merchant_report`);

        // Emit report request
        setTimeout(() => {
            socket.emit('runReport', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: 'merchant_report',
                merchant: merchant,
                date_range: dateRange
            });
        }, 500);

        // Handle socket response
        socket.on(`${melody.melody1}_merchant_report`, function (data) {
            if (data.type === "error" || data.type === "caution") {
                Swal.fire({
                    icon: data.type === "error" ? 'error' : 'warning',
                    text: data.message,
                    confirmButtonColor: '#3085d6',
                    padding: '1em'
                });
            } else {
                const pageHtml = MerchantReportPage({
                    data: data.data,
                    setupData,
                    dateRange: dateRange.split("**"),
                    merchant: merchantValue
                });

                $('.afrobuild_merchant_report_display_page').html(pageHtml);
            }

            // Reset submit button
            $submitBtn.html('<i class="icon-stats-dots mr-2"></i> Run Report').removeAttr('disabled');
            socket.off(`${melody.melody1}_merchant_report`);
        });
    });

    // Handle report close button
    $(document).on('click', 'button.afrobuild_report_close_btn', function (e) {
        e.preventDefault();
        $('.afrobuild_merchant_report_display_page').empty();
        $('.afrobuild_merchant_report_dropdown').val('').change();
    });

    // Load dropdown
    function loadMerchantDropdown() {
        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "merchant"
        });

        socket.on(`${melody.melody1}_merchant`, function (data) {
            const $select = $('.afrobuild_merchant_report_dropdown');
            $select.html(`<option value="" selected>Select Merchant</option>`);

            if (data.type === "error") {
                console.warn(data.message);
                return;
            }

            data.forEach(item => {
                const optionValue = `${item.merchantid}`;
                $select.append(`<option value="${optionValue}">${item.name}</option>`);
            });

            makeAllSelectLiveSearch('afrobuild_merchant_report_dropdown', 'Select Merchant');
        });
    }
});
