import { initDiagram, stepDescriptions } from './diagram_renderer.js';


let state = {
    scale: 1,
    panning: false,
    pointX: 0,
    pointY: 0,
    startX: 0,
    startY: 0
};


const ZOOM_STEP = 0.15;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;

document.addEventListener('DOMContentLoaded', async () => {

    await initDiagram(setupDiagramInteractions);
    

    setupZoomControls();
    setupPan();
    setupExport();
    setupCardInteraction();
});

/**
 * Applies interaction logic to the Mermaid SVG elements
 */
function setupDiagramInteractions() {
    const svgElement = document.querySelector('#mermaid-graph svg');
    if (!svgElement) return;



    const messageTexts = svgElement.querySelectorAll('.messageText');

    messageTexts.forEach(textEl => {

        textEl.style.cursor = 'pointer';
        textEl.classList.add('hover:fill-indigo-600', 'transition-colors');


        textEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent drag start logic
            

            messageTexts.forEach(t => t.classList.remove('font-bold', 'fill-indigo-700'));
            

            textEl.classList.add('font-bold', 'fill-indigo-700');


            const rawText = textEl.textContent.trim();
            

            let matchKey = Object.keys(stepDescriptions).find(key => rawText.includes(key));
            
            if (matchKey) {
                showDetailCard(stepDescriptions[matchKey], matchKey);
            } else {

                console.warn("No description for:", rawText);
            }
        });
    });


    const container = document.getElementById('canvas-container');
    container.addEventListener('click', (e) => {

        if (e.target === container || e.target.id === 'diagram-wrapper') {
            hideDetailCard();
            messageTexts.forEach(t => t.classList.remove('font-bold', 'fill-indigo-700'));
        }
    });
}

function showDetailCard(info, actionName) {
    const card = document.getElementById('interaction-card');
    const title = document.getElementById('card-title');
    const desc = document.getElementById('card-desc');
    const action = document.getElementById('card-action');


    title.textContent = info.title;
    desc.textContent = info.desc;
    action.textContent = actionName;


    card.classList.remove('translate-y-full');
}

function hideDetailCard() {
    const card = document.getElementById('interaction-card');
    card.classList.add('translate-y-full');
}

function setupCardInteraction() {
    const btnClose = document.getElementById('btn-close-card');
    if(btnClose) btnClose.addEventListener('click', hideDetailCard);
}

/* --- Pan & Zoom Logic --- */

function setTransform() {
    const wrapper = document.getElementById('diagram-wrapper');
    wrapper.style.transform = `translate(${state.pointX}px, ${state.pointY}px) scale(${state.scale})`;
}

function setupZoomControls() {
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        state.scale = Math.min(state.scale + ZOOM_STEP, MAX_ZOOM);
        setTransform();
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        state.scale = Math.max(state.scale - ZOOM_STEP, MIN_ZOOM);
        setTransform();
    });

    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
        state.scale = 1;
        state.pointX = 0;
        state.pointY = 0;
        setTransform();
    });
}

function setupPan() {
    const container = document.getElementById('canvas-container');
    
    container.addEventListener('mousedown', (e) => {

        if(e.target.closest('.messageText')) return;

        e.preventDefault();
        state.panning = true;
        state.startX = e.clientX - state.pointX;
        state.startY = e.clientY - state.pointY;
        
        container.classList.add('cursor-grabbing');
        container.classList.remove('cursor-grab');
    });

    window.addEventListener('mousemove', (e) => {
        if (!state.panning) return;
        e.preventDefault();
        state.pointX = e.clientX - state.startX;
        state.pointY = e.clientY - state.startY;
        setTransform();
    });

    window.addEventListener('mouseup', () => {
        state.panning = false;
        container.classList.remove('cursor-grabbing');
        container.classList.add('cursor-grab');
    });
    

    container.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            state.scale = Math.min(Math.max(state.scale + delta, MIN_ZOOM), MAX_ZOOM);
            setTransform();
        }
    }, { passive: false });
}

/* --- Export Logic --- */

function setupExport() {
    const btn = document.getElementById('btn-download-png');
    btn.addEventListener('click', () => {
        const svg = document.querySelector('#mermaid-graph svg');
        if (!svg) return;

        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
        

        if(!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }


        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const bbox = svg.getBoundingClientRect();
        

        const scale = 3;
        canvas.width = bbox.width * scale;
        canvas.height = bbox.height * scale;

        const img = new Image();
        const svgBlob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {

            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            

            const a = document.createElement('a');
            a.download = 'supply-chain-flow.png';
            a.href = canvas.toDataURL('image/png');
            a.click();
            
            URL.revokeObjectURL(url);
        };
        img.src = url;
    });
}
