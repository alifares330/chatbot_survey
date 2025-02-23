export const FVCriteriaComparisonSub = {
    name: 'FVCritereaComparisonSub',
    type: 'response',
    match: ({ trace }) => trace.type === 'ext_criteriaComparisonSub' || trace.payload === 'ext_criteriaComparisonSub',

    render: ({ trace, element }) => {
        try {
            const { VFapiKey } = trace.payload;

            if (!VFapiKey) {
                throw new Error("Missing required input variables: VFapiKey");
            }

            const container = document.createElement('div');
            container.className = 'distress-selection';

            container.innerHTML = `
                <h4 class="header-text">Compare the Relative Importance of the Sub-Criteria:</h4>
                <div id="comparison-container">
                    <div id="criteria-display">
                        <span id="criteria1-label" class="criteria-label">Criteria 1</span>
                        <span id="vs-label" class="vs-text">vs</span>
                        <span id="criteria2-label" class="criteria-label">Criteria 2</span>
                    </div>
                    <div class="slider-container">
                        <input type="range" min="-8" max="8" value="0" step="1" id="comparison-slider">
                        <div id="scale-labels">
                            <div class="scale-label-container">
                                <span class="scale-value">9</span>
                                <span class="scale-description">Absolute preference for Criteria 1</span>
                            </div>
                            <div class="scale-label-container">
                                <span class="scale-value">5</span>
                                <span class="scale-description">Strong preference for Criteria 1</span>
                            </div>
                            <div class="scale-label-container">
                                <span class="scale-value">1</span>
                                <span class="scale-description">Equal preference</span>
                            </div>
                            <div class="scale-label-container">
                                <span class="scale-value">5</span>
                                <span class="scale-description">Strong preference for Criteria 2</span>
                            </div>
                            <div class="scale-label-container">
                                <span class="scale-value">9</span>
                                <span class="scale-description">Absolute preference for Criteria 2</span>
                            </div>
                        </div>
                    </div>
                    <div id="current-description"></div>
                    <div class="button-container">
                        <button id="prev-button" disabled>Previous</button>
                        <button id="next-button">Next</button>
                    </div>
                    <div id="progress-indicator">Question 1 of 10</div>
                </div>
            `;


            const style = document.createElement('style');
            style.textContent = `
              .distress-selection {
                  max-width: 90%;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f8f9fa;
                  border-radius: 10px;
                  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
              }

              .header-text {
                  text-align: center;
                  font-weight: bold;
                  margin-bottom: 15px;
              }

              #comparison-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 15px;
              }

              #criteria-display {
                  display: flex;
                  justify-content: space-between;
                  align-items: center; /* Vertically align the labels */
                  gap: 10px;
                  font-weight: bold;
                  font-size: 18px;
              }

              .criteria-label {
                  display: inline-block; /* Ensures the label remains in a horizontal flow */
                  writing-mode: horizontal-tb; /* Forces horizontal text */
                  white-space: wrap;  /* Prevents wrapping */
                  word-wrap: normal;    /* Ensures words do not break */
                  overflow-wrap: normal; /* Ensures words do not break */
                  font-size: 16px;
                  text-align: center;
                  font-weight: bold;
                  color: #555;
                  transition: opacity 0.3s ease;
              }

              .vs-text {
                  font-size: 12px;
                  font-weight: bold;
                  color: #007bff;
                  white-space: nowrap; /* Prevents text from wrapping */
              }

              .slider-container {
                  width: 80%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
              }

              #comparison-slider {
                  width: 100%;
                  margin: 15px 0;
              }

              #scale-labels {
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
                  position: relative;
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
                  font-weight: bold;
                  font-size: 14px;
                  color: #007bff;
              }

              .scale-description {
                  display: inline-block; /* Ensure text stays in a single line */
                  /white-space: nowrap; /* Prevents wrapping */
                  writing-mode: horizontal-tb !important; /* Ensures horizontal text */
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: white;
                  border: 1px solid #ccc;
                  padding: 5px 10px;
                  border-radius: 5px;
                  font-size: 12px;
                  opacity: 0;
                  transition: opacity 0.3s ease;
                  pointer-events: none;
                  z-index: 10;
              }

              .scale-label-container:hover .scale-description {
                  opacity: 1;
              }

              #current-description {
                  text-align: center;
                  min-height: 20px;
                  margin: 10px 0;
                  color: #555;
                  font-size: 14px;
              }

              .button-container {
                  display: flex;
                  gap: 15px;
                  margin-top: 15px;
              }

              #next-button, #prev-button {
                  padding: 10px 18px;
                  background-color: #007bff;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  font-size: 14px;
                  cursor: pointer;
                  transition: background-color 0.3s ease;
              }

              #next-button:hover, #prev-button:hover {
                  background-color: #0056b3;
              }

              #next-button:disabled, #prev-button:disabled {
                  background-color: #cccccc;
                  cursor: not-allowed;
              }

              #progress-indicator {
                  margin-top: 10px;
                  color: #555;
                  font-size: 14px;
              }
          `;
            container.appendChild(style);
            element.appendChild(container);

            const criteriaPairs = [
                ["Comfort", "Traffic flow disruption"],
                ["Vehicle maintenance cost", "Fuel costs"],
                ["Vehicle maintenance cost", "Safety"],
                ["Gas emissions", "Vehicle deterioration"],
                ["Gas emissions", "Noise"],
                ["Vehicle deterioration", "Noise"]
            ];

            let currentComparisonIndex = 0;
            const slider = container.querySelector("#comparison-slider");
            const criteria1Label = container.querySelector("#criteria1-label");
            const criteria2Label = container.querySelector("#criteria2-label");
            const nextButton = container.querySelector("#next-button");
            const prevButton = container.querySelector("#prev-button");
            const currentDescription = container.querySelector("#current-description");
            const progressIndicator = container.querySelector("#progress-indicator");
            const comparisonResults = {};

            // Convert internal value (-8 to 8) to display value (1-9)
            const getDisplayValue = (value) => {
                const absValue = Math.abs(value);
                if (absValue === 0) return 1;
                return absValue + 1;
            };

            function updateProgress() {
                progressIndicator.textContent = `Question ${currentComparisonIndex + 1} of ${criteriaPairs.length}`;
                prevButton.disabled = currentComparisonIndex === 0;
                nextButton.textContent = currentComparisonIndex === criteriaPairs.length - 1 ? "Submit" : "Next";
            }
          
            function displayCurrentComparison() {
                if (currentComparisonIndex < criteriaPairs.length) {
                    const [criteria1, criteria2] = criteriaPairs[currentComparisonIndex];
                    criteria1Label.textContent = criteria1;
                    criteria2Label.textContent = criteria2;
                    
                    // Restore previous value if it exists
                    const savedValue = comparisonResults[`${criteria1}-${criteria2}`];
                    if (savedValue !== undefined) {
                        // Convert display value (1-9) back to internal value (-8 to 8)
                        const internalValue = savedValue === 1 ? 0 : (savedValue - 1) * (slider.value < 0 ? -1 : 1);
                        slider.value = internalValue;
                        currentDescription.textContent = getDescription(internalValue.toString(), criteria1, criteria2);
                    } else {
                        slider.value = 0;
                        currentDescription.textContent = getDescription("0", criteria1, criteria2);
                    }
                    
                    updateProgress();
                }
            }

            const scaleDescriptions = {
                "-8": "Absolute preference (9) for Criteria 1",
                "-7": "Very strong to absolute preference (8) for Criteria 1",
                "-6": "Very strong preference (7) for Criteria 1",
                "-5": "Strong to very strong preference (6) for Criteria 1",
                "-4": "Strong preference (5) for Criteria 1",
                "-3": "Moderate to strong preference (4) for Criteria 1",
                "-2": "Moderate preference (3) for Criteria 1",
                "-1": "Equal to moderate preference (2) for Criteria 1",
                "0": "Equal preference (1)",
                "1": "Equal to moderate preference (2) for Criteria 2",
                "2": "Moderate preference (3) for Criteria 2",
                "3": "Moderate to strong preference (4) for Criteria 2",
                "4": "Strong preference (5) for Criteria 2",
                "5": "Strong to very strong preference (6) for Criteria 2",
                "6": "Very strong preference (7) for Criteria 2",
                "7": "Very strong to absolute preference (8) for Criteria 2",
                "8": "Absolute preference (9) for Criteria 2"
            };

            const getDescription = (value, criteria1, criteria2) => {
                const description = scaleDescriptions[value];
                if (value < 0) {
                    return description.replace('Criteria 1', criteria1);
                } else if (value > 0) {
                    return description.replace('Criteria 2', criteria2);
                }
                return description;
            };

            slider.addEventListener("input", () => {
                const value = slider.value;
                const [criteria1, criteria2] = criteriaPairs[currentComparisonIndex];
                currentDescription.textContent = getDescription(String(value), criteria1, criteria2);

                const scaleLabels = container.querySelectorAll('.scale-value');
                scaleLabels.forEach((label, index) => {
                    if (index === 2) {
                        label.textContent = '1';
                    } else {
                        const position = index < 2 ? -(8 - index * 4) : (index - 2) * 4;
                        label.textContent = getDisplayValue(position);
                    }
                });
            });

            prevButton.addEventListener("click", () => {
                const [criteria1, criteria2] = criteriaPairs[currentComparisonIndex];
                // convert -8 to 8 range to 1 to 9, while preserving direction.
                comparisonResults[`${criteria1}-${criteria2}`] = parseInt(slider.value) + (slider.value >= 0 ? 1 : -1);
              
                currentComparisonIndex--;
                displayCurrentComparison();
            });

            nextButton.addEventListener("click", () => {
                const [criteria1, criteria2] = criteriaPairs[currentComparisonIndex];
                // convert -8 to 8 range to 1 to 9, while preserving direction.
                comparisonResults[`${criteria1}-${criteria2}`] = parseInt(slider.value) + (slider.value >= 0 ? 1 : -1);

                if (currentComparisonIndex === criteriaPairs.length - 1) {
                    console.log("Results:", comparisonResults);
                    window.voiceflow.chat.interact({
                        type: 'complete_critereaComparisonSub',
                        payload: {
                            comparisons: comparisonResults,
                            confirmation: 'Comparisons submitted successfully'
                        }
                    });
                  
                    
                    // Disable the slider and buttons after submit
                    slider.disabled = true;
                    nextButton.disabled = true;
                    prevButton.disabled = true;

                    // Optionally, change the Next button to "Submitted" or similar
                    nextButton.textContent = "Submitted";  // Or style it differently
                  
                  
                } else {
                    currentComparisonIndex++;
                    displayCurrentComparison();
                }
            });
          
            displayCurrentComparison();

            return () => {
                container.remove();
            };

        } catch (error) {
            console.error("Extension Error:", error.message);
        }
    }
};