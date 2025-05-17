function Dashboard() {
    setBreadcrumb('Dashboard', 'fas fa-home');

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_dashboard_page_form_display">
                    ${StatsAndTransTable()}
                </div>
            </div>
        </div>
    `;
}
