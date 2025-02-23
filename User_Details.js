export const VFUserDetails = {
    name: 'VFUserDetails',
    type: 'response',
    match: ({ trace }) => trace.type === `ext_userDetails` || trace.payload === `ext_userDetails`,
    render: ({ trace, element }) => {
        try {
            const { VFapiKey } = trace.payload;

            if (!VFapiKey) {
                throw new Error("Missing required input variables: VFapiKey");
            }

            const container = document.createElement('div');
            container.innerHTML = `
                <div class="personal-info-form">
                    <form id="info-form">
                        <label for="title">Title:</label>
                        <select id="title" name="title" required>
                            <option value="">Select a title</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Miss">Miss</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms.">Ms.</option>
                            <option value="Dr.">Dr.</option>
                            <option value="Eng.">Eng.</option>
                        </select>

                       <label for="firstName">First Name:</label>
                        <input type="text" id="firstName" name="firstName" required>

                        <label for="lastName">Last Name:</label>
                        <input type="text" id="lastName" name="lastName" required>

                        <label for="company">Company:</label>
                        <input type="text" id="company" name="company" required>

                        <label for="country">Country:</label>
                        <input type="text" id="country" name="country" required>

                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>

                        <button type="submit">Submit</button>
                    </form>
                </div>
                <style>
                    .personal-info-form {
                        max-width: 400px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    }
                    .personal-info-form label {
                        display: block;
                        margin-top: 5px;
                        margin-bottom: 2px;
                        
                    }
                    .personal-info-form input[type="text"],
                    .personal-info-form input[type="email"],
                    .personal-info-form select {
                        width: 100%;
                        padding: 8px;
                        margin-bottom: 1px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        box-sizing: border-box;
                    }
                    .personal-info-form button {
                        background-color: #007bff;
                        color: white;
                        padding: 10px 15px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 5px;
                    }
                    .personal-info-form button:hover {
                        background-color: #0056b3;
                    }
                    .error-message { /* Style for error messages */
                        color: red;
                        font-size: 12px;
                        margin-top: 5px;
                    }
                </style>
            `;

            element.appendChild(container);

            const form = container.querySelector('#info-form');
            const titleSelect = form.title;
            const firstNameInput = form.firstName;
            const lastNameInput = form.lastName;
            const emailInput = form.email;

            // Function to display error messages
            const displayError = (inputElement, message) => {
                let errorSpan = inputElement.nextElementSibling; // Get the next sibling (error span)
                if (!errorSpan || !errorSpan.classList.contains('error-message')) {
                    errorSpan = document.createElement('span');
                    errorSpan.classList.add('error-message');
                    inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling); // Insert after input
                }
                errorSpan.textContent = message;
            };

            const clearError = (inputElement) => {
                const errorSpan = inputElement.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains('error-message')) {
                    errorSpan.remove();
                }
            };

            titleSelect.addEventListener('change', () => {
                clearError(titleSelect);
            });

            firstNameInput.addEventListener('input', () => {
                clearError(firstNameInput);
            });

            lastNameInput.addEventListener('input', () => {
                clearError(lastNameInput);
            });

            emailInput.addEventListener('input', () => {
                clearError(emailInput);
            });

            const submitHandler = (event) => {
                event.preventDefault();

                const title = form.title.value.trim();
                const firstName = form.firstName.value.trim();
                const lastName = form.lastName.value.trim();
                const company = form.company.value.trim();
                const country = form.country.value.trim();
                const email = form.email.value.trim();

                let isValid = true;

                if (!title || !firstName || !lastName || !country || !email) {
                    alert("Please fill in all required fields.");
                    return;
                }

                if (/\d/.test(firstName)) {
                    displayError(firstNameInput, "First name cannot contain numbers.");
                    isValid = false;
                }

                if (/\d/.test(lastName)) {
                    displayError(lastNameInput, "Last name cannot contain numbers.");
                    isValid = false;
                }

                if (!email.includes("@")) {
                    displayError(emailInput, "Invalid email format: Email must contain '@'.");
                    isValid = false;
                } else {
                    // More robust email regex
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        displayError(emailInput, "Invalid email format.");
                        isValid = false;
                    }
                }

                if (!isValid) return; // Don't submit if not valid

                const personalInfo = {
                    title: title,
                    firstName: firstName,
                    lastName: lastName,
                    company: company,
                    country: country,
                    email: email
                };

                // Important: Stringify the data before sending it in the payload
                const payload = {
                    userDetails: personalInfo
                };

                console.log("Payload being sent:", JSON.stringify(payload, null, 2)); // Debugging
                
                // Disable inputs and button after successful submission
                form.querySelectorAll("input, select").forEach(input => input.disabled = true);
                const submitButton = form.querySelector("button[type='submit']");
                submitButton.disabled = true;
                submitButton.textContent = "Submitted"; // Update button text
                submitButton.style.backgroundColor = "#808080"; // Change button color to gray
                submitButton.style.cursor = "not-allowed"; // Show disabled cursor

                window.voiceflow.chat.interact({
                    type: 'complete_userDetails',
                    payload: payload // Send the stringified JSON
                });
            };

            form.addEventListener('submit', submitHandler);

            return () => {
                form.removeEventListener('submit', submitHandler);
                titleSelect.removeEventListener('change', () => clearError(titleSelect));
                firstNameInput.removeEventListener('input', () => clearError(firstNameInput));
                lastNameInput.removeEventListener('input', () => clearError(lastNameInput));
                emailInput.removeEventListener('input', () => clearError(emailInput));
                container.remove();
            };

        } catch (error) {
            console.error("Extension Error:", error.message);
        }
    }
};