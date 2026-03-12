import { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Folder, Search, Calendar, User, MapPin, Download, Eye, Plus, ChevronRight, ChevronDown, Home, Zap, FileCheck } from 'lucide-react';

export function FileManagement() {
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>(['tower-a']);
  const [selectedCategory, setSelectedCategory] = useState<{ building: string; type: string } | null>({ building: 'Tower A', type: 'Mechanical' });
  const [selectedFile, setSelectedFile] = useState<number | null>(null);

  const buildings = [
    {
      id: 'tower-a',
      name: 'Tower A',
      fileCount: 42,
      categories: [
        { name: 'Architectural', count: 8, icon: Home },
        { name: 'Mechanical', count: 12, icon: Zap },
        { name: 'Electrical', count: 9, icon: Zap },
        { name: 'Plumbing', count: 6, icon: Zap },
        { name: 'Structural', count: 4, icon: Home },
        { name: 'Reports', count: 3, icon: FileText },
      ],
    },
    {
      id: 'tower-b',
      name: 'Tower B',
      fileCount: 38,
      categories: [
        { name: 'Architectural', count: 7, icon: Home },
        { name: 'Mechanical', count: 10, icon: Zap },
        { name: 'Electrical', count: 8, icon: Zap },
        { name: 'Plumbing', count: 7, icon: Zap },
        { name: 'Structural', count: 3, icon: Home },
        { name: 'Reports', count: 3, icon: FileText },
      ],
    },
    {
      id: 'building-c',
      name: 'Building C',
      fileCount: 29,
      categories: [
        { name: 'Architectural', count: 5, icon: Home },
        { name: 'Mechanical', count: 8, icon: Zap },
        { name: 'Electrical', count: 7, icon: Zap },
        { name: 'Plumbing', count: 4, icon: Zap },
        { name: 'Structural', count: 2, icon: Home },
        { name: 'Reports', count: 3, icon: FileText },
      ],
    },
  ];

  const projectDocuments = {
    name: 'Project Documents',
    categories: [
      { name: 'Upgrade Plans', count: 4, icon: Zap },
      { name: 'Compliance Reports', count: 12, icon: FileCheck },
      { name: 'Vendor Documents', count: 8, icon: FileText },
      { name: 'Building Codes', count: 15, icon: FileText },
    ],
  };

  const filesByCategory = {
    'Tower A-Mechanical': [
      {
        id: 1,
        name: 'HVAC System Blueprint - Roof Level',
        format: 'PDF',
        uploadedBy: 'Mike Chen',
        uploadDate: '2024-11-26',
        size: '4.2 MB',
        linkedTo: 'WO-2847',
        tags: ['HVAC', 'Compressor', 'Roof'],
        recentUpdate: {
          type: 'Inspection Report',
          description: 'Quarterly HVAC inspection completed. Filter replacement recommended.',
          date: '2024-11-26 10:30 AM',
          by: 'Mike Chen',
          photos: 3,
        },
      },
      {
        id: 2,
        name: 'Chiller Plant As-Built Drawings',
        format: 'DWG',
        uploadedBy: 'Sarah Johnson',
        uploadDate: '2024-11-20',
        size: '8.5 MB',
        linkedTo: null,
        tags: ['Chiller', 'Basement', 'As-Built'],
        recentUpdate: null,
      },
      {
        id: 3,
        name: 'Air Handler Unit Specifications',
        format: 'PDF',
        uploadedBy: 'Mike Chen',
        uploadDate: '2024-11-15',
        size: '2.1 MB',
        linkedTo: null,
        tags: ['AHU', 'Specifications'],
        recentUpdate: null,
      },
    ],
    'Tower A-Electrical': [
      {
        id: 4,
        name: 'Main Distribution Panel Layout',
        format: 'PDF',
        uploadedBy: 'David Martinez',
        uploadDate: '2024-11-22',
        size: '3.2 MB',
        linkedTo: null,
        tags: ['Electrical', 'Distribution', 'Panel'],
        recentUpdate: null,
      },
    ],
    'Tower A-Reports': [
      {
        id: 5,
        name: 'Elevator Inspection Report Q4 2024',
        format: 'PDF',
        uploadedBy: 'William Foster',
        uploadDate: '2024-11-20',
        size: '856 KB',
        linkedTo: null,
        tags: ['Elevator', 'Inspection', 'Compliance'],
        recentUpdate: {
          type: 'Inspection Report',
          description: 'Annual elevator inspection completed. All units passed.',
          date: '2024-11-20 03:30 PM',
          by: 'William Foster',
          photos: 8,
        },
      },
    ],
    'Building C-Electrical': [
      {
        id: 6,
        name: 'Emergency Exit Lighting Plan',
        format: 'PDF',
        uploadedBy: 'David Martinez',
        uploadDate: '2024-11-25',
        size: '2.1 MB',
        linkedTo: 'WO-2846',
        tags: ['Lighting', 'Safety', 'Floor 3'],
        recentUpdate: {
          type: 'Repair Report',
          description: 'Exit light on Floor 3 East Wing repaired and tested.',
          date: '2024-11-25 03:45 PM',
          by: 'David Martinez',
          photos: 2,
        },
      },
    ],
    'Tower B-Plumbing': [
      {
        id: 7,
        name: 'Plumbing Riser Diagram',
        format: 'DWG',
        uploadedBy: 'Sarah Johnson',
        uploadDate: '2024-11-24',
        size: '3.8 MB',
        linkedTo: 'WO-2845',
        tags: ['Plumbing', 'Water Supply', 'Floor 5'],
        recentUpdate: {
          type: 'Maintenance Log',
          description: 'Water leak repair completed. Pressure tested and verified.',
          date: '2024-11-24 04:20 PM',
          by: 'Sarah Johnson',
          photos: 4,
        },
      },
    ],
    'Building C-Mechanical': [
      {
        id: 8,
        name: 'Generator Room Layout',
        format: 'PDF',
        uploadedBy: 'Lisa Park',
        uploadDate: '2024-11-23',
        size: '1.9 MB',
        linkedTo: 'WO-2844',
        tags: ['Generator', 'Basement', 'Emergency Power'],
        recentUpdate: null,
      },
    ],
    'Project Documents-Upgrade Plans': [
      {
        id: 9,
        name: 'HVAC Modernization - Tower B Proposal',
        format: 'PDF',
        uploadedBy: 'John Davis',
        uploadDate: '2024-11-18',
        size: '12.4 MB',
        linkedTo: 'Upgrade Project #1',
        tags: ['HVAC', 'Upgrade', 'Tower B'],
        recentUpdate: null,
      },
      {
        id: 10,
        name: 'LED Lighting Retrofit Plan - Building C',
        format: 'PDF',
        uploadedBy: 'David Martinez',
        uploadDate: '2024-11-15',
        size: '4.8 MB',
        linkedTo: 'Upgrade Project #2',
        tags: ['Lighting', 'Upgrade', 'Energy'],
        recentUpdate: null,
      },
    ],
    'Project Documents-Compliance Reports': [
      {
        id: 11,
        name: 'Q4 2024 Compliance Summary',
        format: 'PDF',
        uploadedBy: 'John Davis',
        uploadDate: '2024-11-20',
        size: '2.3 MB',
        linkedTo: null,
        tags: ['Compliance', 'Quarterly', 'Summary'],
        recentUpdate: null,
      },
    ],
  };

  const toggleBuilding = (buildingId: string) => {
    setExpandedBuildings(prev => 
      prev.includes(buildingId) 
        ? prev.filter(id => id !== buildingId)
        : [...prev, buildingId]
    );
  };

  const selectCategory = (building: string, type: string) => {
    setSelectedCategory({ building, type });
    setSelectedFile(null);
  };

  const currentFiles = selectedCategory 
    ? filesByCategory[`${selectedCategory.building}-${selectedCategory.type}` as keyof typeof filesByCategory] || []
    : [];

  const selectedFileData = currentFiles.find(f => f.id === selectedFile);

  const getFileIcon = (format: string) => {
    if (format === 'PDF') return <FileText className="w-5 h-5 text-red-500" />;
    if (format === 'DWG') return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const totalFiles = Object.values(filesByCategory).flat().length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">File Management</h1>
          <p className="text-gray-600">
            {totalFiles} files organized by building and type
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Upload Files
        </button>
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
              <div className="text-gray-900">6</div>
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
              <div className="text-gray-900">3</div>
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
              <div className="text-orange-900">4</div>
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
                    <span className="text-xs text-gray-500">{building.fileCount}</span>
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {building.categories.map((category) => {
                        const isSelected = selectedCategory?.building === building.name && selectedCategory?.type === category.name;
                        return (
                          <button
                            key={category.name}
                            onClick={() => selectCategory(building.name, category.name)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="flex-1 text-left text-sm">{category.name}</span>
                            <span className="text-xs text-gray-500">{category.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Project Documents */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => toggleBuilding('project-docs')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {expandedBuildings.includes('project-docs') ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
                <Folder className="w-4 h-4 text-purple-500" />
                <span className="flex-1 text-left text-sm text-gray-900">{projectDocuments.name}</span>
              </button>

              {expandedBuildings.includes('project-docs') && (
                <div className="ml-6 mt-1 space-y-1">
                  {projectDocuments.categories.map((category) => {
                    const isSelected = selectedCategory?.building === 'Project Documents' && selectedCategory?.type === category.name;
                    return (
                      <button
                        key={category.name}
                        onClick={() => selectCategory('Project Documents', category.name)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          isSelected ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span className="flex-1 text-left text-sm">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCategory ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-gray-900">{selectedCategory.building}</h2>
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

              {currentFiles.length > 0 ? (
                currentFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file.id)}
                    className={`w-full text-left bg-white rounded-xl p-6 border transition-all ${
                      selectedFile === file.id
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
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 transition-transform flex-shrink-0 ${
                            selectedFile === file.id ? 'rotate-90 text-blue-600' : 'text-gray-400'
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
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Upload First File
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
                    {selectedFileData.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
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
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View File
                </button>
                <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Update
                </button>
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
    </div>
  );
}