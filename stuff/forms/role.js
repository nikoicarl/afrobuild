// Renders the role container section with breadcrumb
function renderRoleContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <div class="page-header">
            <div class="page-title">
                <h3 class="afrobuild_btn" id="afrobuild_manage_role_table_btn" role="button" data-open="table">
                    View All Roles
                </h3>
            </div>
        </div>
    `);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_role_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders the role registration form (Role Name + Description only)
function renderRoleForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New Role</h4>
                    <form id="roleForm" novalidate>
                        <input type="hidden" id="role_hiddenid">

                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <input type="text" class="form-control" id="role_name" placeholder="Role Name" required>
                            </div>
                        </div>

                        <div class="row mt-2">
                            <div class="col-md-12 mb-3">
                                <textarea class="form-control" id="role_description" placeholder="Role Description" rows="3" required></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn role_submit_btn afrobuild_manage_role_submit_btn">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Renders the role table section
function RoleTable() {
    return `
        <!-- BEGIN ROLE TABLE -->
        <div class="row">
            <div class="col-md-12 mt-3">
                <div class="stat-card afrobuild_role_data_table_div">
                    <div class="search-wrapper">
                        <input type="text" id="afrobuild_role_general_search" class="search-input" placeholder="Search table...">
                        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    <table class="afrobuild_role_data_table" style="text-align:left"></table>
                </div>
            </div>
        </div>
        <!-- END ROLE TABLE -->
    `;
}

// Immediately Invoked Function Expression (IIFE) to render the full role page
(() => {
    // Render breadcrumb and container layout
    const roleContainerHTML = renderRoleContainer();
    $('#afrobuild_main_content_display').html(roleContainerHTML);

    // Inject the form into the dedicated div inside the container
    const formHtml = renderRoleForm();
    $('#afrobuild_role_page_form_display').html(formHtml);

    // Load page-specific logic
    if (typeof addPageScript === 'function') {
        addPageScript('app/roleAjax');
    } else {
        console.warn('addPageScript is not defined');
    }
})();
