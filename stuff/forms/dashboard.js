AddDashboardCss();
function AddDashboardCss() {
    let stylesheet = document.getElementById('afrobuild_external_stylesheet');
    stylesheet.href = 'assets/light_css/apexcharts.css';
    // let stylesheet1 = document.getElementById('afrobuild_external_stylesheet1');
    // stylesheet1.href = 'assets/light_css/dash_1.css';
    let stylesheet2 = document.getElementById('afrobuild_external_stylesheet2');
    stylesheet2.href = 'assets/light_css/dash_2.css';
}


function Dashboard() {
    $('.afrobuild_main_page_breadcrumb').html(`DASHBOARD`);
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <li class="mr-4">
            <div class="page-header">
                <div class="page-title">
                    <h3 class="text-white dashboard-month afrobuild_dashboard_date_month_display_breadcrumb"><i class="icon-calendar" style="font-size:17px;color:#fff;"></i> &nbsp; Month</h3>
                </div>
            </div>
        </li>
    `);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_dashboard_page_form_display"></div>
            </div>
        </div>
    `;
}

function ChartList() {
    return `
        <div class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="row widget-statistic">
                    <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                        <div class="widget widget-one_hybrid widget-engagement">
                            <div class="widget-heading">
                                <div class="row">
                                    <div class="col-2">
                                        <div class="w-icon">
                                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                                        </div>
                                    </div>
                                    <div class="col-10">
                                        <h4 class="wt-green text-right mt-2">INCOME IN (<span class="afrobuild_dashboard_currency_display"></span>)</h4>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_monthly_income">0.00</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-green">This Month</p></div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_monthly_target">0.00</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-green">Monthly Target </p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                        <div class="widget widget-one_hybrid widget-followers">
                            <div class="widget-heading">
                                <div class="row">
                                    <div class="col-2">
                                        <div class="w-icon">
                                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                        </div>
                                    </div>
                                    <div class="col-10">
                                        <h4 class="wt-blue text-right mt-2">INVOICE</h4>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_processed_invoice">0</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-blue">Processed</p></div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_processed_proforma">0</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-blue">Pro-Forma</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                        <div class="widget widget-one_hybrid widget-referral">
                            <div class="widget-heading">
                                <div class="row">
                                    <div class="col-2">
                                        <div class="w-icon text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round"
                                                class="feather feather-users">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="col-10">
                                        <h4 class="wt-red text-right mt-2">CLIENTS</h4>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_new_client">0</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-red">New</p></div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_all_clients">0</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-red">Total</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="row widget-statistic">
                    <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                        <div class="widget widget-one_hybrid widget-grey">
                            <div class="widget-heading">
                                <div class="row">
                                    <div class="col-2">
                                        <div class="w-icon">
                                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>                                
                                        </div>
                                    </div>
                                    <div class="col-10">
                                        <h4 class="wt-dark text-right mt-2">EXPENDITURE IN (<span class="afrobuild_dashboard_currency_display"></span>)</h4>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_monthly_expense">0.00</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-dark">This Month</p></div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_monthly_expense_target">0.00</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-dark">Monthly Target </p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                        <div class="widget widget-one_hybrid widget-orange">
                            <div class="widget-heading">
                                <div class="row">
                                    <div class="col-2">
                                        <div class="w-icon">
                                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                        </div>
                                    </div>
                                    <div class="col-10">
                                        <h4 class="wt-orange text-right mt-2">REQUISITION</h4>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_paid_requisitions">0</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-orange">Paid Requisition</p></div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_outstanding_requisitions">0</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-orange">Outstanding Requisitions</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                        <div class="widget widget-one_hybrid widget-purple">
                            <div class="widget-heading">
                                <div class="row">
                                    <div class="col-2">
                                        <div class="w-icon text-center">
                                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                                        </div>
                                    </div>
                                    <div class="col-10">
                                        <h4 class="wt-purple text-right mt-2">VENDORS</h4>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_new_vendors">0</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-purple">New</p></div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12 w-value afrobuild_dashboard_all_vendors">0</div>
                                    <div class="col-xl-12 col-sm-12 col-lg-12 col-md-12"><p class="wt-purple">Total</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xl-6 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="widget-four">
                    <div class="widget-heading">
                        <div class="row">
                            <div class="col-md-6">
                                <h5 class="afrobuild_dashboard_date_month_display">Month</h5>
                            </div>
                            <div class="col-md-6">
                                <h5 class="text-right">Inflows</h5>
                            </div>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div class="vistorsBrowser">
                            <div class="browser-list">
                                <div class="w-icon">
                                    <i class="icon-pie-chart5" style="font-size:17px;color:#0078FF;"></i>
                                </div>
                                <div class="w-browser-details">
                                    <div class="w-browser-info">
                                        <h6>Paid Invoices</h6>
                                        <p class="browser-count afrobuild_dashboard_invoice_payments">0.00</p>
                                    </div>
                                </div>
                            </div>
                            <div class="browser-list">
                                <div class="">
                                    <div class="w-icon">
                                        <i class="icon-credit-card  mt-1" style="font-size:18px;color:#C82D74;"></i>
                                    </div>
                                </div>
                                <div class="w-browser-details">
                                    <div class="w-browser-info">
                                        <h6>Total Collections</h6>
                                        <p class="browser-count afrobuild_dashboard_total_collections">0.00</p>
                                    </div>
                                </div>
                            </div>
                            <div class="browser-list">
                                <div class="w-icon">
                                    <i class="icon-coins" style="font-size:17px;color:#F5842D;"></i>
                                </div>
                                <div class="w-browser-details">
                                    <div class="w-browser-info">
                                        <h6>Outstanding Invoice Balance</h6>
                                        <p class="browser-count afrobuild_dashboard_outstanding_invoice_balance">0.00</p>
                                    </div>
                                </div>
                            </div>
                            <div class="browser-list">
                                <div class="w-icon mbg-green">
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1" style="font-size:17px; color:#678c2f;"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                                </div>
                                <div class="w-browser-details">
                                    <div class="w-browser-info">
                                        <h6>Overall Outstanding Balance</h6>
                                        <p class="browser-count afrobuild_dashboard_outstanding_balance">0.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-6 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="widget-four">
                    <div class="widget-heading">
                        <div class="row">
                            <div class="col-md-6">
                                <h5 class="afrobuild_dashboard_date_month_display">Month</h5>
                            </div>
                            <div class="col-md-6">
                                <h5 class="text-right">Outflows</h5>
                            </div>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div class="vistorsBrowser">
                            <div class="browser-list">
                                <div class="w-icon">
                                    <i class="icon-pie-chart5" style="font-size:17px;color:#0078FF;"></i>
                                </div>
                                <div class="w-browser-details">
                                    <div class="w-browser-info">
                                        <h6>Paid Payment Vouchers</h6>
                                        <p class="browser-count afrobuild_dashboard_paid_payment_voucher">0.00</p>
                                    </div>
                                </div>
                            </div>
                            <div class="browser-list">
                                <div class="">
                                    <div class="w-icon">
                                        <i class="icon-wallet mt-1" style="font-size:18px;color:#C82D74;"></i>
                                    </div>
                                </div>
                                <div class="w-browser-details">
                                    <div class="w-browser-info">
                                        <h6>Financial Obligation payments</h6>
                                        <p class="browser-count afrobuild_dashboard_financial_obligation_payments">0.00</p>
                                    </div>
                                </div>
                            </div>
                            <div class="browser-list">
                                <div class="w-icon">
                                    <i class="icon-coins" style="font-size:17px;color:#F5842D;"></i>
                                </div>
                                <div class="w-browser-details">
                                    <div class="w-browser-info">
                                        <h6>Outstanding Financial Obligation Balance</h6>
                                        <p class="browser-count afrobuild_dashboard_outstanding_financial_obligation_balance">0.00</p>
                                    </div>
                                </div>
                            </div>
                            <div class="browser-list">
                                <div class="w-icon mbg-green">
                                    <i class="icon-calculator3 " style="font-size:17px;color:#678c2f;"></i>
                                </div>
                                <div class="w-browser-details">
                                    <div class="w-browser-info">
                                        <h6>Total Debt</h6>
                                        <p class="browser-count afrobuild_dashboard_total_debt">0.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-xl-8 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="widget widget-four">
                    <div class="widget-heading">
                        <h5 class="">Monthly Revenue - Area Graph</h5>
                    </div>

                    <div class="widget-content">
                        <div class="tabs tab-content">
                            <div id="content_1" class="tabcontent"> 
                                <div id="afrobuild_dashboard_revenue_chart"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-4 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="widget widget-four">
                    <div class="widget-heading">
                        <h5 class="">Monthly Revenue - Donut</h5>
                    </div>
                    <div class="widget-content">
                        <div id="afrobuild_dashboard_revenue_donut"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function GhatofList() {
    return `
        <div class="row">
            <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                <div class="ghatofCard l-bg-cherry">
                    <div class="card-statistic-3 p-4">
                        <div class="card-icon card-icon-large">
                            <i class="icon-briefcase3"></i>
                        </div>
                        <div class="mb-4">
                            <h5 class="card-title text-white mb-0">
                                Number of Trade Associations
                            </h5>
                        </div>
                        <div class="row align-items-center mb-2 d-flex">
                            <div class="col-8">
                                <h2 class="d-flex align-items-center text-white  mb-0">
                                    <span class="afrobuild_dashboard_ta_count">0</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                <div class="ghatofCard l-bg-blue-dark">
                    <div class="card-statistic-3 p-4">
                        <div class="card-icon card-icon-large">
                            <i class="icon-office"></i>
                        </div>
                        <div class="mb-4">
                            <h5 class="card-title text-white mb-0">
                                Number of Businesses
                            </h5>
                        </div>
                        <div class="row align-items-center mb-2 d-flex">
                            <div class="col-8">
                                <h2 class="d-flex align-items-center text-white  mb-0">
                                    <span class="afrobuild_dashboard_business_count">0</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                <div class="ghatofCard l-bg-green-dark">
                    <div class="card-statistic-3 p-4">
                        <div class="card-icon card-icon-large">
                            <i class="icon-versions"></i>
                        </div>
                        <div class="mb-4">
                            <h5 class="card-title text-white mb-0">
                                Number of Regions
                            </h5>
                        </div>
                        <div class="row align-items-center mb-2 d-flex">
                            <div class="col-8">
                                <h2 class="d-flex align-items-center text-white  mb-0">
                                    <span class="afrobuild_dashboard_region_count">0</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                <div class="ghatofCard l-bg-orange-dark">
                    <div class="card-statistic-3 p-4">
                        <div class="card-icon card-icon-large">
                            <i class="icon-tree7"></i>
                        </div>
                        <div class="mb-4">
                            <h5 class="card-title text-white mb-0">
                                Services Offered
                            </h5>
                        </div>
                        <div class="row align-items-center mb-2 d-flex">
                            <div class="col-8">
                                <h2 class="d-flex align-items-center text-white  mb-0">
                                    <span class="afrobuild_dashboard_service_count">0</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                <div class="ghatofCard l-bg-purple-dark">
                    <div class="card-statistic-3 p-4">
                        <div class="card-icon card-icon-large">
                            <i class="icon-city"></i>
                        </div>
                        <div class="mb-4">
                            <h5 class="card-title text-white mb-0">
                                Number of Districts
                            </h5>
                        </div>
                        <div class="row align-items-center mb-2 d-flex">
                            <div class="col-8">
                                <h2 class="d-flex align-items-center text-white  mb-0">
                                    <span class="afrobuild_dashboard_district_count">0</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12">
                <div class="ghatofCard l-bg-dark-grey">
                    <div class="card-statistic-3 p-4">
                        <div class="card-icon card-icon-large">
                            <i class="icon-users4"></i>
                        </div>
                        <div class="mb-4">
                            <h5 class="card-title text-white mb-0">
                                Number of Members
                            </h5>
                        </div>
                        <div class="row align-items-center mb-2 d-flex">
                            <div class="col-8">
                                <h2 class="d-flex align-items-center text-white  mb-0">
                                    <span class="afrobuild_dashboard_member_count">0</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function Activities() {
    return `
        <div class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="widget widget-activity-three">
                    <div class="widget-heading">
                        <h5 class="">Activities</h5>
                    </div>
                    <div class="widget-content">
                        <div class="mt-container mx-auto">
                            <div class="timeline-line">
                                <div class="afrobuild_dashboard_session_activity"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

(()=>{
    let html = ejs.render(Dashboard(), {});
    $('#afrobuild_main_content_display').html(html);

    //Add page ajax file(s)
    addExternalScript('assets/js/apexcharts.min.js');
    addPageScript('administration/dashboardAjax');
})();