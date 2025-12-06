import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
import { diagram1, diagram2, diagram3 } from './diagrams.js';

/**
 * Configuration for Mermaid to match the "Light Blue/Modern" aesthetic.
 */
mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        

        primaryColor: '#e0f2fe',      // Light Blue Background for active participants
        primaryTextColor: '#0f172a',  // Dark slate text
        primaryBorderColor: '#0ea5e9', // Brand Blue border
        
        lineColor: '#64748b',         // Slate 500 lines
        
        secondaryColor: '#f0f9ff',    // Alternate background
        tertiaryColor: '#ffffff',     // Participant background
        

        actorBkg: '#ffffff',
        actorBorder: '#0ea5e9',
        actorTextColor: '#0c4a6e',
        

        signalColor: '#334155',
        signalTextColor: '#334155',
        

        loopTextColor: '#334155',
        noteBkgColor: '#fffbeb',      // Light yellow note
        noteBorderColor: '#fcd34d',
        

        activationBorderColor: '#0ea5e9',
        activationBkgColor: '#bae6fd',
        sequenceNumberColor: '#ffffff'
    }
});

/**
 * Render diagrams into their respective containers.
 */
async function renderDiagrams() {
    const targets = [
        { id: 'render-1', code: diagram1 },
        { id: 'render-2', code: diagram2 },
        { id: 'render-3', code: diagram3 }
    ];

    for (const target of targets) {
        const element = document.getElementById(target.id);
        if (element) {
            try {

                const id = `mermaid-svg-${target.id}`;
                const { svg } = await mermaid.render(id, target.code);
                element.innerHTML = svg;
                element.classList.remove('animate-pulse'); // Stop loading animation
            } catch (error) {
                console.error(`Failed to render diagram ${target.id}:`, error);
                element.innerHTML = `<div class="text-red-500 text-sm">Error rendering diagram.</div>`;
            }
        }
    }
}

/**
 * Setup Intersection Observer for fade-in animations on scroll.
 */
function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.diagram-section').forEach(section => {
        observer.observe(section);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    renderDiagrams();
    setupAnimations();
});
