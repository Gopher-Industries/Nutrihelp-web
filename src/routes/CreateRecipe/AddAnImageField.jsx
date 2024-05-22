import './Field.css'

import React, { useState } from 'react'
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage'

import { Button } from 'semantic-ui-react'
import Prompt from './Prompt'
import { storage } from '../../utils/firebase.js'

const AddAnImageField = ({ onImageAdded }) => {

    var [timeImageUploaded, setTimeImageUploaded] = useState(0);
    const [imageUpload, setImageUpload] = useState(null);
    const [imageList, setImageList] = useState([]);

    const imageListRef = ref(storage, 'images/')

    //Upload the image
    const uploadImage = () => {
        if (imageUpload == null) return; //If image does not exist, do nothing

        timeImageUploaded = Date.now();
        setTimeImageUploaded(timeImageUploaded)

        //Define a name for the image for it to be uploaded to Firebase
        const imageRef = ref(storage, `images/${timeImageUploaded + ' - ' + imageUpload.name}`);

        uploadBytes(imageRef, imageUpload).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
                setImageList(() => [url]);
                onImageAdded(); // This will set isImageAdded to true in CreateRecipe
            })


            //Obtain a list of all the images stored in the Firebase Storage
            listAll(imageListRef).then((response) => {
                console.log(response)

                //Display the last image added in the Firebase Storage
                getDownloadURL(response.items[response.items.length - 1]).then((url) => {
                    setImageList(() => [url]);
                })
            })
        })
    }

    return (
        <div className='form-div'>
            <Prompt text="Image" />

            <input
                type='file'
                onChange={(event) => { setImageUpload(event.target.files[0]) }} />

            <div className='browse-and-upload-buttons-div'>
                <Button className='button-primary' style={{ width: 'auto', overflow: 'visible' }} onClick={uploadImage}>Upload Image</Button>
            </div>


            {imageList.map((url) => {
                return <img src={url} />
            })}

        </div>
    )
}

export default AddAnImageField