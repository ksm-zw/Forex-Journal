(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ChartExportButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChartExportButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
function ChartExportButton({ selector, filename = 'chart.png' }) {
    async function exportSvgAsPng() {
        const el = document.querySelector(selector);
        if (!el) {
            alert('Chart container not found');
            return;
        }
        // If it contains an SVG, serialize it
        const svg = el.querySelector('svg');
        if (svg) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
            const img = new Image();
            img.onload = ()=>{
                const canvas = document.createElement('canvas');
                canvas.width = svg.clientWidth || img.width;
                canvas.height = svg.clientHeight || img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#0a0a0a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const url = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
            };
            img.onerror = ()=>alert('Failed to export SVG chart');
            img.src = svgData;
            return;
        }
        // Fallback: use html2canvas if present
        // (not installed by default here - user can install if needed)
        alert('SVG not found in container. If you need HTML capture, install html-to-image or html2canvas.');
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        "aria-label": "Export chart as PNG",
        title: "Export chart as PNG",
        onClick: exportSvgAsPng,
        className: "btn-gradient px-3 py-2 rounded text-sm",
        children: "Export Chart PNG"
    }, void 0, false, {
        fileName: "[project]/src/components/ChartExportButton.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c = ChartExportButton;
var _c;
__turbopack_context__.k.register(_c, "ChartExportButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ChartExportButton.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/ChartExportButton.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_ChartExportButton_tsx_70b34e35._.js.map