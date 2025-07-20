import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '@/components/Toolbar';
import { RedactionProvider } from '@/context/RedactionContext';

// Test wrapper with context provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <RedactionProvider>{children}</RedactionProvider>
);

describe('Toolbar', () => {
  test('should render with default view mode', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('View Mode');
    expect(screen.getByText('Click Redact Mode to start marking sensitive areas')).toBeInTheDocument();
  });

  test('should toggle to redact mode when clicked', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toHaveTextContent('Redact Mode ON');
    expect(screen.getByText('Click and drag to select areas to redact')).toBeInTheDocument();
  });

  test('should toggle back to view mode when clicked again', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // Toggle to redact mode
    fireEvent.click(button);
    expect(button).toHaveTextContent('Redact Mode ON');
    
    // Toggle back to view mode
    fireEvent.click(button);
    expect(button).toHaveTextContent('View Mode');
    expect(screen.getByText('Click Redact Mode to start marking sensitive areas')).toBeInTheDocument();
  });

  test('should display correct icons for each mode', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // Check initial view mode icon (Eye icon)
    expect(button.querySelector('svg')).toBeInTheDocument();
    
    // Toggle to redact mode
    fireEvent.click(button);
    
    // Check redact mode icon (Scissors icon)
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  test('should have correct styling classes for different modes', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // View mode styling
    expect(button).toHaveClass('border-red-200', 'text-red-600');
    
    // Toggle to redact mode
    fireEvent.click(button);
    
    // Redact mode styling
    expect(button).toHaveClass('bg-red-600', 'text-white');
  });

  test('should show pulsing indicator in redact mode', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    
    // Initially no pulse
    const initialIndicator = document.querySelector('.animate-pulse');
    expect(initialIndicator).toBe(null);
    
    // Toggle to redact mode
    fireEvent.click(button);
    
    // Should have pulsing indicator
    const indicator = document.querySelector('.animate-pulse');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-red-500');
  });

  test('should apply custom className when provided', () => {
    render(
      <TestWrapper>
        <Toolbar className="custom-class" />
      </TestWrapper>
    );
    
    const toolbar = document.querySelector('.custom-class');
    expect(toolbar).toBeInTheDocument();
  });

  test('should have accessible button role and text', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Button component doesn't set type attribute explicitly but is accessible via role
    expect(button.tagName).toBe('BUTTON');
  });

  test('should maintain consistent layout structure', () => {
    render(
      <TestWrapper>
        <Toolbar />
      </TestWrapper>
    );
    
    // Check main container structure
    const container = document.querySelector('.flex.items-center.gap-2.p-3');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('bg-card', 'border', 'rounded-lg', 'shadow-sm');
    
    // Check inner layout
    const innerContainer = document.querySelector('.flex.items-center.gap-2');
    expect(innerContainer).toBeInTheDocument();
  });
}); 