
import React, { useState } from 'react';
import JSZip from 'jszip';

const ExtensionDownloader: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadExtensionZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("tabflow_pro_extension");

      if (!folder) throw new Error("Could not create folder in ZIP");

      const appMatches = [
        "*://localhost/*",
        "*://*.stackblitz.io/*",
        "https://*.webcontainer.io/*",
        "*://127.0.0.1/*",
        window.location.origin + "/*"
      ];

      // 1. manifest.json
      const manifest = {
        "manifest_version": 3,
        "name": "TabFlow Pro",
        "version": "1.0.0",
        "description": "Professional Workspace Bridge for TabFlow.",
        "permissions": ["tabs", "storage"],
        "externally_connectable": {
          "matches": appMatches
        },
        "background": {
          "service_worker": "background.js"
        },
        "action": {
          "default_popup": "popup.html"
        },
        "content_scripts": [
          {
            "matches": appMatches,
            "js": ["content_script.js"],
            "run_at": "document_start"
          }
        ]
      };
      folder.file("manifest.json", JSON.stringify(manifest, null, 4));

      // 2. background.js
      const backgroundJs = `
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_TABS") {
        chrome.tabs.query({}, (tabs) => {
            sendResponse({ 
                tabs: tabs.map(t => ({
                    id: t.id ? t.id.toString() : Math.random().toString(),
                    title: t.title || "Untitled",
                    url: t.url || "",
                    favIconUrl: t.favIconUrl
                })) 
            });
        });
        return true; 
    }
});
      `;
      folder.file("background.js", backgroundJs);

      // 3. content_script.js (The Auto-Handshake Magic)
      const contentScriptJs = `
// Notify the web app of our presence and ID
function notifyApp() {
    window.postMessage({ 
        type: "TABFLOW_EXTENSION_READY", 
        extensionId: chrome.runtime.id 
    }, "*");
}

// Send immediately and also on page load to ensure coverage
notifyApp();
window.addEventListener('load', notifyApp);
      `;
      folder.file("content_script.js", contentScriptJs);

      // 4. popup.html (CSP Compliant)
      const popupHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { width: 320px; font-family: 'Inter', sans-serif; background: #020617; color: white; margin: 0; padding: 20px; }
        .glass { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 20px; backdrop-filter: blur(10px); }
        .header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .logo { width: 32px; height: 32px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
        h1 { font-size: 16px; margin: 0; font-weight: 900; letter-spacing: -0.5px; }
        p { color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0 0 16px 0; }
        .btn { background: #3b82f6; color: white; border: none; width: 100%; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
        .btn:hover { background: #2563eb; transform: translateY(-1px); }
        .badge { background: #10b981; color: white; font-size: 8px; font-weight: 900; padding: 3px 6px; border-radius: 4px; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="glass">
        <div class="header">
            <div class="logo">T</div>
            <h1>TabFlow Pro</h1>
            <div class="badge">Active</div>
        </div>
        <p>Connected to workspace. Reorganize your browser tabs in real-time using the dashboard.</p>
        <button class="btn" id="closeBtn">Connected</button>
    </div>
    <script src="popup.js"></script>
</body>
</html>
      `;
      folder.file("popup.html", popupHtml);

      // 5. popup.js (CSP Compliant Event Handler)
      const popupJs = `
document.getElementById('closeBtn').addEventListener('click', () => {
    window.close();
});
      `;
      folder.file("popup.js", popupJs);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tabflow_pro_extension.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate extension zip:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 text-white flex flex-col items-center text-center border border-white/10 relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      
      <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl mb-6 backdrop-blur-xl border border-white/20 shadow-inner relative z-10">
        <i className="fas fa-magic"></i>
      </div>
      
      <h3 className="text-3xl font-black mb-3 tracking-tighter relative z-10">Instant Setup</h3>
      <p className="text-blue-100 mb-10 max-w-sm text-sm font-medium relative z-10">
        Download the new 2025 Auto-Connect bundle. It links automatically to this app upon installation.
      </p>
      
      <div className="space-y-4 w-full relative z-10">
        <button 
          onClick={downloadExtensionZip}
          disabled={isGenerating}
          className="w-full bg-white text-blue-700 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl disabled:opacity-50"
        >
          {isGenerating ? 'Packaging...' : 'Download Auto-Link Extension'}
        </button>
        
        <div className="text-left text-[10px] text-blue-100 bg-black/20 backdrop-blur-md p-6 rounded-3xl space-y-3 border border-white/5">
          <p className="font-black text-white uppercase tracking-widest text-[9px] mb-2 opacity-60">No Handshake Required</p>
          <div className="flex gap-3">
            <span className="w-5 h-5 bg-white/10 rounded flex items-center justify-center font-bold">1</span>
            <p>Extract zip and load in <code>chrome://extensions</code></p>
          </div>
          <div className="flex gap-3">
            <span className="w-5 h-5 bg-white/10 rounded flex items-center justify-center font-bold">2</span>
            <p>Once loaded, this app will instantly detect the connection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionDownloader;
