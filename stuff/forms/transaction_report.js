// Renders the transaction container section with breadcrumb
function renderTransactionContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(``);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_transaction_report_page_form_display"></div>
            </div>
        </div>
    `;
}


function renderTransactionForm() {
    return `
        <div class="row">
            <div class="col-md-12 mt-3">
                <div class="stat-card p-4">
                    <form class="card-body afrobuild_transaction_report_form" method="post">
                        <div class="row">
                            <div class="col-md-5 col-sm-6">
                                <div class="form-group">
                                    <label>Transaction </label>
                                    <select class="form-control afrobuild_transaction_report_dropdown">
                                        <option value="" selected> Select Transaction </option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-5 col-sm-6">
                                <div class="form-group">
                                    <label>Pick Date in Range </label>
                                    <div class="form-control afrobuild_transaction_report_date_range">
                                        <i class="icon-calendar2"></i>&nbsp;
                                        <span></span> <i class="icon-caret-down"></i>
                                        <input class="hide afrobuild_transaction_report_date" type="text">
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="mt-4">
                                    <button type="submit" class="  btn afrobuild_btn afrobuild_transaction_report_form_btn "><i class="icon-stats-dots mr-2"></i>  Run Report</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12 mt-4 afrobuild_transaction_report_display_page"></div>
        </div>
    `;
}

function TransactionReportPage(data) {
    const logo = `<img src="assets/img/logo.svg" class="img-fluid" alt="Logo" style="max-width: 220px; display: block; margin: 0; padding: 0;">`;

    let htmlTable = '';

    if (data.data.length > 0) {
        data.data.forEach(item => {
            htmlTable += `
                <tr>
                    <td>${item.transactionid}</td>
                    <td>${item.item_name}</td>
                    <td>${Number(item.item_price).toLocaleString('en-GH', {
                        style: 'currency',
                            currency: 'GHS'
                        })}
                    </td>
                    <td>${item.merchant_name}</td>
                    <td>${item.category_name}</td>
                    <td>${item.full_name}</td>
                    <td>${item.datetime.fullDate()}</td>
                </tr>
            `;
        });
    } else {
        htmlTable = `<tr><td colspan="6" class="text-center text-muted py-4">No transactions found.</td></tr>`;
    }

    return `
        <div class="stat-card shadow-sm border rounded-lg p-4 mb-5 bg-white">
            <div id="afrobuild_report_print_div">

                <!-- Header -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h4 class="text-dark font-weight-bold mb-1">Transaction Report</h4>
                        <p class="text-muted" style="font-size: 14px;">Detailed transaction summary</p>
                    </div>
                    <div class="col-md-6 text-md-end">
                    <div class="d-inline-block text-end">
                        <div class="mb-3 mt-2 ml-3">
                            ${logo}
                        </div>
                        <div class="text-muted" style="font-size: 13px; line-height: 1.6;">
                            ${data.setupData.address}<br>
                            ${data.setupData.email}<br>
                            ${data.setupData.phone}
                        </div>
                    </div>
                </div>

                </div>

                <!-- Report Period -->
                <div class="row mb-3">
                    <div class="col-md-12">
                        <div class="bg-light border rounded p-3">
                            <p class="mb-1 text-success font-weight-bold" style="font-size: 14px;">Report Period</p>
                            <p class="text-muted mb-0" style="font-size: 13px;">
                                <strong>From:</strong> ${data.dateRange[0].fullDate()} &nbsp;&nbsp;
                                <strong>To:</strong> ${data.dateRange[1].fullDate()}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Transactions Table -->
                <div class="table-responsive">
                    <table class="table table-bordered table-striped table-hover" style="font-size: 13px;">
                        <thead style="background-color: #28a745;" class="text-white">
                            <tr>
                                <th>Transaction ID</th>
                                <th>Item</th>
                                <th>Amount</th>
                                <th>Merchant</th>
                                <th>Category</th>
                                <th>Customer</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${htmlTable}
                        </tbody>
                    </table>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex justify-content-end mt-4">
                    <button type="button" class="btn btn-outline-secondary afrobuild_report_close_btn">
                        <i class="icon-close2"></i> Close
                    </button>
                    <button type="button" class="btn btn-success  mr-2" onclick="printContent('afrobuild_report_print_div', '');">
                        <i class="icon-printer"></i> Print
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Immediately Invoked Function Expression (IIFE) to render the full transaction page
(() => {
    // Render breadcrumb and container layout
    const transactionContainerHTML = renderTransactionContainer();
    $('#afrobuild_main_content_display').html(transactionContainerHTML);

    // Inject the form into the dedicated div inside the container
    const formHtml = renderTransactionForm();
    $('#afrobuild_transaction_report_page_form_display').html(formHtml);

    // Load page-specific logic
    if (typeof addPageScript === 'function') {
        addPageScript('app/transactionReportAjax');
    } else {
        console.warn('addPageScript is not defined');
    }
})();
