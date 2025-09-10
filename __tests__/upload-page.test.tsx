// Comprehensive tests for the upload page

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, testData, mockFileUpload, asyncUtils } from '@/lib/test-utils';
import UploadPage from '@/app/upload/page';

// Mock the uploadthing components
jest.mock('@/lib/uploadthing', () => ({
  UploadButton: ({ onClientUploadComplete, onUploadError, onUploadBegin, className }: any) => (
    <button
      className={className}
      onClick={() => {
        onUploadBegin?.('test-file');
        // Simulate successful upload
        setTimeout(() => {
          onClientUploadComplete?.([{
            key: 'test-key',
            name: 'test-file.js',
            type: 'application/javascript',
            size: 1024
          }]);
        }, 100);
      }}
      data-testid="upload-button"
    >
      Upload File
    </button>
  ),
}));

// Mock the router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('UploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders the upload page with correct title and description', () => {
      renderWithProviders(<UploadPage />);
      
      expect(screen.getByText('Upload AR Project')).toBeInTheDocument();
      expect(screen.getByText('Share your AR project with the community')).toBeInTheDocument();
    });

    it('shows the project details tab by default', () => {
      renderWithProviders(<UploadPage />);
      
      expect(screen.getByText('Project Details')).toBeInTheDocument();
      expect(screen.getByText('Project Information')).toBeInTheDocument();
    });

    it('renders all three tabs', () => {
      renderWithProviders(<UploadPage />);
      
      expect(screen.getByText('Project Details')).toBeInTheDocument();
      expect(screen.getByText('Upload Files')).toBeInTheDocument();
      expect(screen.getByText('Preview & Submit')).toBeInTheDocument();
    });
  });

  describe('Project Details Tab', () => {
    it('renders all required form fields', () => {
      renderWithProviders(<UploadPage />);
      
      expect(screen.getByLabelText('Project Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Short Description *')).toBeInTheDocument();
      expect(screen.getByLabelText('Project Visibility')).toBeInTheDocument();
      expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      renderWithProviders(<UploadPage />);
      
      // Try to continue without filling required fields
      const continueButton = screen.getByText('Continue to Files');
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Description is required')).toBeInTheDocument();
      });
    });

    it('validates title length', async () => {
      renderWithProviders(<UploadPage />);
      
      const titleInput = screen.getByLabelText('Project Title *');
      
      // Test minimum length
      fireEvent.change(titleInput, { target: { value: 'ab' } });
      fireEvent.blur(titleInput);
      
      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
      });
      
      // Test maximum length
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(121) } });
      fireEvent.blur(titleInput);
      
      await waitFor(() => {
        expect(screen.getByText('Title must be less than 120 characters')).toBeInTheDocument();
      });
    });

    it('validates description length', async () => {
      renderWithProviders(<UploadPage />);
      
      const descriptionInput = screen.getByLabelText('Short Description *');
      
      // Test minimum length
      fireEvent.change(descriptionInput, { target: { value: 'short' } });
      fireEvent.blur(descriptionInput);
      
      await waitFor(() => {
        expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
      });
      
      // Test maximum length
      fireEvent.change(descriptionInput, { target: { value: 'a'.repeat(201) } });
      fireEvent.blur(descriptionInput);
      
      await waitFor(() => {
        expect(screen.getByText('Description must be less than 200 characters')).toBeInTheDocument();
      });
    });

    it('allows adding and removing tags', async () => {
      renderWithProviders(<UploadPage />);
      
      const tagInput = screen.getByLabelText('Tags');
      const addButton = screen.getByRole('button', { name: /add/i });
      
      // Add a tag
      fireEvent.change(tagInput, { target: { value: 'test-tag' } });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('test-tag')).toBeInTheDocument();
      });
      
      // Remove the tag
      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
      });
    });

    it('limits the number of tags', async () => {
      renderWithProviders(<UploadPage />);
      
      const tagInput = screen.getByLabelText('Tags');
      const addButton = screen.getByRole('button', { name: /add/i });
      
      // Add 11 tags (limit is 10)
      for (let i = 0; i < 11; i++) {
        fireEvent.change(tagInput, { target: { value: `tag-${i}` } });
        fireEvent.click(addButton);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Maximum 10 tags allowed')).toBeInTheDocument();
      });
    });

    it('prevents duplicate tags', async () => {
      renderWithProviders(<UploadPage />);
      
      const tagInput = screen.getByLabelText('Tags');
      const addButton = screen.getByRole('button', { name: /add/i });
      
      // Add the same tag twice
      fireEvent.change(tagInput, { target: { value: 'duplicate' } });
      fireEvent.click(addButton);
      fireEvent.change(tagInput, { target: { value: 'duplicate' } });
      fireEvent.click(addButton);
      
      // Should only have one instance
      const tags = screen.getAllByText('duplicate');
      expect(tags).toHaveLength(1);
    });
  });

  describe('File Upload Tab', () => {
    beforeEach(async () => {
      renderWithProviders(<UploadPage />);
      
      // Fill required fields and navigate to files tab
      fireEvent.change(screen.getByLabelText('Project Title *'), { 
        target: { value: 'Test Project' } 
      });
      fireEvent.change(screen.getByLabelText('Short Description *'), { 
        target: { value: 'A test project description' } 
      });
      
      const continueButton = screen.getByText('Continue to Files');
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Upload Project Files')).toBeInTheDocument();
      });
    });

    it('renders drag and drop zone', () => {
      expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
      expect(screen.getByText('or click the upload buttons below')).toBeInTheDocument();
    });

    it('renders upload buttons for different file types', () => {
      expect(screen.getByText('3D Models')).toBeInTheDocument();
      expect(screen.getByText('Scripts')).toBeInTheDocument();
      expect(screen.getByText('Config Files')).toBeInTheDocument();
    });

    it('handles file uploads', async () => {
      const uploadButtons = screen.getAllByTestId('upload-button');
      fireEvent.click(uploadButtons[0]); // Click first upload button
      
      await waitFor(() => {
        expect(screen.getByText('Uploaded Files (1)')).toBeInTheDocument();
        expect(screen.getByText('test-file.js')).toBeInTheDocument();
      });
    });

    it('allows removing uploaded files', async () => {
      const uploadButtons = screen.getAllByTestId('upload-button');
      fireEvent.click(uploadButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Uploaded Files (1)')).toBeInTheDocument();
      });
      
      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Uploaded Files (1)')).not.toBeInTheDocument();
      });
    });

    it('validates that at least one file is uploaded', async () => {
      const continueButton = screen.getByText('Continue to Preview');
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('At least one file must be uploaded')).toBeInTheDocument();
      });
    });

    it('handles drag and drop events', async () => {
      const dropZone = screen.getByText('Drag and drop files here').closest('div');
      
      // Create a mock file
      const file = mockFileUpload.createScriptFile('test.js', 1024);
      
      // Simulate drag and drop
      fireEvent.dragEnter(dropZone!);
      fireEvent.dragOver(dropZone!);
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file]
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText('Uploaded Files (1)')).toBeInTheDocument();
        expect(screen.getByText('test.js')).toBeInTheDocument();
      });
    });

    it('validates file size limits', async () => {
      const dropZone = screen.getByText('Drag and drop files here').closest('div');
      
      // Create a file that's too large (100MB + 1 byte)
      const largeFile = mockFileUpload.createScriptFile('large.js', 100 * 1024 * 1024 + 1);
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [largeFile]
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText(/File large.js is too large/)).toBeInTheDocument();
      });
    });
  });

  describe('Preview Tab', () => {
    beforeEach(async () => {
      renderWithProviders(<UploadPage />);
      
      // Fill form and upload files
      fireEvent.change(screen.getByLabelText('Project Title *'), { 
        target: { value: 'Test Project' } 
      });
      fireEvent.change(screen.getByLabelText('Short Description *'), { 
        target: { value: 'A test project description' } 
      });
      
      // Add a tag
      fireEvent.change(screen.getByLabelText('Tags'), { 
        target: { value: 'test-tag' } 
      });
      fireEvent.click(screen.getByRole('button', { name: /add/i }));
      
      // Navigate to files tab
      fireEvent.click(screen.getByText('Continue to Files'));
      
      await waitFor(() => {
        expect(screen.getByText('Upload Project Files')).toBeInTheDocument();
      });
      
      // Upload a file
      const uploadButtons = screen.getAllByTestId('upload-button');
      fireEvent.click(uploadButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Uploaded Files (1)')).toBeInTheDocument();
      });
      
      // Navigate to preview tab
      fireEvent.click(screen.getByText('Continue to Preview'));
      
      await waitFor(() => {
        expect(screen.getByText('Preview & Submit')).toBeInTheDocument();
      });
    });

    it('displays project information correctly', () => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('A test project description')).toBeInTheDocument();
      expect(screen.getByText('test-tag')).toBeInTheDocument();
    });

    it('displays uploaded files correctly', () => {
      expect(screen.getByText('Files (1)')).toBeInTheDocument();
      expect(screen.getByText('test-file.js')).toBeInTheDocument();
    });

    it('shows visibility badge', () => {
      expect(screen.getByText('public')).toBeInTheDocument();
    });

    it('allows submitting the form', async () => {
      // Mock successful API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: '1' })
      });
      
      const submitButton = screen.getByText('Submit Project');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/projects/1');
      });
    });

    it('handles submission errors', async () => {
      // Mock API error
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Submission failed' })
      });
      
      const submitButton = screen.getByText('Submit Project');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('allows navigation between tabs', async () => {
      renderWithProviders(<UploadPage />);
      
      // Fill required fields
      fireEvent.change(screen.getByLabelText('Project Title *'), { 
        target: { value: 'Test Project' } 
      });
      fireEvent.change(screen.getByLabelText('Short Description *'), { 
        target: { value: 'A test project description' } 
      });
      
      // Navigate to files tab
      fireEvent.click(screen.getByText('Continue to Files'));
      
      await waitFor(() => {
        expect(screen.getByText('Upload Project Files')).toBeInTheDocument();
      });
      
      // Navigate back to details
      fireEvent.click(screen.getByText('Back'));
      
      await waitFor(() => {
        expect(screen.getByText('Project Information')).toBeInTheDocument();
      });
    });

    it('prevents navigation with invalid form data', async () => {
      renderWithProviders(<UploadPage />);
      
      // Try to navigate to files without filling required fields
      fireEvent.click(screen.getByText('Continue to Files'));
      
      // Should stay on details tab
      expect(screen.getByText('Project Information')).toBeInTheDocument();
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderWithProviders(<UploadPage />);
      
      expect(screen.getByLabelText('Project Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Short Description *')).toBeInTheDocument();
      expect(screen.getByLabelText('Project Visibility')).toBeInTheDocument();
      expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      renderWithProviders(<UploadPage />);
      
      expect(screen.getByRole('button', { name: /continue to files/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('shows error messages with proper association', async () => {
      renderWithProviders(<UploadPage />);
      
      const titleInput = screen.getByLabelText('Project Title *');
      fireEvent.change(titleInput, { target: { value: '' } });
      fireEvent.blur(titleInput);
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays network errors', async () => {
      renderWithProviders(<UploadPage />);
      
      // Fill form and navigate to preview
      fireEvent.change(screen.getByLabelText('Project Title *'), { 
        target: { value: 'Test Project' } 
      });
      fireEvent.change(screen.getByLabelText('Short Description *'), { 
        target: { value: 'A test project description' } 
      });
      
      fireEvent.click(screen.getByText('Continue to Files'));
      
      await waitFor(() => {
        expect(screen.getByText('Upload Project Files')).toBeInTheDocument();
      });
      
      const uploadButtons = screen.getAllByTestId('upload-button');
      fireEvent.click(uploadButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Uploaded Files (1)')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Continue to Preview'));
      
      await waitFor(() => {
        expect(screen.getByText('Preview & Submit')).toBeInTheDocument();
      });
      
      // Mock network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const submitButton = screen.getByText('Submit Project');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });
});

