import './CreateRecipe.css'
import './Field.css'

import AddAnImageField from './AddAnImageField'
import React from 'react'
import SectionHeader from './SectionHeader'

//Section to add images
const AddAnImageSection = ({ onImageAdded }) => (
    <div className='form-section'>
        <SectionHeader text='Add An Image' />
        <div>
            <AddAnImageField onImageAdded={onImageAdded} />
        </div>
    </div>
)

export default AddAnImageSection