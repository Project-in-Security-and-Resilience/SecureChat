/**
 **  Steganography Functions Overview:
 * 
 * These functions provide a simple interface for embedding hidden text within an image and decoding it using
 *  steganography, specifically utilizing the `steg` library. The code is designed to work with HTML file inputs
 *  and image elements to display results directly on a web page.
 * 
 **  Functions:
 * - readURL(input): Reads an image file from a file input element and sets it as the source for an image element
 *   on the page.
 * - hideText(): Encodes a piece of text into the previously loaded image using steganography and updates 
 *   another image element to display the encoded image.
 * - decode(input): Reads an image file from a file input element, decodes any hidden text using steganography,
 *  and displays the text within a specified element on the page.\
 * 
 **   How It Works:
 * - readURL(input): Triggered when a user selects an image file. It uses `FileReader` to read the file as a data URL and stores 
 * this in a global variable `imgdatauri`. It then updates an image element (`#image1`) on the page with this data URL,
 *  visually displaying the selected image.
 * 
 * - hideText(): Takes text input from an element (e.g., a text input field with id `#text`) and encodes it 
 * within the image data stored in `imgdatauri`. The `steg.encode` method from the `steg` 
 * library is used for this purpose. The encoded image is then set as the source for another 
 * image element (`#image2`) on the page, showing the result with the hidden text embedded.
 * 
 * - decode(input): Similar to `readURL`, this function is triggered by selecting an image 
 * file intended for text decoding. It reads the selected file and uses `steg.decode` to extract 
 * any hidden text from the image. The decoded text is displayed in an element (e.g., a div with id `#decoded`) 
 * on the page.
 * 
 * Adapted from https://github.com/sibi-sharanyan/mini-projects/tree/master/steganography-simple
 */


var imgdatauri;

function readURL(input) {

    var reader = new FileReader();

    reader.onload = function(e) {
        imgdatauri = e.target.result;
        document.querySelector("#image1").src = e.target.result;
    }
    reader.readAsDataURL(input.files[0]);   
}

function hideText() {
    document.querySelector("#image2").src = steg.encode(document.querySelector('#text').value, imgdatauri);
}

function decode(input) {

    var reader = new FileReader();
    reader.onload = function(e) {
        
        console.log(steg.decode(e.target.result));
        document.querySelector('#decoded').innerText = steg.decode(e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
}