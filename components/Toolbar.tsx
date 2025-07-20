'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useRedaction } from '@/context/RedactionContext';
import { Scissors, Eye, Undo2, Trash2, CheckCircle, FileText, EyeOff } from 'lucide-react';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = '' }: ToolbarProps) {
  const { state, toggleRedactMode, undo, clearAll, applyRedactions, toggleView } = useRedaction();
  const { isRedactMode, canUndo, currentView, redactedPDF } = state;
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  const handleApplyRedactions = async () => {
    try {
      await applyRedactions();
      setShowApplyDialog(false);
    } catch (error) {
      console.error('Failed to apply redactions:', error);
      // Error handling will be implemented in Task 5
    }
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
                disabled={!canUndo}
                className={`
                  transition-all duration-200
                  ${canUndo ? 
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
                disabled={!canUndo}
                className={`
                  transition-all duration-200
                  ${canUndo ? 
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
          {isRedactMode && canUndo && (
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
              <Button
                variant="outline"
                size="sm"
                onClick={toggleView}
                className={`
                  transition-all duration-200
                  ${currentView === 'redacted' ? 
                    'border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300' : 
                    'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }
                `}
              >
                {currentView === 'redacted' ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Redacted View
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Original View
                  </>
                )}
              </Button>
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showApplyDialog}
        title="Apply Redactions"
        description="This will permanently apply all redactions to the PDF. The original content will be unrecoverable. Are you sure you want to continue?"
        confirmLabel="Apply Redactions"
        cancelLabel="Cancel"
        onConfirm={handleApplyRedactions}
        onCancel={() => setShowApplyDialog(false)}
      />
    </>
  );
} 