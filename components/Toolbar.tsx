'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRedaction } from '@/context/RedactionContext';
import { Scissors, Eye } from 'lucide-react';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = '' }: ToolbarProps) {
  const { state, toggleRedactMode } = useRedaction();
  const { isRedactMode } = state;

  return (
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
  );
} 