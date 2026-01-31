import React, { useState } from 'react'

interface TextFormatting {
  color?: string
  fontSize?: number
  fontFamily?: string
  bold?: boolean
  italic?: boolean
}

interface HeaderProps {
  onEditClick: () => void
  title: string
  subtitle: string
  isEditMode?: boolean
  onTitleChange?: (title: string) => void
  onSubtitleChange?: (subtitle: string) => void
  titleFormatting?: TextFormatting
  subtitleFormatting?: TextFormatting
  onTitleFormattingChange?: (formatting: TextFormatting) => void
  onSubtitleFormattingChange?: (formatting: TextFormatting) => void
  partnerLogo?: string
}

const Header: React.FC<HeaderProps> = ({
  onEditClick,
  title,
  subtitle,
  isEditMode = false,
  onTitleChange,
  onSubtitleChange,
  titleFormatting = {},
  subtitleFormatting = {},
  onTitleFormattingChange,
  onSubtitleFormattingChange,
  partnerLogo,
}) => {
  const [activeField, setActiveField] = useState<string>('')
  const [showTitleFormatting, setShowTitleFormatting] = useState(false)
  const [showSubtitleFormatting, setShowSubtitleFormatting] = useState(false)

  const getTitleStyle = (): React.CSSProperties => ({
    color: titleFormatting.color || '#f5f5f7',
    fontSize: titleFormatting.fontSize ? `${titleFormatting.fontSize}px` : '3rem',
    fontFamily: titleFormatting.fontFamily || 'inherit',
    fontWeight: titleFormatting.bold ? '700' : '600',
    fontStyle: titleFormatting.italic ? 'italic' : 'normal',
  })

  const getSubtitleStyle = (): React.CSSProperties => ({
    color: subtitleFormatting.color || '#a0a0a7',
    fontSize: subtitleFormatting.fontSize ? `${subtitleFormatting.fontSize}px` : '1.2rem',
    fontFamily: subtitleFormatting.fontFamily || 'inherit',
    fontWeight: subtitleFormatting.bold ? '700' : 'normal',
    fontStyle: subtitleFormatting.italic ? 'italic' : 'normal',
  })

  const getFormattingPanel = (field: string, formatting: TextFormatting, onChange: ((fmt: TextFormatting) => void) | undefined) => {
    if (!onChange || !isEditMode) return null

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
    }

    return (
      <div className="formatting-panel" onMouseDown={handleMouseDown}>
        <div className="formatting-controls">
          <button
            onMouseDown={handleMouseDown}
            onClick={() => onChange({ ...formatting, bold: !formatting.bold })}
            style={{
              background: formatting.bold ? '#0a84ff' : 'rgba(10, 132, 255, 0.2)',
              color: '#f5f5f7',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}
            title="Bold"
          >
            B
          </button>
          
          <button
            onMouseDown={handleMouseDown}
            onClick={() => onChange({ ...formatting, italic: !formatting.italic })}
            style={{
              background: formatting.italic ? '#0a84ff' : 'rgba(10, 132, 255, 0.2)',
              color: '#f5f5f7',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}
            title="Italic"
          >
            I
          </button>

          <input
            type="color"
            onMouseDown={handleMouseDown}
            value={formatting.color || '#f5f5f7'}
            onChange={(e) => onChange({ ...formatting, color: e.target.value })}
            style={{
              width: '40px',
              height: '35px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            title="Text Color"
          />

          <select
            onMouseDown={handleMouseDown}
            value={formatting.fontSize || 24}
            onChange={(e) => onChange({ ...formatting, fontSize: parseInt(e.target.value) })}
            style={{
              padding: '6px 8px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#f5f5f7',
              border: '1px solid rgba(10, 132, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
            title="Font Size"
          >
            <option value="16">16px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
            <option value="36">36px</option>
            <option value="48">48px</option>
          </select>

          <select
            onMouseDown={handleMouseDown}
            value={formatting.fontFamily || 'inherit'}
            onChange={(e) => onChange({ ...formatting, fontFamily: e.target.value })}
            style={{
              padding: '6px 8px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#f5f5f7',
              border: '1px solid rgba(10, 132, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
            title="Font Family"
          >
            <option value="inherit">Default</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Courier New', monospace">Courier</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Comic Sans MS', cursive">Comic Sans</option>
          </select>
        </div>
      </div>
    )
  }

  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logo1.png" alt="Logo" className="logo" onClick={onEditClick} title="Click to edit" />
        {partnerLogo && (
          <img 
            src={`data:image/png;base64,${partnerLogo}`} 
            alt="Partner Logo" 
            className="logo partner-logo"
            title="Partner Hotel Logo"
          />
        )}
      </div>
      
      <div style={{ position: 'relative', width: '100%' }}>
        {isEditMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              onFocus={() => {
                setActiveField('title')
                setShowTitleFormatting(true)
              }}
              style={{
                ...getTitleStyle(),
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: showTitleFormatting ? '2px solid #0a84ff' : '1px solid rgba(10, 132, 255, 0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'all 0.2s ease',
                minHeight: '50px',
              }}
              placeholder="Enter title"
              autoFocus
            />
            {showTitleFormatting && getFormattingPanel('title', titleFormatting, onTitleFormattingChange)}
          </div>
        ) : (
          <h1 className="main-title" style={getTitleStyle()}>{title}</h1>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%', marginTop: '12px' }}>
        {isEditMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => onSubtitleChange?.(e.target.value)}
              onFocus={() => {
                setActiveField('subtitle')
                setShowSubtitleFormatting(true)
              }}
              style={{
                ...getSubtitleStyle(),
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: showSubtitleFormatting ? '2px solid #0a84ff' : '1px solid rgba(10, 132, 255, 0.3)',
                borderRadius: '10px',
                padding: '8px 12px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'all 0.2s ease',
                minHeight: '40px',
              }}
              placeholder="Enter subtitle"
            />
            {showSubtitleFormatting && getFormattingPanel('subtitle', subtitleFormatting, onSubtitleFormattingChange)}
          </div>
        ) : (
          <p className="subtitle" style={getSubtitleStyle()}>{subtitle}</p>
        )}
      </div>

      <div className="controls">
        <div className="connection-indicator">
          <span className="status-dot"></span>
          <span>Connected</span>
        </div>
      </div>
    </header>
  )
}

export default Header
