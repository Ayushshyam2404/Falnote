import React from 'react'

interface SectionCardProps {
  title: string
  description: string
  imageUrl: string
  isEditable: boolean
  onImageSelect: (url: string) => void
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  imageUrl,
  isEditable,
  onImageSelect,
}) => {
  return (
    <div
      className="snapshot-card"
      onClick={() => imageUrl && !imageUrl.includes('[') && onImageSelect(imageUrl)}
    >
      <div className="snapshot-image-container">
        <img src={imageUrl} alt={title} className="snapshot-image" />
      </div>
      <div className="snapshot-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default SectionCard
