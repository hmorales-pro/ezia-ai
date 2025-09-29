'use client';

import { useState, useEffect, useRef } from 'react';
import { StreamingEvent, SiteStructure } from '@/lib/schemas/site-generator';

interface StreamingSiteGeneratorProps {
  onSiteGenerated?: (site: SiteStructure) => void;
}

export default function StreamingSiteGenerator({ onSiteGenerated }: StreamingSiteGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [events, setEvents] = useState<StreamingEvent[]>([]);
  const [siteStructure, setSiteStructure] = useState<Partial<SiteStructure>>({});
  const [htmlPreview, setHtmlPreview] = useState('');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle streaming events
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startGeneration = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setEvents([]);
    setSiteStructure({});
    setHtmlPreview('');
    setShowJsonEditor(false);

    try {
      const response = await fetch('/api/sites/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          tone: 'professional',
          pages: ['home', 'services', 'contact'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: StreamingEvent = JSON.parse(line.slice(6));
              setEvents(prev => [...prev, event]);
              handleEvent(event);
            } catch (error) {
              console.error('Failed to parse event:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      setEvents(prev => [...prev, {
        type: 'error',
        payload: { message: error instanceof Error ? error.message : 'Unknown error' }
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvent = (event: StreamingEvent) => {
    switch (event.type) {
      case 'theme':
        setSiteStructure(prev => ({ ...prev, theme: event.payload }));
        break;
      
      case 'page':
        setSiteStructure(prev => ({
          ...prev,
          pages: [...(prev.pages || []), event.payload.page]
        }));
        break;
      
      case 'navigation':
        setSiteStructure(prev => ({ ...prev, navigation: event.payload }));
        break;
      
      case 'complete':
        // Generate final HTML
        generatePreview();
        if (onSiteGenerated && siteStructure.theme && siteStructure.pages) {
          onSiteGenerated(siteStructure as SiteStructure);
        }
        break;
      
      case 'error':
        console.error('Generation error:', event.payload);
        break;
    }
  };

  const generatePreview = () => {
    if (!siteStructure.theme || !siteStructure.pages) return;

    // Import renderer dynamically
    import('@/lib/renderer/site-renderer').then(({ siteRenderer }) => {
      const completeSite: SiteStructure = {
        id: siteStructure.id || 'preview',
        title: siteStructure.title || 'Generated Site',
        description: siteStructure.description || '',
        locale: siteStructure.locale || 'fr',
        domain: siteStructure.domain,
        pages: siteStructure.pages,
        assets: siteStructure.assets || [],
        theme: siteStructure.theme,
        navigation: siteStructure.navigation || {
          header: { logo: '', links: [] },
          footer: { logo: '', links: [], copyright: '' }
        },
        customBlocks: siteStructure.customBlocks || {}
      };

      const html = siteRenderer.renderSite(completeSite);
      setHtmlPreview(html);
      setJsonContent(JSON.stringify(completeSite, null, 2));
    });
  };

  const updateFromJson = () => {
    try {
      const updated = JSON.parse(jsonContent);
      setSiteStructure(updated);
      
      // Regenerate preview
      if (updated.theme && updated.pages) {
        import('@/lib/renderer/site-renderer').then(({ siteRenderer }) => {
          const html = siteRenderer.renderSite(updated);
          setHtmlPreview(html);
        });
      }
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const exportSite = () => {
    if (!htmlPreview) return;

    const blob = new Blob([htmlPreview], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteStructure.title || 'site'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'phase_start': return '🚀';
      case 'phase_complete': return '✅';
      case 'theme': return '🎨';
      case 'page': return '📄';
      case 'block': return '🧩';
      case 'navigation': return '🧭';
      case 'complete': return '🎉';
      case 'error': return '❌';
      default: return '📝';
    }
  };

  const getEventDescription = (event: StreamingEvent) => {
    switch (event.type) {
      case 'phase_start':
        return `Starting: ${event.payload.description}`;
      case 'phase_complete':
        return `Completed: ${event.payload.phase}`;
      case 'theme':
        return 'Theme generated';
      case 'page':
        return `Page created: ${event.payload.page.title}`;
      case 'block':
        return `Block added: ${event.payload.block.component}`;
      case 'navigation':
        return 'Navigation generated';
      case 'complete':
        return 'Site generation complete!';
      case 'error':
        return `Error: ${event.payload.message}`;
      default:
        return 'Unknown event';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">AI Website Generator</h1>
          
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your website
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A modern coffee shop in Paris with online ordering..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                disabled={isGenerating}
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={startGeneration}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Website'}
              </button>
              
              {htmlPreview && (
                <>
                  <button
                    onClick={() => setShowJsonEditor(!showJsonEditor)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    {showJsonEditor ? 'Hide JSON' : 'Edit JSON'}
                  </button>
                  <button
                    onClick={exportSite}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Export HTML
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Events Log */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Generation Progress</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{getEventDescription(event)}</p>
                      {event.type === 'phase_start' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Agent: {event.payload.agent}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No events yet. Start generation to see progress.
                  </p>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Preview</h2>
                {htmlPreview && (
                  <button
                    onClick={() => {
                      const newWindow = window.open();
                      if (newWindow) {
                        newWindow.document.write(htmlPreview);
                        newWindow.document.close();
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Open in new tab
                  </button>
                )}
              </div>
              
              {showJsonEditor ? (
                <div className="h-96">
                  <textarea
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    className="w-full h-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    spellCheck={false}
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={updateFromJson}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Update Preview
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                  {htmlPreview ? (
                    <iframe
                      ref={iframeRef}
                      srcDoc={htmlPreview}
                      className="w-full h-full"
                      sandbox="allow-same-origin"
                      title="Website Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Preview will appear here...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}