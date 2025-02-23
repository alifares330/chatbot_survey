export const FVRateDistress = {
    name: 'FVRateDistress',
    type: 'response',
    match: ({ trace }) => trace.type === 'ext_rateDistress' || trace.payload === 'ext_rateDistress',

    render: ({ trace, element }) => {
        const CRITERIA = [
            "Comfort", "Traffic flow disruption", "Vehicle maintenance cost", "Fuel costs",
            "Safety", "Deterioration rate", "Gas emissions", "Vehicle deterioration", "Noise"
        ];

        const RATING_LABELS = [
            "[1] Negligible", "[2] Marginal", "[3] Minor", "[4] Moderate", "[5] Notable",
            "[6] Substantial", "[7] High", "[8] Severe", "[9] Critical", "[10] Absolute"
        ];

        const state = {
            currentPage: 0,
            itemsPerPage: 3,
            currentCriterionIndex: 0,
            ratings: {},
        };

        try {
            const { VFapiKey, IDdistress } = trace.payload;

            if (!VFapiKey || !IDdistress) {
                throw new Error("Missing required input variables: VFapiKey or IDdistress");
            }

            const container = document.createElement('div');
            container.className = 'distress-selection';

            container.innerHTML = `
                <h4>Rate the Impact of ${IDdistress} on:</h4>
                <div class="carousel-container">
                    <div id="criteria-carousel" class="carousel">
                        <div class="carousel-track"></div>
                    </div>
                    <div class="carousel-navigation">
                        <div class="nav-container">
                            <div class="button-group">
                                <button id="prev-btn" disabled>&#8592; Previous</button>
                                <button id="next-btn">Next &#8594;</button>
                                <button id="submit-btn">Submit</button>
                            </div>
                        </div>
                        <div class="page-indicator">
                          Criterion <span id="current-page">1</span> of <span id="total-pages">1</span>
                    </div>
                </div>
            `;

  // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .distress-selection {
                    max-width: 100%;
                    margin: 0 auto;
                    padding: 5px;
                    text-align: left;
                    color: #000;
                }

                .carousel-container {
                    display: flex;
                    flex-direction: column;
                    max-width: 100%;
                    overflow: hidden;
                }

                .carousel {
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                }

                .carousel-track {
                    display: grid;
                    gap: 20px;
                    transition: transform 0.3s ease-in-out;
                }

                .carousel-item {
                    width: 100%;
                    min-width: 150px;
                    display: flex;
                    padding: 5px; /* Reduce padding */
                    margin: 0px 0; /* Reduce vertical margin */
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    color: #000; 
                }

                .carousel-navigation {
                    width: 100%;
                    margin-top: 15px;
                    padding: 10px 0;
                }

                .nav-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 100%;
                    margin: 0 auto;
                }

                .button-group {
                    display: flex;
                    gap: 10px;
                    justify-content: center; /* Center buttons horizontally */
                    width: 100%; /* Ensure buttons take full width for proper alignment */
                    flex-wrap: wrap; /* Allow wrapping of buttons if necessary */
                }

                .page-indicator {
                    width: 100%; /* Key: Make page indicator take full width */
                    text-align: center;
                    color: #666;
                    margin-top: 5px;
                }

                .button-group button {
                    flex: 1; /* Key: Distribute available space equally */
                    min-width: 100px; /* Optional: Set a minimum width */
                    padding: 8px 16px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: #007bff; /* Blue background */
                    color: white; /* White text */
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .button-group button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .button-group button:hover:not(:disabled) {
                    background: #0056b3;
                }

                #submit-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                }

                #submit-btn:hover:not(:disabled) {
                    background: #0056b3;
                }

                .rating-buttons {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 5px;
                }

                .rating-buttons button {
                    padding: 4px;
                    text-align: left;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #000; /* Ensure text remains black */
                    font-family: "Times New Roman", Times, serif; !important;
                    font-size: 14px
                }

                .rating-buttons button:hover,
                .rating-buttons button.selected {
                    background-color: #007bff; /* Blue background on hover/selected */
                    color: white; /* White text on hover/selected */
                }

                .item-title {
                    margin-top: 5px; /* Reduce top margin */
                    margin-bottom: 5px; /* Reduce bottom margin */
                    font-weight: bold;
                    text-align: center;
                    color: #000; /* Ensure title text is black */
                }

                .error-message {
                    background-color: #fee2e2;
                    border: 1px solid #ef4444;
                    color: #991b1b;
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 16px;
                    display: none;
                }
            `;


            container.appendChild(style);
            element.appendChild(container);

            const carouselTrack = container.querySelector('.carousel-track');
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            container.insertBefore(errorMessage, container.firstChild);

            function createCarouselItems() {
                carouselTrack.innerHTML = '';
                CRITERIA.forEach((criterion) => {
                    const item = document.createElement('div');
                    item.className = 'carousel-item';
                    item.style.display = 'none';

                    item.innerHTML = `
                         <h4 class="item-title">${criterion}</h4>
                        <div class="rating-buttons">
                            ${RATING_LABELS.map((label, i) => `
                                <button data-criterion="${criterion}" data-value="${i + 1}">
                                    ${label}
                                </button>
                            `).join('')}
                        </div>
                    `;
                    carouselTrack.appendChild(item);
                });
            }

            function updateLayout() {
                const containerWidth = container.clientWidth;
                const minItemWidth = 150;
                const gap = 20;
                const maxItemsThatFit = Math.floor((containerWidth + gap) / (minItemWidth + gap));
                //state.itemsPerPage = Math.max(1, Math.min(maxItemsThatFit, CRITERIA.length));
                state.itemsPerPage = 1;
                carouselTrack.style.gridTemplateColumns = `repeat(${state.itemsPerPage}, 1fr)`;
                const totalPages = Math.ceil(CRITERIA.length / state.itemsPerPage);
                state.currentPage = Math.min(state.currentPage, totalPages - 1);
                return totalPages;
            }

            function updateCarousel() {
                const totalPages = updateLayout();
                const items = carouselTrack.querySelectorAll('.carousel-item');
                const startIndex = state.currentPage * state.itemsPerPage;
                const endIndex = startIndex + state.itemsPerPage;

                items.forEach((item, index) => {
                    item.style.display = (index >= startIndex && index < endIndex) ? 'block' : 'none';
                });

                const prevBtn = container.querySelector('#prev-btn');
                const nextBtn = container.querySelector('#next-btn');
                const currentPageSpan = container.querySelector('#current-page');
                const totalPagesSpan = container.querySelector('#total-pages');

                prevBtn.disabled = state.currentPage === 0;
                nextBtn.disabled = state.currentPage >= totalPages - 1;
                currentPageSpan.textContent = state.currentPage + 1;
                totalPagesSpan.textContent = totalPages;

            }


            function handleRatingClick(event) {
                if (event.target.tagName === 'BUTTON' && event.target.dataset.criterion) {
                    const criterion = event.target.dataset.criterion;
                    const value = parseInt(event.target.dataset.value);
                    state.ratings[criterion] = value;

                    const buttons = event.target.parentNode.querySelectorAll('button');
                    buttons.forEach(btn => btn.classList.remove('selected'));
                    event.target.classList.add('selected');
                    errorMessage.style.display = 'none';
                  
                    console.log("Current Ratings:", state.ratings); // Log current ratings
                }
            }

            function handleSubmit() {
                if (Object.keys(state.ratings).length !== CRITERIA.length) {
                    errorMessage.textContent = 'Please rate all criteria before submitting.';
                    errorMessage.style.display = 'block';
                    return;
                }

                window.voiceflow.chat.interact({
                    type: `complete_${IDdistress}`,
                    payload: {
                        ratings: state.ratings,
                        confirmation: 'Ratings submitted successfully',
                    }
                 
                });
              
                // Disable all buttons after successful submission
                const allButtons = container.querySelectorAll('button');
                allButtons.forEach(button => button.disabled = true);

                // Hide error message if submission is successful
                errorMessage.style.display = 'none';

                // Optionally, change submit button text or appearance
                const submitButton = container.querySelector('#submit-btn');
                if (submitButton) {
                    submitButton.textContent = "Submitted"; // Or change style
                    // submitButton.classList.add('submitted'); // Add a 'submitted' class for styling
                }


                state.currentCriterionIndex;

                if (state.currentCriterionIndex < CRITERIA.length) {
                    const nextCriterion = CRITERIA[state.currentCriterionIndex];
                    const nextCriterionItemIndex = CRITERIA.indexOf(nextCriterion);
                    state.currentPage = Math.floor(nextCriterionItemIndex / state.itemsPerPage);

                    updateCarousel();
                } else {
                    console.log("All criteria rated!");
                    // You might want to reset or disable the form here.
                }
            }


            carouselTrack.addEventListener('click', handleRatingClick);

            container.querySelector('#prev-btn').addEventListener('click', () => {
                if (state.currentPage > 0) {
                    state.currentPage--;
                    updateCarousel();
                }
            });

            container.querySelector('#next-btn').addEventListener('click', () => {
                const totalPages = Math.ceil(CRITERIA.length / state.itemsPerPage);
                if (state.currentPage < totalPages - 1) {
                    state.currentPage++;
                    updateCarousel();
                }
            });

            container.querySelector('#submit-btn').addEventListener('click', handleSubmit);

            createCarouselItems();
            updateCarousel();

            const resizeObserver = new ResizeObserver(() => {
                updateCarousel();
            });
            resizeObserver.observe(container);

            return () => {
                resizeObserver.disconnect();
                container.remove();
            };

        } catch (error) {
            console.error("Extension Error:", error.message);
            return () => element.remove();
        }
    }
};