import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import SimpleElementEditor from '../../components/certificate/SimpleElementEditor';
import { 
  Save, 
  Upload, 
  Plus, 
  X, 
  FileText, 
  ArrowLeft,
  Download,
  Eye
} from 'lucide-react';
import { eventsAPI, certificatesAPI } from '../../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateTemplateEditor = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [backgroundSize, setBackgroundSize] = useState('cover');
  const [elements, setElements] = useState([]);
  const [selectedElementForEdit, setSelectedElementForEdit] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureElement, setCurrentSignatureElement] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const exportRef = useRef(null);
  const signatureCanvasRef = useRef(null);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchTemplate();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getById(eventId);
      if (response && response.data) {
        setEvent(response.data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Gagal memuat data event');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplate = async () => {
    try {
      const response = await certificatesAPI.getTemplate();
      if (response && response.data) {
        const data = response.data;
        if (data.backgroundImage) {
          setBackgroundImage(data.backgroundImage);
        }
        if (data.backgroundSize) {
          setBackgroundSize(data.backgroundSize);
        }
        if (data.elements && Array.isArray(data.elements)) {
          setElements(data.elements);
        }
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    }
  };

  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTextElement = (type = 'user_name', customText = '') => {
    const textContent = type === 'user_name' ? '[NAMA_PESERTA]' : 
                       type === 'event_name' ? '[NAMA_EVENT]' : 
                       customText || 'Custom Text';
    
    const getDefaultFont = (elementType) => {
      switch (elementType) {
        case 'user_name':
          return 'Ephesis';
        case 'event_name':
          return 'Great Vibes';
        default:
          return 'Inter';
      }
    };
    
    const newElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      text: textContent,
      position: { x: 400, y: 300 },
      fontSize: type === 'user_name' ? 32 : 24,
      fontFamily: getDefaultFont(type),
      color: '#000000',
      fontWeight: 'normal',
      textAlign: 'center',
      isDynamic: type !== 'custom',
      dynamicType: type === 'custom' ? undefined : type
    };
    
    setElements([...elements, newElement]);
    setSelectedElementForEdit(newElement);
  };

  const addSignatureElement = () => {
    const newSignatureElement = {
      id: `signature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'signature',
      position: { x: 400, y: 500 },
      width: 150,
      height: 60,
      signatureData: '',
      label: ''
    };
    
    setElements([...elements, newSignatureElement]);
    setCurrentSignatureElement(newSignatureElement);
    setShowSignatureModal(true);
  };

  const handleOpenSignatureModal = (element) => {
    setCurrentSignatureElement(element);
    setShowSignatureModal(true);
  };

  const handleSignatureSave = () => {
    if (signatureCanvasRef.current && currentSignatureElement) {
      const signatureData = signatureCanvasRef.current.toDataURL();
      
      setElements(elements.map(el => 
        el.id === currentSignatureElement.id 
          ? { ...el, signatureData }
          : el
      ));
      
      setShowSignatureModal(false);
      setCurrentSignatureElement(null);
    }
  };

  const handleSignatureClear = () => {
    if (signatureCanvasRef.current) {
      const ctx = signatureCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
      }
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  useEffect(() => {
    if (showSignatureModal && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showSignatureModal]);

  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      
      if (!backgroundImage) {
        toast.error('Silakan upload background image terlebih dahulu');
        return;
      }
      
      if (!elements || elements.length === 0) {
        toast.error('Silakan tambahkan minimal satu elemen text atau signature');
        return;
      }
      
      const templateData = {
        backgroundImage,
        backgroundSize,
        elements
      };
      
      const response = await certificatesAPI.updateTemplate(templateData);
      
      if (response && response.success) {
        toast.success('Template sertifikat berhasil disimpan!');
        navigate('/admin/certificates');
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Gagal menyimpan template');
    } finally {
      setSaving(false);
    }
  };

  const exportToPDF = async () => {
    if (!exportRef.current) return;

    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(exportRef.current, {
        width: 800,
        height: 600,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 210]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = 800;
      const imgHeight = 600;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save('certificate-template.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Gagal export ke PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/certificates')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">
            Certificate Template Editor
          </h1>
          <p className="text-gray-600">
            {event ? `Membuat template untuk: ${event.title}` : 'Design your certificate template'}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Background */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Background Image</h2>
              
              <div 
                className="upload-container mb-4"
                onClick={() => !isUploading && document.getElementById('image-upload')?.click()}
              >
                {backgroundImage ? (
                  <div className="relative">
                    <img 
                      src={backgroundImage} 
                      alt="Background preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 hover:opacity-100 transition-opacity">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                    {isUploading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageUpload}
                style={{ display: 'none' }}
              />
              
              {backgroundImage && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image Fit:</label>
                  <div className="space-y-1">
                    {['contain', 'cover', 'stretch'].map(size => (
                      <label key={size} className="flex items-center">
                        <input
                          type="radio"
                          name="backgroundSize"
                          value={size}
                          checked={backgroundSize === size}
                          onChange={(e) => setBackgroundSize(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Elements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Add Elements</h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => addTextElement('user_name')}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Participant Name
                </button>
                <button
                  onClick={() => addTextElement('event_name')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Event Name
                </button>
                <button
                  onClick={() => addTextElement('custom', 'Custom Text')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Custom Text
                </button>
                <button
                  onClick={addSignatureElement}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Signature
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Actions</h2>
              
              <div className="space-y-2">
                <button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Menyimpan...' : 'Simpan Template'}
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-black mb-2">Certificate Canvas</h2>
                <p className="text-gray-600">800 × 600 pixels</p>
              </div>
              
              <div className="canvas-container" ref={exportRef}>
                <div 
                  className="relative w-full"
                  style={{
                    aspectRatio: '4/3',
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: backgroundSize === 'stretch' ? '100% 100%' : backgroundSize,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#fefefe',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    minHeight: '600px'
                  }}
                >
                  {!backgroundImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FileText className="mx-auto h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Certificate Template Canvas</p>
                        <p className="text-sm">Upload background image and add elements</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="element-editor-overlay absolute inset-0">
                    <SimpleElementEditor
                      elements={elements}
                      onElementsChange={setElements}
                      canvasWidth={800}
                      canvasHeight={600}
                      onOpenSignatureModal={handleOpenSignatureModal}
                      onElementSelect={(element) => setSelectedElementForEdit(element)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && currentSignatureElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Draw Signature</h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4" style={{ width: '100%', height: '200px', border: '3px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
              <canvas
                ref={signatureCanvasRef}
                width={400}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  cursor: 'crosshair',
                  borderRadius: '8px',
                  display: 'block'
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSignatureClear}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Clear
              </button>
              <button
                onClick={handleSignatureSave}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateTemplateEditor;

