import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// --- Tipleri Export Et ---
export interface DroppedIcon {
  id: number;
  src: string;
  xPercent: number;
  yPercent: number;
}
export interface RecipePageData {
    id: number; // Sayfa için benzersiz ID
    text: string; // Metni göstermek için
    icons: DroppedIcon[];
}
// --- Export Bitti ---

const PAGE_WIDTH = 700; // HTMLFlipBook'a verilen width
const PAGE_HEIGHT = 800; // HTMLFlipBook'a verilen height
const PAGE_PADDING = 40; // Page component'indeki padding

const ICON_PLACEABLE_WIDTH = PAGE_WIDTH - 2 * PAGE_PADDING;
const ICON_PLACEABLE_HEIGHT = PAGE_HEIGHT - 2 * PAGE_PADDING;

const Page = styled.div`
  position: relative;
  width: 100%; // Genişlik %100 kalabilir, çünkü HTMLFlipBook her sayfaya 700px veriyor
  height: 800px; // Sabit yükseklik HTMLFlipBook ile aynı
  padding: 40px;
  background: linear-gradient(to right, #f5f5f5 0%, white 3%, white 97%, #f5f5f5 100%);
  background-image:
    linear-gradient(#e0e0e0 1px, transparent 1px),
    linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
  background-size: 25px 25px;
  overflow: visible;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
`;

const IconContainer = styled(motion.div).attrs(props => ({
  className: props.className ? `${props.className} icon-container-class` : 'icon-container-class',
}))<{ $isEditing?: boolean }>`
  position: absolute;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 1700; // Textarea (1600) üzerinde olması için artırıldı
  border: 1px dashed transparent;
  transition: border-color 0.2s;
  transform: translate(-50%, -50%);
  pointer-events: ${({ $isEditing }) => ($isEditing ? 'auto' : 'none')}; // Sadece düzenleme modunda tıklanabilir

  &:hover {
    border-color: ${props => props.$isEditing ? 'rgba(255, 0, 0, 0.5)' : 'transparent'};
  }
`;

const IconImage = styled.img`
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
  object-fit: contain;
`;

const EditablePageText = styled.textarea.attrs(props => ({
  className: props.className ? `${props.className} editable-page-textarea` : 'editable-page-textarea',
}))<{ readOnly?: boolean }>` // readOnly prop'unu styled component'e bildirelim
  position: absolute;
  inset: 40px; /* Page padding'i ile aynı hizada başlar */
  padding: 20px; /* TextBase'in padding'i gibi */
  width: calc(100% - 80px); /* inset left+right */
  height: calc(100% - 80px); /* inset top+bottom */
  min-height: 720px; // TextBase ile aynı min-height
  max-height: 720px; // YAZI ALANI SABİT KALSIN, SCROLL OLMASIN
  box-sizing: border-box;
  background: transparent;
  border: none; // Düzenleme modunda kenarlık eklenebilir veya App.tsx'teki kırmızı kenarlık gibi bir overlay kullanılabilir
  font-family: "Architects Daughter", cursive;
  font-size: 1.2em;
  color: #444;
  line-height: 1.6;
  resize: none;
  outline: none;
  white-space: pre-wrap; 
  overflow-wrap: break-word;
  z-index: 1600; // z-index geçici olarak artırıldı (GlobalIconDropZone'un z-index'i 1500)
  opacity: 1; // Her zaman görünür, okunabilirliği readOnly ile kontrol edilecek
  pointer-events: ${(props) => (props.readOnly ? 'none' : 'auto')};
  overflow: hidden; // SCROLL OLMASIN

  &:focus {
    /* İsteğe bağlı: odaklandığında hafif bir kenarlık */
    /* box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.5); */
  }

  &::placeholder {
    color: #aaa;
    font-style: italic;
  }
`;

interface RecipePageProps {
  pageNumber: number;
  isEditing: boolean;
  initialData: RecipePageData;
  onUpdateIcons: (pageIndex: number, icons: DroppedIcon[]) => void;
  onPageTextChange?: (pageNumber: number, newText: string) => void; // Eksik prop eklendi
  activeTextPageIndex: number;
  selectedIcon?: string | null;
}

const RecipePage = React.forwardRef<HTMLDivElement, RecipePageProps>((
  { pageNumber, isEditing, initialData, onUpdateIcons, onPageTextChange, activeTextPageIndex, selectedIcon }, 
  ref
) => {
  const [icons, setIcons] = useState<DroppedIcon[]>(initialData.icons || []);
  const [text, setText] = useState(initialData.text || '');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIcons(initialData.icons || []);
  }, [initialData.icons, pageNumber]);

  useEffect(() => {
    if (isEditing && activeTextPageIndex === pageNumber && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isEditing, activeTextPageIndex, pageNumber]);

  const handleIconClick = (event: React.MouseEvent<HTMLDivElement>, iconId: number) => {
    event.stopPropagation();
    if (isEditing) {
      const updatedIcons = icons.filter(icon => icon.id !== iconId);
      setIcons(updatedIcons);
      onUpdateIcons(pageNumber, updatedIcons);
    }
  };

  // --- YENİ: Sayfaya tıklayınca sticker ekle ---
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing && selectedIcon) {
      // Tıklanan noktayı hesapla (padding'i çıkar)
      const rect = (e.target as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left - PAGE_PADDING;
      const y = e.clientY - rect.top - PAGE_PADDING;
      if (x < 0 || y < 0 || x > ICON_PLACEABLE_WIDTH || y > ICON_PLACEABLE_HEIGHT) return;
      const xPercent = (x / ICON_PLACEABLE_WIDTH) * 100;
      const yPercent = (y / ICON_PLACEABLE_HEIGHT) * 100;
      const newIcon: DroppedIcon = {
        id: Date.now(),
        src: selectedIcon,
        xPercent,
        yPercent
      };
      const updatedIcons = [...icons, newIcon];
      setIcons(updatedIcons);
      onUpdateIcons(pageNumber, updatedIcons);
      // --- Seçili stickerı sıfırla ---
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('clearSelectedIcon'));
      }
    }
  };

  // --- YAZI SINIRLAMASI (GÖRSEL OLARAK SATIR/SAYFA DOLULUĞUNA GÖRE) ---
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const maxHeight = 240; // px, textarea'nın max yüksekliği
    // Geçici bir textarea oluşturup yükseklik ölç
    const temp = document.createElement('textarea');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.style.height = 'auto';
    temp.style.width = 'calc(100% - 80px)';
    temp.style.fontFamily = 'Architects Daughter, cursive';
    temp.style.fontSize = '1.2em';
    temp.style.lineHeight = '1.6';
    temp.value = value;
    document.body.appendChild(temp);
    const totalHeight = temp.scrollHeight;
    document.body.removeChild(temp);
    // Eğer toplam yükseklik max'ı geçiyorsa eski değeri koru
    if (totalHeight > maxHeight) return;
    setText(value);
  };

  return (
    <Page 
      ref={ref}
      onClick={handlePageClick} // EKLENDİ
    >
      <EditablePageText
        ref={textAreaRef}
        value={text}
        onChange={handleTextChange}
        onBlur={() => onPageTextChange?.(pageNumber, text)}
        readOnly={!isEditing}
        placeholder={pageNumber % 2 === 0 ? "Malzemeler ve Başlık..." : "Hazırlanışı..."}
        onMouseDownCapture={(e) => e.stopPropagation()}
      />

      {icons.map((icon) => {
        const left_abs = PAGE_PADDING + (icon.xPercent / 100) * ICON_PLACEABLE_WIDTH;
        const top_abs = PAGE_PADDING + (icon.yPercent / 100) * ICON_PLACEABLE_HEIGHT;

        return (
          <IconContainer
            key={icon.id}
            style={{
              left: `${left_abs}px`,
              top: `${top_abs}px`
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (isEditing) handleIconClick(e, icon.id);
            }}
            title={isEditing ? "Silmek için tıkla" : ""}
            $isEditing={isEditing}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <IconImage src={icon.src} alt="Recipe icon" />
          </IconContainer>
        );
      })}
    </Page>
  );
});

RecipePage.displayName = 'RecipePage';
export default RecipePage;