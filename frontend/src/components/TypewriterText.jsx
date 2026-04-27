import React, { useState, useEffect } from 'react';

const TypewriterText = ({ 
  texts = [], 
  speed = 50, 
  delay = 0, 
  deleteSpeed = 30,
  pauseDuration = 1500,
  className = '',
  onComplete = null
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentText = texts[sentenceIndex] || '';

  // Debug logging
  console.log('Current sentence index:', sentenceIndex);
  console.log('Current text:', currentText);
  console.log('All texts:', texts);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        setCurrentIndex(1);
      }, delay);
      return () => clearTimeout(delayTimer);
    } else {
      setCurrentIndex(1);
    }
  }, [delay]);

  useEffect(() => {
    if (currentIndex === 0) return;

    if (!isDeleting && currentIndex <= currentText.length) {
      // Typing forward
      const timer = setTimeout(() => {
        setDisplayedText(currentText.slice(0, currentIndex));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isDeleting && currentIndex > currentText.length) {
      // Finished typing, pause before deleting
      const pauseTimer = setTimeout(() => {
        setIsDeleting(true);
        setCurrentIndex(currentIndex - 1);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    } else if (isDeleting && currentIndex > 0) {
      // Deleting
      const timer = setTimeout(() => {
        setDisplayedText(currentText.slice(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      }, deleteSpeed);

      return () => clearTimeout(timer);
    } else if (isDeleting && currentIndex === 0) {
      // Finished deleting, move to next sentence
      setIsDeleting(false);
      const nextSentenceIndex = (sentenceIndex + 1) % texts.length;
      console.log('Moving to next sentence:', nextSentenceIndex);
      setSentenceIndex(nextSentenceIndex);
      setCurrentIndex(1);
    }
  }, [currentIndex, currentText, speed, deleteSpeed, isDeleting, pauseDuration, sentenceIndex, texts.length, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      <span className="typewriter-cursor">|</span>
    </span>
  );
};

export default TypewriterText;
