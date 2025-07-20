import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '@/components/ConfirmDialog'

describe('ConfirmDialog', () => {
  test('renders when open and calls callbacks', () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()

    render(
      <ConfirmDialog
        isOpen
        title="Test Dialog"
        description="Testing description"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    // Title and description visible
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Testing description')).toBeInTheDocument()

    // Click confirm
    fireEvent.click(screen.getByTestId('confirm-btn'))
    expect(onConfirm).toHaveBeenCalled()

    // Click cancel
    fireEvent.click(screen.getByTestId('cancel-btn'))
    expect(onCancel).toHaveBeenCalled()
  })

  test('does not render when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    )

    expect(screen.queryByRole('dialog')).toBeNull()
  })
}) 