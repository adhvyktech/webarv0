import { generateARExperience, displayARScene } from './ar-utils.js';

let targetImageFile = null;
let outputFile = null;

document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('fileUpload');
    const outputType = document.getElementById('outputType');
    const outputFileInput = document.getElementById('outputFile');
    const youtubeLink = document.getElementById('youtubeLink');
    const generateButton = document.getElementById('generateButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const qrCode = document.getElementById('qrCode');
    const uniqueUrl = document.getElementById('uniqueUrl');
    const targetPreview = document.getElementById('targetPreview');
    const outputPreview = document.getElementById('outputPreview');

    fileUpload.addEventListener('change', (event) => {
        targetImageFile = event.target.files[0];
        displayPreview(targetImageFile, targetPreview);
    });

    outputType.addEventListener('change', () => {
        youtubeLink.style.display = outputType.value === 'youtube' ? 'block' : 'none';
        outputFileInput.style.display = outputType.value !== 'youtube' ? 'block' : 'none';
        outputPreview.innerHTML = '';
    });

    outputFileInput.addEventListener('change', (event) => {
        outputFile = event.target.files[0];
        displayPreview(outputFile, outputPreview);
    });

    generateButton.addEventListener('click', async () => {
        if (!targetImageFile) {
            alert('Please upload a target image.');
            return;
        }

        const output = outputType.value === 'youtube' ? youtubeLink.value : outputFile;

        if (!output && outputType.value !== 'youtube') {
            alert('Please upload an output file or enter a YouTube URL.');
            return;
        }

        loadingIndicator.style.display = 'block';
        generateButton.disabled = true;

        try {
            const result = await generateARExperience(targetImageFile, outputType.value, output);
            qrCode.innerHTML = `<img src="${result.qrCodeUrl}" alt="QR Code">`;
            uniqueUrl.textContent = `Unique URL: ${result.uniqueUrl}`;
            displayARScene(result.arSceneData);
        } catch (error) {
            console.error('Error generating AR experience:', error);
            alert('Failed to generate AR experience. Please try again.');
        } finally {
            loadingIndicator.style.display = 'none';
            generateButton.disabled = false;
        }
    });
});

function displayPreview(file, previewElement) {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
        videoElement.controls = true;
        videoElement.style.maxWidth = '200px';
        videoElement.style.maxHeight = '200px';
        previewElement.innerHTML = '';
        previewElement.appendChild(videoElement);
    } else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        previewElement.innerHTML = `<p>3D Model: ${file.name}</p>`;
    }
}