'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useRedaction } from '@/context/RedactionContext';
import { Scissors, Eye, Undo2, Trash2, CheckCircle, FileText, EyeOff, ChevronDown, Download } from 'lucide-react';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = '' }: ToolbarProps) {
  const { state, toggleRedactMode, undo, clearAll, applyRedactions, toggleView } = useRedaction();
  const { isRedactMode, canUndo, currentView, redactedPDF, redactionsApplied } = state;
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  const handleApplyRedactions = async () => {
    try {
      await applyRedactions();
      setShowApplyDialog(false);
    } catch (error) {
      console.error('Failed to apply redactions:', error);
      // Error handling will be implemented in Task 5
    }
  };

  const handleViewToggle = (view: 'original' | 'redacted') => {
    if (view !== currentView) {
      toggleView();
    }
    setShowViewDropdown(false);
  };

  const getViewToggleButton = () => {
    if (!redactedPDF) return null;

    const viewConfig = {
      original: {
        text: 'Original View',
        icon: FileText,
        color: 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
      },
      redacted: {
        text: 'Redacted View',
        icon: EyeOff,
        color: 'border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300'
      }
    };

    const config = viewConfig[currentView];
    const Icon = config.icon;

    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowViewDropdown(!showViewDropdown)}
          className={`transition-all duration-200 ${config.color}`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {config.text}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>

        {/* View Toggle Dropdown */}
        {showViewDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="py-1">
              <button
                onClick={() => handleViewToggle('original')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  currentView === 'original' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                Original View
                {currentView === 'original' && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
              <button
                onClick={() => handleViewToggle('redacted')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  currentView === 'redacted' ? 'bg-purple-50 text-purple-600' : 'text-gray-700'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                Redacted View
                {currentView === 'redacted' && (
                  <span className="ml-auto text-purple-600">✓</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Download handlers
  const handleDownload = (type: 'original' | 'redacted') => {
    const pdfData = type === 'original' ? state.originalPDF : state.redactedPDF;
    if (!pdfData) return;
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = type === 'original' ? 'document-original.pdf' : 'document-redacted.pdf';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <>
      <div className={`flex items-center gap-2 p-3 bg-card border rounded-lg shadow-sm ${className}`}>
        <div className="flex items-center gap-2">
          <Button
            variant={isRedactMode ? "default" : "outline"}
            size="sm"
            onClick={toggleRedactMode}
            className={`
              transition-all duration-200 
              ${isRedactMode ? 
                'bg-red-600 hover:bg-red-700 text-white shadow-md' : 
                'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
              }
            `}
          >
            {isRedactMode ? (
              <>
                <Scissors className="w-4 h-4" />
                Redact Mode ON
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                View Mode
              </>
            )}
          </Button>
          
          {/* Undo and Clear buttons - only show when in redact mode */}
          {isRedactMode && (
            <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo || redactionsApplied}
                className={`
                  transition-all duration-200
                  ${canUndo && !redactionsApplied ? 
                    'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300' : 
                    'border-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Undo2 className="w-4 h-4" />
                Undo
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={!canUndo || redactionsApplied}
                className={`
                  transition-all duration-200
                  ${canUndo && !redactionsApplied ? 
                    'border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300' : 
                    'border-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          )}

          {/* Apply Redactions button - only show when in redact mode and there are rectangles */}
          {isRedactMode && canUndo && !redactionsApplied && (
            <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowApplyDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md transition-all duration-200"
              >
                <CheckCircle className="w-4 h-4" />
                Apply Redactions
              </Button>
            </div>
          )}

          {/* View Toggle - only show when redacted PDF is available */}
          {redactedPDF && (
            <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
              {getViewToggleButton()}
            </div>
          )}
          
          {/* Mode indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div 
              className={`
                w-2 h-2 rounded-full transition-colors duration-200
                ${isRedactMode ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}
              `}
            />
            <span className={`
              font-medium transition-colors duration-200
              ${isRedactMode ? 'text-red-600' : 'text-muted-foreground'}
            `}>
              {isRedactMode ? 'Click and drag to select areas to redact' : 'Click Redact Mode to start marking sensitive areas'}
            </span>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload('original')}
          disabled={!state.originalPDF}
          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
        >
          <Download className="w-4 h-4 mr-1" />
          Download Original
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload('redacted')}
          disabled={!state.redactedPDF}
          className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
        >
          <Download className="w-4 h-4 mr-1" />
          Download Redacted
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showApplyDialog}
        title="Apply Redactions"
        description="This will permanently apply all redactions to the PDF. The original content will be unrecoverable and cannot be undone. Are you sure you want to continue?"
        confirmLabel="Apply Redactions"
        cancelLabel="Cancel"
        onConfirm={handleApplyRedactions}
        onCancel={() => setShowApplyDialog(false)}
        isDestructive={true}
      />

      {/* Click outside to close dropdown */}
      {showViewDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowViewDropdown(false)}
        />
      )}
    </>
  );
} 