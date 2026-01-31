import React, { useState } from 'react'
import FormattingToolbar from './FormattingToolbar'

interface TextFormatting {
  color?: string
  fontSize?: number
  fontFamily?: string
  bold?: boolean
  italic?: boolean
}

interface TableRow {
  [key: string]: string
}

interface TableSectionProps {
  title: string
  onTitleChange?: (title: string) => void
  titleFormatting?: TextFormatting
  onTitleFormattingChange?: (formatting: TextFormatting) => void
  rows: TableRow[]
  columns: string[]
  onDataChange?: (rows: TableRow[], columns: string[]) => void
  isEditMode?: boolean
  formatting?: TextFormatting
}

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#f5f5f7',
  fontSize: '1rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
  transition: 'all 0.2s ease',
}

const getFormattingStyle = (formatting?: TextFormatting): React.CSSProperties => ({
  color: formatting?.color || '#f5f5f7',
  fontSize: formatting?.fontSize ? `${formatting.fontSize}px` : '1rem',
  fontFamily: formatting?.fontFamily || 'inherit',
  fontWeight: formatting?.bold ? '700' : '400',
  fontStyle: formatting?.italic ? 'italic' : 'normal',
})

const TableSection: React.FC<TableSectionProps> = ({
  title,
  onTitleChange,
  titleFormatting = {},
  onTitleFormattingChange,
  rows,
  columns,
  onDataChange,
  isEditMode = false,
  formatting = {},
}) => {
  const [pasteError, setPasteError] = useState<string>('')
  const [focusedField, setFocusedField] = useState<string>('')

  const parseExcelData = (text: string) => {
    try {
      setPasteError('')
      
      // Split by newline to get rows
      const lines = text.trim().split('\n')
      if (lines.length === 0) {
        setPasteError('No data detected')
        return
      }

      // Split by tab (Excel default) or comma
      const delimiter = text.includes('\t') ? '\t' : ','
      
      // Get headers from first row
      const headerLine = lines[0].split(delimiter).map(h => h.trim())
      const newColumns = headerLine.filter(h => h.length > 0)

      if (newColumns.length === 0) {
        setPasteError('Could not detect column headers')
        return
      }

      // Parse data rows
      const newRows: TableRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(delimiter).map(c => c.trim())
        if (cells.some(c => c.length > 0)) {
          const row: TableRow = {}
          newColumns.forEach((col, idx) => {
            row[col] = cells[idx] || ''
          })
          newRows.push(row)
        }
      }

      if (newRows.length === 0) {
        setPasteError('No data rows found')
        return
      }

      onDataChange?.(newRows, newColumns)
    } catch (error) {
      setPasteError(`Error parsing data: ${(error as Error).message}`)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isEditMode) return
    e.preventDefault()
    
    const text = e.clipboardData?.getData('text/plain')
    if (text) {
      parseExcelData(text)
    }
  }

  const updateCell = (rowIdx: number, colName: string, value: string) => {
    const newRows = [...rows]
    newRows[rowIdx] = { ...newRows[rowIdx], [colName]: value }
    onDataChange?.(newRows, columns)
  }

  const addRow = () => {
    const newRow: TableRow = {}
    columns.forEach(col => {
      newRow[col] = ''
    })
    onDataChange?.([...rows, newRow], columns)
  }

  const deleteRow = (idx: number) => {
    const newRows = rows.filter((_, i) => i !== idx)
    onDataChange?.(newRows, columns)
  }

  const addColumn = () => {
    const newColName = `Column ${columns.length + 1}`
    const newColumns = [...columns, newColName]
    const newRows = rows.map(row => ({ ...row, [newColName]: '' }))
    onDataChange?.(newRows, newColumns)
  }

  const updateColumnName = (idx: number, newName: string) => {
    const oldName = columns[idx]
    const newColumns = [...columns]
    newColumns[idx] = newName
    
    const newRows = rows.map(row => {
      const newRow: TableRow = {}
      Object.entries(row).forEach(([key, val]) => {
        newRow[key === oldName ? newName : key] = val
      })
      return newRow
    })
    
    onDataChange?.(newRows, newColumns)
  }

  const deleteColumn = (idx: number) => {
    const colToDelete = columns[idx]
    const newColumns = columns.filter((_, i) => i !== idx)
    const newRows = rows.map(row => {
      const newRow: TableRow = {}
      Object.entries(row).forEach(([key, val]) => {
        if (key !== colToDelete) newRow[key] = val
      })
      return newRow
    })
    onDataChange?.(newRows, newColumns)
  }

  if (!isEditMode && rows.length === 0) {
    return null
  }

  return (
    <section className="section" style={{ marginTop: '40px' }}>
      <div style={{ marginBottom: '20px' }}>
        {isEditMode && focusedField === 'title' && (
          <FormattingToolbar
            formatting={titleFormatting || {}}
            onChange={(fmt) => onTitleFormattingChange?.(fmt)}
          />
        )}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          onFocus={() => setFocusedField('title')}
          style={{
            marginBottom: '10px',
            ...getFormattingStyle(titleFormatting),
            fontSize: '2rem',
            fontWeight: '700',
            border: isEditMode && focusedField === 'title' ? '2px solid rgba(100, 200, 255, 0.5)' : 'none',
            background: isEditMode && focusedField === 'title' ? 'rgba(100, 200, 255, 0.1)' : 'transparent',
            padding: isEditMode ? '8px 12px' : '0px',
            borderRadius: '6px',
            color: '#f5f5f7',
            fontFamily: 'inherit',
            outline: 'none',
            cursor: isEditMode ? 'text' : 'default',
            transition: 'all 0.2s ease',
          }}
          placeholder="Table Title"
          readOnly={!isEditMode}
        />
      </div>
      
      <div style={{
        background: 'rgba(20, 20, 30, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '30px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      }}>

      {isEditMode && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 12px 0', color: '#a1a1a6', fontSize: '0.9rem' }}>
            📋 Paste Excel/CSV data here (Tab or comma-separated, with headers in first row)
          </p>
          <div
            onPaste={handlePaste}
            style={{
              minHeight: '100px',
              padding: '12px',
              border: '2px dashed rgba(100, 200, 255, 0.3)',
              borderRadius: '6px',
              background: 'rgba(100, 200, 255, 0.05)',
              cursor: 'text',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#a1a1a6',
              outline: 'none',
            } as React.CSSProperties}
            contentEditable
            suppressContentEditableWarning
          >
            Click here and paste your Excel data...
          </div>
          {pasteError && (
            <p style={{ color: '#ff6b6b', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
              ❌ {pasteError}
            </p>
          )}

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button
              onClick={addRow}
              style={{
                padding: '8px 16px',
                background: '#34c759',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
              } as React.CSSProperties}
            >
              + Add Row
            </button>
            <button
              onClick={addColumn}
              style={{
                padding: '8px 16px',
                background: '#007aff',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
              } as React.CSSProperties}
            >
              + Add Column
            </button>
          </div>
        </div>
      )}

      {(rows.length > 0 || isEditMode) && (
        <div style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(10, 10, 15, 0.6)',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'inherit',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)' }}>
                {isEditMode && <th style={{ width: '50px' }}></th>}
                {columns.map((col, idx) => (
                  <th key={idx} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: '#f5f5f7',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                  } as React.CSSProperties}>
                    {isEditMode ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={col}
                          onChange={(e) => updateColumnName(idx, e.target.value)}
                          style={{
                            ...inputStyle,
                            flex: 1,
                            fontSize: '0.9rem',
                          } as React.CSSProperties}
                        />
                        <button
                          onClick={() => deleteColumn(idx)}
                          style={{
                            padding: '4px 8px',
                            background: '#ff3b30',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          } as React.CSSProperties}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      col
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  background: rowIdx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                } as React.CSSProperties}>
                  {isEditMode && (
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteRow(rowIdx)}
                        style={{
                          padding: '4px 8px',
                          background: '#ff3b30',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        } as React.CSSProperties}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col} style={{
                      padding: '12px 16px',
                      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#e8e8ed',
                      ...getFormattingStyle(formatting),
                    } as React.CSSProperties}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={row[col] || ''}
                          onChange={(e) => updateCell(rowIdx, col, e.target.value)}
                          style={{
                            ...inputStyle,
                            width: '100%',
                            fontSize: '0.9rem',
                          } as React.CSSProperties}
                        />
                      ) : (
                        row[col] || '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </section>
  )
}

export default TableSection
