import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  /** Accepted file types (e.g., ".pdf,.doc,.docx") */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Whether multiple files are allowed */
  multiple?: boolean;
  /** Label for the upload area */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Callback when files are selected */
  onFilesChange?: (files: File[]) => void;
  /** Callback for upload progress (0-100) */
  onProgress?: (progress: number) => void;
  /** Whether the upload is in progress */
  isUploading?: boolean;
  /** Upload progress percentage (0-100) */
  progress?: number;
  /** Error message */
  error?: string;
  /** Whether upload was successful */
  success?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Current selected file (controlled) */
  value?: File | null;
  /** Required field */
  required?: boolean;
  /** Input name */
  name?: string;
  /** Input id */
  id?: string;
}

/**
 * FileUpload Component
 *
 * A styled file upload component with drag-and-drop support
 * and progress indicator for long uploads.
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  label = 'Upload File',
  helperText,
  onFilesChange,
  isUploading = false,
  progress = 0,
  error,
  success = false,
  disabled = false,
  value,
  required = false,
  name,
  id,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`;
    }

    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type.toLowerCase();

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', '/'));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    setLocalError(null);
    const fileArray = Array.from(files);

    // Validate files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }
    }

    onFilesChange?.(multiple ? fileArray : [fileArray[0]]);
  }, [multiple, maxSize, accept, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && !isUploading) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, isUploading, handleFiles]);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalError(null);
    onFilesChange?.([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getStateStyles = () => {
    if (displayError) {
      return 'border-red-300 bg-red-50';
    }
    if (success) {
      return 'border-green-300 bg-green-50';
    }
    if (isDragging) {
      return 'border-primary bg-primary/5';
    }
    if (disabled || isUploading) {
      return 'border-gray-200 bg-gray-50 cursor-not-allowed';
    }
    return 'border-gray-300 hover:border-primary';
  };

  return (
    <div className="space-y-2">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
        required={required && !value}
        name={name}
        id={id}
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${getStateStyles()}
        `}
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          {/* Icon */}
          {isUploading ? (
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : success ? (
            <CheckCircle className="w-10 h-10 text-green-500" />
          ) : displayError ? (
            <AlertCircle className="w-10 h-10 text-red-500" />
          ) : value ? (
            <File className="w-10 h-10 text-primary" />
          ) : (
            <Upload className="w-10 h-10 text-gray-400" />
          )}

          {/* Label & Status */}
          {isUploading ? (
            <div className="w-full max-w-xs">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Uploading... {progress}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : value ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                {value.name}
              </span>
              <span className="text-xs text-gray-500">
                ({formatFileSize(value.size)})
              </span>
              {!disabled && (
                <button
                  onClick={handleRemove}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-500">
                Drag & drop or click to browse
              </p>
            </>
          )}
        </div>
      </div>

      {/* Helper text / Error */}
      {(helperText || displayError) && (
        <p className={`text-xs ${displayError ? 'text-red-500' : 'text-gray-500'}`}>
          {displayError || helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Upload progress hook for axios
 * @example
 * const { progress, upload } = useUploadProgress();
 * await upload(axios.post('/upload', formData, {
 *   onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / (e.total || 1)))
 * }));
 */
export function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const startUpload = useCallback(() => {
    setProgress(0);
    setIsUploading(true);
  }, []);

  const updateProgress = useCallback((loaded: number, total: number) => {
    const percent = Math.round((loaded * 100) / (total || 1));
    setProgress(percent);
  }, []);

  const endUpload = useCallback(() => {
    setProgress(100);
    setIsUploading(false);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
  }, []);

  return {
    progress,
    isUploading,
    startUpload,
    updateProgress,
    endUpload,
    resetProgress,
  };
}

export default FileUpload;
