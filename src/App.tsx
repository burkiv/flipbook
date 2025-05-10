import { useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import RecipeFlipbook from './components/RecipeFlipbook';
import Cover from './components/Cover';
import { RecipePageData, DroppedIcon } from './components/RecipePage';
import Pencil3D from './components/Pencil3D';
import IconPanel from './components/IconPanel';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f0f0f0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  perspective: 2000px;
  margin: auto;
`;

const NotebookWrapper = styled.div`
  position: relative;
  width: 1400px;
  height: 800px;
  transform-style: preserve-3d;
  margin: auto;
`;

interface Recipe {
  id: number;
  title?: string;
  leftPageText: string;
  rightPageText: string;
  iconsLeft: DroppedIcon[];
  iconsRight: DroppedIcon[];
}

const exampleRecipe: Recipe = {
  id: 1,
  title: 'Çikolatalı Kek Tarifi',
  leftPageText: `Malzemeler:\n• 3 yumurta\n• 1,5 su bardağı şeker\n• 1,5 su bardağı süt\n• 1 su bardağı sıvı yağ\n• 2,5 su bardağı un\n• 3 yemek kaşığı kakao\n• 1 paket kabartma tozu\n• 1 paket vanilya`,
  rightPageText: `Hazırlanışı:\n1. Fırını 180 derecede ısıtın\n2. Yumurta ve şekeri çırpın\n3. Süt ve yağı ekleyip karıştırın\n4. Kuru malzemeleri eleyerek ekleyin\n5. Karışımı yağlanmış kek kalıbına dökün\n6. 35-40 dakika pişirin`,
  iconsLeft: [],
  iconsRight: [],
};

const ActionButton = styled.button`
  position: absolute;
  bottom: 30px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  z-index: 1000;
  border-radius: 5px;
  opacity: 0.9;
  transition: opacity 0.2s, background-color 0.2s;

  &:hover {
    opacity: 1;
    background-color: #0056b3;
  }

  &.save {
    right: 140px;
  }

  &.cancel {
    right: 30px;
    background-color: #6c757d;
    &:hover {
      background-color: #545b62;
    }
  }
`;

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<'view' | 'new'>('view');
  const [recipes, setRecipes] = useState<Recipe[]>([exampleRecipe]);
  const [newRecipeBuffer, setNewRecipeBuffer] = useState<Recipe | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const notebookWrapperRef = useRef<HTMLDivElement>(null);

  const handlePageClick = (idx: number) => {
    console.log(`[App] handlePageClick called with index: ${idx}`);
    setCurrentPageIndex(idx);
  };

  const recipePages = useMemo((): RecipePageData[] => {
    const pages: RecipePageData[] = [];
    recipes.forEach((recipe) => {
      pages.push({
        id: recipe.id * 2,
        text: recipe.leftPageText,
        icons: recipe.iconsLeft,
      });
      pages.push({
        id: recipe.id * 2 + 1,
        text: recipe.rightPageText,
        icons: recipe.iconsRight,
      });
    });
    return pages;
  }, [recipes]);

  const newRecipePages = useMemo((): RecipePageData[] | null => {
    if (!newRecipeBuffer) return null;
    return [
      { id: newRecipeBuffer.id * 2, text: newRecipeBuffer.leftPageText, icons: newRecipeBuffer.iconsLeft },
      { id: newRecipeBuffer.id * 2 + 1, text: newRecipeBuffer.rightPageText, icons: newRecipeBuffer.iconsRight },
    ];
  }, [newRecipeBuffer]);

  const handleIconClick = (iconSrc: string) => {
    if (isEditing) {
      setSelectedIcon((prevSelected) => (prevSelected === iconSrc ? null : iconSrc));
    }
  };

  const handleOpenNotebook = () => {
    if (!isEditing) {
      setIsOpen(true);
    }
  };

  const handleCloseNotebook = () => {
    setIsOpen(false);
    setMode('view');
    setIsEditing(false);
    setSelectedIcon(null);
    setNewRecipeBuffer(null);
  };

  const handleStartNewRecipe = () => {
    if (isOpen && mode === 'view') {
      setMode('new');
      setIsEditing(true);
      setNewRecipeBuffer({
        id: Date.now(),
        leftPageText: '',
        rightPageText: '',
        iconsLeft: [],
        iconsRight: [],
      });
      setSelectedIcon(null);
      setCurrentPageIndex(0);
    }
  };

  const handleSaveNewRecipe = () => {
    if (newRecipeBuffer) {
      setRecipes((prev) => [...prev, { ...newRecipeBuffer, id: Date.now() }]);
    }
    setMode('view');
    setIsEditing(false);
    setNewRecipeBuffer(null);
    setSelectedIcon(null);
  };

  const handleCancelNewRecipe = () => {
    setMode('view');
    setIsEditing(false);
    setNewRecipeBuffer(null);
    setSelectedIcon(null);
  };

  const handlePageTextChange = (pageIndex: number, newText: string) => {
    console.log(`[App] handlePageTextChange for pageIndex: ${pageIndex}, newText: ${newText.substring(0,20)}...`);
    const isLeftPage = pageIndex % 2 === 0;
    const recipeDataArrayIndex = Math.floor(pageIndex / 2);

    if (mode === 'new' && newRecipeBuffer) {
      setNewRecipeBuffer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          leftPageText: isLeftPage ? newText : prev.leftPageText,
          rightPageText: !isLeftPage ? newText : prev.rightPageText,
        };
      });
    } else if (mode === 'view' && isEditing) {
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe, index) => {
          if (index !== recipeDataArrayIndex) return recipe;
          return {
            ...recipe,
            leftPageText: isLeftPage ? newText : recipe.leftPageText,
            rightPageText: !isLeftPage ? newText : recipe.rightPageText,
          };
        })
      );
    }
  };

  const handleUpdatePageIcons = (pageIndex: number, updatedIcons: DroppedIcon[]) => {
    console.log(`[App] handleUpdatePageIcons called for pageIndex: ${pageIndex}`);
    const recipeDataArrayIndex = Math.floor(pageIndex / 2);
    const isLeftPageUpdate = pageIndex % 2 === 0;

    if (mode === 'new' && newRecipeBuffer) {
      setNewRecipeBuffer((prev) => {
        if (!prev) return null;
        // Yeni tarifte sadece bir tarif olduğu için recipeDataArrayIndex her zaman 0 olmalı,
        // pageIndex 0 (sol) veya 1 (sağ) olabilir.
        return {
          ...prev,
          iconsLeft: isLeftPageUpdate ? updatedIcons : prev.iconsLeft,
          iconsRight: !isLeftPageUpdate ? updatedIcons : prev.iconsRight,
        };
      });
    } else if (mode === 'view' && isEditing) {
      setRecipes(prevRecipes =>
        prevRecipes.map((recipe, index) => {
          if (index === recipeDataArrayIndex) {
            return {
              ...recipe,
              iconsLeft: isLeftPageUpdate ? updatedIcons : recipe.iconsLeft,
              iconsRight: !isLeftPageUpdate ? updatedIcons : recipe.iconsRight,
            };
          }
          return recipe;
        })
      );
    }
  };

  const handleIconPlaced = () => {
    if (isEditing) {
      setSelectedIcon(null);
    }
  };

  const handlePageFlip = (pageIndex: number) => {
    console.log(
      `Flipped to page: ${pageIndex}, isEditing: ${isEditing}, selectedIcon: ${selectedIcon}`
    );
    setCurrentPageIndex(pageIndex);
    setSelectedIcon(null);
  };

  const pagesToDisplay = mode === 'new' ? newRecipePages || [] : recipePages;

  console.log('App render. isEditing:', isEditing, 'selectedIcon:', selectedIcon, 'currentPageIndex:', currentPageIndex);

  return (
    <AppContainer>
      <IconPanel isVisible={isEditing} onIconClick={handleIconClick} selectedIcon={selectedIcon} />

      <NotebookWrapper ref={notebookWrapperRef}>
        <AnimatePresence>
          {!isOpen && <Cover key="cover" onClick={handleOpenNotebook} />}
        </AnimatePresence>

        {isOpen && (
          <RecipeFlipbook
            key={mode === 'new' ? 'new-book' : `book-${recipes.length}`}
            recipes={pagesToDisplay}
            isEditing={isEditing}
            selectedIcon={selectedIcon}
            onIconPlaced={handleIconPlaced}
            onUpdatePageIcons={handleUpdatePageIcons}
            onPageTextChange={handlePageTextChange}
            closeBook={handleCloseNotebook}
            onPageFlip={handlePageFlip}
            onPageClick={handlePageClick}
          />
        )}
      </NotebookWrapper>

      {isOpen && mode === 'new' && (
        <>
          <ActionButton className="save" onClick={handleSaveNewRecipe}>
            Kaydet
          </ActionButton>
          <ActionButton className="cancel" onClick={handleCancelNewRecipe}>
            İptal
          </ActionButton>
        </>
      )}

      <Pencil3D onClick={isOpen ? handleStartNewRecipe : handleOpenNotebook} />
    </AppContainer>
  );
}

export default App;
