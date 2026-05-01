export const UserAllergenInformation = ({ isLoggedIn, userAllergen }) => {
  if (!isLoggedIn) {
    return;
  }

  if (userAllergen.length > 0) {
    return (
      <section className="scan-barcode-user-allergens">
        <h3 className="scan-barcode-section-title">Allergen information</h3>
        <div className="scan-barcode-info-panel scan-barcode-info-panel-warning">
          <p className="scan-barcode-info-title">Allergen ingredients detected in your profile</p>
          <p className="scan-barcode-info-text">{userAllergen.join(", ")}</p>
        </div>
      </section>
    )
  } else {
    return (
      <section className="scan-barcode-user-allergens">
        <h3 className="scan-barcode-section-title">Allergen information</h3>
        <div className="scan-barcode-info-panel">
          <p className="scan-barcode-info-text">You have not specified any allergen ingredients.</p>
        </div>
      </section>
    )
  } 
}

export const DetectionResult = ({ isLoggedIn, hasAllergen, matchingAllergens }) => {
  if (!isLoggedIn) {
    return;
  }

  if (!hasAllergen) {
    return <p className="scan-barcode-detection-result safe">Safe to use - no allergens detected</p>;
  } else {
    return (
      <div className="scan-barcode-detection-result warning">
        <p>
          Allergen detected. This product contains ingredients from your allergy list.
        </p>
        <p className="scan-barcode-detection-list">{matchingAllergens.join(", ")}</p>
      </div>
    );
  }
}

export const BarcodeInformation = ({ barcodeResult, productName, barcodeIngredients }) => {
  return (
    <table className="scan-barcode-table">
      <tbody>
        <tr>
          <th>Code</th>
          <td>{barcodeResult}</td>
        </tr>
        <tr>
          <th>Product</th>
          <td>{productName}</td>
        </tr>
        <tr>
          <th>Ingredients</th>
          <td>
            <ol className="scan-barcode-ingredient-list">
              {barcodeIngredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ol>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
