import React from 'react';
import { Button } from 'semantic-ui-react';
import './SubmitButton.css';

// Button to submit a form
const SubmitButton = ({ text, onSubmit, disabled }) => {

    return (
        <div className='button-div'>
            <Button onClick={onSubmit} disabled={disabled}>
                {text}
            </Button>
        </div>
    )
}

export default SubmitButton;