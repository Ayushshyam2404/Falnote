import React from 'react'

interface ImageModalProps {
  imageUrl: string
  onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <img src={imageUrl} alt="Full size" />
      </div>
    </div>
  )
}

export default ImageModal
