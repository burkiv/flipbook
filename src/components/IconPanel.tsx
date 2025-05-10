import styled from 'styled-components';

// İkonları import et
import cirpmaTeli from '../assets/icons/cırpmateli.png';
import domates from '../assets/icons/domates.png';
import havuc from '../assets/icons/havuc.png';
import karabiber from '../assets/icons/karabiber.png';
import nane from '../assets/icons/nane.png';
import patates from '../assets/icons/patates.png';
import peynir from '../assets/icons/peynir.png';
import sarimsak from '../assets/icons/sarımsak.png';
import seker from '../assets/icons/seker.png';
import siviYag from '../assets/icons/sıvıyag.png';
import sogan from '../assets/icons/sogan.png';
import sut from '../assets/icons/süt.png';
import tavuk from '../assets/icons/tavuk.png';
import tuz from '../assets/icons/tuz.png';
import un from '../assets/icons/un.png';
import yag from '../assets/icons/yag.png';
import yumurta from '../assets/icons/yumurta.png';

// Styled Components Tanımları
const PanelContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: ${props => props.$isVisible ? 'grid' : 'none'};
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
  z-index: 9999;
`;

// Seçili ikona stil ekle
const IconWrapper = styled.div<{ $isSelected: boolean }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: box-shadow 0.2s, transform 0.2s, border 0.2s;
  background: white;
  border: 2px solid ${props => props.$isSelected ? '#007bff' : 'transparent'}; // Seçiliyse mavi çerçeve
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    transform: scale(1.08);
  }
`;

const StyledImage = styled.img`
  width: 90%; // İçeride biraz boşluk bırakmak için
  height: 90%;
  object-fit: contain;
`;

// Prop Tipleri
interface IconPanelProps {
  isVisible: boolean;
  onIconClick: (src: string) => void;
  selectedIcon: string | null; // Yeni prop
}

// İkon Veri Dizisi
const icons = [
  { src: cirpmaTeli, alt: 'Çırpma Teli' }, { src: domates, alt: 'Domates' },
  { src: havuc, alt: 'Havuç' }, { src: karabiber, alt: 'Karabiber' },
  { src: nane, alt: 'Nane' }, { src: patates, alt: 'Patates' },
  { src: peynir, alt: 'Peynir' }, { src: sarimsak, alt: 'Sarımsak' },
  { src: seker, alt: 'Şeker' }, { src: siviYag, alt: 'Sıvı Yağ' },
  { src: sogan, alt: 'Soğan' }, { src: sut, alt: 'Süt' },
  { src: tavuk, alt: 'Tavuk' }, { src: tuz, alt: 'Tuz' },
  { src: un, alt: 'Un' }, { src: yag, alt: 'Yağ' },
  { src: yumurta, alt: 'Yumurta' }
];

// Component Tanımı
const IconPanel: React.FC<IconPanelProps> = ({ isVisible, onIconClick, selectedIcon }) => (
  <PanelContainer $isVisible={isVisible}>
    {icons.map((icon, i) => (
      <IconWrapper
        key={i}
        onClick={() => onIconClick(icon.src)}
        title={icon.alt}
        $isSelected={selectedIcon === icon.src} // Seçili olup olmadığını kontrol et
      >
        <StyledImage src={icon.src} alt={icon.alt} />
      </IconWrapper>
    ))}
  </PanelContainer>
);

// Default Export
export default IconPanel;