// Renders the dashboard main layout container
function renderDashboardContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html('');
    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_dashboard_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders stats cards 
function renderStats(data) {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="stat-card card-products">
                            <div class="stat-title">Total no. of Products/Services</div>
                            <div class="stat-value">${data.productCount}</div>
                            <div class="stat-subtitle">in ${data.categoryCount} categories</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card card-transactions">
                            <div class="stat-title">Total no. of Transactions</div>
                            <div class="stat-value">${data.transactionCount}</div>
                            <div class="stat-subtitle">From All regions in Ghana</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card card-transactions">
                            <div class="stat-title">Total Value of Transactions</div>
                            <div class="stat-value">GHS ${formatNumber(data.totalTransactionAmount)}</div>
                            <div class="stat-subtitle">From Aug 2023 to Mar 2025</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renders the transaction table section
function renderTransactionTable() {
    return `
        <!-- BEGIN TRANSACTION TABLE -->
        <div class="row">
            <div class="col-md-12 mt-3">
                <div class="stat-card afrobuild_transaction_data_table_div">
                    <div class="search-wrapper">
                        <input type="text" id="afrobuild_transaction_general_search" class="search-input" placeholder="Search table...">
                        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <table class="afrobuild_transaction_data_table" style="text-align:left"></table>
                </div>
            </div>
        </div>
        <!-- END TRANSACTION TABLE -->
    `;
}

function renderActivities() {
    return `
        <div class="row " style="display : none;">
            <div class="col-md-12 mt-4">
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

function ActionModal() {
    return `
        <button type="button" class="afrobuild_transaction_action_modal hide" data-toggle="modal" data-target="#actionModal"></button>
        <div class="modal fade" id="actionModal" tabindex="-1" role="dialog" aria-labelledby="actionModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md" role="document">
                <div class="modal-content">
                    <div class="modal-header" style="background-color: #009345;">
                        <h5 class="modal-title text-white" id="actionModalLabel"></h5>
                    </div>
                    <div class="modal-body">
                        <form class="afrobuild_transaction_action_form">
                            <input type="hidden" class="afrobuild_transaction_hiddenid">
                            <input type="hidden" class="afrobuild_transaction_hidden_action">
                            <div class="row">
                                <div class="col-md-12 mt-2 mb-3">
                                    <label class="form-label"> Product / Service </label>
                                    <input type="text" class="form-control afrobuild_transaction_product" placeholder="Product Name" disabled>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12 mt-2 mb-3">
                                    <textarea id="message" class="form-control afrobuild_transaction_action_msg" rows="3" placeholder="Reason"></textarea>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 text-end">
                                    <button type="submit" class="btn afrobuild_btn afrobuild_action_submit_btn action_submit_btn" role="button">
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}


// Immediately Invoked Function Expression (IIFE) to render the dashboard
(() => {
    // Render the dashboard container
    const dashboardHTML = renderDashboardContainer();
    $('#afrobuild_main_content_display').html(dashboardHTML);


    html = ejs.render(ActionModal(), {});
    $('#afrobuild_main_content_display').append(html);

    // Load any dashboard-specific scripts
    addPageScript('app/dashboardAjax');
})();
