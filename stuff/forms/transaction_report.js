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
    let logo, revenueTotal = 0, expenditureTotal = 0;
    logo = `<img src="assets/img/default.png" style="max-width: 100%; height: auto;"/>`;

    let htmlTable = `
        <table class="table table-striped" width="100%">
            <thead>
                <tr class="afrobuild-bg-primary">
                    <th style="font-size:12px;" class="text-white"> ${data.type == 'monthly' ? 'Month' : 'Year'} </th>
                    <th style="font-size:12px;" class="text-white"> Revenue </th>
                    <th style="font-size:12px;" class="text-white"> Expenditure </th>
                    <th style="font-size:12px;" class="text-white"> Gross Transaction </th>
                </tr>
            </thead>
            <tbody>
    `;

    if (data.data.length > 0) {
        for (let i = 0; i < data.data.length; i++) {
            const item = data.data[i];
            revenueTotal += Number(item.revenueTotal);
            expenditureTotal += Number(item.expenditureTotal);
            htmlTable += `
                <tr>
                    <td class="">${data.type == 'monthly' ? item.month.toUcwords() : item.year}</td>
                    <td class="">${formatNumber(Number(item.revenueTotal))}</td>
                    <td class="">${formatNumber(Number(item.expenditureTotal))}</td>
                    <td class="">${formatNumber(Number(item.revenueTotal) - Number(item.expenditureTotal))}</td>
                </tr>
            `;
        }
        htmlTable += `
            <tr> 
                <td> <b>SUBTOTAL:</b> </td>
                <td class="text-warning text-bold"> ${data.setupData.currency.toUpperCase()} ${formatNumber(Number(revenueTotal))} </td>
                <td class="text-danger text-bold"> ${data.setupData.currency.toUpperCase()} ${formatNumber(Number(expenditureTotal))} </td>
                <td class="text-success text-bold"> ${data.setupData.currency.toUpperCase()} ${formatNumber(Number(revenueTotal) - Number(expenditureTotal))} </td>
            </tr>
        `;
    } else {
        htmlTable += `<tr> <td colspan="5"> No data found. </td></tr>`;
    }
    htmlTable += `
            </tbody>
        </table>
    `;
    
    return `
        <div class="card">
            <div class="card-body" id="afrobuild_report_print_div">
                <div class="row ">
                    <div class="col-sm-12 col-md-6"><h4 style="font-size: 32px; font-weight: 700; color: #0e1726;">TRANSACTION REPORT</h4></div>
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
                        <p class="d-block afrobuild-primary" style="font-size: 14px;font-weight: 600;">REPORT DETAILS</p>
                        <p class="d-block text-muted" style="font-size: 13px;"><b>Type:</b> ${data.type == null || data.type == '' || data.type == undefined ? '' : data.type.toUcwords()}</p>
                        <p class="d-block text-muted" style="font-size: 13px;"><b>From:</b> ${data.start_year}</p>
                        <p class="d-block text-muted" style="font-size: 13px;"><b>To:</b> ${data.end_year}</p>
                        <p class="d-block text-muted" style="font-size: 15px;"><b>Total Revenue:</b> <span class="text-warning">${data.setupData.currency.toUpperCase()} ${formatNumber(Number(revenueTotal))}</span></p>
                        <p class="d-block text-muted" style="font-size: 15px;"><b>Total Expenditure:</b> <span class="text-danger">${data.setupData.currency.toUpperCase()} ${formatNumber(Number(expenditureTotal))}</span></p>
                        <p class="d-block text-muted" style="font-size: 15px;"><b>Gross Transaction:</b> <span class="text-success">${data.setupData.currency.toUpperCase()} ${formatNumber(Number(revenueTotal) - Number(expenditureTotal))}</span></p>
                    </div>
                    <div class="col-md-6">
                        <div class="mt-3 text-right">
                            <p class="d-block afrobuild-primary" style="font-size: 14px;font-weight: 600;"> ${data.setupData.name.toUpperCase()} </p>
                            <p class="d-block text-muted" style="font-size: 13px;"> ${data.setupData.address} </p>
                            <p class="d-block text-muted" style="font-size: 13px;"> ${data.setupData.email_one} ${data.setupData.email_two == null || data.setupData.email_two == '' ? '' : ' | ' + data.setupData.email_two} </p>
                            <p class="d-block text-muted" style="font-size: 13px;"> ${data.setupData.phone_one} ${data.setupData.phone_two == null || data.setupData.phone_two == '' ? '' : ' | ' + data.setupData.phone_two} </p>
                        </div>
                    </div>
                </div>
                <div class="row  mt-4">
                    <div class="col-md-12 table-responsive">
                        ${htmlTable}
                    </div>
                </div>
                <div class="card-footer">
                    <div class="row">
                        <div class="col-md-12 text-right">
                            <button type="button" class="btn afrobuild-bg-primary-opacity afrobuild-primary mr-2 afrobuild_general_inflows_report_close_btn"><i class="icon-close2"></i> Close </button>
                            <button type="button" class="btn afrobuild-bg-primary mr-2" onclick="printContent('afrobuild_report_print_div', '');"><i class="icon-printer"></i> Print</button>
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
