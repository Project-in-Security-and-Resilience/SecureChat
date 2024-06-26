/**
 *  * SteganographyComponent:
 *  This is a React component that provides a user interface for encoding, and 
 * decoding hidden messages within images using steganography. This component allows users to select an image,
 *  input text to hide within that image, and then download the encoded image with the hidden message. 
 * It also supports decoding a hidden message from an encoded image.
 * 
 * * Requirements:
 * This component assumes the existence of a steganography library (`steg`) 
 *  and imported at the top of the file. The library must provide at least two methods: 
 * `encode(text, image)` to hide text within an image, and `decode(image)`
 *  to extract hidden text from an image.
 * 
 * * Functions:
 * - readURL(file): Reads a selected file and sets the source image to the read result.
 * - hideText(): Encodes the specified text into the source image and updates the encoded image state.
 * - decode(file): Decodes the text hidden within the selected image file and updates the decoded text state.
 * - handleDownload(): Triggers the download of the encoded image with the hidden message.
 * - handleSourceImageChange(event): Handles changes to the source image file input and processes the selected file.
 * - handleEncodedImageChange(event): Handles changes to the encoded image file input for decoding and processes the selected file.
 
* * State:
 * - sourceImage: The data URL of the source image selected by the user.
 * - encodedImage: The data URL of the image after encoding the text.
 * - textToHide: The text input by the user to hide within the image.
 * - decodedText: The text decoded from the encoded image.
**/

import React, { useState } from 'react';
//const steg = require("");

const SteganographyComponent = () => {

  const [sourceImage, setSourceImage] = useState('');
  const [encodedImage, setEncodedImage] = useState('');
  const [textToHide, setTextToHide] = useState('');
  const [decodedText, setDecodedText] = useState('');


  // Function to read and set the source image from the file input
  const readURL = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      // Set the read image as source image
      setSourceImage(e.target.result);
    };

    reader.readAsDataURL(file);   
  }

  // Function to encode text into the source image
  const hideText = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const encodedDataUri = steg.encode(textToHide, img); // Pass the image object instead of imageData
      setEncodedImage(encodedDataUri);
    };
    img.src = sourceImage;
  }

  // Function to decode text from an image
  const decode = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decodedMessage = steg.decode(img); // Pass the image object instead of imageData
        setDecodedText(decodedMessage);
      };
      img.src = e.target.result;
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

  //  renders the UI
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
