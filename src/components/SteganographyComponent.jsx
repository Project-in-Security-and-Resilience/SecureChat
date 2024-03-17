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
    <div>
      <div className='encodeSection'>
        <span className="title">Hide Text In Image</span>
        <div className="cont">
          <input
            className="imageInput"
            type="file"
            name="pic"
            accept="image/*"
            onChange={handleSourceImageChange}
          />
          
            <input
              type="text"
              placeholder='Enter Message...'
              value={textToHide}
              onChange={(e) => setTextToHide(e.target.value)}
            />
          
          <button className="downloadButton" onClick={hideText}>
            Encode
          </button>
        </div>
        
        <div className="cont">
          <div className="img-cont">
            <div className="img1">
              <h5 className="sourcePic">Source Image</h5>
              <img className="sourcePic" src={sourceImage}/>
            </div>
            <div>
              <h5 className="encodedText">Encoded Image</h5>
              <img className="encodedPic" src={encodedImage}/>
            </div>
            <button onClick={handleDownload} className="downloadButton">Download Encoded Image</button>  
          </div>
        </div>
      </div>
      <div className='decodeSection'>
        <span className="title">Decode Image To Text</span>
        <div>
          <input
            className="imageInput"
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
    </div>
  );
};

export default SteganographyComponent;
