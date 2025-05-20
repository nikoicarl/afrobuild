// Renders the user container section
function User() {
    return `
        <div class="layout-px-spacing mb-5">
            <div class="row layout-top-spacing">
                <div class="col-md-12" id="afrobuild_user_page_form_display"></div>
            </div>
        </div>
    `;
}

// Renders the user registration form
function UserForm() {
    return `
        <div class="row">
            <div class="col-12 layout-spacing">
                <div class="stat-card p-4">
                    <h4 class="mb-4">Create New User</h4>
                    <form id="userForm" novalidate>
                        <input type="hidden" id="user_hiddenid" >
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
                                <input type="password" class="form-control" id="confirm_password" placeholder="Password" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12 text-end">
                                <button type="submit" class="btn afrobuild_btn user_submit_btn">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Immediately Invoked Function Expression (IIFE) to render the form
(() => {
    const formHtml = UserForm(); // No EJS rendering needed unless using EJS tags
    $('#afrobuild_main_content_display').html(formHtml);

    // Load page-specific scripts
    addPageScript('app/userAjax');
})();
