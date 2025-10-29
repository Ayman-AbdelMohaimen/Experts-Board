import type { SavedItemType, ExpertProduct, CourseOutline, SuggestionCategory, CourseTopic } from '../types';

const loadedScripts = new Set<string>();
const loadScript = (src: string) => {
    if (loadedScripts.has(src)) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedScripts.add(src);
            resolve(null);
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

const loadPdfScripts = async () => {
    await Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")
    ]);
};


// --- Text Formatting ---
function formatServices(content: string[]): string {
    return content.map(s => `- ${s}`).join('\n');
}

function formatProducts(content: ExpertProduct[]): string {
    return content.map(p => 
        `- ${p.name} (${p.type})\n  Price: ${p.price || 'N/A'}\n  Description: ${p.description}`
    ).join('\n\n');
}

function formatCourseOutline(content: CourseOutline): string {
    let text = `${content.courseTitle}\n${'='.repeat(content.courseTitle.length)}\n\n`;
    text += `Description: ${content.description}\n\n`;
    content.modules.forEach((mod, i) => {
        text += `Module ${i + 1}: ${mod.title}\n`;
        text += `  Objectives:\n${mod.objectives.map(o => `    - ${o}`).join('\n')}\n`;
        text += `  Topics:\n${mod.topics.map(t => `    - ${t.title}${t.content ? `\n      ${t.content.replace(/\n/g, '\n      ')}` : ''}`).join('\n\n')}\n`;
        text += `  Activities:\n${mod.activities.map(a => `    - ${a}`).join('\n')}\n\n`;
    });
    return text;
}

function formatSuggestions(content: SuggestionCategory[]): string {
    return content.map(cat => 
        `${cat.emoji} ${cat.category}\n${'-'.repeat(cat.category.length)}\n${cat.suggestions.map(s => `- ${s}`).join('\n')}`
    ).join('\n\n');
}

// --- HTML Formatting for PDF ---
function formatServicesHtml(content: string[]): string {
    return `<ul>${content.map(s => `<li>${s}</li>`).join('')}</ul>`;
}

function formatProductsHtml(content: ExpertProduct[]): string {
    return content.map(p => 
        `<div style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #eee;">
            <p><strong>${p.name}</strong> (${p.type})</p>
            <p><small>Price: ${p.price || 'N/A'}</small></p>
            <p>${p.description}</p>
        </div>`
    ).join('');
}

function formatCourseOutlineHtml(content: CourseOutline): string {
    let html = `<h2>${content.courseTitle}</h2><p>${content.description}</p>`;
    content.modules.forEach((mod, i) => {
        html += `<div style="margin-top: 1.5rem;">
            <h3>Module ${i + 1}: ${mod.title}</h3>
            <h4>Objectives</h4>
            <ul>${mod.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
            <h4>Topics</h4>
            <ul>${mod.topics.map(t => `<li><strong>${t.title}</strong>${t.content ? `<div style="padding-left: 15px; border-left: 2px solid #ddd; margin-top: 5px; white-space: pre-wrap;">${t.content}</div>` : ''}</li>`).join('')}</ul>
            <h4>Activities</h4>
            <ul>${mod.activities.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>`;
    });
    return html;
}

function formatSuggestionsHtml(content: SuggestionCategory[]): string {
    return content.map(cat => 
        `<div style="margin-bottom: 1.5rem;">
            <h3>${cat.emoji} ${cat.category}</h3>
            <ul>${cat.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>`
    ).join('');
}


// --- Main Export Functions ---
export const formatContentForExport = (content: any, type: SavedItemType): string => {
    switch (type) {
        case 'services': return formatServices(content as string[]);
        case 'products': return formatProducts(content as ExpertProduct[]);
        case 'courseOutline': return formatCourseOutline(content as CourseOutline);
        case 'assessments':
        case 'improvementPlan': return formatSuggestions(content as SuggestionCategory[]);
        default: return 'Unsupported content type.';
    }
};

const formatContentForHtmlExport = (content: any, type: SavedItemType): string => {
    switch (type) {
        case 'services': return formatServicesHtml(content as string[]);
        case 'products': return formatProductsHtml(content as ExpertProduct[]);
        case 'courseOutline': return formatCourseOutlineHtml(content as CourseOutline);
        case 'assessments':
        case 'improvementPlan': return formatSuggestionsHtml(content as SuggestionCategory[]);
        default: return 'Unsupported content type.';
    }
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};

export const downloadAsTxt = (filename: string, text: string) => {
    const element = document.createElement('a');
    // FIX: Add UTF-8 charset and BOM to handle Arabic characters correctly.
    const file = new Blob([`\uFEFF${text}`], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename.replace(/ /g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

export const downloadAsPdf = async (filename: string, content: any, type: SavedItemType, title: string) => {
    try {
        await loadPdfScripts();
        const { jsPDF } = (window as any).jspdf;
        const html2canvas = (window as any).html2canvas;

        const htmlContent = formatContentForHtmlExport(content, type);

        const container = document.createElement('div');
        container.innerHTML = `
            <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; padding: 40px; width: 800px; color: #333; background: white;">
                <h1>${title}</h1>
                <hr style="margin: 1rem 0;" />
                ${htmlContent}
            </div>
        `;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        const canvas = await html2canvas(container.firstElementChild as HTMLElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename.replace(/ /g, '_')}.pdf`);
        
        document.body.removeChild(container);

    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};