import React from 'react';

const FieldError = ({ error, touched }) => {
  if (!error || !touched) return null;

  return (
    <p
      className="field-error"
      style={{
        color: '#ec0000ff',
        fontSize: '12px',
        marginTop: '4px',
        fontWeight: '500',
        animation: 'fadeIn 0.2s ease-in-out'
      }}
    >
      {error}
    </p>
  );
};

export default FieldError;
