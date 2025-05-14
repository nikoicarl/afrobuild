(() => {
    // Logout event
    $('.afrobuild_logout_btn').click(function (e) {
        e.preventDefault();

        const $btn = $(this);
        
        // Animation for the button when clicked (spinner effect)
        $btn.html('<div class="spinner-border text-white mr-2 align-self-center loader-sm"></div>')
            .fadeOut(200) // Fade out the button
            .fadeIn(200); // Fade it back in to show the spinner

        // Retrieve melody from localStorage
        const melody = JSON.parse(localStorage.getItem('melody'));

        // Fallback if melody object is undefined or missing properties
        if (!melody || !melody.melody1 || !melody.melody2) {
            console.error('Missing session identifiers');
            $btn.html(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="feather feather-log-out">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line></svg> 
                <span>Log Out</span>
            `);
            return;
        }

        // Delay logout for UX with smooth transition
        setTimeout(() => {
            socket.emit('logoutAction', {
                melody1: melody.melody1,
                melody2: melody.melody2
            });

            // Page transition effect - fade out page and then redirect
            $('body').fadeOut(1000, function() {
                window.location.replace("/"); // redirect after fade
            });
        }, 500);
    });

    // Receive logout response
    socket.on(melody.melody1 + '_logoutAction', function (data) {
        const $btn = $('.afrobuild_logout_btn');

        if (data.type === "error" || data.type === "caution") {
            console.warn('Logout issue:', data.message);

            $btn.html(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="feather feather-log-out">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line></svg> 
                <span>Log Out</span>
            `);

            if (data.timeout === 'yes') {
                // Clear client session after a delay
                setTimeout(() => {
                    window.localStorage.clear();
                    $('body').fadeOut(1000, function() {
                        window.location.replace("/");
                    });
                }, 1500);
            }

        } else if (data.type === "success") {
            $btn.html(data.message);
            window.localStorage.clear();
            $('body').fadeOut(1000, function() {
                window.location.replace("/");
            });
        }
    });
})();
