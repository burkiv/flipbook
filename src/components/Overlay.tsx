import styled from "styled-components";

export const OverlayWrap = styled.div`
  position: fixed;
  pointer-events: none; /* Tıklamaları her zaman alt katmanlara geçir */
  z-index: 1002;
  /* Style (top, left, width, height) App.tsx'ten gelecek */
`;

interface TextareaProps {
  $isTextEditable?: boolean; // Prop adı Overlay.tsx içinde tutarlı olsun
}

export const OverlayTextarea = styled.textarea<TextareaProps>`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  font-family: "Architects Daughter", cursive;
  font-size: 1.2em;
  color: #444;
  line-height: 1.6;
  resize: none;
  outline: none;
  padding: 0;
  margin: 0;
  overflow-y: hidden;
  pointer-events: ${(p) => (p.$isTextEditable ? "auto" : "none")}; // Textarea tıklanabilirliğini kendi yönetir
  /* Görsel test için kenarlık eklenebilir */
  border: ${(p) => (p.$isTextEditable ? '2px solid red' : 'none')}; 
  background-color: ${(p) => (p.$isTextEditable ? 'rgba(255, 0, 0, 0.1)' : 'transparent')};
`;
