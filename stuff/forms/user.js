// Renders the user container section with breadcrumb
function renderUserContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <div class="page-header">
            <div class="page-title">
                <h3 class="afrobuild_btn grey" id="afrobuild_manage_user_table_btn" role="button" data-open="table">
                    View All Users
                </h3>
            </div>
        </div>
    `);

    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_user_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders the user registration form
function renderUserForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New User</h4>
                    <form id="userForm" novalidate>
                        <input type="hidden" id="user_hiddenid">

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" id="first_name" placeholder="First Name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="text" class="form-control" id="last_name" placeholder="Last Name" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <input type="email" class="form-control" id="email" placeholder="example@mail.com" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <input type="tel" class="form-control" id="phone" placeholder="Phone">
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 mb-3">
                                <textarea id="address" class="form-control" rows="3" placeholder="Address"></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" id="username" placeholder="Username" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <input type="password" class="form-control" id="password" placeholder="Password" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <input type="password" class="form-control" id="confirm_password" placeholder="Confirm Password" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn user_submit_btn" role="button">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Renders the user table section
function UserTable() {
    return `
        <!-- BEGIN USER TABLE -->
        <div class="row">
            <div class="col-md-12 mt-3">
                <div class="card">
                    <div class="card-body afrobuild_user_data_table_div">
                        <div class="search-wrapper">
                            <input type="text" id="afrobuild_user_general_search" class="search-input" placeholder="Search table...">
                            <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        <table class="afrobuild_user_data_table" style="text-align:left"></table>
                    </div>
                </div>
            </div>
        </div>
        <!-- END USER TABLE -->
    `;
}

// Immediately Invoked Function Expression (IIFE) to render the full user page
(() => {
    // Render breadcrumb and container layout
    const userContainerHTML = renderUserContainer();
    $('#afrobuild_main_content_display').html(userContainerHTML);

    // Inject the form into the dedicated div inside the container
    const formHtml = renderUserForm();
    $('#afrobuild_user_page_form_display').html(formHtml);

    // Load page-specific logic
    if (typeof addPageScript === 'function') {
        addPageScript('app/userAjax');
    } else {
        console.warn('addPageScript is not defined');
    }
})();
