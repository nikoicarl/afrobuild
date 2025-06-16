$(document).ready(function () {
    // Initialize date range picker
    startDateRangePicker('.afrobuild_product_report_date_range', '.afrobuild_product_report_date');
    const setupData = JSON.parse($('.hidden_setup_data').val());

    // Load product dropdown
    loadProductDropdown();

    // Handle form submission
    $(document).on('submit', 'form.afrobuild_product_report_form', function (e) {
        e.preventDefault();

        const $form = $(this);
        const productValue = $('.afrobuild_product_report_dropdown', $form).val() || '';
        const dateRange = $('.afrobuild_product_report_date', $form).val();
        const product = productValue.trim() ? productValue.split("**")[0] : '';

        // Set loading state on submit button
        const $submitBtn = $('.afrobuild_product_report_form_btn');
        $submitBtn.html('<div class="mr-2 spinner-border align-self-center loader-sm"></div>').attr('disabled', true);

        // Remove any existing listeners
        socket.off('runReport');
        socket.off(`${melody.melody1}_product_report`);

        // Emit report request
        setTimeout(() => {
            socket.emit('runReport', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: 'product_report',
                product: product,
                date_range: dateRange
            });
        }, 500);

        // Handle socket response
        socket.on(`${melody.melody1}_product_report`, function (data) {
            if (data.type === "error" || data.type === "caution") {
                Swal.fire({
                    icon: data.type === "error" ? 'error' : 'warning',
                    text: data.message,
                    confirmButtonColor: '#3085d6',
                    padding: '1em'
                });
            } else {
                const pageHtml = ProductReportPage({
                    data: data.data,
                    setupData,
                    dateRange: dateRange.split("**"),
                    product: productValue
                });

                $('.afrobuild_product_report_display_page').html(pageHtml);
            }

            // Reset submit button
            $submitBtn.html('<i class="icon-stats-dots mr-2"></i> Run Report').removeAttr('disabled');
            socket.off(`${melody.melody1}_product_report`);
        });
    });

    // Handle report close button
    $(document).on('click', 'button.afrobuild_report_close_btn', function (e) {
        e.preventDefault();
        $('.afrobuild_product_report_display_page').empty();
        $('.afrobuild_product_report_dropdown').val('').change();
    });

    // Load dropdown
    function loadProductDropdown() {
        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "product"
        });

        socket.on(`${melody.melody1}_product`, function (data) {
            const $select = $('.afrobuild_product_report_dropdown');
            $select.html(`<option value="" selected>Select Product</option>`);

            if (data.type === "error") {
                console.warn(data.message);
                return;
            }

            data.forEach(item => {
                const optionValue = `${item.productid}`;
                $select.append(`<option value="${optionValue}">${item.name}</option>`);
            });

            makeAllSelectLiveSearch('afrobuild_product_report_dropdown', 'Select Product');
        });
    }
});
