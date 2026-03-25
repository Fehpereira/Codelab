import { Accept } from 'react-dropzone';
import {
  DropzoneDescription,
  DropzoneGroup,
  DropzoneInput,
  Dropzone as DropzoneRoot,
  DropzoneTitle,
  DropzoneUploadIcon,
  DropzoneZone,
} from './components';
import {
  FileList,
  FileListAction,
  FileListActions,
  FileListDescription,
  FileListHeader,
  FileListIcon,
  FileListInfo,
  FileListItem,
  FileListName,
  FileListSize,
} from '../file-list';
import { Trash2 } from 'lucide-react';

type DropzoneProps = {
  file?: File;
  setFile: (file: File | undefined) => void;
  accpet?: Accept;
};

const defaultAccept: Accept = {
  'image/*': ['.jpg', '.png', '.jpeg', '.webp'],
};

export const Dropzone = ({ file, setFile, accpet }: DropzoneProps) => {
  return (
    <DropzoneRoot
      accept={accpet}
      maxSize={5 * 1024 * 1024} // 5MB
      onDropAccepted={(files) => setFile(files[0])}
    >
      <div className="flex flex-col gap-4">
        <DropzoneZone>
          <DropzoneInput />
          <DropzoneGroup className="gap-4">
            <DropzoneUploadIcon />
            <DropzoneGroup>
              <DropzoneTitle>
                Arraste e solte ou clique para fazer upload
              </DropzoneTitle>
              <DropzoneDescription>Máximo de 5MB</DropzoneDescription>
            </DropzoneGroup>
          </DropzoneGroup>
        </DropzoneZone>
        {file && (
          <FileList>
            <FileListItem>
              <FileListHeader>
                <FileListIcon />
                <FileListInfo>
                  <FileListName>{file.name}</FileListName>
                  <FileListDescription>
                    <FileListSize>{file.size}</FileListSize>
                  </FileListDescription>
                </FileListInfo>
                <FileListActions>
                  <FileListAction onClick={() => setFile(undefined)}>
                    <Trash2 />
                  </FileListAction>
                </FileListActions>
              </FileListHeader>
            </FileListItem>
          </FileList>
        )}
      </div>
    </DropzoneRoot>
  );
};
