import { displayARScene, displayPreview } from './ar-utils.js';

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

        if (outputType.value !== 'youtube' && !outputFile) {
            alert('Please upload an output file or enter a YouTube URL.');
            return;
        }

        loadingIndicator.style.display = 'block';
        generateButton.disabled = true;

        try {
            const formData = new FormData();
            formData.append('targetImage', targetImageFile);
            formData.append('outputType', outputType.value);
            
            if (outputType.value === 'youtube') {
                formData.append('youtubeLink', youtubeLink.value);
            } else {
                formData.append('outputFile', outputFile);
            }

            const response = await fetch('/api/generate-ar', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                qrCode.innerHTML = `<img src="${result.qrCodeDataUrl}" alt="QR Code">`;
                uniqueUrl.innerHTML = `<a href="${result.arExperienceUrl}" target="_blank">${result.arExperienceUrl}</a>`;
            } else {
                throw new Error(result.error || 'Failed to generate AR experience');
            }
        } catch (error) {
            console.error('Error generating AR experience:', error);
            alert('Failed to generate AR experience. Please try again.');
        } finally {
            loadingIndicator.style.display = 'none';
            generateButton.disabled = false;
        }
    });
});