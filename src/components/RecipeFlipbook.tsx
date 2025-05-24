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
  currentPage?: number;
  isEditing: boolean;
  onUpdatePageIcons: (pageIndex: number, icons: DroppedIcon[]) => void;
  onPageTextChange?: (pageNumber: number, newText: string) => void;
  closeBook?: () => void;
  onPageFlip: (pageIndex: number) => void;
}

const RecipeFlipbook: React.FC<RecipeFlipbookProps> = ({
  recipes,
  startPage = 0,
  currentPage,
  isEditing,
  onUpdatePageIcons,
  onPageTextChange,
  closeBook,
  onPageFlip
}) => {
  const flipBook = useRef<PageFlipInstance | null>(null);

  useEffect(() => {
    if (flipBook.current && typeof currentPage === 'number') {
      const pageFlipApi = flipBook.current.pageFlip?.();
      if (pageFlipApi && pageFlipApi.getCurrentPageIndex() !== currentPage) {
        pageFlipApi.turnToPage(currentPage);
      }
    }
  }, [currentPage]);

  const handleFlip = useCallback((e: { data: number }) => {
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

  return (
    <FlipbookContainer>
      <HTMLFlipBook
        width={700}
        height={800}
        ref={flipBook}
        onFlip={handleFlip}
        startPage={startPage}
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
        startZIndex={1}
        clickEventForward={true}
        useMouseEvents={!isEditing}
        swipeDistance={50}
        showPageCorners={true}
        disableFlipByClick={isEditing}
        style={{}}
        usePortrait={false}
        autoSize={true}
      >
        {recipes.map((pageData, index) => (
          <RecipePage
            key={pageData.id}
            pageNumber={index}
            initialData={pageData}
            isEditing={isEditing}
            onUpdateIcons={onUpdatePageIcons}
            onPageTextChange={onPageTextChange}
            activeTextPageIndex={currentPage ?? 0}
          />
        ))}
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

export default React.memo(RecipeFlipbook);
