export const VFVegetableSelectionExtension = {
    name: 'VFVegetableSelection',
    type: 'response',
    match: ({ trace }) => trace.type === `ext_vegetableSelection` || trace.payload === `ext_vegetableSelection`,
    render: ({ trace, element }) => {
        const VFapiKey = trace.payload.VFapiKey || null
        const userID = trace.payload.user || null

        try {
            // Validate required input variables
            if (!VFapiKey || !userID) {
                throw new Error("Missing required input variables: VFapiKey or UserID");
            }
            
            const vegetableContainer = document.createElement('div')
            vegetableContainer.innerHTML = `
                <div class="vegetable-selection">
                    <h3>Select Your Vegetables:</h3>
                    <div class="vegetable-grid">
                        <label class="vegetable-option">
                            <input type="checkbox" name="vegetable" value="Carrot">
                            <span>Carrot</span>
                        </label>
                        <label class="vegetable-option">
                            <input type="checkbox" name="vegetable" value="Broccoli">
                            <span>Broccoli</span>
                        </label>
                        <label class="vegetable-option">
                            <input type="checkbox" name="vegetable" value="Spinach">
                            <span>Spinach</span>
                        </label>
                        <label class="vegetable-option">
                            <input type="checkbox" name="vegetable" value="Tomato">
                            <span>Tomato</span>
                        </label>
                        <label class="vegetable-option">
                            <input type="checkbox" name="vegetable" value="Cucumber">
                            <span>Cucumber</span>
                        </label>
                        <label class="vegetable-option">
                            <input type="checkbox" name="vegetable" value="Bell Pepper">
                            <span>Bell Pepper</span>
                        </label>
                    </div>
                    <!-- Confirmation Modal -->
                    <div id="confirmation-modal">
                        <h3>Confirm Selection</h3>
                        <div id="selected-vegetables"></div>
                        <button id="confirm-selection">Confirm</button>
                        <button id="cancel-selection">Cancel</button>
                    </div>
                    <button id="review-selection">Review Selection</button>
                </div>
                <style>
                    .vegetable-selection {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .vegetable-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                        margin: 20px 0;
                    }
                    .vegetable-option {
                        display: flex;
                        align-items: center;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    .vegetable-option input {
                        margin-right: 10px;
                    }
                    #review-selection {
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    #confirmation-modal {
                        display: none;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        z-index: 1000;
                    }
                </style>
            `
            element.appendChild(vegetableContainer);

            const reviewButton = vegetableContainer.querySelector('#review-selection');
            const confirmationModal = vegetableContainer.querySelector('#confirmation-modal');
            const confirmButton = vegetableContainer.querySelector('#confirm-selection');
            const cancelButton = vegetableContainer.querySelector('#cancel-selection');
            const selectedVegetablesDiv = vegetableContainer.querySelector('#selected-vegetables');

            let selectedVegetables = [];

            reviewButton.addEventListener('click', () => {
                const checkboxes = vegetableContainer.querySelectorAll('input[name="vegetable"]:checked');
                selectedVegetables = Array.from(checkboxes).map(cb => cb.value);
                
                if (selectedVegetables.length === 0) {
                    alert('Please select at least one vegetable');
                    return;
                }

                selectedVegetablesDiv.innerHTML = `
                    <p>Selected Vegetables:</p>
                    <ul>${selectedVegetables.map(veg => `<li>${veg}</li>`).join('')}</ul>
                `;
                confirmationModal.style.display = 'block';
            });

            confirmButton.addEventListener('click', () => {
                if (selectedVegetables.length > 0) {
                    // Prepare data for API
                    const vegetableData = selectedVegetables.map(vegetable => ({
                        name: vegetable,
                        user: userID,
                        timestamp: new Date().toISOString()
                    }));

                    // Upload data to KB
                    const url = 'https://api.voiceflow.com/v1/knowledge-base/docs/upload/table?overwrite=true';
                    const config = {
                        method: 'POST',
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: VFapiKey
                        },
                        body: JSON.stringify({
                            data: {
                                schema: {
                                    searchableFields: ['name', 'user', 'timestamp']
                                },
                                name: userID,
                                items: vegetableData
                            }
                        })
                    };

                    fetch(url, config)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(result => {
                            if (!result || typeof result !== 'object') {
                                throw new Error("Invalid API response");
                            }

                            window.voiceflow.chat.interact({
                                type: 'complete',
                                payload: {
                                    selectedVegetables: selectedVegetables,
                                    confirmation: 'Vegetable selection saved successfully'
                                }
                            });
                        })
                        .catch(error => console.error('Error:', error));

                    confirmationModal.style.display = 'none';
                }
            });

            cancelButton.addEventListener('click', () => {
                confirmationModal.style.display = 'none';
                selectedVegetables = [];
            });

        } catch (error) {
            console.error(error.message);
        }
    }
};