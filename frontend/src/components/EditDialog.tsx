import React, { useState, useRef } from 'react'

interface EditDialogProps {
  onClose: () => void
  onImageUpload: (file: File, type: string, cardId?: number) => void
  isEditMode: boolean
  onEditModeChange: (value: boolean) => void
}

const EditDialog: React.FC<EditDialogProps> = ({ 
  onClose, 
  onImageUpload,
  isEditMode,
  onEditModeChange,
}) => {
  const [uploading, setUploading] = useState(false)
  
  const fileInputRefs = {
    card1: useRef<HTMLInputElement>(null),
    card2: useRef<HTMLInputElement>(null),
    card3: useRef<HTMLInputElement>(null),
    bg: useRef<HTMLInputElement>(null),
    partner: useRef<HTMLInputElement>(null),
  }

  const handleCardImageSelect = async (cardId: number, file: File) => {
    console.log(`[DEBUG] Card image selected - CardId: ${cardId}, File: ${file.name}`)
    setUploading(true)
    try {
      await onImageUpload(file, 'card', cardId)
      console.log(`[DEBUG] Card ${cardId} image uploaded successfully`)
    } catch (error) {
      console.error('Failed to upload card image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleBackgroundImageSelect = (file: File) => {
    onImageUpload(file, 'background')
  }

  const handlePartnerLogoSelect = (file: File) => {
    onImageUpload(file, 'partner')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="dialog-header">
          <h2 style={{ margin: 0 }}>Edit & Upload</h2>
          <label className="edit-mode-toggle">
            <input
              type="checkbox"
              checked={isEditMode}
              onChange={(e) => onEditModeChange(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Edit Mode</span>
          </label>
        </div>
        
        <h2 style={{ fontSize: '1.1rem', marginTop: '20px', marginBottom: '15px' }}>Upload Images</h2>

        <div className="dialog-section">
          <h3>Project Cards</h3>
          {['card1', 'card2', 'card3'].map((card, idx) => (
            <div key={card} className="upload-group">
              <button
                onClick={() =>
                  fileInputRefs[card as keyof typeof fileInputRefs].current?.click()
                }
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : `Upload Card ${idx + 1} Image`}
              </button>
              <input
                ref={fileInputRefs[card as keyof typeof fileInputRefs]}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  handleCardImageSelect(idx + 1, e.target.files[0])
                }
                style={{ display: 'none' }}
              />
            </div>
          ))}
        </div>

        <div className="dialog-section">
          <h3>Background Image</h3>
          <div className="upload-group">
            <button onClick={() => fileInputRefs.bg.current?.click()}>
              Upload Background Image
            </button>
            <input
              ref={fileInputRefs.bg}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleBackgroundImageSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="dialog-section">
          <h3>Partner Hotel Logo</h3>
          <div className="upload-group">
            <button onClick={() => fileInputRefs.partner.current?.click()}>
              Upload Partner Logo
            </button>
            <input
              ref={fileInputRefs.partner}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handlePartnerLogoSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <button className="btn-save" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}

export default EditDialog
