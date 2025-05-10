import React, { useRef, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styled from 'styled-components';
import RecipePage, { RecipePageData, DroppedIcon } from './RecipePage';

const FlipbookContainer = styled.div`
  width: 1400px;
  height: 800px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  position: relative; // Test butonu için eklendi
`;

const GlobalIconDropZone = styled.div<{ $isVisible?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; // FlipbookContainer genişliğinde
  height: 100%; // FlipbookContainer yüksekliğinde
  z-index: 1500; // Diğer sayfa elemanlarının üzerinde, ama test butonu gibi şeylerin altında olabilir
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
  cursor: ${props => props.$isVisible ? 'copy' : 'default'};
  // background: ${props => props.$isVisible ? 'rgba(0, 255, 0, 0.1)' : 'transparent'}; // Test için görünür yap
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.4);
  color: white;
  border: none;
  padding: 15px 10px;
  font-size: 20px;
  cursor: pointer;
  z-index: 1001; // HTMLFlipBook'un üzerinde olması için artırıldı
  border-radius: 5px;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &.prev {
    left: -50px;
  }

  &.next {
    right: -50px;
  }
`;

interface PageFlipInstance {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    flip: (pageIndex: number, animationDirection: string) => void;
    getCurrentPageIndex: () => number;
    turnToPage: (pageIndex: number) => void; // Yeni metot eklendi
  };
}

interface RecipeFlipbookProps {
  recipes: RecipePageData[];
  startPage?: number;
  currentPage?: number; // Yeni prop: App.tsx'ten gelen aktif sayfa indeksi
  isEditing?: boolean;
  selectedIcon?: string | null;
  onIconPlaced: () => void;
  onUpdatePageIcons: (pageIndex: number, icons: DroppedIcon[]) => void;
  onPageTextChange?: (pageNumber: number, newText: string) => void; // Yeni prop
  closeBook?: () => void;
  onPageFlip: (pageIndex: number) => void;
  onPageClick?: (pageIndex: number) => void;
}

const RecipeFlipbook: React.FC<RecipeFlipbookProps> = ({
  recipes,
  startPage = 0,
  currentPage, // Yeni prop alındı
  isEditing,
  selectedIcon,
  onIconPlaced,
  onUpdatePageIcons,
  onPageTextChange, // Yeni prop alındı
  closeBook,
  onPageFlip,
  onPageClick
}) => {
  const flipBook = useRef<PageFlipInstance | null>(null);
  const flipbookContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flipBook.current && typeof currentPage === 'number') {
      const pageFlipApi = flipBook.current.pageFlip?.();
      if (pageFlipApi && pageFlipApi.getCurrentPageIndex() !== currentPage) {
        console.log(`[RecipeFlipbook] Turning to page ${currentPage} due to prop change.`);
        pageFlipApi.turnToPage(currentPage);
      }
    }
  }, [currentPage]);

  const handleFlip = useCallback((e: { data: number }) => {
    console.log('[RecipeFlipbook] handleFlip triggered. Page data from library:', e.data);
    onPageFlip(e.data);
  }, [onPageFlip]);

  const flipNext = () => {
    flipBook.current?.pageFlip().flipNext();
  };

  const flipPrev = () => {
    const currentPageIndex = flipBook.current?.pageFlip().getCurrentPageIndex();
    if (currentPageIndex !== undefined && currentPageIndex === 0) {
      closeBook?.();
    } else {
      flipBook.current?.pageFlip().flipPrev();
    }
  };

  const handleGlobalIconDrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !selectedIcon || !flipbookContainerRef.current) return;

    const containerRect = flipbookContainerRef.current.getBoundingClientRect();
    const clickXInContainer = event.clientX - containerRect.left;
    const clickYInContainer = event.clientY - containerRect.top;

    const singlePageWidth = containerRect.width / 2; 
    const pageHeight = containerRect.height;

    let targetPageIndex = -1;
    let xOnPage = 0;
    const yOnPage = clickYInContainer;

    if (clickXInContainer < singlePageWidth) {
      targetPageIndex = flipBook.current?.pageFlip().getCurrentPageIndex() ?? 0; 
      if (targetPageIndex % 2 !== 0 && clickXInContainer < singlePageWidth) { 
          targetPageIndex = Math.max(0, targetPageIndex -1); 
      } else if (targetPageIndex % 2 === 0 && clickXInContainer >= singlePageWidth) {
          targetPageIndex = targetPageIndex + 1;
      }
      const actualClickedPageVisualIndex = clickXInContainer < singlePageWidth ? 0 : 1;
      const currentBookPageIndex = flipBook.current?.pageFlip().getCurrentPageIndex() ?? 0;
      const recipeDataIndex = Math.floor(currentBookPageIndex / 2);
      targetPageIndex = recipeDataIndex * 2 + actualClickedPageVisualIndex;

      xOnPage = clickXInContainer % singlePageWidth;
      
    } else {
      targetPageIndex = flipBook.current?.pageFlip().getCurrentPageIndex() ?? 0;
       if (targetPageIndex % 2 === 0 && clickXInContainer >= singlePageWidth) { 
          targetPageIndex = targetPageIndex + 1; 
      } else if (targetPageIndex % 2 !== 0 && clickXInContainer < singlePageWidth) {
          targetPageIndex = Math.max(0, targetPageIndex -1);
      }
      const actualClickedPageVisualIndex = clickXInContainer < singlePageWidth ? 0 : 1;
      const currentBookPageIndex = flipBook.current?.pageFlip().getCurrentPageIndex() ?? 0;
      const recipeDataIndex = Math.floor(currentBookPageIndex / 2);
      targetPageIndex = recipeDataIndex * 2 + actualClickedPageVisualIndex;

      xOnPage = (clickXInContainer - singlePageWidth) % singlePageWidth;
    }

    const pagePadding = 40;
    const iconPlaceableWidth = singlePageWidth - (2 * pagePadding);
    const iconPlaceableHeight = pageHeight - (2 * pagePadding);

    const xOnPaddedArea = Math.max(0, Math.min(xOnPage - pagePadding, iconPlaceableWidth));
    const yOnPaddedArea = Math.max(0, Math.min(yOnPage - pagePadding, iconPlaceableHeight));

    const xPercent = (xOnPaddedArea / iconPlaceableWidth) * 100;
    const yPercent = (yOnPaddedArea / iconPlaceableHeight) * 100;

    if (targetPageIndex !== -1 && xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
      const newIcon: DroppedIcon = {
        id: Date.now(),
        src: selectedIcon,
        xPercent: xPercent,
        yPercent: yPercent,
      };
      const currentPageData = recipes[targetPageIndex];
      const updatedIcons = currentPageData ? [...currentPageData.icons, newIcon] : [newIcon];
      
      console.log(`[RecipeFlipbook] Global Icon Drop: Page ${targetPageIndex}, X% ${xPercent.toFixed(2)}, Y% ${yPercent.toFixed(2)}`);
      onUpdatePageIcons(targetPageIndex, updatedIcons);
      onIconPlaced();
    }
  };

  return (
    <FlipbookContainer ref={flipbookContainerRef}>
      <GlobalIconDropZone 
        $isVisible={isEditing && !!selectedIcon} 
        onClick={handleGlobalIconDrop} 
      />
     

      <HTMLFlipBook
        width={700} // Temel prop
        height={800} // Temel prop
        ref={flipBook} // Temel prop
        onFlip={handleFlip} // Test edilecek temel prop
        startPage={startPage} // startPage prop'u geri eklendi

        // Kütüphanenin daha stabil çalışması için diğer proplar geri eklendi
        size="stretch"
        minWidth={300}
        maxWidth={700}
        minHeight={400}
        maxHeight={800}
        maxShadowOpacity={0.5}
        showCover={false}
        mobileScrollSupport={true}
        className="recipe-flipbook"
        flippingTime={1000}
        drawShadow={true}
        startZIndex={1} // Sayfa katmanlarının z-index'ini kontrol eder
        clickEventForward={true} // Bu zaten true idi, kalmalı
        useMouseEvents={!isEditing} // Düzenleme modunda değilken fare ile çevirme
        swipeDistance={50}
        showPageCorners={true}
        disableFlipByClick={isEditing} // Düzenleme modundayken tıklayarak çevirmeyi engelle
      >
        {recipes.map((pageData, index) => {
          return (
            <RecipePage
              key={pageData.id}
              pageNumber={index}
              initialData={pageData}
              isEditing={isEditing}
              selectedIcon={selectedIcon}
              onIconPlaced={onIconPlaced} // Bu hala GlobalIconDropZone için gerekli
              onUpdateIcons={onUpdatePageIcons}
              onPageTextChange={onPageTextChange} // Yeni prop iletildi
              onPageClick={onPageClick}
            />
          );
        })}
      </HTMLFlipBook>
      {!isEditing && recipes.length > 0 && (
        <>
          <NavButton className="prev" onClick={flipPrev}>&lt;</NavButton>
          <NavButton className="next" onClick={flipNext}>&gt;</NavButton>
        </>
      )}
    </FlipbookContainer>
  );
};

export default RecipeFlipbook;
