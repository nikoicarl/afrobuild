$(document).ready(function () {
    const socket = io();

    

    // Handle user registration form submission
    $('#userForm').submit(function (e) {
        e.preventDefault();

        const userData = {
            first_name: $('#first_name').val().trim(),
            last_name: $('#last_name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim(),
            address: $('#address').val().trim(),
            username: $('#username').val().trim(),
            password: $('#password').val().trim(),
            confirm_password: $('#confirm_password').val().trim(),
            user_hiddenid: $('#user_hiddenid').val().trim(),
            melody1: melody.melody1,
            melody2: melody.melody2
        };

        // Set submit button to loading state
        const $submitBtn = $('.user_submit_btn');
        $submitBtn.html('<div class="spinner-border align-self-center loader-sm" role="status"></div>');
        $submitBtn.attr('disabled', true);

        setTimeout(() => {
            socket.emit('create_user', userData);

            // Dynamically listen to the expected response event
            socket.once(`${userData.melody1}_create_user`, function (res) {
                if (res.success) {
                    Swal.fire({
                        title: 'Success',
                        text: res.message || 'User created successfully!',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000
                    });
                    $('#userForm')[0].reset();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: res.message || 'Failed to create user.',
                        icon: 'error',
                        showConfirmButton: true
                    });
                }

                $submitBtn.html('Submit');
                $submitBtn.removeAttr('disabled');
            });
        }, 300);

    });
});
