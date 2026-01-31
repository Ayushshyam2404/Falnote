import React, { useState } from 'react'

interface EditableTextProps {
  id: string
  text: string
  isEditable: boolean
  onSave: (text: string) => void
  className?: string
}

const EditableText: React.FC<EditableTextProps> = ({
  id,
  text,
  isEditable,
  onSave,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(text)

  const handleSave = () => {
    if (value.trim()) {
      onSave(value)
      setIsEditing(false)
    }
  }

  if (!isEditable || !isEditing) {
    return (
      <div
        id={id}
        className={`editable-text ${className} ${isEditable ? 'editable' : ''}`}
        onClick={() => isEditable && setIsEditing(true)}
      >
        {text}
      </div>
    )
  }

  return (
    <div className="edit-input-container">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        autoFocus
      />
    </div>
  )
}

export default EditableText
