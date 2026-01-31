import React from 'react'

interface TextFormatting {
  color?: string
  fontSize?: number
  fontFamily?: string
  bold?: boolean
  italic?: boolean
}

interface FormattingToolbarProps {
  formatting: TextFormatting
  onChange: (formatting: TextFormatting) => void
}

export default function FormattingToolbar({ formatting, onChange }: FormattingToolbarProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...formatting, color: e.target.value })
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...formatting, fontSize: parseInt(e.target.value) })
  }

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...formatting, fontFamily: e.target.value })
  }

  const toggleBold = () => {
    onChange({ ...formatting, bold: !formatting.bold })
  }

  const toggleItalic = () => {
    onChange({ ...formatting, italic: !formatting.italic })
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '12px',
        padding: '12px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '8px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {/* Text Color */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.85rem', color: '#a1a1a6' }}>Color:</label>
        <input
          type="color"
          value={formatting.color || '#f5f5f7'}
          onChange={handleColorChange}
          style={{ width: '40px', height: '32px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
        />
      </div>

      {/* Font Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.85rem', color: '#a1a1a6' }}>Size:</label>
        <select
          value={formatting.fontSize || 16}
          onChange={handleFontSizeChange}
          style={{
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: '#f5f5f7',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
        </select>
      </div>

      {/* Font Family */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.85rem', color: '#a1a1a6' }}>Font:</label>
        <select
          value={formatting.fontFamily || 'inherit'}
          onChange={handleFontFamilyChange}
          style={{
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: '#f5f5f7',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="inherit">Default</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
        </select>
      </div>

      {/* Bold Button */}
      <button
        onClick={toggleBold}
        style={{
          padding: '6px 12px',
          background: formatting.bold ? '#0a84ff' : 'rgba(255,255,255,0.1)',
          border: formatting.bold ? '1px solid #0a84ff' : '1px solid rgba(255,255,255,0.2)',
          borderRadius: '6px',
          color: '#f5f5f7',
          fontWeight: '700',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        B
      </button>

      {/* Italic Button */}
      <button
        onClick={toggleItalic}
        style={{
          padding: '6px 12px',
          background: formatting.italic ? '#0a84ff' : 'rgba(255,255,255,0.1)',
          border: formatting.italic ? '1px solid #0a84ff' : '1px solid rgba(255,255,255,0.2)',
          borderRadius: '6px',
          color: '#f5f5f7',
          fontStyle: 'italic',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        I
      </button>
    </div>
  )
}
