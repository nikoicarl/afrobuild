$(document).ready(function () {
    // Initialize date range picker
    startDateRangePicker('.afrobuild_category_report_date_range', '.afrobuild_category_report_date');

    // Load category dropdown
    loadCategoryDropdown();

    // Handle form submission
    $(document).on('submit', 'form.afrobuild_category_report_form', function (e) {
        e.preventDefault();

        const $form = $(this);
        const categoryValue = $('.afrobuild_category_report_category', $form).val() || '';
        const dateRange = $('.afrobuild_category_report_date', $form).val();

        const category = categoryValue.trim() ? categoryValue.split("**")[0] : '';

        // Set loading state on submit button
        const $submitBtn = $('.afrobuild_category_report_form_btn');
        $submitBtn.html('<div class="mr-2 spinner-border align-self-center loader-sm"></div>').attr('disabled', true);

        // Clean up any previous socket listeners
        socket.off('runPosReport');
        socket.off(`${melody.melody1}_category_report`);

        // Emit the report request
        setTimeout(() => {
            socket.emit('runPosReport', {
                melody1: melody.melody1,
                melody2: melody.melody2,
                param: 'category_report',
                category,
                date_range: dateRange
            });
        }, 500);

        // Handle the response
        socket.on(`${melody.melody1}_category_report`, function (data) {
            if (data.type === "error" || data.type === "caution") {
                swal({
                    text: data.message,
                    type: data.type === "error" ? 'error' : 'warning',
                    padding: '1em'
                });
            } else {
                const pageHtml = data.reportType === 'category'
                    ? CategoryReportPageCategory({
                        data: data.data,
                        setupData,
                        dateRange: dateRange.split("**"),
                        category: categoryValue
                    })
                    : CategoryReportPage({
                        data: data.data,
                        setupData,
                        dateRange: dateRange.split("**"),
                        category: categoryValue
                    });

                $('.afrobuild_category_report_display_page').html(pageHtml);
            }

            // Reset button
            $submitBtn.html('<i class="icon-stats-dots mr-2"></i> Run Report').removeAttr('disabled');
            socket.off(`${melody.melody1}_category_report`);
        });
    });

    // Handle report close
    $(document).on('click', 'button.afrobuild_report_close_btn', function (e) {
        e.preventDefault();
        $('.afrobuild_category_report_display_page').empty();
        $('.afrobuild_category_report_type, .afrobuild_category_report_category').val('').change();
    });

    // Load category dropdown
    function loadCategoryDropdown() {
        socket.emit('dropdown', {
            melody1: melody.melody1,
            melody2: melody.melody2,
            param: "category"
        });

        socket.on(`${melody.melody1}_category`, function (data) {
            const $select = $('.afrobuild_category_report_category');
            $select.html(`<option value="" selected>Select Category</option>`);

            if (data.type === "error") {
                console.warn(data.message);
                return;
            }

            data.forEach(item => {
                const optionValue = `${item.categoryid}**${item.name}**${item.phone}**${item.email}**${item.address}`;
                $select.append(`<option value="${optionValue}">${item.name.toUcwords()}</option>`);
            });

            makeAllSelectLiveSearch('afrobuild_category_report_category', 'Select Category');
        });
    }
});
