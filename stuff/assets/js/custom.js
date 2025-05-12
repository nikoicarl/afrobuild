$(document).ready(function () {
    const socket = io();

    $(document).on('submit', 'form.business-setup-form', function (e) {
        e.preventDefault();

        const $form = $(this);

        // Extract form field values
        const name = $('#name', $form).val();
        const email = $('#email', $form).val();
        const mobile = $('#mobile', $form).val();
        const country = $('#country', $form).val();
        const region = $('#region', $form).val();
        const address = $('#address', $form).val();

        // Simple validation
        if (!email || !mobile || !country || !region || !address) {
            Swal.fire('Missing Info', 'Please fill in all required fields.', 'warning');
            return;
        }

        const $submitBtn = $('#submit', $form);
        $submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...');

        // Emit the form data via socket
        socket.emit('businessSetup', {
            name,
            email,
            mobile,
            country,
            region,
            address
        });

        // Handle server response
        socket.once('businessSetupResponse', function (data) { // Use .once to listen for the response just once
            if (data.type === 'success') {
                Swal.fire('Success', data.message || 'Business setup completed.', 'success');
                $form[0].reset(); // reset the form
            } else if (data.type === 'caution') {
                Swal.fire('Note', data.message || 'Something to be aware of.', 'warning');
            } else {
                Swal.fire('Error', data.message || 'Something went wrong.', 'error');
            }

            // Reset submit button
            $submitBtn.prop('disabled', false).html('Submit');
        });
    });
});
