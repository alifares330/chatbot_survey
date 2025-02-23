export const FVDistressCompare = {
    name: 'FVDistressCompare',
    type: 'response',
    match: ({ trace }) => trace.type === 'ext_distressCompare' || trace.payload === 'ext_distressCompare',

    render: ({ trace, element }) => {
        try {
            const { VFapiKey } = trace.payload;

            if (!VFapiKey) {
                throw new Error("Missing required input variables: VFapiKey");
            }

            const container = document.createElement('div');
            container.className = 'distress-selection';

            container.innerHTML = `
                <h4 style="text-align: center;">Compare the Relative Importance of Surface and Subsurface Distresses</h4>
                <div id="comparison-container">
                    <div id="criteria-display">
                        <span id="criteria1-label" style="text-align: center;">Surface Distresses</span>
                        <span id="vs-label" style="text-align: center;">vs</span>
                        <span id="criteria2-label" style="text-align: center;">Sub-Surface Distresses</span>
                    </div>
                    <div class="slider-container">
                        <input type="range" min="-5" max="5" value="0" step="1" id="comparison-slider">
                        <div id="scale-labels">
                            <div class="scale-label-container">
                                <span class="scale-value">5</span>
                                <span class="scale-description">Absolute preference for Surface Distresses</span>
                            </div>
                            <div class="scale-label-container">
                                <span class="scale-value">3</span>
                                <span class="scale-description">Strong preference for Surface Distresses</span>
                            </div>
                            <div class="scale-label-container">
                                <span class="scale-value">1</span>
                                <span class="scale-description">Equal preference</span>
                            </div>
                            <div class="scale-label-container">
                                <span class="scale-value">3</span>
                                <span class="scale-description">Strong preference for Sub-Surface Distresses</span>
                            </div>
                            <div class="scale-label-container">
                                <span class="scale-value">5</span>
                                <span class="scale-description">Absolute preference for Sub-Surface Distresses</span>
                            </div>
                        </div>
                    </div>
                    <div id="current-description"></div>
                    <button id="submit-button">Submit Comparison</button>
                </div>
            `;

            const style = document.createElement('style');
            style.textContent = `
                .distress-selection {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 30px;
                    background-color: #f8f9fa;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                h3 {
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 25px;
                    font-size: 1.5rem;
                }

                #comparison-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 25px;
                }

                #criteria-display {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    margin-bottom: 15px;
                    font-weight: 600;
                    color: #34495e;
                }

                #vs-label {
                    color: #7f8c8d;
                    font-weight: 500;
                    font-style: italic;
                    white-space: nowrap; /* Prevents text from wrapping */
                }

                .slider-container {
                    width: 100%;
                    position: relative;
                    padding: 0 15px;
                }

                #comparison-slider {
                    width: 100%;
                    margin: 25px 0;
                    height: 8px;
                    -webkit-appearance: none;
                    background: #e0e0e0;
                    border-radius: 4px;
                    outline: none;
                }

                #comparison-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: #3498db;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                #comparison-slider::-webkit-slider-thumb:hover {
                    background: #2980b9;
                }

                #scale-labels {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    position: relative;
                    padding: 10px 0;
                }

                .scale-label-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    cursor: pointer;
                }

                .scale-value {
                    font-weight: 600;
                    color: #34495e;
                    margin-bottom: 5px;
                }

                .scale-description {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #fff;
                    border: 1px solid #e0e0e0;
                    padding: 8px 12px;
                    border-radius: 6px;
                    white-space: nowrap;
                    font-size: 0.875rem;
                    opacity: 0;
                    transition: all 0.3s ease;
                    pointer-events: none;
                    z-index: 10;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .scale-label-container:hover .scale-description {
                    opacity: 1;
                    transform: translateX(-50%) translateY(5px);
                }

                #current-description {
                    text-align: center;
                    min-height: 24px;
                    margin: 15px 0;
                    color: #596575;
                    font-size: 1rem;
                    padding: 0 15px;
                }

                #submit-button {
                    padding: 12px 30px;
                    background-color: #2ecc71;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    margin-top: 20px;
                }

                #submit-button:hover {
                    background-color: #27ae60;
                    transform: translateY(-1px);
                }

                #submit-button:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                    transform: none;
                }
            `;
            container.appendChild(style);
            element.appendChild(container);

            const slider = container.querySelector("#comparison-slider");
            const currentDescription = container.querySelector("#current-description");
            const submitButton = container.querySelector("#submit-button");

            const scaleDescriptionsConfig = {
                "-5": "Absolute preference (100%) for Surface Distresses",
                "-4": "Very strong preference (90%) for Surface Distresses",
                "-3": "Strong preference (80%) for Surface Distresses",
                "-2": "Moderate preference (70%) for Surface Distresses",
                "-1": "Slight preference (60%) for Surface Distresses",
                "0": "Equal Preference (50%/50%)",
                "1": "Slight preference (60%) for Sub-Surface Distresses",
                "2": "Moderate preference (70%) for Sub-Surface Distresses",
                "3": "Strong preference (80%) for Sub-Surface Distresses",
                "4": "Very strong preference (90%) for Sub-Surface Distresses",
                "5": "Absolute preference (100%) for Sub-Surface Distresses"
            };

            const getDisplayValue = (internalValue) => {
                const absValue = Math.abs(internalValue);
                return absValue === 0 ? 1 : absValue + 1;
            };

            const updateScaleLabels = () => {
                const scaleLabels = container.querySelectorAll('.scale-value');
                scaleLabels.forEach((label, index) => {
                    const position = index === 2 ? 0 : (index < 2 ? (-(index - 1) * 2 + 2) : (index *2) -4);
                    label.textContent = getDisplayValue(position);
                });
            };

            currentDescription.textContent = scaleDescriptionsConfig[slider.value];
            updateScaleLabels();

            slider.addEventListener("input", () => {
                currentDescription.textContent = scaleDescriptionsConfig[slider.value];
                updateScaleLabels();
                console.log(scaleDescriptionsConfig[slider.value])
            });

            submitButton.addEventListener("click", () => {
                window.voiceflow.chat.interact({
                    type: 'complete_distressCompare',
                    payload: {
                        comparison: slider.value,
                        confirmation: 'Comparison submitted successfully'
                    }
                });

              
                // Disable the submit button and slider after submission
                submitButton.disabled = true;
                slider.disabled = true;

                // Optionally, change the submit button text
                submitButton.textContent = "Submitted"; // Or style it differently
              
              
            });

            return () => {
                container.remove();
            };

        } catch (error) {
            console.error("Extension Error:", error.message);
        }
    }
};