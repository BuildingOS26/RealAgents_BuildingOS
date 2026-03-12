import { useState } from 'react';
import { Upload, FileText, Image, File, Search, Filter, Eye, Brain, Layers, Zap, CheckCircle2, Loader2 } from 'lucide-react';

export function DocumentAnalysis() {
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);

  const documents = [
    {
      id: 1,
      name: 'Tower B - HVAC System Blueprint',
      type: 'Blueprint',
      uploadDate: '2024-11-20',
      status: 'Analyzed',
      pages: 24,
      processingTime: '3m 42s',
      confidence: 97.8,
      insights: [
        'System capacity: 2,500 CFM per floor',
        'Compliance: Meets ASHRAE 90.1 standards',
        'Identified: 3 maintenance access points',
        'Energy efficiency rating: 92%',
      ],
      extractedData: {
        components: 147,
        measurements: 892,
        specifications: 34,
        codeReferences: 12,
      },
    },
    {
      id: 2,
      name: 'Building Code Manual 2025',
      type: 'Code Document',
      uploadDate: '2024-11-19',
      status: 'Analyzed',
      pages: 156,
      processingTime: '8m 15s',
      confidence: 99.2,
      insights: [
        '12 new code updates applicable to facility',
        'Fire safety requirements updated',
        '3 critical compliance actions needed',
        'Deadline: March 2025',
      ],
      extractedData: {
        regulations: 234,
        requirements: 567,
        changesFromPrevious: 42,
        applicableSections: 89,
      },
    },
    {
      id: 3,
      name: 'Fire Suppression System Specs',
      type: 'Technical Spec',
      uploadDate: '2024-11-18',
      status: 'Analyzed',
      pages: 45,
      processingTime: '2m 58s',
      confidence: 96.5,
      insights: [
        'System type: Wet pipe sprinkler',
        'Coverage: 99.2% of building area',
        'Inspection schedule: Quarterly',
        'Last inspection: Passed',
      ],
      extractedData: {
        components: 89,
        specifications: 156,
        testingProtocols: 23,
        maintenanceItems: 45,
      },
    },
    {
      id: 4,
      name: 'Electrical Distribution Plan',
      type: 'Blueprint',
      uploadDate: '2024-11-15',
      status: 'Processing',
      pages: 32,
      processingTime: null,
      confidence: null,
      insights: [],
      extractedData: null,
    },
  ];

  const processingStages = [
    { name: 'Document Upload', status: 'complete', time: '0.2s' },
    { name: 'OCR Processing', status: 'complete', time: '1.8s' },
    { name: 'Entity Extraction', status: 'complete', time: '0.9s' },
    { name: 'Semantic Analysis', status: 'processing', time: '1.1s' },
    { name: 'Code Cross-Reference', status: 'pending', time: '-' },
    { name: 'Insight Generation', status: 'pending', time: '-' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Document Analysis</h1>
        <p className="text-gray-600">
          AI-powered deep learning analysis of building documents
        </p>
      </div>

      {/* Processing Pipeline Visualization */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white">AI Processing Pipeline</h2>
            <p className="text-sm text-indigo-100">Multi-stage neural network analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {processingStages.map((stage, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                {stage.status === 'complete' && (
                  <CheckCircle2 className="w-5 h-5 text-green-300" />
                )}
                {stage.status === 'processing' && (
                  <Loader2 className="w-5 h-5 text-yellow-300 animate-spin" />
                )}
                {stage.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                )}
              </div>
              <p className="text-sm text-white mb-1">{stage.name}</p>
              <p className="text-xs text-indigo-100">{stage.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 mb-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-gray-900 mb-2">Upload Building Documents</h3>
          <p className="text-gray-600 mb-4">
            AI will automatically extract, classify, and analyze your documents
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Choose Files
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Supports PDF, DWG, PNG, JPG up to 50MB • Processes 100+ pages/minute
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {documents.map((doc) => {
            const isSelected = selectedDoc === doc.id;
            
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc.id)}
                className={`bg-white rounded-xl p-6 border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {doc.type === 'Blueprint' ? (
                      <Image className="w-6 h-6 text-gray-600" />
                    ) : (
                      <FileText className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-gray-900">{doc.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                          doc.status === 'Analyzed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.pages} pages</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                    
                    {doc.status === 'Analyzed' && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-green-600">
                          <Zap className="w-4 h-4" />
                          <span>{doc.processingTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <Brain className="w-4 h-4" />
                          <span>{doc.confidence}% confidence</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8 h-fit">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">AI Analysis Results</h2>
                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                  <Eye className="w-4 h-4" />
                  View Document
                </button>
              </div>

              {documents.find(d => d.id === selectedDoc)?.status === 'Analyzed' ? (
                <>
                  {/* Extracted Data Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {Object.entries(documents.find(d => d.id === selectedDoc)?.extractedData || {}).map(([key, value]) => (
                      <div key={key} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                        <div className="text-gray-900 mb-1">{value}</div>
                        <div className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-gray-900 mb-3">Key Insights</h3>
                    <div className="space-y-3">
                      {documents
                        .find(d => d.id === selectedDoc)
                        ?.insights.map((insight, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                          >
                            <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-700">{insight}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-gray-900 mb-1">AI Processing Details</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Document analyzed using multi-layer neural networks trained on 50,000+ building documents
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Models used: 3</span>
                          <span>•</span>
                          <span>Processing nodes: 12</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-gray-900 mb-3">AI Recommendations</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                        <p className="text-gray-700">Schedule preventive maintenance</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                        <p className="text-gray-700">Update facility documentation</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                        <p className="text-gray-700">Cross-reference with building codes</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Generate Full Report
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Analyzing document...</p>
                  <p className="text-sm text-gray-500">
                    Running through 6-stage AI pipeline
                  </p>
                  
                  <div className="mt-6 space-y-2">
                    {processingStages.slice(0, 4).map((stage, index) => (
                      <div key={index} className="flex items-center justify-between text-sm px-4">
                        <span className="text-gray-600">{stage.name}</span>
                        <span className="text-gray-400">{stage.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a document to view analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

