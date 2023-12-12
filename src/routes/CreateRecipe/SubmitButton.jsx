import React from 'react';
import { Button } from 'semantic-ui-react';
import './SubmitButton.css';
import { Link } from 'react-router-dom';

// Button to submit a form
const SubmitButton = ({ text, onSubmit, disabled }) => {

    return (
        <div className='button-div'><Link to={'/recipe'}><Button onClick={onSubmit} disabled={disabled}>
        {text}
    </Button>
    </Link>
            
        </div>
    )
}

export default SubmitButton;