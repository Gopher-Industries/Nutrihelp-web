import { useRef } from 'react';
import "./styles.css";

export const FileUploader = () => {
  const hiddenFileInput = useRef(null);

  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  return (
    <>
      <button
        className="button-upload"
        onClick={handleClick}
      >
        Upload a file
      </button>
      <input
        type="file"
        ref={hiddenFileInput}
        style={{display:'none'}}
      />
    </>
  );
};