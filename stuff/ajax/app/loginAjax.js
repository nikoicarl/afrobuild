$(document).ready(() => {
    const socket = io();

    $(document).on('submit', 'form.business-setup-form', function (e) {
        e.preventDefault();

        const $form = $(this);
        const $submitBtn = $form.find('#submit');

        const formData = getFormData($form, ['name', 'email', 'mobile', 'country', 'region', 'address']);

        if (isMissingRequiredFields(formData)) {
            Swal.fire('Missing Info', 'Please fill in all required fields.', 'warning');
            return;
        }

        showSubmitting($submitBtn);

        socket.emit('businessSetup', formData);

        socket.once('_businessSetup', (data) => handleResponse(data, $form, $submitBtn));
    });

    function getFormData($form, fields) {
        return fields.reduce((data, field) => {
            data[field] = $form.find(`#${field}`).val().trim();
            return data;
        }, {});
    }

    function isMissingRequiredFields(data) {
        return ['email', 'mobile', 'country', 'region', 'address'].some(key => !data[key]);
    }

    function showSubmitting($btn) {
        $btn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...
        `);
    }

    function resetButton($btn) {
        $btn.prop('disabled', false).html('Submit');
    }

    function handleResponse(data, $form, $submitBtn) {
        const types = {
            success: { icon: 'success', title: 'Success' },
            caution: { icon: 'warning', title: 'Note' },
            error: { icon: 'error', title: 'Error' }
        };

        const { type = 'error', message = 'Something happened.', melody1, melody2 } = data;
        const alertType = types[type] || types.error;

        Swal.fire({
            title: alertType.title,
            text: message,
            icon: alertType.icon,
            timer: 3000,
            showConfirmButton: false
        });

        if (type === 'success') {
            $form[0].reset();
            setTimeout(() => {
                // Example: redirect to dashboard or use melody values
                // window.location.href = `/welcome/${melody2}`;
                window.location.reload(); 
            }, 3000);
        } else {
            resetButton($submitBtn);
        }
    }
});
