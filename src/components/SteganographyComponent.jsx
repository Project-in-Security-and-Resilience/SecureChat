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
  // Function to trigger the download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = encodedImage; // Set the href to the data URL of the encoded image
    link.download = 'encoded-image.png'; // Set the default filename for the download
    document.body.appendChild(link); // Append to the body
    link.click(); // Trigger the click to download
    document.body.removeChild(link); // Remove the link from the body
  };
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

      <div className="imageContainer">
      <div className="img-cont">
        <div className="img1">
          <h5 className="sourcePic">Source Image</h5>
          <img className="sourcePic" src={sourceImage} alt="Source"/>
        </div>

        <div>
          <h5 className="encodedText">Encoded Image</h5>
          <img className="encodedPic" src={encodedImage} alt="Encoded"/>
        </div>
        <button onClick={handleDownload} className="downloadButton">Download</button>
                
              
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
          <h5 className="decodedText">Decoded Text:</h5>
          <h2 className="decodedText"> {decodedText}</h2>
        </div>
      </div>
    </div>
  );
};

export default SteganographyComponent;
