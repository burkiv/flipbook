import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import coverImage from '../assets/cover.png';

const CoverContainer = styled(motion.div)`
  width: 700px;
  height: 800px;
  background-image: url(${coverImage});
  background-size: cover;
  background-position: center;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  cursor: pointer;
  position: absolute;
  transform-origin: left center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
`;

interface CoverProps {
  onClick: () => void;
}

const coverVariants = {
    initial: {
        rotateY: 0,
        opacity: 1,
        x: 0,
    },
    exit: {
        rotateY: -90,
        opacity: 0.8,
        x: "-10%",
        transition: { duration: 0.6, ease: "easeInOut" }
    }
};

const Cover: React.FC<CoverProps> = ({ onClick }) => {
  return (
      <CoverContainer
        onClick={onClick}
        variants={coverVariants}
        initial="initial"
        exit="exit"
      />
  );
};

export default Cover;
