document.addEventListener('DOMContentLoaded', () => {
    // Signup Form Logic
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const roleRadios = document.querySelectorAll('input[name="role"]');
        const ownerFields = document.getElementById('ownerFields');

        // Function to toggle the visibility of owner fields
        function toggleOwnerFields() {
            const selectedRole = document.querySelector('input[name="role"]:checked').value;
            if (selectedRole === 'owner') {
                ownerFields.classList.remove('hidden');
            } else {
                ownerFields.classList.add('hidden');
            }
        }

        // Add event listeners to radio buttons
        roleRadios.forEach(radio => {
            radio.addEventListener('change', toggleOwnerFields);
        });

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData();
            formData.append('emailOrUsername', document.getElementById('emailOrUsername').value);
            formData.append('password', document.getElementById('password').value);
            formData.append('phoneNumber', document.getElementById('phoneNumber').value);
            
            const role = document.querySelector('input[name="role"]:checked').value;
            formData.append('role', role);

            if (role === 'owner') {
                formData.append('cafeName', document.getElementById('cafeName').value);
                formData.append('address', document.getElementById('address').value);
                formData.append('startTime', document.getElementById('startTime').value);
                formData.append('endTime', document.getElementById('endTime').value);
            }

            // Just logging to console for now as there's no backend specified
            console.log('Signup Form submitted with data:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            alert('登録が完了しました！ (Registration Complete - Simulation)');
        });
    }

    // Signin Form Logic
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('emailOrUsername', document.getElementById('emailOrUsername').value);
            formData.append('password', document.getElementById('password').value);

            console.log('Signin Form submitted with data:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            alert('ログインしました！ (Login Complete - Simulation)');
        });
    }
});
