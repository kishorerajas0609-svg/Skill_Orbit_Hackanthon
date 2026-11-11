import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Upload, Crop, Check, Image as ImageIcon } from 'lucide-react';
import { api } from '../../api/client';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (url: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
      setError('');
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.avatar_url) {
        onSuccess(res.data.avatar_url);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload & Crop Profile Photo"
      description="Upload an image (JPG, PNG, WEBP) up to 5MB."
      maxWidth="md"
    >
      <div className="space-y-5">
        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-emerald-500/50 bg-surface-elevated/50 p-8 cursor-pointer transition-colors group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border text-foreground-muted group-hover:text-emerald-400 transition-colors shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <span className="mt-3 text-sm font-semibold text-foreground">Click to browse image</span>
            <span className="mt-1 text-xs text-foreground-muted">PNG, JPG, or WEBP up to 5MB</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-emerald-500/40 bg-black/40 shadow-inner">
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="h-full w-full object-cover transition-transform"
                  style={{ transform: `scale(${zoom})` }}
                />
              </div>
            </div>

            <div className="space-y-1.5 px-4">
              <div className="flex justify-between text-xs text-foreground-muted">
                <span>Zoom / Scale</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="flex justify-center">
              <label className="cursor-pointer text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Choose a different photo
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-rose-400 text-center">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={!selectedFile}
            icon={<Check className="w-4 h-4" />}
          >
            Save Photo
          </Button>
        </div>
      </div>
    </Modal>
  );
};
