// Renders the user container section with breadcrumb
function renderUserContainer() {
    $('.afrobuild_main_page_breadcrumb_navigation').html(`
        <div class="page-header">
            <div class="page-title">
                <h3 class="afrobuild_btn" id="afrobuild_manage_user_table_btn" role="button" data-open="table">
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
                                <button type="submit" class="btn afrobuild_btn afrobuild_manage_user_submit_btn user_submit_btn" role="button">Submit</button>
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
                <div class="stat-card afrobuild_user_data_table_div">
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
        <!-- END USER TABLE -->
    `;
}

function ActionModal() {
    return `
        <button type="button" class="afrobuild_user_action_modal hide" data-toggle="modal" data-target="#actionModal"></button>
        <div class="modal fade afrobuild_user_action_modal" id="actionModal" tabindex="-1" role="dialog" aria-labelledby="actionModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-md" role="document">
                <div class="modal-content shadow-sm border-0 rounded-3">
                    <div class="modal-header" style="background-color: #009345;">
                        <h5 class="modal-title text-white fw-semibold" id="actionModalLabel"></h5>
                        <button type="button" class="btn-close btn-close-white" data-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body px-4 py-3" style = "z-index:100;">
                        <form class="afrobuild_user_action_form">
                            <input type="hidden" class="afrobuild_user_hiddenid">
                            
                            <div class="mb-3">
                                <label class="mb-2 ml-1"> Role</label>
                                <select class="form-select afrobuild_user_role_select form-control" required>
                                    <option value="" disabled selected>Select User Role</option>
                                </select>
                            </div>

                            <div class="d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-success afrobuild_user_action_submit_btn action_submit_btn">
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

// Immediately Invoked Function Expression (IIFE) to render the full user page
(() => {
    // Render breadcrumb and container layout
    const userContainerHTML = renderUserContainer();
    $('#afrobuild_main_content_display').html(userContainerHTML);

    // Inject the form into the dedicated div inside the container
    const formHtml = renderUserForm();
    $('#afrobuild_user_page_form_display').html(formHtml);

    html = ejs.render(ActionModal(), {});
    $('#afrobuild_main_content_display').append(html);

    // Load page-specific logic
    if (typeof addPageScript === 'function') {
        addPageScript('app/userAjax');
    } else {
        console.warn('addPageScript is not defined');
    }
})();
