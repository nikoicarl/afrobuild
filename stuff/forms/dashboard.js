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
        <div class="modal fade afrobuild_transaction_action_modal" id="actionModal" tabindex="-1" role="dialog" aria-labelledby="actionModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md" role="document">
                <div class="modal-content shadow-sm border-0 rounded-3">
                    <div class="modal-header" style="background-color: #009345;">
                        <h5 class="modal-title text-white fw-semibold" id="actionModalLabel"></h5>
                        <button type="button" class="btn-close btn-close-white" data-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body px-4 py-3">
                        <form class="afrobuild_transaction_action_form">
                            <input type="hidden" class="afrobuild_transaction_hiddenid">
                            <input type="hidden" class="afrobuild_transaction_hidden_action">
                            
                            <div class="mb-3">
                                <label class="form-label fw-semibold">Product / Service</label>
                                <input type="text" class="form-control afrobuild_transaction_product" placeholder="Product Name" disabled>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-semibold">Message</label>
                                <textarea id="message" class="form-control afrobuild_transaction_action_msg" rows="4" placeholder="Enter a message..."></textarea>
                            </div>

                            <div class="d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-success afrobuild_action_submit_btn action_submit_btn">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function ViewModal() {
    return `
        <!-- Trigger Button (Hidden) -->
        <button type="button" class="afrobuild_transaction_view_modal hide" data-toggle="modal" data-target="#viewModal"></button>

        <!-- View Modal -->
        <div class="modal fade afrobuild_transaction_view_modal" id="viewModal" tabindex="-1" role="dialog" aria-labelledby="viewModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">

                    <!-- Modal Header -->
                    <div class="modal-header" style="background-color: #009345;">
                        <h5 class="modal-title text-white" id="viewModalLabel">Transaction Details</h5>
                    </div>

                    <!-- Modal Body -->
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Product / Service:</label>
                                <p class="form-control-plaintext afrobuild_view_product"></p>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Category:</label>
                                <p class="form-control-plaintext afrobuild_view_category"></p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Customer Name:</label>
                                <p class="form-control-plaintext afrobuild_view_customer"></p>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Merchant:</label>
                                <p class="form-control-plaintext afrobuild_view_merchant"></p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Date:</label>
                                <p class="form-control-plaintext afrobuild_view_date"></p>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Amount:</label>
                                <p class="form-control-plaintext afrobuild_view_amount"></p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <label class="form-label fw-bold">Message:</label>
                                <p class="form-control-plaintext afrobuild_view_reason"></p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12 mb-2">
                                <label class="form-label fw-bold">Status:</label>
                                <p class="form-control-plaintext afrobuild_view_status"></p>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">
                            Close
                        </button>
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

    html = ejs.render(ViewModal(), {});
    $('#afrobuild_main_content_display').append(html);

    // Load any dashboard-specific scripts
    addPageScript('app/dashboardAjax');
})();
