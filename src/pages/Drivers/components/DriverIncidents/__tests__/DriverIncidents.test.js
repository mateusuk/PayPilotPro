import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DriverIncidents from '../DriverIncidents';
import useFirestore from '../../../../../hooks/useFirestore';

// Mock dos módulos
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'test-driver-id'
  }),
}));

jest.mock('../../../../../hooks/useFirestore');
jest.mock('../../../context/DriversContext', () => ({
  DriversProvider: ({ children }) => <div>{children}</div>,
  useDrivers: () => ({
    getDriverById: jest.fn().mockResolvedValue({
      id: 'test-driver-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      status: 'active'
    })
  })
}));

describe('DriverIncidents Component', () => {
  const mockIncidents = [
    {
      id: 'incident1',
      title: 'Traffic Violation',
      date: '2023-05-15',
      description: 'Speeding ticket',
      status: 'pending',
      requested: '2023-05-16T10:00:00Z',
      comment: 'Speeding ticket on highway',
      driverId: 'test-driver-id',
      driverName: 'John Doe',
      createDeduction: true
    },
    {
      id: 'incident2',
      title: 'Customer Complaint',
      date: '2023-06-20',
      description: 'Late delivery',
      status: 'resolved',
      requested: '2023-06-21T14:30:00Z',
      comment: 'Customer reported late delivery',
      driverId: 'test-driver-id',
      driverName: 'John Doe',
      createDeduction: false
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup Firestore mock
    useFirestore.mockReturnValue({
      getDocuments: jest.fn().mockResolvedValue(mockIncidents),
      addDocument: jest.fn().mockResolvedValue('new-incident-id')
    });
  });

  test('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <DriverIncidents />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading incidents...')).toBeInTheDocument();
  });

  test('displays incidents after loading', async () => {
    render(
      <MemoryRouter>
        <DriverIncidents />
      </MemoryRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading incidents...')).not.toBeInTheDocument();
    });
    
    // Check if incidents are displayed
    expect(screen.getByText('Traffic Violation')).toBeInTheDocument();
    expect(screen.getByText('Customer Complaint')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  test('filters incidents based on search term', async () => {
    render(
      <MemoryRouter>
        <DriverIncidents />
      </MemoryRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading incidents...')).not.toBeInTheDocument();
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search incidents...');
    fireEvent.change(searchInput, { target: { value: 'Traffic' } });
    
    // Check that only matching incidents are shown
    expect(screen.getByText('Traffic Violation')).toBeInTheDocument();
    expect(screen.queryByText('Customer Complaint')).not.toBeInTheDocument();
  });

  test('shows add incident modal when clicking create button', async () => {
    render(
      <MemoryRouter>
        <DriverIncidents />
      </MemoryRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading incidents...')).not.toBeInTheDocument();
    });
    
    // Click on create incident button
    fireEvent.click(screen.getByText('Create Incident'));
    
    // Check if modal is displayed
    expect(screen.getByText('Create New Incident')).toBeInTheDocument();
    expect(screen.getByLabelText('Incident Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Incident Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  test('can add a new incident', async () => {
    const mockAddDocument = jest.fn().mockResolvedValue('new-incident-id');
    useFirestore.mockImplementation((collection) => ({
      getDocuments: jest.fn().mockResolvedValue(mockIncidents),
      addDocument: mockAddDocument
    }));

    render(
      <MemoryRouter>
        <DriverIncidents />
      </MemoryRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading incidents...')).not.toBeInTheDocument();
    });
    
    // Click on create incident button
    fireEvent.click(screen.getByText('Create Incident'));
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Incident Title'), { 
      target: { value: 'New Test Incident' } 
    });
    
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: 'This is a test incident description' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Incident'));
    
    // Check if addDocument was called
    await waitFor(() => {
      expect(mockAddDocument).toHaveBeenCalled();
      const addedIncident = mockAddDocument.mock.calls[0][0];
      expect(addedIncident.title).toBe('New Test Incident');
      expect(addedIncident.description).toBe('This is a test incident description');
      expect(addedIncident.driverId).toBe('test-driver-id');
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Incident created successfully')).toBeInTheDocument();
    });
  });

  test('handles errors when loading incidents', async () => {
    // Mock a failure when getting documents
    useFirestore.mockReturnValue({
      getDocuments: jest.fn().mockRejectedValue(new Error('Failed to load incidents')),
      addDocument: jest.fn()
    });
    
    render(
      <MemoryRouter>
        <DriverIncidents />
      </MemoryRouter>
    );
    
    // Wait for loading to complete and error to show
    await waitFor(() => {
      expect(screen.queryByText('Loading incidents...')).not.toBeInTheDocument();
    });
    
    // The component should show empty incident list instead of error when just incidents fail to load
    expect(screen.getByText('No incidents have been recorded for this driver.')).toBeInTheDocument();
  });
}); 