import { ReactNode, useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from '@nextui-org/react';

import { languages, usePresetStore } from '@/store';

export interface PresetProviderProps {
  children?: ReactNode;
}

export function PresetProvider({ children }: PresetProviderProps) {
  const { language, references, setLanguages } = usePresetStore();
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(new Set([language]));
  const [selectedReferences, setSelectedReferences] = useState(
    new Set(references)
  );
  useEffect(() => {
    if (!language) {
      setOpen(true);
    }
    setSelectedLanguage(new Set([language]));
  }, [language]);
  useEffect(() => {
    setSelectedReferences(new Set(references));
  }, [references]);
  return (
    <>
      {children}
      <Modal
        isOpen={open}
        hideCloseButton={!language}
        onOpenChange={(isOpen) => {
          if (language) {
            setOpen(isOpen);
          }
        }}
      >
        <ModalContent>
          <ModalHeader>预设</ModalHeader>
          <ModalBody>
            <Select
              label="主语言"
              selectedKeys={selectedLanguage}
              onSelectionChange={setSelectedLanguage as any}
            >
              {languages.map((language) => (
                <SelectItem key={language.value}>{language.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="参照语言"
              disabledKeys={Array.from(selectedLanguage)}
              selectionMode="multiple"
              selectedKeys={selectedReferences}
              onSelectionChange={setSelectedReferences as any}
            >
              {languages.map((language) => (
                <SelectItem key={language.value}>{language.label}</SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => {
                const newLanguage = Array.from(selectedLanguage)[0];
                if (newLanguage) {
                  setOpen(false);
                  setLanguages(newLanguage, Array.from(selectedReferences));
                }
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default PresetProvider;
