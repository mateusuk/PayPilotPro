import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DriverList from '../DriverList/DriverList';
import { BrowserRouter } from 'react-router-dom';
import { DriversProvider } from '../../context/DriversContext';

// Mock the DriversContext
jest.mock('../../context/DriversContext', () => ({
  useDrivers: jest.fn(() => ({
    getDriversByStatus: jest.fn(async (status) => {
      if (status === 'active') {
        return [
          {
            id: 'driver1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
            customer: { name: 'Amazon' },
            location: 'London',
            status: 'active',
            createdAt: new Date('2023-01-15'),
            lastActive: new Date('2023-05-10'),
          },
          {
            id: 'driver2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '0987654321',
            customer: { name: 'DHL' },
            location: 'Manchester',
            status: 'active',
            createdAt: new Date('2023-02-20'),
            lastActive: new Date('2023-05-08'),
          }
        ];
      } else if (status === 'invited') {
        return [
          {
            id: 'driver3',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob.johnson@example.com',
            phone: '5556667777',
            customer: 'UPS',
            location: 'Birmingham',
            status: 'invited',
            createdAt: new Date('2023-05-01'),
            appDownloaded: true,
            interviewStatus: 'yes',
            toxicologyStatus: 'no',
            backgroundStatus: 'yes',
            inductionStatus: 'no',
            onboardingProgress: 60,
          },
          {
            id: 'driver4',
            firstName: 'Alice',
            lastName: 'Williams',
            email: 'alice.williams@example.com',
            phone: '1112223333',
            customer: 'FedEx',
            location: 'Leeds',
            status: 'invited',
            createdAt: new Date('2023-05-05'),
            appDownloaded: true,
            interviewStatus: 'yes',
            toxicologyStatus: 'yes',
            backgroundStatus: 'yes',
            inductionStatus: 'yes',
            onboardingProgress: 100,
          }
        ];
      } else {
        return []; // inactive drivers for this test
      }
    }),
    updateDriver: jest.fn(async (driverId, updateData) => {
      return { id: driverId, ...updateData };
    }),
  })),
  DriversProvider: ({ children }) => <div>{children}</div>,
}));

// Mock navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

describe('DriverList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders active drivers table correctly', async () => {
    render(
      <BrowserRouter>
        <DriversProvider>
          <DriverList />
        </DriversProvider>
      </BrowserRouter>
    );

    // Wait for the active drivers to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Check table headers for active drivers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check that active status and deactivate buttons are shown
    const statusBadges = screen.getAllByText('Active');
    expect(statusBadges.length).toBeGreaterThan(0);
    
    const deactivateButtons = screen.getAllByText('Deactivate');
    expect(deactivateButtons.length).toBeGreaterThan(0);
  });

  test('switches to onboarding tab and renders onboarding drivers table correctly', async () => {
    render(
      <BrowserRouter>
        <DriversProvider>
          <DriverList />
        </DriversProvider>
      </BrowserRouter>
    );

    // Click on the Onboarding tab
    fireEvent.click(screen.getByText('Onboarding'));

    // Wait for the onboarding drivers to load
    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Alice Williams')).toBeInTheDocument();
    });

    // Check table headers for onboarding drivers
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('Toxicology')).toBeInTheDocument();
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText('Induction')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();

    // Check status toggle buttons exist
    const yesButtons = screen.getAllByText('yes');
    const noButtons = screen.getAllByText('no');
    expect(yesButtons.length).toBeGreaterThan(0);
    expect(noButtons.length).toBeGreaterThan(0);

    // Check for Activate button for driver with all requirements met
    expect(screen.getByText('Activate')).toBeInTheDocument();
  });

  test('filters drivers based on search term', async () => {
    render(
      <BrowserRouter>
        <DriversProvider>
          <DriverList />
        </DriversProvider>
      </BrowserRouter>
    );

    // Wait for drivers to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search by name, email or phone...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    // Check that only Jane Smith is shown
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('toggles onboarding status when button is clicked', async () => {
    const { useDrivers } = require('../../context/DriversContext');
    const mockUpdateDriver = jest.fn().mockResolvedValue({
      id: 'driver3',
      toxicologyStatus: 'yes',
      onboardingProgress: 80
    });

    useDrivers.mockReturnValue({
      getDriversByStatus: jest.fn(async () => [
        {
          id: 'driver3',
          firstName: 'Bob',
          lastName: 'Johnson',
          customer: 'UPS',
          status: 'invited',
          createdAt: new Date('2023-05-01'),
          appDownloaded: true,
          interviewStatus: 'yes',
          toxicologyStatus: 'no',
          backgroundStatus: 'yes',
          inductionStatus: 'no',
          onboardingProgress: 60,
        }
      ]),
      updateDriver: mockUpdateDriver,
    });

    render(
      <BrowserRouter>
        <DriversProvider>
          <DriverList />
        </DriversProvider>
      </BrowserRouter>
    );

    // Click on the Onboarding tab
    fireEvent.click(screen.getByText('Onboarding'));

    // Wait for the onboarding driver to load
    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    // Find and click the 'no' button for toxicology
    const toxicologyButtons = screen.getAllByText('no');
    fireEvent.click(toxicologyButtons[0]);

    // Verify updateDriver was called with correct parameters
    await waitFor(() => {
      expect(mockUpdateDriver).toHaveBeenCalledWith(
        'driver3',
        expect.objectContaining({
          toxicologyStatus: 'yes',
        })
      );
    });
  });

  test('filters clear when Clear Filters button is clicked', async () => {
    render(
      <BrowserRouter>
        <DriversProvider>
          <DriverList />
        </DriversProvider>
      </BrowserRouter>
    );

    // Wait for drivers to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Apply a filter
    const searchInput = screen.getByPlaceholderText('Search by name, email or phone...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    // Verify filter was applied
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Click Clear Filters button
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    // Verify filters were cleared
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(searchInput.value).toBe('');
    });
  });

  test('deactivates a driver when Deactivate button is clicked and confirmed via modal', async () => {
    // Mock window.confirm and window.prompt
    const { useDrivers } = require('../../context/DriversContext');
    const mockUpdateDriver = jest.fn().mockResolvedValue({
      id: 'driver1',
      status: 'inactive',
      offboardedAt: new Date().toISOString(),
      offboardReason: 'Left the company'
    });

    useDrivers.mockReturnValue({
      getDriversByStatus: jest.fn(async () => [
        {
          id: 'driver1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          customer: { name: 'Amazon' },
          location: 'London',
          status: 'active',
          createdAt: new Date('2023-01-15'),
          lastActive: new Date('2023-05-10'),
        }
      ]),
      updateDriver: mockUpdateDriver,
    });

    render(
      <BrowserRouter>
        <DriversProvider>
          <DriverList />
        </DriversProvider>
      </BrowserRouter>
    );

    // Wait for the active driver to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the deactivate button
    const deactivateButton = screen.getByText('Deactivate');
    fireEvent.click(deactivateButton);

    // Modal should be visible now
    await waitFor(() => {
      expect(screen.getByText('You are about to deactivate')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Enter reason in textarea
    const reasonTextarea = screen.getByPlaceholderText('Please provide a reason for deactivation...');
    fireEvent.change(reasonTextarea, { target: { value: 'Left the company' } });

    // Click the Deactivate Driver button in the modal
    const confirmButton = screen.getByText('Deactivate Driver');
    fireEvent.click(confirmButton);

    // Verify updateDriver was called with correct parameters
    await waitFor(() => {
      expect(mockUpdateDriver).toHaveBeenCalledWith(
        'driver1',
        expect.objectContaining({
          status: 'inactive',
          offboardReason: 'Left the company'
        })
      );
    });
  });
}); 