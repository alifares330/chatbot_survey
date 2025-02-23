export const VFWorkScope = {
  name: 'VFWorkScope',
  type: 'response',
  match: ({ trace }) => trace.type === 'ext_workScope' || trace.payload === 'ext_workScope',
  
  render: ({ trace, element }) => {
    try {
      const { VFapiKey } = trace.payload;

      // Ensure VFapiKey is present
      if (!VFapiKey) {
        throw new Error("Missing required input variables: VFapiKey");
      }

      const container = document.createElement('div');
      container.className = 'work-selection'; // Added class directly to container

      // HTML structure for work selection form
      container.innerHTML = `
        <h3>My work Scope is:</h3>
        <form id="work-form"></form>
      `;

      // Style definitions for the component
      const style = document.createElement('style');
      style.textContent = `
        .work-selection {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        .work-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* Responsive grid */
          gap: 10px;
          margin-bottom: 20px;
        }
        .work-option {
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        .work-option input {
          margin-right: 10px;
        }
        .other-input {
          display: none;
          margin-top: 10px;
        }
        .work-selection button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }
        .work-selection button:hover {
          background: #0056b3;
        }
      `;
      container.appendChild(style); // Append style to container

      element.appendChild(container);

      const form = container.querySelector('#work-form');
      const works = [
        "Inspection/ Assessment", "Maintenance Planning", "Maintenance Work", "Quality Management",
        "Research & Development", "Consultation", "Other"
      ];

      const grid = document.createElement('div'); // Created grid container
      grid.className = 'work-grid';
      form.appendChild(grid);

      // Create the checkbox options dynamically
      works.forEach(work => {
        const label = document.createElement('label');
        label.className = 'work-option';
        label.innerHTML = `
          <input type="checkbox" name="work" value="${work}">
          <span>${work}</span>
        `;
        grid.appendChild(label);
      });

      // Create other input field
      const otherInputContainer = document.createElement('div');
      otherInputContainer.className = 'other-input';
      otherInputContainer.innerHTML = `
        <input type="text" id="other-work" placeholder="Specify other work">
      `;
      form.appendChild(otherInputContainer);

      // Add event listener for 'Other' checkbox
      const otherCheckbox = form.querySelector('input[value="Other"]');
      otherCheckbox.addEventListener('change', () => {
        if (otherCheckbox.checked) {
          otherInputContainer.style.display = 'block';
        } else {
          otherInputContainer.style.display = 'none';
        }
      });

      // Create submit button
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.textContent = 'Submit';
      form.appendChild(submitButton);

      const submitHandler = (event) => {
        event.preventDefault();

        const workDescription = Array.from(form.querySelectorAll('input[name="work"]:checked'))
          .map(cb => cb.value);
        
        if (workDescription.includes("Other")) {
          const otherValue = form.querySelector('#other-work').value.trim();
          if (!otherValue) { // Check for empty or whitespace-only input
            alert('Please specify the nature of your work .');
            return; // Stop submission
        } else {
            workDescription.push(otherValue); // Add to selected if it's not empty
        }
        }

        if (workDescription.length === 0) {
          alert('Please make at least one selection.');
          return;
        }
        
        
        
        // Disable all checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(input => {
          input.disabled = true;
        });

        // Disable "Other" input field
        const otherInput = form.querySelector('#other-work');
        if (otherInput) {
          otherInput.disabled = true;
        }

        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Submitted';
        submitButton.style.backgroundColor = '#808080';
        submitButton.style.cursor = 'not-allowed';
        
        
        
        window.voiceflow.chat.interact({
          type: 'complete_workScope',
          payload: {
            workDescription: workDescription,
            confirmation: 'Work description submitted successfully'
          }
        });
      };
      
      form.addEventListener('submit', submitHandler);

      // Cleanup function
      return () => {
        form.removeEventListener('submit', submitHandler);
        container.remove();
      };

    } catch (error) {
      console.error("Extension Error:", error.message);
    }
  }
};
