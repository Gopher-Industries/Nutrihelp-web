import './SubmitButton.css';

import { Button } from 'semantic-ui-react';
import React from 'react';

// Button to submit a form
const SubmitButton = ({ text, onSubmit, disabled }) => {

    return (
        <div className=''><Button className='button-primary' onClick={onSubmit} disabled={disabled}>
            {text}
        </Button>

        </div>
    )
}

export default SubmitButton;