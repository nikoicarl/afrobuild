$(document).ready(function () { 
    const socket = io();

    // Handle login form submission
    $('.afrobuild-login-submit').submit(function (e) {
        e.preventDefault();

        const username = $('.username', this).val();
        const password = $('.password', this).val();

        // Set submit button to loading state
        const $submitBtn = $('.afrobuild-login-form-btn');
        $submitBtn.html('<div class="spinner-border align-self-center loader-sm" role="status"></div>');
        $submitBtn.attr('disabled', true);

        setTimeout(() => {
            socket.emit('system_login', {
                username: username,
                password: password
            });
        }, 500);

        // Handle login response
        socket.on('_system_login', (data) => {
            if (data.type === "success") {
                Swal.fire({
                    title: 'Success',
                    text: data.message,
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000
                });

                const melody = {
                    melody1: data.melody1,
                    melody2: data.melody2
                };

                window.localStorage.setItem('melody', JSON.stringify(melody));

                const queryString = window.location.search;
                const pubMedQuery = (queryString.includes("pub") && queryString.includes("med")) 
                    ? queryString 
                    : `?pub=${melody.melody2}&med=${melody.melody1}`;
                
                window.location.replace("/dashboard" + pubMedQuery + "&evn=dash");
            } else {
                Swal.fire({
                    title: data.type === "caution" ? 'Caution' : 'Error',
                    text: data.message,
                    icon: data.type === "caution" ? 'warning' : 'error',
                    showConfirmButton: false,
                    timer: 3000
                });
            }

            $submitBtn.html('Sign In');
            $submitBtn.removeAttr('disabled');
            $('.password').val('');
        });
    });

    // Toggle password visibility
    $(document).on("click", "path.ovasyte_login_clear_btn", function () {
        const passwordInput = $('#password');
        const inputType = passwordInput.attr('type');

        passwordInput.attr('type', inputType === 'password' ? 'text' : 'password');
    });

    // Redirect on error from hidden error field
    const hiddenError = $('.afrobuild_hidden_url_error').val();
    try {
        const err = JSON.parse(hiddenError);
        if (err.error) {
            window.location.replace("/" + window.location.search);
        }
    } catch (e) {
        console.warn("Invalid JSON in hidden error field");
    }
});
