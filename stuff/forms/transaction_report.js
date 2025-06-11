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
    let logo;
    logo = `<img src="assets/img/default.png" style="max-width: 100%; height: auto;"/>`;
    console.log(data);


    let htmlTable = ``;

    // if (data.data.length > 0) {
    //     for (let i = 0; i < data.data.length; i++) {
    //         const item = data.data[i];
            
    //         htmlTable += `
    //             <tr>
    //                 <td>${item.name}</td>
    //                 <td>${item.phone}</td>
    //                 <td>${item.email}</td>
    //                 <td>${item.address}</td>
    //             </tr>
    //         `;
    //     }
    // } else {
    //     htmlTable += `<tr> <td colspan="8"> No data found. </td></tr>`;
    // }

    return `
        <div class="card">
            <div class="card-body" id="ovasyte_report_print_div">
                <div class="row ">
                    <div class="col-sm-12 col-md-6"><h4 style="font-size: 32px; font-weight: 700; color: #0e1726;">SUPPLIER REPORT</h4></div>
                    <div class="col-sm-12 col-md-6 align-self-right text-right text-sm-right">
                        <div class="company-info float-right">
                            <div class="" style="width: 200px;">
                                ${logo}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <p class="d-block ovasyte-primary" style="font-size: 14px;font-weight: 600;">REPORT DETAILS</p>
                        <p class="d-block text-muted" style="font-size: 13px;"><b>From:</b> ${data.dateRange[0].fullDate()}</p>
                        <p class="d-block text-muted" style="font-size: 13px;"><b>To:</b> ${data.dateRange[1].fullDate()}</p>
                    </div>
                    <div class="col-md-6">
                        <div class="mt-3 text-right">
                            <p class="d-block ovasyte-primary" style="font-size: 14px;font-weight: 600;"> ${data.setupData.name.toUpperCase()} </p>
                            <p class="d-block text-muted" style="font-size: 13px;"> ${data.setupData.address} </p>
                            <p class="d-block text-muted" style="font-size: 13px;"> ${data.setupData.email_one} ${data.setupData.email_two == null || data.setupData.email_two == '' ? '' : ' | ' + data.setupData.email_two} </p>
                            <p class="d-block text-muted" style="font-size: 13px;"> ${data.setupData.phone_one} ${data.setupData.phone_two == null || data.setupData.phone_two == '' ? '' : ' | ' + data.setupData.phone_two} </p>
                        </div>
                    </div>
                </div>
                <div class="row  mt-4">
                    <div class="col-md-12 table-responsive">
                        <table class="table table-striped" width="100%">
                            <thead>
                                <tr class="ovasyte-bg-primary">
                                    <th style="font-size:12px;" class="text-white">Supplier</th>
                                    <th style="font-size:12px;" class="text-white">Phone</th>
                                    <th style="font-size:12px;" class="text-white">Email</th>
                                    <th style="font-size:12px;" class="text-white">Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${htmlTable}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="row">
                        <div class="col-md-12 text-right">
                            <button type="button" class="btn ovasyte-bg-primary-opacity ovasyte-primary mr-2 ovasyte_report_close_btn"><i class="icon-close2"></i> Close </button>
                            <button type="button" class="btn ovasyte-bg-primary mr-2" onclick="printContent('ovasyte_report_print_div', '');"><i class="icon-printer"></i> Print</button>
                        </div>
                    </div>
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
