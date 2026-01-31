import { useState, useEffect } from 'react'
import './styles/App.css'
import Header from './components/Header'
import EditDialog from './components/EditDialog'
import ImageModal from './components/ImageModal'
import FormattingToolbar from './components/FormattingToolbar'
import TableSection from './components/TableSection'
import { pageDataApi, projectCardsApi } from './api'
import { useWebSocket } from './hooks'
import type { PageData, ProjectCard } from './types'
import { API_BASE_URL } from './types'

// Log API configuration on startup
console.log('[App] Configuration loaded - API_BASE_URL:', API_BASE_URL)

interface TextFormatting {
  color?: string
  fontSize?: number
  fontFamily?: string
  bold?: boolean
  italic?: boolean
}

function App() {
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [projectCards, setProjectCards] = useState<ProjectCard[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [sessionId] = useState(() => Date.now() + '-' + Math.random().toString(36).substr(2, 9))
  const [partnerLogo, setPartnerLogo] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Editable content state
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editContent, setEditContent] = useState<Record<string, string>>({})
  
  // Editable card state - separate from projectCards
  const [editCards, setEditCards] = useState<Record<number, { title: string; description: string }>>({})
  
  // Formatting state
  const [formatting, setFormatting] = useState<Record<string, TextFormatting>>({})
  const [activeFormattingField, setActiveFormattingField] = useState<string>('main_title')
  const [cardFormatting, setCardFormatting] = useState<Record<string, TextFormatting>>({})
  const [activeCardFormattingField, setActiveCardFormattingField] = useState<string>('')
  
  // Table state
  const [tableTitle, setTableTitle] = useState('Data Table')
  const [tableRows, setTableRows] = useState<Record<string, string>[]>([])
  const [tableColumns, setTableColumns] = useState<string[]>(['Column 1', 'Column 2', 'Column 3'])
  const [tableFormatting, setTableFormatting] = useState<Record<string, TextFormatting>>({})
  
  // UI state
  const [isSaving, setIsSaving] = useState(false)

  const { send } = useWebSocket(sessionId, (data) => {
    if ((data.type === 'data_updated' || data.type === 'image_updated') && data.session_id !== sessionId) {
      // Reload data from backend
      loadPageData()
      loadProjectCards()
    }
  })

  useEffect(() => {
    console.log('[App] Component mounted, loading data')
    loadPageData()
    loadProjectCards()
  }, [])

  const loadPageData = async () => {
    try {
      setLoadError(null)
      console.log('[App] Loading page data from API...')
      const response = await pageDataApi.get()
      console.log('[App] Page data loaded:', response.data)
      setPageData(response.data)
      setEditTitle(response.data.main_title || '')
      setEditSubtitle(response.data.main_subtitle || '')
      setEditContent(response.data.content || {})
      setPartnerLogo(response.data.partner_logo || null)
      // Load formatting from content
      const fmt: Record<string, TextFormatting> = {}
      Object.keys(response.data.content || {}).forEach((key) => {
        if (key.endsWith('_formatting')) {
          try {
            fmt[key] = JSON.parse(response.data.content[key])
          } catch {
            fmt[key] = {}
          }
        }
      })
      // Load title and subtitle formatting
      if (response.data.content?.['main_title_formatting']) {
        try {
          fmt['main_title_formatting'] = JSON.parse(response.data.content['main_title_formatting'])
        } catch {
          fmt['main_title_formatting'] = {}
        }
      }
      if (response.data.content?.['main_subtitle_formatting']) {
        try {
          fmt['main_subtitle_formatting'] = JSON.parse(response.data.content['main_subtitle_formatting'])
        } catch {
          fmt['main_subtitle_formatting'] = {}
        }
      }
      setFormatting(fmt)
      
      // Load table data
      if (response.data.content?.['section5_table_data']) {
        try {
          const tableData = JSON.parse(response.data.content['section5_table_data'])
          setTableRows(tableData.rows || [])
          setTableColumns(tableData.columns || ['Column 1', 'Column 2', 'Column 3'])
        } catch {
          setTableRows([])
        }
      }
      
      if (response.data.content?.['section5_title']) {
        setTableTitle(response.data.content['section5_title'])
      }
      
      // Load table formatting
      const tableFmt: Record<string, TextFormatting> = {}
      if (response.data.content?.['section5_title_formatting']) {
        try {
          tableFmt['section5_title_formatting'] = JSON.parse(response.data.content['section5_title_formatting'])
        } catch {
          tableFmt['section5_title_formatting'] = {}
        }
      }
      if (response.data.content?.['section5_cell_formatting']) {
        try {
          tableFmt['section5_cell_formatting'] = JSON.parse(response.data.content['section5_cell_formatting'])
        } catch {
          tableFmt['section5_cell_formatting'] = {}
        }
      }
      setTableFormatting(tableFmt)

    } catch (error: any) {
      const msg = error?.message || 'Unknown error'
      console.error('Failed to load page data:', error)
      setLoadError(`Failed to load page: ${msg}`)
    }
  }

  const loadProjectCards = async () => {
    try {
      console.log('[App] Loading project cards from API...')
      const response = await projectCardsApi.getAll()
      console.log('[App] Project cards loaded:', response.data)
      setProjectCards(response.data || [])
      // Initialize edit cards state with fresh data - ensure all 3 cards exist
      const cards: Record<number, { title: string; description: string }> = {}
      const cardFmt: Record<string, TextFormatting> = {}
      ;(response.data || []).forEach((card: any) => {
        cards[card.id] = { 
          title: card.title || '', 
          description: card.description || '' 
        }
        // Load formatting for each card
        if (card.formatting && typeof card.formatting === 'object') {
          if (card.formatting.title) {
            cardFmt[`card_${card.id}_title`] = card.formatting.title
          }
          if (card.formatting.description) {
            cardFmt[`card_${card.id}_description`] = card.formatting.description
          }
        }
      })
      // Ensure we have at least 3 cards in the edit state
      for (let i = 1; i <= 3; i++) {
        if (!cards[i]) {
          cards[i] = { title: '', description: '' }
        }
      }
      setEditCards(cards)
      setCardFormatting(cardFmt)
    } catch (error) {
      console.error('Failed to load project cards:', error)
    }
  }

  
const handleSaveAllChanges = async () => {
    setIsSaving(true)
    try {
      // 1. Save page content and formatting
      const contentWithFormatting = { ...editContent }
      Object.entries(formatting).forEach(([key, fmt]) => {
        if (Object.keys(fmt).length > 0) {
          contentWithFormatting[key] = JSON.stringify(fmt)
        }
      })
      
      // Include title and subtitle formatting
      if (Object.keys(formatting['main_title_formatting'] || {}).length > 0) {
        contentWithFormatting['main_title_formatting'] = JSON.stringify(formatting['main_title_formatting'])
      }
      if (Object.keys(formatting['main_subtitle_formatting'] || {}).length > 0) {
        contentWithFormatting['main_subtitle_formatting'] = JSON.stringify(formatting['main_subtitle_formatting'])
      }
      
      // Add table data and formatting
      if (tableRows.length > 0 || tableColumns.length > 0) {
        contentWithFormatting['section5_table_data'] = JSON.stringify({
          rows: tableRows,
          columns: tableColumns,
        })
      }
      if (tableTitle) {
        contentWithFormatting['section5_title'] = tableTitle
      }
      if (tableFormatting['section5_title_formatting']) {
        contentWithFormatting['section5_title_formatting'] = JSON.stringify(tableFormatting['section5_title_formatting'])
      }
      if (tableFormatting['section5_cell_formatting']) {
        contentWithFormatting['section5_cell_formatting'] = JSON.stringify(tableFormatting['section5_cell_formatting'])
      }
      
      try {
        const response = await pageDataApi.update({
          main_title: editTitle,
          main_subtitle: editSubtitle,
          content: contentWithFormatting,
          modified_by: sessionId,
        })
        
        if (response.data) {
          setPageData(response.data)
        }
      } catch (updateError) {
        console.error('Error updating page data:', updateError)
        // Continue anyway - data might have been saved despite response error
      }
      
      // 2. Save card changes - compare editCards with original projectCards
      const cardUpdatePromises = projectCards
        .map(originalCard => {
          const edited = editCards[originalCard.id]
          if (!edited) return null
          
          const hasChanges = 
            edited.title !== originalCard.title || 
            edited.description !== originalCard.description
          
          // Check if formatting changed
          const titleFmtKey = `card_${originalCard.id}_title`
          const descFmtKey = `card_${originalCard.id}_description`
          const titleFmtChanged = Object.keys(cardFormatting[titleFmtKey] || {}).length > 0
          const descFmtChanged = Object.keys(cardFormatting[descFmtKey] || {}).length > 0
          
          if (!hasChanges && !titleFmtChanged && !descFmtChanged) {
            return null
          }
          
          // Build formatting object
          const cardFormatData: Record<string, any> = {}
          if (titleFmtChanged) {
            cardFormatData.title = cardFormatting[titleFmtKey]
          }
          if (descFmtChanged) {
            cardFormatData.description = cardFormatting[descFmtKey]
          }
          
          return projectCardsApi.update(originalCard.id, {
            title: edited.title,
            description: edited.description,
            formatting: Object.keys(cardFormatData).length > 0 ? cardFormatData : undefined,
          } as any)
        })
        .filter(promise => promise !== null)
      
      if (cardUpdatePromises.length > 0) {
        try {
          await Promise.all(cardUpdatePromises)
        } catch (cardError) {
          console.error('Error updating cards:', cardError)
        }
      }
      
      // 3. Reload cards to sync state
      try {
        await loadProjectCards()
      } catch (reloadError) {
        console.error('Error reloading cards:', reloadError)
      }
      
      // 4. Exit edit mode
      setIsEditMode(false)
      
      send({
        type: 'data_updated',
        data: editContent,
        session_id: sessionId,
      })
    } catch (error) {
      console.error('Failed to save changes:', error)
      alert('Error saving changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: string, cardId?: number) => {
    try {
      console.log(`[DEBUG] Uploading image - Type: ${type}, CardId: ${cardId}, FileName: ${file.name}`)
      
      if (type === 'background') {
        console.log('[DEBUG] Uploading to background endpoint')
        await pageDataApi.uploadImage(file)
      } else if (type === 'partner') {
        console.log('[DEBUG] Uploading partner logo')
        await pageDataApi.uploadPartnerLogo(file)
      } else if (type === 'card' && cardId) {
        console.log(`[DEBUG] Uploading to card endpoint - Card ID: ${cardId}`)
        await projectCardsApi.uploadImage(cardId, file)
      } else {
        console.log('[DEBUG] Warning: Image type not recognized or missing cardId')
      }
      
      await loadPageData()
      await loadProjectCards()
      send({
        type: 'image_updated',
        session_id: sessionId,
      })
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  const getFormattingStyle = (fieldKey: string): React.CSSProperties => {
    const fmt = formatting[fieldKey] || {}
    return {
      color: fmt.color || undefined,
      fontSize: fmt.fontSize ? `${fmt.fontSize}px` : undefined,
      fontFamily: fmt.fontFamily || undefined,
      fontWeight: fmt.bold ? '700' : undefined,
      fontStyle: fmt.italic ? 'italic' : undefined,
    }
  }

  const getCardFormattingStyle = (cardId: number, fieldType: 'title' | 'description'): React.CSSProperties => {
    const fmt = cardFormatting[`card_${cardId}_${fieldType}`] || {}
    return {
      color: fmt.color || undefined,
      fontSize: fmt.fontSize ? `${fmt.fontSize}px` : undefined,
      fontFamily: fmt.fontFamily || undefined,
      fontWeight: fmt.bold ? '700' : undefined,
      fontStyle: fmt.italic ? 'italic' : undefined,
    }
  }

  // Professional input/textarea styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(10, 132, 255, 0.4)',
    borderRadius: '10px',
    color: '#f5f5f7',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(10, 132, 255, 0.4)',
    borderRadius: '10px',
    color: '#f5f5f7',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    minHeight: '120px',
    resize: 'vertical',
    transition: 'all 0.2s ease',
  }

  if (!pageData) {
    return <div className="loading" style={{ color: '#00ff00', fontSize: '24px', fontWeight: 'bold' }}>
      {loadError ? `❌ Error: ${loadError}` : '⏳ Loading page data...'}
    </div>
  }

  console.log('[App] Rendering page content with data:', {
    title: pageData.main_title,
    cardsCount: Object.keys(editCards).length,
    hasBackground: !!pageData.background_image
  })

  return (
    <div className="app">
      {/* Background Image Layer */}
      {pageData.background_image && (
        <div
          className="app-background"
          style={{
            backgroundImage: `url('data:image/png;base64,${pageData.background_image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        ></div>
      )}
      
      <Header
        onEditClick={() => setShowEditDialog(true)}
        title={isEditMode ? editTitle : pageData.main_title}
        subtitle={isEditMode ? editSubtitle : pageData.main_subtitle}
        isEditMode={isEditMode}
        onTitleChange={setEditTitle}
        onSubtitleChange={setEditSubtitle}
        titleFormatting={formatting['main_title_formatting'] || {}}
        subtitleFormatting={formatting['main_subtitle_formatting'] || {}}
        onTitleFormattingChange={(fmt) => setFormatting({ ...formatting, main_title_formatting: fmt })}
        onSubtitleFormattingChange={(fmt) => setFormatting({ ...formatting, main_subtitle_formatting: fmt })}
        partnerLogo={partnerLogo || undefined}
      />

      <main className="container">
        {isEditMode && (
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '24px', marginBottom: '30px', backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
            <h3 style={{ marginBottom: '15px', color: '#f5f5f7', fontSize: '1.1rem', fontWeight: '600' }}>✏️ Edit Mode - Click a field to format it</h3>
            <button
              onClick={handleSaveAllChanges}
              disabled={isSaving}
              style={{
                padding: '12px 24px',
                background: '#34c759',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                marginBottom: '15px',
                boxShadow: '0 4px 12px rgba(52, 199, 89, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        )}
        {/* Section 1: Active Construction Projects */}
        <section className="section">
          {isEditMode && activeFormattingField === 'section1_title' && (
            <FormattingToolbar
              formatting={formatting['section1_title_formatting'] || {}}
              onChange={(fmt) => setFormatting({ ...formatting, section1_title_formatting: fmt })}
            />
          )}
          {isEditMode ? (
            <input
              type="text"
              value={editContent['section1_title'] || 'Active Construction Projects'}
              onChange={(e) => setEditContent({ ...editContent, section1_title: e.target.value })}
              onFocus={() => setActiveFormattingField('section1_title')}
              style={{
                ...inputStyle,
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '10px',
                ...getFormattingStyle('section1_title_formatting'),
              }}
            />
          ) : (
            <h2 style={getFormattingStyle('section1_title_formatting')}>{editContent['section1_title'] || 'Active Construction Projects'}</h2>
          )}
          
          {isEditMode && activeFormattingField === 'section1_subtitle' && (
            <FormattingToolbar
              formatting={formatting['section1_subtitle_formatting'] || {}}
              onChange={(fmt) => setFormatting({ ...formatting, section1_subtitle_formatting: fmt })}
            />
          )}
          {isEditMode ? (
            <input
              type="text"
              value={editContent['section1_subtitle'] || 'Current snapshots from our active project sites'}
              onChange={(e) => setEditContent({ ...editContent, section1_subtitle: e.target.value })}
              onFocus={() => setActiveFormattingField('section1_subtitle')}
              style={{
                ...inputStyle,
                fontSize: '1rem',
                marginBottom: '20px',
                ...getFormattingStyle('section1_subtitle_formatting'),
              }}
            />
          ) : (
            <p className="section-subtitle" style={getFormattingStyle('section1_subtitle_formatting')}>{editContent['section1_subtitle'] || 'Current snapshots from our active project sites'}</p>
          )}

          <div className="cards-grid">
            {projectCards.length > 0 ? (
              projectCards.map((card) => (
                <div key={card.id} className={card.image ? 'snapshot-card' : 'placeholder-card'}>
                  <div className="snapshot-image-container">
                    {card.image ? (
                      <img
                        src={`data:image/png;base64,${card.image}`}
                        alt={card.title}
                        className="snapshot-image"
                        onClick={() => card.image && setSelectedImage(`data:image/png;base64,${card.image}`)}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                  </div>
                  <div className="snapshot-content">
                    {isEditMode ? (
                      <>
                        {activeCardFormattingField === `card_${card.id}_title` && (
                          <FormattingToolbar
                            formatting={cardFormatting[`card_${card.id}_title`] || {}}
                            onChange={(fmt) => setCardFormatting({ ...cardFormatting, [`card_${card.id}_title`]: fmt })}
                          />
                        )}
                        <input
                          type="text"
                          value={editCards[card.id]?.title ?? ''}
                          onChange={(e) => setEditCards({ ...editCards, [card.id]: { title: e.target.value, description: editCards[card.id]?.description ?? '' } })}
                          onFocus={() => setActiveCardFormattingField(`card_${card.id}_title`)}
                          placeholder="Enter project title"
                          style={{
                            ...inputStyle,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '10px',
                            ...getCardFormattingStyle(card.id, 'title'),
                          }}
                        />
                        {activeCardFormattingField === `card_${card.id}_description` && (
                          <FormattingToolbar
                            formatting={cardFormatting[`card_${card.id}_description`] || {}}
                            onChange={(fmt) => setCardFormatting({ ...cardFormatting, [`card_${card.id}_description`]: fmt })}
                          />
                        )}
                        <textarea
                          value={editCards[card.id]?.description ?? ''}
                          onChange={(e) => setEditCards({ ...editCards, [card.id]: { title: editCards[card.id]?.title ?? '', description: e.target.value } })}
                          onFocus={() => setActiveCardFormattingField(`card_${card.id}_description`)}
                          placeholder="Enter project description"
                          style={{
                            ...textareaStyle,
                            minHeight: '80px',
                            ...getCardFormattingStyle(card.id, 'description'),
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <h3 style={getCardFormattingStyle(card.id, 'title')}>{card.title || `Project ${card.id}`}</h3>
                        <p style={getCardFormattingStyle(card.id, 'description')}>{card.description || 'Add project details'}</p>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="placeholder-card">
                  <div className="placeholder-image">No Image</div>
                  <div className="snapshot-content">
                    <h3>Project 1</h3>
                    <p>Add project details</p>
                  </div>
                </div>
                <div className="placeholder-card">
                  <div className="placeholder-image">No Image</div>
                  <div className="snapshot-content">
                    <h3>Project 2</h3>
                    <p>Add project details</p>
                  </div>
                </div>
                <div className="placeholder-card">
                  <div className="placeholder-image">No Image</div>
                  <div className="snapshot-content">
                    <h3>Project 3</h3>
                    <p>Add project details</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Section 2: Target Construction Companies */}
        <section className="section">
          {isEditMode && activeFormattingField === 'section2_title' && (
            <FormattingToolbar
              formatting={formatting['section2_title_formatting'] || {}}
              onChange={(fmt) => setFormatting({ ...formatting, section2_title_formatting: fmt })}
            />
          )}
          {isEditMode ? (
            <input
              type="text"
              value={editContent['section2_title'] || 'Target Construction Companies'}
              onChange={(e) => setEditContent({ ...editContent, section2_title: e.target.value })}
              onFocus={() => setActiveFormattingField('section2_title')}
              style={{
                ...inputStyle,
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '20px',
                ...getFormattingStyle('section2_title_formatting'),
              }}
            />
          ) : (
            <h2 style={getFormattingStyle('section2_title_formatting')}>{editContent['section2_title'] || 'Target Construction Companies'}</h2>
          )}
          <div className="list-section">
            {isEditMode && activeFormattingField === 'section2_content' && (
              <FormattingToolbar
                formatting={formatting['section2_content_formatting'] || {}}
                onChange={(fmt) => setFormatting({ ...formatting, section2_content_formatting: fmt })}
              />
            )}
            {isEditMode ? (
              <textarea
                value={editContent['section2_content'] || 'Company Name 1\nCompany Name 2\nCompany Name 3'}
                onChange={(e) => setEditContent({ ...editContent, section2_content: e.target.value })}
                onFocus={() => setActiveFormattingField('section2_content')}
                placeholder="Enter each company name on a new line"
                style={{
                  ...textareaStyle,
                  ...getFormattingStyle('section2_content_formatting'),
                }}
              />
            ) : (
              <ul>
                {(editContent['section2_content'] || 'Company Name 1\nCompany Name 2\nCompany Name 3').split('\n').map((item, idx) => (
                  item.trim() && <li key={idx} style={getFormattingStyle('section2_content_formatting')}>{item.trim()}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Section 3: Lead Generation & LNR Targets */}
        <section className="section">
          {isEditMode && activeFormattingField === 'section3_title' && (
            <FormattingToolbar
              formatting={formatting['section3_title_formatting'] || {}}
              onChange={(fmt) => setFormatting({ ...formatting, section3_title_formatting: fmt })}
            />
          )}
          {isEditMode ? (
            <input
              type="text"
              value={editContent['section3_title'] || 'Lead Generation & LNR Targets'}
              onChange={(e) => setEditContent({ ...editContent, section3_title: e.target.value })}
              onFocus={() => setActiveFormattingField('section3_title')}
              style={{
                ...inputStyle,
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '20px',
                ...getFormattingStyle('section3_title_formatting'),
              }}
            />
          ) : (
            <h2 style={getFormattingStyle('section3_title_formatting')}>{editContent['section3_title'] || 'Lead Generation & LNR Targets'}</h2>
          )}
          <div className="list-section">
            {isEditMode && activeFormattingField === 'section3_content' && (
              <FormattingToolbar
                formatting={formatting['section3_content_formatting'] || {}}
                onChange={(fmt) => setFormatting({ ...formatting, section3_content_formatting: fmt })}
              />
            )}
            {isEditMode ? (
              <textarea
                value={editContent['section3_content'] || 'Company Name 1 — Description\nCompany Name 2 — Description\nCompany Name 3 — Description'}
                onChange={(e) => setEditContent({ ...editContent, section3_content: e.target.value })}
                onFocus={() => setActiveFormattingField('section3_content')}
                placeholder="Enter each company on a new line"
                style={{
                  ...textareaStyle,
                  ...getFormattingStyle('section3_content_formatting'),
                }}
              />
            ) : (
              <ul>
                {(editContent['section3_content'] || 'Company Name 1 — Description\nCompany Name 2 — Description\nCompany Name 3 — Description').split('\n').map((item, idx) => (
                  item.trim() && <li key={idx} style={getFormattingStyle('section3_content_formatting')}>{item.trim()}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Section 4: Upcoming Events */}
        <section className="section">
          {isEditMode && activeFormattingField === 'section4_title' && (
            <FormattingToolbar
              formatting={formatting['section4_title_formatting'] || {}}
              onChange={(fmt) => setFormatting({ ...formatting, section4_title_formatting: fmt })}
            />
          )}
          {isEditMode ? (
            <input
              type="text"
              value={editContent['section4_title'] || 'Bill William Sportsplex & Nearby Schools/Colleges'}
              onChange={(e) => setEditContent({ ...editContent, section4_title: e.target.value })}
              onFocus={() => setActiveFormattingField('section4_title')}
              style={{
                ...inputStyle,
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '20px',
                ...getFormattingStyle('section4_title_formatting'),
              }}
            />
          ) : (
            <h2 style={getFormattingStyle('section4_title_formatting')}>{editContent['section4_title'] || 'Bill William Sportsplex & Nearby Schools/Colleges'}</h2>
          )}

          <div className="list-section">
            {isEditMode ? (
              <>
                {activeFormattingField === 'section4_sportsplex' && (
                  <FormattingToolbar
                    formatting={formatting['section4_sportsplex_formatting'] || {}}
                    onChange={(fmt) => setFormatting({ ...formatting, section4_sportsplex_formatting: fmt })}
                  />
                )}
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#a1a1a6' }}>Bill William Sportsplex:</label>
                <textarea
                  value={editContent['section4_sportsplex'] || 'Event Name 1 — Date & Time\nEvent Name 2 — Date & Time\nEvent Name 3 — Date & Time'}
                  onChange={(e) => setEditContent({ ...editContent, section4_sportsplex: e.target.value })}
                  onFocus={() => setActiveFormattingField('section4_sportsplex')}
                  placeholder="Enter each event on a new line"
                  style={{
                    ...textareaStyle,
                    marginBottom: '20px',
                    ...getFormattingStyle('section4_sportsplex_formatting'),
                  }}
                />
                {activeFormattingField === 'section4_schools' && (
                  <FormattingToolbar
                    formatting={formatting['section4_schools_formatting'] || {}}
                    onChange={(fmt) => setFormatting({ ...formatting, section4_schools_formatting: fmt })}
                  />
                )}
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#a1a1a6' }}>High Schools & Colleges:</label>
                <textarea
                  value={editContent['section4_schools'] || 'School/College Name 1 — Event Name, Date & Time\nSchool/College Name 2 — Event Name, Date & Time\nSchool/College Name 3 — Event Name, Date & Time'}
                  onChange={(e) => setEditContent({ ...editContent, section4_schools: e.target.value })}
                  onFocus={() => setActiveFormattingField('section4_schools')}
                  placeholder="Enter each school/college event on a new line"
                  style={{
                    ...textareaStyle,
                    ...getFormattingStyle('section4_schools_formatting'),
                  }}
                />
              </>
            ) : (
              <>
                <h3>Bill William Sportsplex</h3>
                <ul>
                  {(editContent['section4_sportsplex'] || 'Event Name 1 — Date & Time\nEvent Name 2 — Date & Time\nEvent Name 3 — Date & Time').split('\n').map((item, idx) => (
                    item.trim() && <li key={idx} style={getFormattingStyle('section4_sportsplex_formatting')}>{item.trim()}</li>
                  ))}
                </ul>

                <div style={{ height: '1px', backgroundColor: '#424245', margin: '25px 0' }}></div>

                <h3>High Schools & Colleges</h3>
                <ul>
                  {(editContent['section4_schools'] || 'School/College Name 1 — Event Name, Date & Time\nSchool/College Name 2 — Event Name, Date & Time\nSchool/College Name 3 — Event Name, Date & Time').split('\n').map((item, idx) => (
                    item.trim() && <li key={idx} style={getFormattingStyle('section4_schools_formatting')}>{item.trim()}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Section 5: Data Table */}
        <TableSection
          title={tableTitle}
          onTitleChange={setTableTitle}
          titleFormatting={tableFormatting['section5_title_formatting']}
          onTitleFormattingChange={(fmt) => setTableFormatting({ ...tableFormatting, section5_title_formatting: fmt })}
          rows={tableRows}
          columns={tableColumns}
          onDataChange={(rows, columns) => {
            setTableRows(rows)
            setTableColumns(columns)
          }}
          isEditMode={isEditMode}
          formatting={tableFormatting['section5_cell_formatting']}
          onFormattingChange={(fmt) => setTableFormatting({ ...tableFormatting, section5_cell_formatting: fmt })}
        />
      </main>

      <footer>
        <p>Powered By Orange Falcon LLC (Formerly known as Orange Technolab LLC)</p>
      </footer>

      {showEditDialog && (
        <EditDialog
          onClose={() => setShowEditDialog(false)}
          onImageUpload={handleImageUpload}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
        />
      )}

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}

export default App
