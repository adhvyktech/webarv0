document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('fileUpload');
    const outputType = document.getElementById('outputType');
    const outputFile = document.getElementById('outputFile');
    const youtubeLink = document.getElementById('youtubeLink');
    const generateButton = document.getElementById('generateButton');
    const qrCode = document.getElementById('qrCode');
    const uniqueUrl = document.getElementById('uniqueUrl');
    const arScene = document.getElementById('arScene');
    const targetPreview = document.getElementById('targetPreview');
    const outputPreview = document.getElementById('outputPreview');

    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                targetPreview.innerHTML = `<img src="${e.target.result}" alt="Target Image Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    outputType.addEventListener('change', () => {
        if (outputType.value === 'youtube') {
            outputFile.style.display = 'none';
            youtubeLink.style.display = 'block';
        } else {
            outputFile.style.display = 'block';
            youtubeLink.style.display = 'none';
        }
    });

    outputFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (outputType.value === 'image') {
                    outputPreview.innerHTML = `<img src="${e.target.result}" alt="Output Image Preview">`;
                } else if (outputType.value === 'video') {
                    outputPreview.innerHTML = `<video src="${e.target.result}" controls></video>`;
                } else if (outputType.value === '3d') {
                    outputPreview.innerHTML = `<p>3D model preview not available</p>`;
                }
            };
            reader.readAsDataURL(file);
        }
    });

    youtubeLink.addEventListener('input', (e) => {
        const youtubeUrl = e.target.value;
        if (youtubeUrl) {
            const videoId = getYoutubeVideoId(youtubeUrl);
            if (videoId) {
                outputPreview.innerHTML = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            }
        }
    });

    generateButton.addEventListener('click', async () => {
        if (!fileUpload.files[0]) {
            alert('Please upload a target image.');
            return;
        }

        if (outputType.value !== 'youtube' && !outputFile.files[0]) {
            alert('Please upload an output file.');
            return;
        }

        if (outputType.value === 'youtube' && !youtubeLink.value) {
            alert('Please enter a YouTube URL.');
            return;
        }

        const targetImage = await readFileAsDataURL(fileUpload.files[0]);
        let output;

        if (outputType.value === 'youtube') {
            output = youtubeLink.value;
        } else {
            output = await readFileAsDataURL(outputFile.files[0]);
        }

        const uniqueId = Math.random().toString(36).substring(2, 15);
        const arExperience = createARExperience(targetImage, outputType.value, output);

        // Save the AR experience data (you might want to use a backend service for this)
        localStorage.setItem(uniqueId, JSON.stringify(arExperience));

        // Generate QR code and unique URL
        const arUrl = `${window.location.origin}/ar-view.html?id=${uniqueId}`;
        qrCode.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(arUrl)}" alt="QR Code">`;
        uniqueUrl.innerHTML = `<p>Unique URL: <a href="${arUrl}" target="_blank">${arUrl}</a></p>`;

        // Display the AR scene preview
        displayARScene(arExperience);
    });

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    function createARExperience(targetImage, outputType, output) {
        return {
            targetImage,
            outputType,
            output
        };
    }

    function displayARScene(arExperience) {
        let outputEntity;

        switch (arExperience.outputType) {
            case 'image':
                outputEntity = `<a-image src="${arExperience.output}" width="1" height="1"></a-image>`;
                break;
            case 'video':
                outputEntity = `<a-video src="${arExperience.output}" width="1" height="1" autoplay loop></a-video>`;
                break;
            case 'youtube':
                const videoId = getYoutubeVideoId(arExperience.output);
                outputEntity = `
                    <a-entity geometry="primitive: plane; width: 1.6; height: 0.9" material="shader: flat; src: #yt-video" position="0 0 0"></a-entity>
                    <a-assets>
                        <iframe id="yt-video" width="560" height="315" src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                    </a-assets>
                `;
                break;
            case '3d':
                outputEntity = `<a-entity gltf-model="${arExperience.output}" scale="0.5 0.5 0.5"></a-entity>`;
                break;
        }

        arScene.innerHTML = `
            <a-scene mindar-image="imageTargetSrc: ${arExperience.targetImage};" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
                <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
                <a-entity mindar-image-target="targetIndex: 0">
                    ${outputEntity}
                </a-entity>
            </a-scene>
        `;
    }

    function getYoutubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
});