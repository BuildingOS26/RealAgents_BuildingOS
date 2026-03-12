import { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Folder, Search, Calendar, User, Download, Eye, Plus, ChevronRight, ChevronDown, Home, Zap, Trash2, X, CheckCircle, AlertCircle, MessageCircle, Send, Bot, Loader2 } from 'lucide-react';
import { uploadFile, listFiles, createFileRecord, deleteFileRecord, getFileCounts, deleteFile } from '../lib/supabase';
import { API_URL } from '../lib/api';
import { useAuth } from '../modules/auth/AuthContext';


const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 15000); // Auto-dismiss after 15 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-up z-50 max-w-md ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
      }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
      ) : (
        <AlertCircle className="w-5 h-5 mt-0.5 text-red-500" />
      )}
      <div className="flex-1">
        <h4 className="font-medium text-sm mb-1">{type === 'success' ? 'Success' : 'Error'}</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const defaultCategories = [
  { name: 'Architectural', count: 0, icon: Home },
  { name: 'Mechanical', count: 0, icon: Zap },
  { name: 'Electrical', count: 0, icon: Zap },
  { name: 'Plumbing', count: 0, icon: Zap },
  { name: 'Structural', count: 0, icon: Home },
  { name: 'Reports', count: 0, icon: FileText },
];

export function FileManagement() {
  const { profile } = useAuth();
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ buildingId: string; buildingName: string; type: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | number | null>(null);
  const [fetchedFiles, setFetchedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [buildings, setBuildings] = useState<any[]>([]);
  
  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFile, setChatFile] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Load data function extracted for re-use
  const refreshData = async () => {
    try {
      // 1. Fetch Buildings (filtered by company)
      const companyParam = profile?.company ? `?companyId=${encodeURIComponent(profile.company)}` : '';
      const response = await fetch(`${API_URL}/_api/buildings${companyParam}`);
      if (!response.ok) throw new Error('Failed to fetch buildings');
      const buildingsData = await response.json();

      // 2. Fetch File Counts (scoped to company's buildings only)
      const buildingIds = buildingsData.map((b: any) => b.id);
      const counts: any = await getFileCounts(profile?.company, buildingIds);

      // 3. Map to UI State
      const mappedBuildings = buildingsData.map((b: any) => {
        const buildingCounts = counts[b.id] || { total: 0, categories: {} };
        return {
          id: b.id,
          name: b.name,
          fileCount: buildingCounts.total,
          categories: defaultCategories.map(cat => ({
            ...cat,
            count: buildingCounts.categories[cat.name.toLowerCase()] || 0
          }))
        };
      });

      setBuildings(mappedBuildings);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Load buildings and then counts (wait for profile to load)
  useEffect(() => {
    if (!profile?.company) return;
    refreshData();
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, [profile?.company]);

  const getFolderPath = () => {
    if (!selectedCategory) return '';
    return `${selectedCategory.buildingName}/${selectedCategory.type}`;
  };

  // Load files from Supabase when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadCategoryFiles();
    } else {
      setFetchedFiles([]);
    }
  }, [selectedCategory]);

  const loadCategoryFiles = async () => {
    const folderPath = getFolderPath();
    if (!folderPath) return;

    try {
      setLoadingFiles(true);
      const files = await listFiles('test-building-files', folderPath);

      // Transform Supabase files to UI format
      const formattedFiles = (files || []).map(f => ({
        id: f.id,
        name: f.name.replace(/^\d+_/, ''), // Remove timestamp prefix if present for display
        _realName: f.name, // Keep real name for deletion/download
        format: f.name.split('.').pop()?.toUpperCase() || 'FILE',
        uploadedBy: 'You', // Placeholder
        uploadDate: new Date(f.created_at).toLocaleDateString(),
        size: (f.metadata?.size ? (f.metadata.size / 1024 / 1024).toFixed(1) + ' MB' : '0 MB'),
        linkedTo: null,
        tags: [],
        recentUpdate: null,
        isSupabase: true,
      }));

      setFetchedFiles(formattedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCategory) return;

    try {
      setUploading(true);
      const folderPath = getFolderPath();
      const { data: result, error: uploadError } = await uploadFile(file, 'test-building-files', folderPath);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        setToast({
          show: true,
          message: `Upload failed: ${uploadError?.message || 'Unknown storage error'}`,
          type: 'error'
        });
        return;
      }

      if (result) {
        console.log('File uploaded successfully:', result);

        // Create DB Record
        const { error: dbError } = await createFileRecord({
          companyId: profile?.company || 'default_company',
          buildingId: selectedCategory.buildingId,
          folder: selectedCategory.type.toLowerCase(), // Ensure enum compatibility
          filename: file.name,
          fileType: file.name.split('.').pop() || 'unknown',
          s3Key: result.fileName,
        });

        if (dbError) {
          console.warn('Database metadata create error (non-critical):', dbError);
        }

        setToast({
          show: true,
          message: 'File uploaded successfully',
          type: 'success'
        });

        // Reload files and counts
        await loadCategoryFiles();
        await refreshData();

        // Auto-sync documents for AI (if it's a PDF)
        if (file.name.toLowerCase().endsWith('.pdf')) {
          syncBuildingDocuments(selectedCategory.buildingName);
        }

        // Reset file input
        event.target.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setToast({
        show: true,
        message: 'An unexpected error occurred during upload',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (file: any) => {
    try {
      if (!selectedCategory) return;

      const folderPath = getFolderPath();
      const confirmed = true; // Auto-confirm to fix UI lag/blocking
      if (!confirmed) return;

      console.log('Attempting verify delete for:', file.name, 'Real Name:', file._realName, 'Folder:', folderPath);

      // Construct full path. 
      // Note: If listFiles matches how we stored it, file._realName is just the filename part.
      const fullPath = folderPath ? `${folderPath}/${file._realName}` : file._realName;

      // Permanent delete from storage
      const deleteSuccess = await deleteFile(fullPath, 'test-building-files');

      if (!deleteSuccess) {
        console.warn("Permanent delete from storage failed.");
        // We might still want to try deleting from DB if it was already gone from storage?
        // But let's warn the user.
        setToast({
          show: true,
          message: 'Failed to delete file from storage',
          type: 'error'
        });
        return;
      }

      // Delete from Database
      const dbSuccess = await deleteFileRecord(fullPath, file.name);

      if (dbSuccess) {
        setFetchedFiles(prev => prev.filter(f => f.id !== file.id));
        setToast({
          show: true,
          message: 'File permanently deleted',
          type: 'success'
        });
        await refreshData(); // Refresh counts
      } else {
        setToast({
          show: true,
          message: 'Failed to delete file record from database',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setToast({
        show: true,
        message: 'An unexpected error occurred during deletion',
        type: 'error'
      });
    }
  };

  /*
  const buildings = [
    // ... replaced by state
  ];
  */

  const toggleBuilding = (buildingId: string) => {
    setExpandedBuildings(prev =>
      prev.includes(buildingId)
        ? prev.filter(id => id !== buildingId)
        : [...prev, buildingId]
    );
  };

  const selectCategory = (buildingName: string, buildingId: string, type: string) => {
    setSelectedCategory({ buildingName, buildingId, type });
    setSelectedFile(null);
  };

  // No static files anymore
  const currentFiles = fetchedFiles;

  const selectedFileData = currentFiles.find(f => f.id === selectedFile);

  const getFileIcon = (format: string) => {
    const fmt = format.toUpperCase();
    if (fmt === 'PDF') return <FileText className="w-5 h-5 text-red-500" />;
    if (fmt === 'DWG') return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (['JPG', 'PNG', 'JPEG'].includes(fmt)) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  // Calculate total files from dynamic stats
  const totalFiles = buildings.reduce((acc, b) => acc + b.fileCount, 0);

  // Hidden file input ref (simulated by ID)
  const triggerFileUpload = () => {
    document.getElementById('hidden-file-input')?.click();
  };

  // Get Supabase public URL for a file
  const getFileUrl = (file: any) => {
    if (!selectedCategory) return '';
    const folderPath = getFolderPath();
    // Encode each path segment separately to preserve slashes
    const encodedPath = folderPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const encodedFileName = encodeURIComponent(file._realName);
    // Construct Supabase storage public URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lxlrwiltjwfbvjkhsgis.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/test-building-files/${encodedPath}/${encodedFileName}`;
  };

  // View file in new tab
  const handleViewFile = (file: any) => {
    const url = getFileUrl(file);
    window.open(url, '_blank');
  };

  // Download file
  const handleDownloadFile = async (file: any) => {
    try {
      const url = getFileUrl(file);
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setToast({
        show: true,
        message: 'File downloaded successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Download error:', error);
      setToast({
        show: true,
        message: 'Failed to download file',
        type: 'error'
      });
    }
  };

  // Auto-sync documents for AI after file upload
  const syncBuildingDocuments = async (buildingName: string) => {
    try {
      await fetch(`${API_URL}/_api/ai/vectors/sync/${encodeURIComponent(buildingName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`Auto-synced documents for ${buildingName}`);
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  };

  // Open chat for a specific file
  const openFileChat = (file: any) => {
    setChatFile(file);
    setChatMessages([]);
    setChatInput('');
    setChatOpen(true);
  };

  // Send chat message about the file
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !chatFile || !selectedCategory) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    // Construct the file path for filtering (matches how it's stored in embeddings)
    const filePath = `${selectedCategory.buildingName}/${selectedCategory.type}/${chatFile._realName}`;

    try {
      // Call the AI chat endpoint with single-file filter
      const response = await fetch(`${API_URL}/_api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          selectedBuildings: [selectedCategory.buildingName],
          filterFilePath: filePath,  // Single-file filter
          conversationHistory: chatMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response || 'No response received.' }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not connect to the AI service.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">File Management</h1>
          <p className="text-gray-600">
            {totalFiles} files organized by building and type
          </p>
        </div>
        <button
          onClick={triggerFileUpload}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Upload File
        </button>
        <input
          id="hidden-file-input"
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-900">{totalFiles}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-gray-900">Pending</div>
              <div className="text-sm text-gray-600">Recent Updates</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-gray-900">{buildings.length}</div>
              <div className="text-sm text-gray-600">Buildings</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-orange-900">Pending</div>
              <div className="text-sm text-orange-700">Upgrade Plans</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder Tree Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Folders</h2>
          </div>

          <div className="space-y-1">
            {/* Buildings */}
            {buildings.map((building) => {
              const isExpanded = expandedBuildings.includes(building.id);
              return (
                <div key={building.id}>
                  <button
                    onClick={() => toggleBuilding(building.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                    <Folder className="w-4 h-4 text-blue-500" />
                    <span className="flex-1 text-left text-sm text-gray-900">{building.name}</span>
                    {building.fileCount > 0 && (
                      <span className="text-xs text-gray-500">{building.fileCount}</span>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {building.categories.map((category) => {
                        const isSelected = selectedCategory?.buildingName === building.name && selectedCategory?.type === category.name;
                        return (
                          <button
                            key={category.name}
                            onClick={() => selectCategory(building.name, building.id, category.name)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="flex-1 text-left text-sm">{category.name}</span>
                            {category.count > 0 && (
                              <span className="text-xs text-gray-500">{category.count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}


          </div>
        </div>

        {/* Files List */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCategory ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-gray-900">{selectedCategory.buildingName}</h2>
                  <p className="text-sm text-gray-600">{selectedCategory.type} • {currentFiles.length} files</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {loadingFiles && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Loading files...</p>
                </div>
              )}

              {!loadingFiles && currentFiles.length > 0 ? (
                currentFiles.map((file, idx) => (
                  <button
                    key={file.id || idx}
                    onClick={() => setSelectedFile(file.id)}
                    className={`w-full text-left bg-white rounded-xl p-6 border transition-all ${selectedFile === file.id
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getFileIcon(file.format)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-gray-900 mb-1">{file.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {file.format}
                              </span>
                              <span>{file.size}</span>
                              {file.isSupabase && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  Synced
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 transition-transform flex-shrink-0 ${selectedFile === file.id ? 'rotate-90 text-blue-600' : 'text-gray-400'
                            }`} />
                        </div>

                        {file.recentUpdate && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-2">
                            <div className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                              <div className="flex-1">
                                <p className="text-sm text-green-900">{file.recentUpdate.type}</p>
                                <p className="text-xs text-green-700 mt-1">{file.recentUpdate.description}</p>
                                <div className="flex items-center gap-3 text-xs text-green-600 mt-2">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {file.recentUpdate.by}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {file.recentUpdate.date}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    {file.recentUpdate.photos} photos
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {file.uploadedBy}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {file.uploadDate}
                          </div>
                          {file.linkedTo && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">Linked: {file.linkedTo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No files in this category yet</p>
                  <button
                    onClick={triggerFileUpload}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {currentFiles.length > 0 ? 'Upload File' : 'Upload First File'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a folder to view files</p>
            </div>
          )}
        </div>

        {/* File Details Sidebar */}
        <div className="space-y-6">
          {selectedFileData ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-gray-900 mb-4">File Details</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFileData.tags.map((tag: any, index: any) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {selectedFileData.tags.length === 0 && <span className="text-xs text-gray-400">No tags</span>}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Format</p>
                  <p className="text-gray-900">{selectedFileData.format}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Size</p>
                  <p className="text-gray-900">{selectedFileData.size}</p>
                </div>

                {selectedFileData.linkedTo && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Linked To</p>
                    <p className="text-blue-600 hover:underline cursor-pointer">{selectedFileData.linkedTo}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => handleViewFile(selectedFileData)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View File
                </button>
                <button 
                  onClick={() => openFileChat(selectedFileData)}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat About File
                </button>
                <button 
                  onClick={() => handleDownloadFile(selectedFileData)}
                  className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Update
                </button>
                {selectedFileData.isSupabase && (
                  <button
                    onClick={() => handleDeleteFile(selectedFileData)}
                    className="w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete File
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a file to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && chatFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-medium">Chat About File</h3>
                  <p className="text-sm text-gray-500 truncate max-w-[300px]">{chatFile.name}</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Ask any question about this document.</p>
                  <p className="text-gray-400 text-xs mt-1">The AI will search the document content to answer.</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-xl flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  placeholder="Ask a question about this document..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}