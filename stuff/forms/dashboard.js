// Renders the dashboard main layout container
function renderDashboardContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(``);
    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_dashboard_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders stats cards and recent transactions table
function renderStatsAndTransactionTable() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="stat-card card-products">
                            <div class="stat-title">Total no. of Products/Services</div>
                            <div class="stat-value">1200</div>
                            <div class="stat-subtitle">in 12 categories</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card card-merchants">
                            <div class="stat-title">Total no. of Merchants</div>
                            <div class="stat-value">150</div>
                            <div class="stat-subtitle">From 8 regions in Ghana</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card card-transactions">
                            <div class="stat-title">Total no. of Transactions</div>
                            <div class="stat-value">₵150,000,000.00</div>
                            <div class="stat-subtitle">From Aug 2023 to Mar 2025</div>
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    <div class="table-title">Recent Transactions</div>
                    <div class="table-responsive">
                        <table class="custom-table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Product/Service</th>
                                    <th>Category</th>
                                    <th>Customer Name</th>
                                    <th>Date</th>
                                    <th>Merchant Name</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${[...Array(9)].map((_, i) => {
                                    const statusClass = i === 5 || i === 6 ? 'status-failed' : (i === 2 ? 'status-pending' : 'status-done');
                                    return `
                                        <tr>
                                            <td>AF1032993</td>
                                            <td>Cement</td>
                                            <td>Building</td>
                                            <td>Kofi Owusu</td>
                                            <td>12/03/23</td>
                                            <td>Jane Doe</td>
                                            <td>₵ 300.00</td>
                                            <td class="${statusClass}">${statusClass.split('-')[1]}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
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

    // Inject stats and transactions into the dashboard section
    const statsAndTableHTML = renderStatsAndTransactionTable();
    $('#afrobuild_dashboard_page_form_display').html(statsAndTableHTML);

    // Load any dashboard-specific scripts
    addPageScript('app/dashboardAjax');
})();
