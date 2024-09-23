document.addEventListener('DOMContentLoaded', () => {
    const outputType = document.getElementById('outputType');
    const outputFile = document.getElementById('outputFile');
    const youtubeLink = document.getElementById('youtubeLink');
    const generateButton = document.getElementById('generateButton');
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
        if (outputType.value !== 'youtube' && !outputFile.files[0]) {
            alert('Please upload an output file.');
            return;
        }

        if (outputType.value === 'youtube' && !youtubeLink.value) {
            alert('Please enter a YouTube URL.');
            return;
        }

        let output;

        if (outputType.value === 'youtube') {
            output = youtubeLink.value;
        } else {
            output = await readFileAsDataURL(outputFile.files[0]);
        }

        const arExperience = createARExperience(outputType.value, output);
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

    function createARExperience(outputType, output) {
        return {
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
            <a-scene mindar-face embedded>
                <a-camera active="false" position="0 0 0"></a-camera>
                <a-entity mindar-face-target="anchorIndex: 1">
                    ${outputEntity}
                </a-entity>
            </a-scene>
        `;
    }
});