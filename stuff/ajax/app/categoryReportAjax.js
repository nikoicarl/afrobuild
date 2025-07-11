$(document).ready(function () {
    // Initialize date range picker
    startDateRangePicker('.afrobuild_category_report_date_range', '.afrobuild_category_report_date');
    const setupData = JSON.parse($('.hidden_setup_data').val());

    // Load category dropdown
    loadCategoryDropdown();

    // Handle form submission
    $(document).on('submit', 'form.afrobuild_category_report_form', function (e) {
        e.preventDefault();

        const $form = $(this);
        const categoryValue = $('.afrobuild_category_report_dropdown', $form).val() || '';
        const dateRange = $('.afrobuild_category_report_date', $form).val();
        const category = categoryValue.trim() ? categoryValue.split("**")[0] : '';

        // Set loading state on submit button
        const $submitBtn = $('.afrobuild_category_report_form_btn');
        $submitBtn.html('<div class="mr-2 spinner-border align-self-center loader-sm"></div>').attr('disabled', true);

        // Remove any existing listeners
        socket.off('runReport');
        socket.off(`${melody.melody1}_category_report`);

        // Emit report request
        setTimeout(() => {
            socket.emit('runReport', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: 'category_report',
                category: category,
                date_range: dateRange
            });
        }, 500);

        // Handle socket response
        socket.on(`${melody.melody1}_category_report`, function (data) {
            if (data.type === "error" || data.type === "caution") {
                Swal.fire({
                    icon: data.type === "error" ? 'error' : 'warning',
                    text: data.message,
                    confirmButtonColor: '#3085d6',
                    padding: '1em'
                });
            } else {
                const pageHtml = CategoryReportPage({
                    data: data.data,
                    setupData,
                    dateRange: dateRange.split("**"),
                    category: categoryValue
                });

                $('.afrobuild_category_report_display_page').html(pageHtml);
            }

            // Reset submit button
            $submitBtn.html('<i class="icon-stats-dots mr-2"></i> Run Report').removeAttr('disabled');
            socket.off(`${melody.melody1}_category_report`);
        });
    });

    // Handle report close button
    $(document).on('click', 'button.afrobuild_report_close_btn', function (e) {
        e.preventDefault();
        $('.afrobuild_category_report_display_page').empty();
        $('.afrobuild_category_report_dropdown').val('').change();
    });

    // Load dropdown
    function loadCategoryDropdown() {
        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "category"
        });

        socket.on(`${melody.melody1}_category`, function (data) {
            const $select = $('.afrobuild_category_report_dropdown');
            $select.html(`<option value="" selected>Select Category</option>`);

            if (data.type === "error") {
                console.warn(data.message);
                return;
            }

            data.forEach(item => {
                const optionValue = `${item.categoryid}`;
                $select.append(`<option value="${optionValue}">${item.name}</option>`);
            });

            makeAllSelectLiveSearch('afrobuild_category_report_dropdown', 'Select Category');
        });
    }
});
