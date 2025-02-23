export const VFShowImage = {
    name: 'VFShowImage',
    type: 'response',
    match: ({ trace }) => trace.type === 'ext_showImage' || trace.payload === 'ext_showImage',
    render: ({ trace, element }) => {
        try {
            const { imageUrl, imageAlt } = trace.payload;

            if (!imageUrl || !imageAlt) {
                throw new Error("Missing required input variables: imageUrl, imageAlt");
            }

            const container = document.createElement('div');
            container.className = 'vf-image-container';

            const image = document.createElement('img');
            image.src = imageUrl;
            //image.alt = imageAlt;
            image.className = 'vf-image';

            const continueButton = document.createElement('button');
            continueButton.className = 'vf-continue-button';
            continueButton.textContent = 'Continue';

            const fullscreenOverlay = document.createElement('div');
            fullscreenOverlay.className = 'vf-fullscreen-overlay';
            fullscreenOverlay.style.display = 'none';

            const fullscreenImage = document.createElement('img');
            fullscreenImage.src = imageUrl;
            //fullscreenImage.alt = imageAlt;
            fullscreenImage.className = 'vf-fullscreen-image';

            fullscreenOverlay.appendChild(fullscreenImage);

            const style = document.createElement('style');
            style.textContent = `
                .vf-image-container {
                    position: relative;
                    width: 100%;
                    text-align: center;
                }
                .vf-image {
                    max-width: 90%;
                    height: auto;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: transform 0.3s ease;
                }
                .vf-image:hover {
                    transform: scale(1.05);
                }
                .vf-fullscreen-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2147483647;
                    overflow: hidden;
                }
                .vf-fullscreen-image {
                    max-width: 95%;
                    max-height: 95%;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }
                .vf-continue-button {
                    margin-top: 10px;
                    padding: 8px 16px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            `;

            container.appendChild(image);
            container.appendChild(continueButton);
            container.appendChild(fullscreenOverlay);
            container.appendChild(style);
            element.appendChild(container);

            let scale = 1;
            let panning = false;
            let pointX = 0;
            let pointY = 0;
            let start = { x: 0, y: 0 };

            const toggleFullscreen = () => {
                if (fullscreenOverlay.style.display === 'none') {
                    fullscreenOverlay.style.display = 'flex';
                    scale = 1;
                    fullscreenImage.style.transform = `scale(${scale})`;
                } else {
                    fullscreenOverlay.style.display = 'none';
                }
            };

            const setTransform = () => {
                fullscreenImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
            };

            fullscreenOverlay.addEventListener('mousedown', (e) => {
                e.preventDefault();
                start = { x: e.clientX - pointX, y: e.clientY - pointY };
                panning = true;
            });

            fullscreenOverlay.addEventListener('mouseup', () => {
                panning = false;
            });

            fullscreenOverlay.addEventListener('mousemove', (e) => {
                e.preventDefault();
                if (!panning) return;
                pointX = e.clientX - start.x;
                pointY = e.clientY - start.y;
                setTransform();
            });

            fullscreenOverlay.addEventListener('wheel', (e) => {
                e.preventDefault();
                const xs = (e.clientX - pointX) / scale;
                const ys = (e.clientY - pointY) / scale;
                const delta = -e.deltaY;
                const newScale = delta > 0 ? scale * 1.2 : scale / 1.2;
                scale = Math.min(Math.max(1, newScale), 5);  // Limit zoom between 1x and 5x
                pointX = e.clientX - xs * scale;
                pointY = e.clientY - ys * scale;
                setTransform();
            });

            image.addEventListener('click', toggleFullscreen);
            fullscreenImage.addEventListener('dblclick', toggleFullscreen);

            continueButton.addEventListener('click', () => {
                if (window.voiceflow && window.voiceflow.chat && window.voiceflow.chat.interact) {
                    window.voiceflow.chat.interact({
                        type: 'complete',
                        payload: {
                            imageShown: 1
                        }
                    });
                } else {
                    console.error("Voiceflow chat object not available.");
                }
            });

            const handleEscapeKey = (e) => {
                if (e.key === 'Escape' && fullscreenOverlay.style.display === 'flex') {
                    toggleFullscreen();
                }
            };

            document.addEventListener('keydown', handleEscapeKey);

            const cleanup = () => {
                image.removeEventListener('click', toggleFullscreen);
                fullscreenImage.removeEventListener('dblclick', toggleFullscreen);
                continueButton.removeEventListener('click', continueButton.onclick);
                document.removeEventListener('keydown', handleEscapeKey);
                fullscreenOverlay.removeEventListener('mousedown', fullscreenOverlay.onmousedown);
                fullscreenOverlay.removeEventListener('mouseup', fullscreenOverlay.onmouseup);
                fullscreenOverlay.removeEventListener('mousemove', fullscreenOverlay.onmousemove);
                fullscreenOverlay.removeEventListener('wheel', fullscreenOverlay.onwheel);
                container.remove();
            };

            return cleanup;

        } catch (error) {
            console.error("Extension Error:", error.message);
        }
    }
};
