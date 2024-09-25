export async function generateARExperience(targetImage, outputType, output) {
    // Convert target image to data URL
    const targetImageDataUrl = await fileToDataUrl(targetImage);

    // Generate a unique identifier for the AR experience
    const uniqueId = Math.random().toString(36).substring(2, 15);

    // Create AR scene data based on output type
    let arSceneData;
    switch (outputType) {
        case 'image':
            arSceneData = await createImageARScene(targetImageDataUrl, await fileToDataUrl(output));
            break;
        case 'video':
            arSceneData = await createVideoARScene(targetImageDataUrl, URL.createObjectURL(output));
            break;
        case '3d':
            arSceneData = await create3DModelARScene(targetImageDataUrl, URL.createObjectURL(output));
            break;
        case 'youtube':
            arSceneData = await createYoutubeARScene(targetImageDataUrl, output);
            break;
        default:
            throw new Error('Invalid output type');
    }

    // Generate QR code (you may want to use a QR code library here)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://your-ar-app.com/experience/${uniqueId}`)}`;

    return {
        qrCodeUrl,
        uniqueUrl: `https://your-ar-app.com/experience/${uniqueId}`,
        arSceneData
    };
}

export function displayARScene(arSceneData) {
    const arScene = document.getElementById('arScene');
    arScene.innerHTML = `
        <a-scene mindar-image="imageTargetSrc: ${arSceneData.targetImage}" color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
            <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
            <a-entity mindar-image-target="targetIndex: 0">
                ${arSceneData.entity}
            </a-entity>
        </a-scene>
    `;
}

async function createImageARScene(targetImage, outputImage) {
    return {
        targetImage,
        entity: `<a-image src="${outputImage}" position="0 0 0" height="1" width="1"></a-image>`
    };
}

async function createVideoARScene(targetImage, videoUrl) {
    return {
        targetImage,
        entity: `<a-video src="${videoUrl}" position="0 0 0" height="1" width="1"></a-video>`
    };
}

async function create3DModelARScene(targetImage, modelUrl) {
    return {
        targetImage,
        entity: `<a-gltf-model src="${modelUrl}" position="0 0 0" scale="0.1 0.1 0.1"></a-gltf-model>`
    };
}

async function createYoutubeARScene(targetImage, youtubeUrl) {
    const videoId = getYoutubeVideoId(youtubeUrl);
    return {
        targetImage,
        entity: `
            <a-entity geometry="primitive: plane; width: 1.6; height: 0.9;" material="shader: flat; src: #yt-video" position="0 0 0">
                <a-entity geometry="primitive: plane; width: 1.6; height: 0.9;" material="shader: flat; color: #000" position="0 0 -0.01"></a-entity>
            </a-entity>
            <a-assets>
                <iframe id="yt-video" width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </a-assets>
        `
    };
}

function getYoutubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}