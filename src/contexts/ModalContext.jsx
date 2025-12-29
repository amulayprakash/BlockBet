import { createContext, useContext, useState } from 'react';

const ModalContext = createContext({
  activeModal: null,
  setActiveModal: () => {},
});

export function ModalProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <ModalContext.Provider value={{ activeModal, setActiveModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}






