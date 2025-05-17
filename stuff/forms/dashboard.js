
function Dashboard() {
    setBreadcrumb('Dashboard', 'fas fa-home');

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_dashboard_page_form_display"></div>
            </div>
        </div>
    `;
}


function StatsAndTransTable() {
    return `
        <div class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-title">Total no. of Products/Services</div>
                            <div class="stat-value">1200</div>
                            <div class="stat-subtitle">in 12 categories</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-title">Total no. of Merchants</div>
                            <div class="stat-value">150</div>
                            <div class="stat-subtitle">From 8 regions in Ghana</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
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
                                    <th><input type="checkbox"></th>
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
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-done">Done</td>
                                </tr>
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-done">Done</td>
                                </tr>
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-pending">Pending</td>
                                </tr>
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-done">Done</td>
                                </tr>
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-done">Done</td>
                                </tr>
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-failed">Failed</td>
                                </tr>
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-failed">Failed</td>
                                </tr>
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-done">Done</td>
                                </tr>
                                <tr>
                                    <td><input type="checkbox"></td>
                                    <td>AF1032993</td>
                                    <td>Cement</td>
                                    <td>Building</td>
                                    <td>Kofi Owusu</td>
                                    <td>12/03/23</td>
                                    <td>Jane Doe</td>
                                    <td>₵ 300.00</td>
                                    <td class="status-done">Done</td>
                                </tr>
                            </tbody>
                        </table>
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
    addPageScript('app/dashboardAjax');
})();