'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiDownload } from 'react-icons/fi';

interface ScreenshotUploaderProps {
  onScreenshotAdded?: (dataUrl: string) => void;
}

export default function ScreenshotUploader({ onScreenshotAdded }: ScreenshotUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [screenshots, setScreenshots] = useState<Array<{
    id: string;
    url: string;
    caption: string;
    timestamp: Date;
  }>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const screenshot = {
            id: Date.now().toString() + Math.random(),
            url: dataUrl,
            caption: '',
            timestamp: new Date(),
          };
          setScreenshots(prev => [screenshot, ...prev]);
          onScreenshotAdded?.(dataUrl);
          toast.success('Screenshot uploaded');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error('Failed to upload screenshot');
        console.error(error);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateCaption = (id: string, newCaption: string) => {
    setScreenshots(prev =>
      prev.map(s => (s.id === id ? { ...s, caption: newCaption } : s))
    );
    setEditingId(null);
  };

  const deleteScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const downloadScreenshot = (url: string, timestamp: Date) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `trade-setup-${timestamp.toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h3 className="text-lg font-bold gradient-text mb-4">Trade Setup Screenshots</h3>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <FiUpload className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Click to upload or drag & drop</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Screenshots Grid */}
        {screenshots.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Uploads</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {screenshots.map(screenshot => (
                <div
                  key={screenshot.id}
                  className="relative group bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden"
                >
                  {/* Image */}
                  <img
                    src={screenshot.url}
                    alt="Trade setup"
                    className="w-full h-40 object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                    <button
                      onClick={() => downloadScreenshot(screenshot.url, screenshot.timestamp)}
                      className="btn-compact btn-primary"
                      title="Download"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteScreenshot(screenshot.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      title="Delete"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="p-3 card border-t">
                    {editingId === screenshot.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        onBlur={() => updateCaption(screenshot.id, editCaption)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateCaption(screenshot.id, editCaption);
                          }
                        }}
                        placeholder="Add caption..."
                        className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      <p
                        onClick={() => {
                          setEditingId(screenshot.id);
                          setEditCaption(screenshot.caption);
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                      >
                        {screenshot.caption || 'Click to add caption...'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
