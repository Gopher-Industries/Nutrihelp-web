import FieldError from "../../../components/FieldError";

function BarcodeInputForm({ value, handleOnchange, handleBlur, error, touched, handleSubmit }) {
  return (
    <div className="barcode-input-wrapper">
      <div className="form-group scan-barcode-form-group">
        <label className="scan-barcode-label">Barcode</label>
        <input
          placeholder="Enter barcode number. Ex: 3017624010701"
          value={value}
          onChange={(e) => handleOnchange(e.target.value)}
          onBlur={handleBlur}
          className={`barcode-input scan-barcode-input ${error && touched ? 'error-border' : ''}`}
        />
        <FieldError error={error} touched={touched} />
      </div>

      <button className="upload-button scan-barcode-submit" onClick={handleSubmit}>
        Get Barcode Information
      </button>
    </div>
  )
}

export default BarcodeInputForm;
