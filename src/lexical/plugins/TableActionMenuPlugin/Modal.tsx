import React from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  close: () => void;
}

interface ModalContext {
  ModalChild?: React.FC<ModalProps>;
  setModal?: React.Dispatch<React.SetStateAction<React.FC<ModalProps> | undefined>>;
}

const ModalContext = React.createContext<ModalContext>({});
export const ModalProvider = ModalContext.Provider;
export const useModal = () => React.useContext(ModalContext);

export function Modal() {
  const { ModalChild, setModal } = React.useContext(ModalContext);
  const close = () => setModal?.(undefined);
  return (
    ModalChild
      ? (
          createPortal((
            <div className="lexical-background">
              <div className="dialog">
                <div className="body">
                  <ModalChild close={close} />
                </div>
              </div>
            </div>
          ), document.body)
        )
      : null
  );
}