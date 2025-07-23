'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useRedaction } from '@/context/RedactionContext';
import { useToast, useMicroInteraction } from '@/components/ui/state-manager';
import { Scissors, Eye, Undo2, Trash2, CheckCircle, FileText, EyeOff, ChevronDown, Download } from 'lucide-react';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = '' }: ToolbarProps) {
  const { state, toggleRedactMode, undo, clearAll, applyRedactions, toggleView } = useRedaction();
  const { isRedactMode, canUndo, currentView, redactedPDF, redactionsApplied } = state;
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const { showToast } = useToast();
  const { triggerMicroInteraction } = useMicroInteraction();

  const handleApplyRedactions = async () => {
    try {
      await applyRedactions();
      setShowApplyDialog(false);
      showToast('success', 'Redactions Applied', 'Your redactions have been successfully applied to the PDF.');
      triggerMicroInteraction('apply-button', 'success-bounce');
    } catch (error) {
      console.error('Failed to apply redactions:', error);
      showToast('error', 'Application Failed', 'Failed to apply redactions. Please try again.');
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
          <div className="absolute top-full left-0 mt-1 bg-white border z-50 min-w-[200px]">
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
      <div className={`flex items-center justify-between p-4 bg-card border border-border ${className}`}>
        {/* Primary Controls Section */}
        <div className="flex items-center gap-2">
          <Button
            variant={isRedactMode ? "destructive" : "outline"}
            size="sm"
            onClick={toggleRedactMode}
            className="flex items-center gap-2"
          >
            {isRedactMode ? <Scissors className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isRedactMode ? 'Redact Mode ON' : 'View Mode'}
          </Button>
          
          {/* Undo and Clear buttons - only show when in redact mode */}
          {isRedactMode && (
            <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo || redactionsApplied}
                className="flex items-center gap-2"
              >
                <Undo2 className="w-4 h-4" />Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={!canUndo || redactionsApplied}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />Clear All
              </Button>
            </div>
          )}

          {/* Apply Redactions button - only show when in redact mode and there are rectangles */}
          {isRedactMode && canUndo && !redactionsApplied && (
            <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowApplyDialog(true)}
                className="flex items-center gap-2"
                id="apply-button"
              >
                <CheckCircle className="w-4 h-4" />Apply Redactions
              </Button>
            </div>
          )}

          {/* View Toggle - only show when redacted PDF is available */}
          {redactedPDF && (
            <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
              {getViewToggleButton()}
            </div>
          )}
        </div>

        {/* Center Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-2xl font-semibold text-gray-800">Fede's Redaction Tool</h1>
        </div>

        {/* Secondary Controls Section */}
        <div className="flex items-center gap-2">
          {/* Download Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('original')}
            disabled={!state.originalPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />Download Original
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleDownload('redacted')}
            disabled={!state.redactedPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />Download Redacted
          </Button>
          
        </div>
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