$(function () {
    const socket = io();

    $(document).on('submit', 'form.business-setup-form', function (e) {
        e.preventDefault();

        const $form = $(this);
        const $submitBtn = $form.find('#submit');
        const requiredFields = ['name', 'email', 'mobile', 'country', 'region', 'address'];

        const formData = Object.fromEntries(
            requiredFields.map(field => [field, $form.find(`#${field}`).val().trim()])
        );

        if (requiredFields.some(field => !formData[field])) {
            return Swal.fire('Missing Info', 'Please fill in all required fields.', 'warning');
        }

        $submitBtn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...
        `);

        socket.emit('businessSetup', formData);

        socket.once('_businessSetup', ({ type = 'error', message, melody1, melody2 }) => {
            const icons = {
                success: 'success',
                caution: 'warning',
                error: 'error'
            };

            Swal.fire({
                title: type === 'success' ? 'Success' : type === 'caution' ? 'Note' : 'Error',
                text: message || 'Something happened.',
                icon: icons[type] || 'error',
                timer: 3000,
                showConfirmButton: false
            });

            if (type === 'success') {
                $form[0].reset();
                setTimeout(() => {
                    // Example redirect: window.location.href = `/dashboard/${melody2}`;
                    window.location.reload();
                }, 3000);
            } else {
                $submitBtn.prop('disabled', false).html('Submit');
            }
        });
    });
});
