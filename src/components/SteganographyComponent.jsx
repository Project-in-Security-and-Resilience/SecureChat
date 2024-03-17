import React, { useState } from 'react';
//import steg from '../lib/steganography.min.js'; // Assuming steg is converted to a module
//import { steg } from '../';

const SteganographyComponent = () => {
  const [sourceImage, setSourceImage] = useState('');
  const [encodedImage, setEncodedImage] = useState('');
  const [textToHide, setTextToHide] = useState('');
  const [decodedText, setDecodedText] = useState('');

  const readURL = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      setSourceImage(e.target.result);
    };

    reader.readAsDataURL(file);   
  }

  const hideText = () => {
    const encodedDataUri = steg.encode(textToHide, sourceImage);
    setEncodedImage(encodedDataUri);
  }

  const decode = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const decodedMessage = steg.decode(e.target.result);
      console.log(decodedMessage);
      setDecodedText(decodedMessage);
    };

    reader.readAsDataURL(file);
  }

  // Handler for source image file input
  const handleSourceImageChange = (event) => {
    readURL(event.target.files[0]);
  };

  // Handler for encoded image file input (if different from source)
  const handleEncodedImageChange = (event) => {
    decode(event.target.files[0]);
  };

  return (
    <div className="cont">
      <input
        className="ui primary button"
        type="file"
        name="pic"
        accept="image/*"
        onChange={handleSourceImageChange}
      />
      <div className="ui input">
        <input
          type="text"
          value={textToHide}
          onChange={(e) => setTextToHide(e.target.value)}
        />
      </div>
      <button className="ui secondary button" onClick={hideText}>
        Hide Message Into Image
      </button>

      <div className="img-cont">
        <div className="img1">
          <h5>Source Image</h5>
          <img src={sourceImage} alt="Source" />
        </div>

        <div>
          <h5>Message Encoded Image</h5>
          <img src={encodedImage} alt="Encoded" />
        </div>
      </div>

      <div>
        <input
          className="ui secondary button"
          type="file"
          name="pic"
          accept="image/*"
          onChange={handleEncodedImageChange}
        />
        <div>
          <h5>Decoded Text:</h5>
          <h2>{decodedText}</h2>
        </div>
      </div>
    </div>
  );
};

export default SteganographyComponent;
