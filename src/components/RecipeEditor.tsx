import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const EditorOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const EditorContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  width: 600px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Architects Daughter', cursive;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 150px;
  font-size: 1rem;
  resize: vertical;
  font-family: 'Architects Daughter', cursive;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &.primary {
    background-color: #007bff;
    color: white;

    &:hover {
      background-color: #0056b3;
    }
  }

  &.secondary {
    background-color: #6c757d;
    color: white;

    &:hover {
      background-color: #545b62;
    }
  }
`;

interface RecipeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: { title: string; ingredients: string; instructions: string }) => void;
}

const RecipeEditor: React.FC<RecipeEditorProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  // Log when the component renders and what the current state is
  console.log(
    `RecipeEditor rendered. isOpen: ${isOpen}, title: "${title}", ingredients: "${ingredients}", instructions: "${instructions}"`
  );

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    console.log('Instructions TextArea onChange. New value:', newValue);
    setInstructions(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, ingredients, instructions });
    setTitle('');
    setIngredients('');
    setInstructions('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <EditorOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <EditorContainer
            onClick={e => e.stopPropagation()}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Tarif Başlığı"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <TextArea
                placeholder="Malzemeler"
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                required
              />
              <TextArea
                placeholder="Hazırlanışı"
                value={instructions}
                onChange={handleInstructionsChange} // Use the new handler
                required
              />
              <ButtonContainer>
                <Button type="button" className="secondary" onClick={onClose}>
                  İptal
                </Button>
                <Button type="submit" className="primary">
                  Kaydet
                </Button>
              </ButtonContainer>
            </form>
          </EditorContainer>
        </EditorOverlay>
      )}
    </AnimatePresence>
  );
};

export default RecipeEditor;