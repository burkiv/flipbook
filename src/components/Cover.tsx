import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import coverImage from '../assets/cover.png';

const CoverWrapper = styled(motion.div)`
  width: 700px;
  height: 800px;
  margin: 0 auto;
  perspective: 1200px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
`;

const CoverImg = styled(motion.img)`
  width: 700px;
  height: 800px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  transform-origin: left center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: rotateY(-8deg);
  box-shadow:
    0 30px 40px -20px rgba(0,0,0,.25),
    inset 0 0 15px rgba(0,0,0,.15);
`;

interface CoverProps {
  onClick: () => void;
}

const coverVariants = {
    initial: {
        rotateY: -8,
        opacity: 1,
        x: 0,
    },
    exit: {
        rotateY: -90,
        opacity: 0,
        x: "-100%",
        transition: { duration: 0.6, ease: "easeInOut" }
    }
};

const Cover: React.FC<CoverProps> = ({ onClick }) => {
  return (
      <CoverWrapper>
        <CoverImg
          src={coverImage}
          alt="Recipe Notebook Cover"
          onClick={onClick}
          variants={coverVariants}
          initial="initial"
          animate="initial"
          exit="exit"
          whileHover={{ rotateY: 0, boxShadow: "0 40px 50px -25px rgba(0,0,0,.3), inset 0 0 15px rgba(0,0,0,.1)" }}
        />
      </CoverWrapper>
  );
};

export default Cover;
