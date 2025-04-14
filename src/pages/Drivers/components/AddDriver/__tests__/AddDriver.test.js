import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddDriver from '../AddDriver';

// Mock the DriversContext
jest.mock('../../../context/DriversContext', () => ({
  useDrivers: jest.fn(() => ({
    addDriver: jest.fn(async (driverData) => {
      return { id: 'mock-id', ...driverData };
    }),
    loading: false,
    error: null,
  })),
  DriversProvider: ({ children }) => <div>{children}</div>,
}));

describe('AddDriver Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onDriverAdded: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when isOpen is true', () => {
    render(<AddDriver {...defaultProps} />);
    
    expect(screen.getByText('Add a new driver')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
    expect(screen.getByText('Select Customer')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument(); // Default selected role
    expect(screen.getByText('Select Location')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(<AddDriver {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Add a new driver')).not.toBeInTheDocument();
  });

  test('form validation shows error when fields are missing', async () => {
    render(<AddDriver {...defaultProps} />);
    
    // Try to submit form without filling required fields
    fireEvent.click(screen.getByText('Invite Driver'));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });

  test('dropdowns open and allow selection', () => {
    render(<AddDriver {...defaultProps} />);
    
    // Test customer dropdown
    fireEvent.click(screen.getByText('Select Customer'));
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Amazon'));
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    
    // Test location dropdown
    fireEvent.click(screen.getByText('Select Location'));
    expect(screen.getByText('London')).toBeInTheDocument();
    fireEvent.click(screen.getByText('London'));
    expect(screen.getByText('London')).toBeInTheDocument();
    
    // Test role dropdown (already has a default value)
    fireEvent.click(screen.getByText('Driver'));
    expect(screen.getByText('Lead Driver')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Lead Driver'));
    expect(screen.getByText('Lead Driver')).toBeInTheDocument();
  });

  test('successfully submits the form and shows success message', async () => {
    const { useDrivers } = require('../../../context/DriversContext');
    const mockAddDriver = jest.fn().mockResolvedValue({
      id: 'driver-123',
      email: 'test@example.com',
      accessNumber: '12345678',
    });
    
    useDrivers.mockReturnValue({
      addDriver: mockAddDriver,
      loading: false,
      error: null,
    });
    
    render(<AddDriver {...defaultProps} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '1234567890' } });
    
    // Select customer
    fireEvent.click(screen.getByText('Select Customer'));
    fireEvent.click(screen.getByText('Amazon'));
    
    // Location is already selected
    fireEvent.click(screen.getByText('Select Location'));
    fireEvent.click(screen.getByText('London'));
    
    // Submit form
    fireEvent.click(screen.getByText('Invite Driver'));
    
    // Check if the addDriver function was called with the correct data
    await waitFor(() => {
      expect(mockAddDriver).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        customer: 'Amazon',
        role: 'Driver',
        location: 'London',
        status: 'invited',
      }));
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Driver invitation sent successfully!')).toBeInTheDocument();
    });
  });

  test('shows loading state during form submission', async () => {
    const { useDrivers } = require('../../../context/DriversContext');
    // Create a promise that doesn't resolve immediately to test loading state
    let resolveAddDriver;
    const addDriverPromise = new Promise(resolve => {
      resolveAddDriver = resolve;
    });
    
    const mockAddDriver = jest.fn(() => addDriverPromise);
    
    useDrivers.mockReturnValue({
      addDriver: mockAddDriver,
      loading: true,
      error: null,
    });
    
    render(<AddDriver {...defaultProps} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '1234567890' } });
    
    // Select customer and location
    fireEvent.click(screen.getByText('Select Customer'));
    fireEvent.click(screen.getByText('Amazon'));
    fireEvent.click(screen.getByText('Select Location'));
    fireEvent.click(screen.getByText('London'));
    
    // Submit form
    fireEvent.click(screen.getByText('Invite Driver'));
    
    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText('Sending Invitation...')).toBeInTheDocument();
    });
    
    // Resolve the promise to complete the test
    resolveAddDriver({ id: 'driver-123', accessNumber: '12345678' });
  });

  test('closes modal when cancel button is clicked', () => {
    render(<AddDriver {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
}); 