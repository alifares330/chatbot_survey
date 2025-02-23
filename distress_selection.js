export const VFDistressSelectionExtension = {
    name: 'VFDistressSelectionExtension',
    type: 'response',
    match: ({ trace }) => trace.type === 'ext_distressSelection' || trace.payload === 'ext_distressSelection',
    
    render: ({ trace, element }) => {
      try {
        const { VFapiKey } = trace.payload;

        if (!VFapiKey) {
          throw new Error("Missing required input variables: VFapiKey");
        }

        const container = document.createElement('div');
        container.className = 'distress-selection';

        container.innerHTML = `
          <h4>Select Pavement Distresses:</h4>
          <form id="distress-form">
            <div id="distress-options"></div>
            <div id="other-input-container" style="display: none;">
              <input type="text" id="other-distress" placeholder="Specify other distress">
            </div>
            <button type="submit" id="submit-btn">Submit</button>
          </form>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .distress-selection {
                max-width: 100%;
                margin: 0 auto;
                padding: 20px;
                text-align: left;
            }

            #distress-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .distress-option {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
            }

            .distress-option input {
                cursor: pointer;
            }

            #other-input-container {
                margin-top: 10px;
            }

            #other-distress {
                width: 100%;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }

            #submit-btn {
                margin-top: 15px;
                padding: 10px 15px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            #submit-btn:hover {
                background: #0056b3;
            }
        `;
        container.appendChild(style);

        element.appendChild(container);

        const form = container.querySelector('#distress-form');
        const distressOptions = container.querySelector('#distress-options');
        const otherInputContainer = container.querySelector('#other-input-container');
        const otherDistressInput = container.querySelector('#other-distress');

        const distresses = [
          "Roughness", "Rutting", "Raveling", "Thickness deficiency",
          "Surface cracks", "Subsurface cracks", "Potholes",
          "Skid resistance", "Bleeding", "Other"
        ];

        // Create the checkbox options dynamically
        distresses.forEach(distress => {
          const label = document.createElement('label');
          label.className = 'distress-option';
          label.innerHTML = `
            <input type="checkbox" name="distress" value="${distress}">
            <span>${distress}</span>
          `;
          distressOptions.appendChild(label);
        });

        // Add event listener for 'Other' checkbox
        const otherCheckbox = form.querySelector('input[value="Other"]');
        otherCheckbox.addEventListener('change', () => {
          otherInputContainer.style.display = otherCheckbox.checked ? 'block' : 'none';
        });

        // Submit handler
        form.addEventListener('submit', (event) => {
          event.preventDefault();

          const selectedDistresses = Array.from(form.querySelectorAll('input[name="distress"]:checked'))
            .map(cb => cb.value);
          
          if (selectedDistresses.includes("Other")) {
            const otherValue = otherDistressInput.value.trim();
            if (!otherValue) { // Check for empty or whitespace-only input
                alert('Please specify the other distress.');
                otherDistressInput.focus(); // Set focus back to the input field
                return; // Stop submission
            } else {
                selectedDistresses.push(otherValue); // Add to selected if it's not empty
            }
          }

          if (selectedDistresses.length === 0) {
            alert('Please select at least one distress.');
            return;
          }

          // Disable all checkboxes
          form.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.disabled = true;
          });

          // Disable text input for "Other"
          if (otherDistressInput) {
            otherDistressInput.disabled = true;
          }

          // Disable submit button
          const submitButton = form.querySelector('#submit-btn');
          submitButton.disabled = true;
          submitButton.textContent = 'Submitted';
          submitButton.style.backgroundColor = '#808080'; // Gray color
          submitButton.style.cursor = 'not-allowed';

          // Send data
          window.voiceflow.chat.interact({
            type: 'complete_distressSelection',
            payload: {
              selectedDistresses: selectedDistresses,
              confirmation: 'Work description submitted successfully'
            }
          });
        });

        return () => {
          container.remove();
        };

      } catch (error) {
        console.error("Extension Error:", error.message);
      }
    }
};
