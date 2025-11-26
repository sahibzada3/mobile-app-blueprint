import * as React from 'react';

export const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (!visualViewport) return;

      const keyboardOpen = visualViewport.height < window.innerHeight;
      const height = window.innerHeight - visualViewport.height;

      setIsKeyboardOpen(keyboardOpen);
      setKeyboardHeight(keyboardOpen ? height : 0);
    };

    // Handle iOS keyboard
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    // Handle Android keyboard
    window.addEventListener('resize', handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.addEventListener('resize', handleResize);
    };
  }, []);

  return { keyboardHeight, isKeyboardOpen };
};
