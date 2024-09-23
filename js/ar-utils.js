export async function initializeAR() {
    if (window.AFRAME && window.MINDAR && window.MINDAR.IMAGE) {
        console.log('AR libraries already loaded');
        return;
    }

    console.log('Loading AR libraries...');
    await Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.1/dist/mindar-image.prod.js'),
        loadScript('https://aframe.io/releases/1.3.0/aframe.min.js'),
    ]);
    await loadScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.1/dist/mindar-image-aframe.prod.js');
    console.log('AR libraries loaded successfully');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}