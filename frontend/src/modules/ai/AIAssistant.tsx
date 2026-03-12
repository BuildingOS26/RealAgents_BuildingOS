import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Building, Loader2, FileText, FolderOpen, RefreshCw } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { API_URL } from '../../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BuildingInfo {
  id: string;
  name: string;
}

interface BuildingDetails {
  [key: string]: {
    name: string;
    categories: {
      [key: string]: {
        fileCount: number;
        files: { name: string; path: string }[];
      };
    };
  };
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I'm your BuildingOS AI Assistant. I can help you with information about your buildings based on the documents uploaded to each building's folders.

Select one or more buildings above to get started. You can select multiple buildings to ask questions across all of them.

I can help you with:
• Finding information in building documents
• Comparing information across multiple buildings
• Architectural, Electrical, Mechanical specifications
• Reports and compliance documentation
• General building management questions

What would you like help with today?`,
  timestamp: new Date()
};

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState<BuildingInfo[]>([]);
  const [buildingDetails, setBuildingDetails] = useState<BuildingDetails>({});
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingStatus, setIndexingStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch available buildings on mount
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;

        const response = await fetch(`${API_URL}/_api/ai/buildings`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBuildings(data.buildings || []);
          setBuildingDetails(data.details || {});
        }
      } catch (error) {
        console.error('Error fetching buildings:', error);
      } finally {
        setLoadingBuildings(false);
      }
    };

    fetchBuildings();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get the selected buildings' details
  const selectedBuildingsDetails = selectedBuildings
    .map(name => buildingDetails[name])
    .filter(Boolean);

  // Toggle building selection
  const toggleBuilding = (buildingName: string) => {
    setSelectedBuildings(prev =>
      prev.includes(buildingName)
        ? prev.filter(b => b !== buildingName)
        : [...prev, buildingName]
    );
  };

  // Smart sync documents for selected buildings (only indexes new/modified files)
  const reindexBuildings = async (forceReindex = false) => {
    if (selectedBuildings.length === 0 || isIndexing) return;

    setIsIndexing(true);
    setIndexingStatus('Checking for changes...');

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;

      // First, initialize vector bucket (in case it doesn't exist)
      setIndexingStatus('Setting up vector storage...');
      await fetch(`${API_URL}/_api/ai/vectors/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      // Sync each selected building
      const results = [];
      for (const building of selectedBuildings) {
        setIndexingStatus(forceReindex
          ? `Re-indexing ${building} documents...`
          : `Syncing ${building} documents...`);

        const response = await fetch(`/_api/ai/vectors/sync/${encodeURIComponent(building)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ forceReindex, includeRetry: true })
        });

        if (response.ok) {
          const data = await response.json();
          results.push({ building, ...data.summary });
        }
      }

      const totalProcessed = results.reduce((sum, r) => sum + (r.processed || 0), 0);
      const totalUpToDate = results.reduce((sum, r) => sum + (r.upToDate || 0), 0);

      if (totalProcessed === 0) {
        setIndexingStatus(`✓ All ${totalUpToDate} files across ${selectedBuildings.length} building(s) are indexed`);
      } else {
        setIndexingStatus(`✓ Synced ${selectedBuildings.length} building(s): ${totalProcessed} new files indexed`);
      }

      // Clear status after 5 seconds
      setTimeout(() => setIndexingStatus(null), 5000);
    } catch (error) {
      console.error('Sync error:', error);
      setIndexingStatus('❌ Sync failed. Check console for details.');
      setTimeout(() => setIndexingStatus(null), 5000);
    } finally {
      setIsIndexing(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;

      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch(`${API_URL}/_api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          selectedBuildings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">AI Assistant</h1>
        <p className="text-gray-600">
          Ask questions about your buildings based on uploaded documentation
        </p>

        {/* Building Selector */}
        <div className="mt-6">
          {loadingBuildings ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading buildings...</span>
            </div>
          ) : buildings.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800">
                No buildings found. Upload building documents to the <strong>building-files</strong> bucket in Supabase to get started.
              </p>
            </div>
          ) : (
            <>
              {/* Building Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildings.map((building) => {
                  const details = buildingDetails[building.name];
                  const categoryCount = details ? Object.keys(details.categories).length : 0;
                  const totalFiles = details
                    ? Object.values(details.categories).reduce((sum, cat) => sum + cat.fileCount, 0)
                    : 0;

                  return (
                    <button
                      key={building.id}
                      onClick={() => toggleBuilding(building.name)}
                      className={`text-left p-5 rounded-xl border-2 transition-all ${selectedBuildings.includes(building.name)
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedBuildings.includes(building.name) ? 'bg-blue-500' : 'bg-blue-100'
                          }`}>
                          <Building className={`w-6 h-6 ${selectedBuildings.includes(building.name) ? 'text-white' : 'text-blue-600'}`} />
                        </div>
                        {selectedBuildings.includes(building.name) && (
                          <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                            {selectedBuildings.indexOf(building.name) + 1}
                          </span>
                        )}
                      </div>
                      <h3 className="text-gray-900 font-medium mb-2">{building.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="w-4 h-4" />
                          {categoryCount} categories
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {totalFiles} files
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Buildings Details */}
              {selectedBuildings.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      {selectedBuildings.length === 1
                        ? `Selected: ${selectedBuildings[0]}`
                        : `Selected ${selectedBuildings.length} buildings: ${selectedBuildings.join(', ')}`}
                    </h4>
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <button
                        onClick={() => reindexBuildings(true)}
                        disabled={isIndexing}
                        className="inline-flex items-center gap-3 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        style={{ flexDirection: 'row' }}
                        title="Sync and re-index all documents"
                      >
                        <RefreshCw className={`w-4 h-4 flex-shrink-0 ${isIndexing ? 'animate-spin' : ''}`} style={{ display: 'inline-block' }} />
                        <span style={{ display: 'inline' }}>{isIndexing ? 'Syncing...' : 'Sync Documents & Reindex'}</span>
                      </button>
                      <p className="text-xs text-gray-500 italic">Press this after uploading new files</p>
                    </div>
                  </div>
                  {indexingStatus && (
                    <div className={`mb-2 text-sm ${indexingStatus.includes('✓') ? 'text-green-600' : indexingStatus.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
                      {indexingStatus}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedBuildingsDetails.flatMap((details, idx) =>
                      Object.entries(details.categories).map(([category, data]) => (
                        <span
                          key={`${selectedBuildings[idx]}-${category}`}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                        >
                          {selectedBuildings.length > 1 ? `${selectedBuildings[idx]}: ` : ''}{category} ({data.fileCount})
                        </span>
                      ))
                    )}
                  </div>
                  {selectedBuildings.length > 1 && (
                    <p className="mt-2 text-xs text-gray-500">
                      You can ask questions that compare or span across all selected buildings.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl p-4 ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 shadow-sm'
                  }`}>
                  <p className={`whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {message.content}
                  </p>
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about maintenance, suppliers, parts ordering, scheduling, or upgrades..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              {selectedBuildings.length === 0
                ? 'Select one or more buildings above to focus your questions'
                : selectedBuildings.length === 1
                  ? `Focused on ${selectedBuildings[0]} documentation`
                  : `Focused on ${selectedBuildings.length} buildings: ${selectedBuildings.join(', ')}`}
            </p>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
