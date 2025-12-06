import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
import { classData, generateMermaidDefinition } from './data.js';


try {
    lucide.createIcons();
} catch (e) {
    console.warn("Lucide icons not ready yet");
}

document.addEventListener('DOMContentLoaded', async () => {
    initMermaid();
    renderClassCards();
    await renderDiagram();
    lucide.createIcons(); 
});

function initMermaid() {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        fontFamily: 'Inter',
        themeVariables: {
            primaryColor: '#ffffff',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#94a3b8',
            lineColor: '#64748b',
            secondaryColor: '#f8fafc',
            tertiaryColor: '#fff',
            fontFamily: 'Inter',
            fontSize: '14px'
        },
        flowchart: { curve: 'basis' }
    });
}

async function renderDiagram() {
    const container = document.getElementById('mermaid-container');
    const graphDefinition = generateMermaidDefinition();
    
    try {
        const id = `mermaid-svg-${Date.now()}`;
        const { svg } = await mermaid.render(id, graphDefinition);
        container.innerHTML = svg;
        
        const svgElement = container.querySelector('svg');
        if(svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.minHeight = '400px';
        }
    } catch (error) {
        console.error('Mermaid rendering failed:', error);
        container.innerHTML = `
            <div class="text-red-500 flex flex-col items-center justify-center h-full p-4">
                <p class="font-semibold mb-2">Gagal memuat diagram.</p>
                <div class="text-xs bg-red-50 p-3 rounded border border-red-100 w-full overflow-auto max-h-32">
                    ${error.message}
                </div>
            </div>`;
    }
}

function renderClassCards() {
    const grid = document.getElementById('class-grid');
    grid.innerHTML = ''; 
    
    classData.forEach((cls, index) => {
        const card = document.createElement('div');
        card.className = `class-card bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4 opacity-0 fade-in-up`;
        card.style.animationDelay = `${index * 50}ms`;

        const attributesList = cls.attributes.map(attr => {
            const isFK = attr.includes('(FK)');

            const cleanText = attr.replace(' (FK)', '');
            
            return `
                <li class="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <span class="text-slate-600 font-mono text-xs truncate mr-2" title="${cleanText}">${cleanText}</span>
                    ${isFK ? '<span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">FK</span>' : ''}
                </li>
            `;
        }).join('');

        card.innerHTML = `
            <div class="flex items-center gap-3 mb-1">
                <div class="p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                    <i data-lucide="${cls.icon || 'box'}" class="w-5 h-5"></i>
                </div>
                <h4 class="font-semibold text-base text-slate-800">${cls.name}</h4>
            </div>
            <div class="flex-1 mt-2">
                <div class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Atribut</div>
                <ul class="flex flex-col">
                    ${attributesList}
                </ul>
            </div>
        `;

        grid.appendChild(card);
    });
}
