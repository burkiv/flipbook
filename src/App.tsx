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
  background: transparent; 
  box-shadow: none; 
  z-index: 200; // CoverWrapper'dan daha yüksek bir z-index
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
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view');
  const [recipes, setRecipes] = useState<Recipe[]>([exampleRecipe]);
  const [newRecipeBuffer, setNewRecipeBuffer] = useState<Recipe | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const notebookWrapperRef = useRef<HTMLDivElement>(null);

  // Yeni yardımcı fonksiyon
  const goToRecipe = (recipeIdx: number) => {
    if (!isOpen) setIsOpen(true); // Defter kapalıysa aç
    const pageToFlipTo = recipeIdx * 2; // Tarifin sol sayfası (0, 2, 4...)
    console.log(`[App] goToRecipe called for recipeIdx: ${recipeIdx}, calculated pageToFlipTo: ${pageToFlipTo}`);
    setCurrentPageIndex(pageToFlipTo);
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
    console.log("[App] handleOpenNotebook called. Current isEditing:", isEditing);
    if (!isEditing) {
      setIsOpen(true);
      console.log("[App] isOpen set to true");
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
      const title = prompt('Tarif ismi?', newRecipeBuffer.title || '');
      // Kullanıcı iptal ederse veya boş bırakırsa, yine de bir başlıkla kaydet
      const recipeToSave = {
        ...newRecipeBuffer,
        title: title?.trim() || `Yeni Tarif ${recipes.length + 1}`,
        id: Date.now(), // ID burada atanmalı, newRecipeBuffer'da değil
      };
      setRecipes(prev => [...prev, recipeToSave]);
    }
    setMode('view');
    setIsEditing(false);      // Düzenleme modunu kapat
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

  const handlePageFlip = (pageIndex: number) => {
    console.log(
      `Flipped to page: ${pageIndex}, isEditing: ${isEditing}, selectedIcon: ${selectedIcon}`
    );
    setCurrentPageIndex(pageIndex);
    setSelectedIcon(null);
  };

  const pagesToDisplay = mode === 'new' ? newRecipePages || [] : recipePages;

  console.log('App render. isOpen:', isOpen, 'isEditing:', isEditing, 'selectedIcon:', selectedIcon, 'currentPageIndex:', currentPageIndex);

  return (
    <AppContainer>
      <IconPanel isVisible={isEditing} onIconClick={handleIconClick} selectedIcon={selectedIcon} />

      {/* Tarif Listesi ve Silme/Düzenleme Butonları */}
      {isOpen && mode === 'view' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 2000, // Diğer elementlerin üzerinde olması için
          maxHeight: 'calc(100vh - 100px)', // Kaydırma için
          overflowY: 'auto'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Tariflerim</h4>
          {recipes.map((r, i) => (
            <div key={r.id} className="recipe-row"> {/* className eklendi */}
              <button onClick={()=> {
                setMode('edit'); // 'edit' moduna geç
                setIsEditing(true); 
                goToRecipe(i); 
              }}
                title="Düzenle"
                style={{background: 'none', border: 'none', cursor: 'pointer', padding: '5px'}}
              >
                ✏️
              </button>
              <button onClick={() => {
                  if (confirm(`"${r.title || `Tarif #${i+1}`}" silinsin mi?`)) {
                    setRecipes(prev => prev.filter(rr => rr.id !== r.id));
                    if (recipes.length === 1 && recipes[0].id === r.id) {
                        handleCloseNotebook();
                    } else {
                        // Eğer silinen tarif aktifse veya sonrasında başka tarif yoksa başa dön
                        // Bu mantık daha da iyileştirilebilir.
                        setCurrentPageIndex(0); 
                    }
                  }
              }}
                title="Tarifi Sil"
                style={{background: 'none', border: 'none', cursor: 'pointer', padding: '5px'}}
              >🗑️</button>
              <span 
                style={{cursor:'pointer', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} 
                onClick={() => {
                  setMode('view');
                  setIsEditing(false); 
                  goToRecipe(i); // Yeni fonksiyonu kullan
                }}
              >
                {r.title || `Tarif #${i+1}`}
              </span>
            </div>
          ))}
          {recipes.length === 0 && <p style={{fontSize: '13px', color: 'grey'}}>Henüz tarif yok.</p>}
        </div>
      )}

      <NotebookWrapper ref={notebookWrapperRef}>
        <AnimatePresence>
          {!isOpen && <Cover key="cover" onClick={handleOpenNotebook} />}
        </AnimatePresence>

        {isOpen && (
          <RecipeFlipbook
            key={mode === 'new' ? 'new-book' : `book-${recipes.length}`}
            recipes={pagesToDisplay}
            isEditing={isEditing}
            onUpdatePageIcons={handleUpdatePageIcons}
            onPageTextChange={handlePageTextChange}
            closeBook={handleCloseNotebook}
            onPageFlip={handlePageFlip}
            currentPage={currentPageIndex}
          />
        )}
      </NotebookWrapper>

      {/* Kaydet/İptal butonları yeni ve edit modunda gösterilecek */}
      {isOpen && (mode === 'new' || mode === 'edit') && (
        <>
          <ActionButton className="save" onClick={() => {
            if (mode === 'new') {
              handleSaveNewRecipe(); // Bu zaten setIsEditing(false) ve setMode('view') yapıyor
            } else if (mode === 'edit') {
              // Var olan tarifi kaydetme (metin zaten onBlur ile güncelleniyor)
              setIsEditing(false); // Sadece düzenleme modunu kapat
              setMode('view');
              // İkonlar da anlık güncelleniyor
            }
          }}>Kaydet</ActionButton>

          <ActionButton className="cancel" onClick={() => {
            if (mode === 'new') {
              handleCancelNewRecipe(); // Bu zaten setIsEditing(false) ve setMode('view') yapıyor
            } else if (mode === 'edit') {
              // Var olan tarif düzenlemesini iptal et
              // TODO: Eğer değişiklikleri geri almak isteniyorsa, burada orijinal veriyi yükleme mantığı eklenebilir.
              // Şimdilik sadece düzenleme modunu kapatıp view moduna dönüyoruz.
              setIsEditing(false);
              setSelectedIcon(null); // Seçili ikonu temizle
              setMode('view');
            }
          }}>İptal</ActionButton>
        </>
      )}

      <Pencil3D onClick={isOpen ? handleStartNewRecipe : handleOpenNotebook} />
    </AppContainer>
  );
}

export default App;
