export const VFShowImage = {
    name: 'VFShowImage',
    type: 'response',
    match: ({ trace }) => trace.type === 'ext_showImage' || trace.payload === 'ext_showImage',
    render: ({ trace, element }) => {
        try {
            const { VFapiKey, imageUrl, imageAlt } = trace.payload;
            if (!VFapiKey || !imageUrl || !imageAlt) {
                throw new Error("Missing required input variables: VFapiKey, imageUrl, imageAlt");
            }

            // Create main container
            const container = document.createElement('div');
            container.className = 'vf-fullscreen-wrapper';

            // Create image container
            const imageContainer = document.createElement('div');
            imageContainer.className = 'vf-image-container';

            // Create close button container
            const closeButtonContainer = document.createElement('div');
            closeButtonContainer.className = 'vf-close-button-container';
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.className = 'vf-close-button';
            closeButton.innerHTML = '×';
            closeButtonContainer.appendChild(closeButton);

            // Create main image
            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = imageAlt;
            image.className = 'vf-image';

            // Create fullscreen container
            const fullscreenContainer = document.createElement('div');
            fullscreenContainer.className = 'vf-fullscreen-container';
            fullscreenContainer.innerHTML = `
                <div class="vf-fullscreen-header">
                    <button class="vf-exit-btn">Exit Fullscreen</button>
                </div>
                <img src="${imageUrl}" alt="${imageAlt}" class="vf-fullscreen-image">
            `;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .vf-fullscreen-wrapper {
                    position: relative;
                    width: 100%;
                    margin: 10px 0;
                }

                .vf-image-container {
                    position: relative;
                    width: 100%;
                    text-align: center;
                }

                .vf-close-button-container {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    z-index: 100;
                }

                .vf-close-button {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                    line-height: 1;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s ease;
                }

                .vf-close-button:hover {
                    background: rgba(0, 0, 0, 0.9);
                }

                .vf-image {
                    max-width: 100%;
                    height: auto;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: transform 0.2s ease;
                }

                .vf-image:hover {
                    transform: scale(1.02);
                }

                .vf-fullscreen-container {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: black;
                    z-index: 2147483647;
                }

                .vf-fullscreen-container.active {
                    display: block;
                }

                .vf-fullscreen-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    text-align: right;
                    z-index: 2147483647;
                }

                .vf-exit-btn {
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .vf-exit-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .vf-fullscreen-image {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    max-width: 95vw;
                    max-height: 90vh;
                    object-fit: contain;
                }

                .vf-image-container:fullscreen {
                    background-color: black;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .vf-image-container:fullscreen .vf-image {
                    max-width: 95vw;
                    max-height: 90vh;
                    object-fit: contain;
                }
            `;

            // Append elements
            imageContainer.appendChild(image);
            imageContainer.appendChild(closeButtonContainer);
            container.appendChild(imageContainer);
            container.appendChild(fullscreenContainer);
            container.appendChild(style);
            element.appendChild(container);

            // Function to handle fullscreen
            const openFullscreen = async (element) => {
                try {
                    if (element.requestFullscreen) {
                        await element.requestFullscreen();
                    } else if (element.webkitRequestFullscreen) {
                        await element.webkitRequestFullscreen();
                    } else if (element.msRequestFullscreen) {
                        await element.msRequestFullscreen();
                    } else {
                        fullscreenContainer.classList.add('active');
                    }
                } catch (err) {
                    fullscreenContainer.classList.add('active');
                }
            };

            // Function to exit fullscreen
            const closeFullscreen = () => {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                fullscreenContainer.classList.remove('active');
            };

            // Function to remove the entire component
            const removeComponent = () => {
                closeFullscreen();
                container.remove();
            };

            // Event listeners
            image.addEventListener('click', () => {
                openFullscreen(imageContainer);
            });

            closeButton.addEventListener('click', removeComponent);

            const exitBtn = fullscreenContainer.querySelector('.vf-exit-btn');
            exitBtn.addEventListener('click', closeFullscreen);

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeFullscreen();
                }
            });

            // Handle fullscreen change
            document.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) {
                    fullscreenContainer.classList.remove('active');
                }
            });

            // Cleanup function
            return () => {
                closeFullscreen();
                container.remove();
            };

        } catch (error) {
            console.error("Extension Error:", error.message);
        }
    }
};