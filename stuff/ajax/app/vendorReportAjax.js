$(document).ready(function () {
    // Initialize date range picker
    startDateRangePicker('.afrobuild_vendor_report_date_range', '.afrobuild_vendor_report_date');
    const setupData = JSON.parse($('.hidden_setup_data').val());

    // Load vendor dropdown
    loadVendorDropdown();

    // Handle form submission
    $(document).on('submit', 'form.afrobuild_vendor_report_form', function (e) {
        e.preventDefault();

        const $form = $(this);
        const vendorValue = $('.afrobuild_vendor_report_dropdown', $form).val() || '';
        const dateRange = $('.afrobuild_vendor_report_date', $form).val();
        const vendor = vendorValue.trim() ? vendorValue.split("**")[0] : '';

        // Set loading state on submit button
        const $submitBtn = $('.afrobuild_vendor_report_form_btn');
        $submitBtn.html('<div class="mr-2 spinner-border align-self-center loader-sm"></div>').attr('disabled', true);

        // Remove any existing listeners
        socket.off('runReport');
        socket.off(`${melody.melody1}_vendor_report`);

        // Emit report request
        setTimeout(() => {
            socket.emit('runReport', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: 'vendor_report',
                vendor: vendor,
                date_range: dateRange
            });
        }, 500);

        // Handle socket response
        socket.on(`${melody.melody1}_vendor_report`, function (data) {
            if (data.type === "error" || data.type === "caution") {
                Swal.fire({
                    icon: data.type === "error" ? 'error' : 'warning',
                    text: data.message,
                    confirmButtonColor: '#3085d6',
                    padding: '1em'
                });
            } else {
                const pageHtml = VendorReportPage({
                    data: data.data,
                    setupData,
                    dateRange: dateRange.split("**"),
                    vendor: vendorValue
                });

                $('.afrobuild_vendor_report_display_page').html(pageHtml);
            }

            // Reset submit button
            $submitBtn.html('<i class="icon-stats-dots mr-2"></i> Run Report').removeAttr('disabled');
            socket.off(`${melody.melody1}_vendor_report`);
        });
    });

    // Handle report close button
    $(document).on('click', 'button.afrobuild_report_close_btn', function (e) {
        e.preventDefault();
        $('.afrobuild_vendor_report_display_page').empty();
        $('.afrobuild_vendor_report_dropdown').val('').change();
    });

    // Load dropdown
    function loadVendorDropdown() {
        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "vendor"
        });

        socket.on(`${melody.melody1}_vendor`, function (data) {
            const $select = $('.afrobuild_vendor_report_dropdown');
            $select.html(`<option value="" selected>Select Vendor</option>`);

            if (data.type === "error") {
                console.warn(data.message);
                return;
            }

            data.forEach(item => {
                const optionValue = `${item.vendorid}`;
                $select.append(`<option value="${optionValue}">${item.name}</option>`);
            });

            makeAllSelectLiveSearch('afrobuild_vendor_report_dropdown', 'Select Vendor');
        });
    }
});
