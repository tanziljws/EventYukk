import React, { useState, useCallback, useRef, useEffect } from 'react';

export const SimpleElementEditor = ({
  elements,
  onElementsChange,
  canvasWidth,
  canvasHeight,
  onOpenSignatureModal,
  onElementSelect
}) => {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredElementId, setHoveredElementId] = useState(null);
  const canvasRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const startDimensionsRef = useRef(null);

  const handleElementClick = (elementId) => {
    setSelectedElementId(elementId);
    const element = elements.find(el => el.id === elementId);
    if (element && onElementSelect) {
      onElementSelect(element);
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedElementId(null);
    }
  };

  const handleElementMouseDown = (e, elementId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - canvasRect.left - (element.position?.x || 0);
    const offsetY = e.clientY - canvasRect.top - (element.position?.y || 0);
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    setSelectedElementId(elementId);
  };

  const handleResizeMouseDown = (e, elementId, handle) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (element) {
      startDimensionsRef.current = {
        width: element.width || 100,
        height: element.height || 50,
        fontSize: element.type === 'text' ? element.fontSize : 16
      };
    }
    
    setResizeHandle(handle);
    setIsResizing(true);
    setSelectedElementId(elementId);
  };

  const smoothUpdate = useCallback((e) => {
    if (!canvasRef.current) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastUpdateRef.current;
    
    if (deltaTime < 8) return;
    lastUpdateRef.current = currentTime;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    if (isDragging && selectedElementId) {
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;

      const constrainedX = Math.max(0, Math.min(canvasWidth - 100, newX));
      const constrainedY = Math.max(0, Math.min(canvasHeight - 50, newY));

      onElementsChange(elements.map(el => 
        el.id === selectedElementId 
          ? { ...el, position: { x: constrainedX, y: constrainedY } }
          : el
      ));
    } else if (isResizing && selectedElementId && resizeHandle) {
      const element = elements.find(el => el.id === selectedElementId);
      if (!element) return;

      if (element.type === 'text' || element.type === 'signature') {
        const currentWidth = element.width || 100;
        const currentHeight = element.height || 50;
        let newWidth = currentWidth;
        let newHeight = currentHeight;

        switch (resizeHandle) {
          case 'se':
            newWidth = Math.max(50, mouseX - (element.position?.x || 0));
            newHeight = Math.max(30, mouseY - (element.position?.y || 0));
            break;
          case 'sw':
            newWidth = Math.max(50, (element.position?.x || 0) + currentWidth - mouseX);
            newHeight = Math.max(30, mouseY - (element.position?.y || 0));
            break;
          case 'ne':
            newWidth = Math.max(50, mouseX - (element.position?.x || 0));
            newHeight = Math.max(30, (element.position?.y || 0) + currentHeight - mouseY);
            break;
          case 'nw':
            newWidth = Math.max(50, (element.position?.x || 0) + currentWidth - mouseX);
            newHeight = Math.max(30, (element.position?.y || 0) + currentHeight - mouseY);
            break;
          case 'e':
            newWidth = Math.max(50, mouseX - (element.position?.x || 0));
            break;
          case 'w':
            newWidth = Math.max(50, (element.position?.x || 0) + currentWidth - mouseX);
            break;
          case 'n':
            newHeight = Math.max(30, (element.position?.y || 0) + currentHeight - mouseY);
            break;
          case 's':
            newHeight = Math.max(30, mouseY - (element.position?.y || 0));
            break;
        }

        newWidth = Math.min(newWidth, canvasWidth - (element.position?.x || 0));
        newHeight = Math.min(newHeight, canvasHeight - (element.position?.y || 0));

        let newFontSize = 16;
        if (element.type === 'text' && startDimensionsRef.current) {
          const cornerHandles = ['se', 'sw', 'ne', 'nw'];
          
          if (cornerHandles.includes(resizeHandle)) {
            const widthFactor = newWidth / startDimensionsRef.current.width;
            const heightFactor = newHeight / startDimensionsRef.current.height;
            const avgFactor = (widthFactor + heightFactor) / 2;
            const startFontSize = startDimensionsRef.current.fontSize;
            const calculatedFontSize = startFontSize * avgFactor;
            newFontSize = Math.max(8, Math.min(120, Math.round(calculatedFontSize)));
          } else {
            newFontSize = element.fontSize;
          }
        }

        onElementsChange(elements.map(el => 
          el.id === selectedElementId 
            ? { 
                ...el, 
                width: newWidth, 
                height: newHeight,
                ...(element.type === 'text' ? { fontSize: newFontSize } : {})
              }
            : el
        ));
      }
    }
  }, [isDragging, isResizing, selectedElementId, resizeHandle, dragOffset, elements, onElementsChange, canvasWidth, canvasHeight]);

  const handleMouseMove = useCallback((e) => {
    smoothUpdate(e);
  }, [smoothUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    startDimensionsRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const deleteElement = (elementId) => {
    onElementsChange(elements.filter(el => el.id !== elementId));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const renderResizeHandles = (element) => {
    if (selectedElementId !== element.id) return null;

    const handles = [
      { pos: 'nw', style: { top: '-12px', left: '-12px' }, cursor: 'nw-resize' },
      { pos: 'ne', style: { top: '-12px', right: '-12px' }, cursor: 'ne-resize' },
      { pos: 'sw', style: { bottom: '-12px', left: '-12px' }, cursor: 'sw-resize' },
      { pos: 'se', style: { bottom: '-12px', right: '-12px' }, cursor: 'se-resize' },
      { pos: 'w', style: { top: '50%', left: '-12px', transform: 'translateY(-50%)' }, cursor: 'w-resize' },
      { pos: 'e', style: { top: '50%', right: '-12px', transform: 'translateY(-50%)' }, cursor: 'e-resize' },
      { pos: 'n', style: { top: '-12px', left: '50%', transform: 'translateX(-50%)' }, cursor: 'n-resize' },
      { pos: 's', style: { bottom: '-12px', left: '50%', transform: 'translateX(-50%)' }, cursor: 's-resize' },
    ];

    return handles.map(handle => (
      <div
        key={handle.pos}
        className="resize-handle"
        style={{
          position: 'absolute',
          ...handle.style,
          width: handle.pos.includes('n') || handle.pos.includes('s') ? '28px' : '20px',
          height: handle.pos.includes('w') || handle.pos.includes('e') ? '28px' : '20px',
          backgroundColor: '#3b82f6',
          border: '2px solid white',
          borderRadius: handle.pos.length === 1 ? '8px' : '50%',
          cursor: handle.cursor,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, element.id, handle.pos)}
      />
    ));
  };

  return (
    <div className="simple-element-editor">
      <div 
        ref={canvasRef}
        className="element-canvas"
        onClick={handleCanvasClick}
        style={{
          width: canvasWidth,
          height: canvasHeight,
          position: 'relative',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          background: 'transparent',
          overflow: 'hidden'
        }}
      >
        {elements.filter(element => element.position).map(element => {
          if (element.type === 'text') {
            return (
              <div
                key={element.id}
                onClick={() => handleElementClick(element.id)}
                onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                onMouseEnter={() => setHoveredElementId(element.id)}
                onMouseLeave={() => setHoveredElementId(null)}
                style={{
                  position: 'absolute',
                  left: element.position?.x || 0,
                  top: element.position?.y || 0,
                  width: element.width || 'auto',
                  height: element.height || 'auto',
                  fontSize: element.fontSize,
                  fontFamily: element.fontFamily,
                  color: element.color,
                  fontWeight: element.fontWeight,
                  textAlign: element.textAlign,
                  cursor: isDragging && selectedElementId === element.id ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  border: selectedElementId === element.id ? '2px dashed #3b82f6' : '1px dashed transparent',
                  borderRadius: '4px',
                  backgroundColor: selectedElementId === element.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  transition: isDragging || isResizing ? 'none' : 'all 0.15s ease',
                  zIndex: selectedElementId === element.id ? 20 : 10,
                  maxWidth: canvasWidth - (element.position?.x || 0),
                  wordWrap: 'break-word',
                  minWidth: '50px',
                  minHeight: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  padding: '8px'
                }}
              >
                {element.text}
                
                {hoveredElementId === element.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg z-30"
                    title="Delete element"
                  >
                    ×
                  </button>
                )}
                
                {renderResizeHandles(element)}
              </div>
            );
          } else if (element.type === 'signature') {
            return (
              <div
                key={element.id}
                onClick={() => handleElementClick(element.id)}
                onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                onMouseEnter={() => setHoveredElementId(element.id)}
                onMouseLeave={() => setHoveredElementId(null)}
                style={{
                  position: 'absolute',
                  left: element.position?.x || 0,
                  top: element.position?.y || 0,
                  width: element.width,
                  height: element.height,
                  cursor: isDragging && selectedElementId === element.id ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  border: selectedElementId === element.id ? '2px dashed #3b82f6' : '1px dashed transparent',
                  borderRadius: '4px',
                  backgroundColor: selectedElementId === element.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  transition: isDragging || isResizing ? 'none' : 'all 0.15s ease',
                  zIndex: selectedElementId === element.id ? 20 : 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {element.signatureData ? (
                  <img
                    src={element.signatureData}
                    alt="Signature"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      border: '2px dashed #ccc',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}
                  >
                    📝 Signature Placeholder
                  </div>
                )}
                {element.label && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#666',
                      marginTop: '2px',
                      textAlign: 'center'
                    }}
                  >
                    {element.label}
                  </div>
                )}
                
                {hoveredElementId === element.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg z-30"
                    title="Delete element"
                  >
                    ×
                  </button>
                )}
                
                {renderResizeHandles(element)}
              </div>
            );
          }
          return null;
        })}
      </div>

      {selectedElement && (
        <div className="element-properties mt-4 bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              Edit {selectedElement.type === 'text' ? 'Text' : 'Signature'} Element
            </h4>
            {selectedElement.type === 'text' && selectedElement.isDynamic && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                Dynamic Text
              </span>
            )}
          </div>
          
          {selectedElement.type === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text:</label>
                {selectedElement.isDynamic ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-600">
                    {selectedElement.text}
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedElement.dynamicType === 'user_name' 
                        ? 'Dynamic: Will be replaced with participant name'
                        : 'Dynamic: Will be replaced with event name'
                      }
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={selectedElement.text}
                    onChange={(e) => {
                      onElementsChange(elements.map(el => 
                        el.id === selectedElement.id ? { ...el, text: e.target.value } : el
                      ));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Family:</label>
                <select
                  value={selectedElement.fontFamily}
                  onChange={(e) => {
                    onElementsChange(elements.map(el => 
                      el.id === selectedElement.id ? { ...el, fontFamily: e.target.value } : el
                    ));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <optgroup label="Standard Fonts">
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Inter">Inter</option>
                  </optgroup>
                  <optgroup label="Cursive/Script Fonts">
                    <option value="Ephesis">Ephesis (Elegant)</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Brush Script MT">Brush Script MT</option>
                    <option value="Lucida Handwriting">Lucida Handwriting</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size: {selectedElement.fontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="120"
                  value={selectedElement.fontSize}
                  onChange={(e) => {
                    onElementsChange(elements.map(el => 
                      el.id === selectedElement.id ? { ...el, fontSize: parseInt(e.target.value) } : el
                    ));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color:</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => {
                      onElementsChange(elements.map(el => 
                        el.id === selectedElement.id ? { ...el, color: e.target.value } : el
                      ));
                    }}
                    className="w-12 h-8 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={selectedElement.color}
                    onChange={(e) => {
                      onElementsChange(elements.map(el => 
                        el.id === selectedElement.id ? { ...el, color: e.target.value } : el
                      ));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Align:</label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      onClick={() => {
                        onElementsChange(elements.map(el => 
                          el.id === selectedElement.id ? { ...el, textAlign: align } : el
                        ));
                      }}
                      className={`px-3 py-1 text-sm rounded ${
                        selectedElement.textAlign === align
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedElement.type === 'signature' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (optional):</label>
                <input
                  type="text"
                  value={selectedElement.label || ''}
                  onChange={(e) => {
                    onElementsChange(elements.map(el => 
                      el.id === selectedElement.id ? { ...el, label: e.target.value } : el
                    ));
                  }}
                  placeholder="e.g., Director, Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <button
                onClick={() => {
                  if (onOpenSignatureModal) {
                    onOpenSignatureModal(selectedElement);
                  }
                }}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded-md text-sm hover:bg-purple-600 transition-colors font-medium"
              >
                ✍️ Draw Signature
              </button>
            </>
          )}

          <button
            onClick={() => deleteElement(selectedElement.id)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
          >
            🗑️ Delete Element
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleElementEditor;

