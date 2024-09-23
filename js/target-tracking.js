document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('fileUpload');
    const outputType = document.getElementById('outputType');
    const outputFile = document.getElementById('outputFile');
    const youtubeLink = document.getElementById('youtubeLink');
    const generateButton = document.getElementById('generateButton');
    const qrCode = document.getElementById('qrCode');
    const uniqueUrl = document.getElementById('uniqueUrl');
    const arScene = document.getElementById('arScene');

    outputType.addEventListener('change', () => {
        if (outputType.value === 'youtube') {
            outputFile.style.display = 'none';
            youtubeLink.style.display = 'block';
        } else {
            outputFile.style.display = 'block';
            youtubeLink.style.display = 'none';
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
                outputEntity = `<a-entity geometry="primitive: plane; width: 1; height: 0.5625" material="shader: flat; src: #yt-video"></a-entity>
                                <a-assets>
                                    <video id="yt-video" src="${arExperience.output}" autoplay loop crossorigin="anonymous"></video>
                                </a-assets>`;
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
});