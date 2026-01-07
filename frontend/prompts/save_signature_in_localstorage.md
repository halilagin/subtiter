after drawing signature in signerpane.jsx, I want to save the signature in local storage. 

The signature should be saved in local storage with the following properties

{
    "pageNumber": <PDF page number>,
    "signature": <base64 encoded string of the signature>  ,
    "x": <x coordinate of the signature>,
    "y": <y coordinate of the signature>,
    "date": <date of signing>
}



