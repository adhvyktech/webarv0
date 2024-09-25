export async function generateARExperience(formData) {
    try {
        const response = await fetch('/api/generate-ar', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to generate AR experience');
        }

        const result = await response.json();
        return {
            qrCodeUrl: result.qrCodeUrl,
            uniqueUrl: result.uniqueUrl,
            arExperienceId: result.arExperienceId
        };
    } catch (error) {
        console.error('Error generating AR experience:', error);
        throw error;
    }
}

export function displayARScene(arExperienceId) {
    const arScene = document.getElementById('arScene');
    arScene.innerHTML = `
        <iframe src="/ar-view/${arExperienceId}" width="100%" height="600" frameborder="0"></iframe>
    `;
}

export function getYoutubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

export function displayPreview(file, previewElement) {
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