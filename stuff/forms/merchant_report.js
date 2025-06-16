// Renders the container section with breadcrumb
function renderReportContainer(targetId = 'afrobuild_merchant_report_page_form_display') {
    $('.afrobuild_main_page_breadcrumb_navigation').html('');
    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="${targetId}"></div>
            </div>
        </div>
    `;
}

// Renders the filter form
function renderReportForm({
    formClass = 'afrobuild_merchant_report_form',
    dropdownClass = 'afrobuild_merchant_report_dropdown',
    dateRangeClass = 'afrobuild_merchant_report_date_range',
    dateInputClass = 'afrobuild_merchant_report_date',
    submitBtnClass = 'afrobuild_merchant_report_form_btn',
    displayContainerClass = 'afrobuild_merchant_report_display_page'
} = {}) {
    return `
        <div class="row">
            <div class="col-md-12 mt-3">
                <div class="stat-card p-4">
                    <form class="card-body ${formClass}" method="post">
                        <div class="row">
                            <div class="col-md-5 col-sm-6">
                                <div class="form-group">
                                    <label>Merchant</label>
                                    <select class="form-control ${dropdownClass}">
                                        <option value="" selected>Select Merchant</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-5 col-sm-6">
                                <div class="form-group">
                                    <label>Pick Date in Range</label>
                                    <div class="form-control ${dateRangeClass}">
                                        <i class="icon-calendar2"></i>&nbsp;<span></span> <i class="icon-caret-down"></i>
                                        <input class="hide ${dateInputClass}" type="text">
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="mt-4">
                                    <button type="submit" class="btn afrobuild_btn ${submitBtnClass}">
                                        <i class="icon-stats-dots mr-2"></i> Run Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 mt-4 ${displayContainerClass}"></div>
        </div>
    `;
}

// Renders the merchant report
function MerchantReportPage(data) {
    const logo = `
        <img src="assets/img/logo.svg" class="img-fluid" alt="Logo" style="max-width: 180px;">
    `;

    const htmlTable = data.data.length > 0
        ? data.data.map(item => `
            <tr>
                <td>${item.merchantid}</td>
                <td>${item.name.toUcwords()}</td>
                <td>${item.email ? item.email : 'N/A'}</td>
                <td>${item.phone ? item.phone : 'N/A'}</td>
                <td>${item.location ? item.location : 'N/A'}</td>
                <td>${item.address ? item.address : 'N/A'}</td>
                <td>${item.date_time.fullDate()}</td>
            </tr>
        `).join('')
        : `<tr><td colspan="7" class="text-center text-muted py-4">No merchants found.</td></tr>`;

    return `
        <div class="stat-card shadow-sm border rounded-lg p-4 mb-5 bg-white">
            <div id="afrobuild_report_print_div">

                <!-- Header -->
                <div class="d-flex justify-content-between flex-wrap align-items-start mb-4">
                    <div>
                        <h4 class="text-dark mb-1">Merchant Report</h4>
                        <p class="text-muted" style="font-size: 14px;">Detailed merchant summary</p>
                    </div>
                    <div class="text-end">
                        <div class="mb-2">${logo}</div>
                        <div class="text-muted small">
                            ${data.setupData.address}<br>
                            ${data.setupData.email}<br>
                            ${data.setupData.phone}
                        </div>
                    </div>
                </div>

                <!-- Report Period -->
                <div class="mb-4">
                    <div class="bg-light border rounded p-3">
                        <div class="fw-semibold text-success mb-1" style="font-size: 14px;">Report Period</div>
                        <div class="text-muted" style="font-size: 13px;">
                            <strong>From:</strong> ${data.dateRange[0].fullDate()} &nbsp;&nbsp;
                            <strong>To:</strong> ${data.dateRange[1].fullDate()}
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="table-responsive">
                    <table id="merchant_table" class="table table-bordered table-striped table-hover" style="font-size: 13px;">
                        <thead class="bg-success text-white">
                            <tr>
                                <th>Merchant ID</th>
                                <th>Merchant</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Location</th>
                                <th>Address</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>${htmlTable}</tbody>
                    </table>
                </div>

                <!-- Action Buttons -->
                <div class="card mt-4 shadow-sm border no-print">
                    <div class="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div class="text-muted small">
                            <i class="icon-info me-1"></i> Report Actions
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            <button type="button" class="btn btn-outline-dark afrobuild_report_close_btn">
                                <i class="icon-close2 me-1"></i> Close
                            </button>
                            <button type="button" class="btn btn-outline-success" onclick="printContent('afrobuild_report_print_div')">
                                <i class="icon-printer me-1"></i> Print
                            </button>
                            <button type="button" class="btn btn-outline-info" onclick="exportHTMLTableToCSV('merchant_table', 'merchant_report.csv')">
                                <i class="icon-file-text me-1"></i> CSV
                            </button>
                            <button type="button" class="btn btn-outline-primary" onclick="exportHTMLTableToExcel('merchant_table', 'merchant_report.xlsx')">
                                <i class="icon-file-excel me-1"></i> Excel
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}



// Auto-load page
(() => {
    const containerHTML = renderReportContainer();
    $('#afrobuild_main_content_display').html(containerHTML);

    const formHtml = renderReportForm();
    $('#afrobuild_merchant_report_page_form_display').html(formHtml);

    if (typeof addPageScript === 'function') {
        addPageScript('app/merchantReportAjax');
    } else {
        console.warn('addPageScript is not defined');
    }
})();
