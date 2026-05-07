import React, { useState, useContext } from 'react';
import { toast } from "react-toastify";
import { UserContext } from "../../context/user.context";
// Import components
import BarcodeInputForm from "./components/BarcodeInputForm";
import { UserAllergenInformation, DetectionResult, BarcodeInformation } from "./components/BarcodeResponse";
import { ERROR_MESSAGES, validateBarcode } from "../../utils/validationRules";

// Example barcode: 3017624010701
function ScanBarcode() {
  const { currentUser } = useContext(UserContext);
  const user_id = currentUser?.user_id;

  // Access user_id from the context
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showBarcodeInfo, setShowBarcodeInfo] = useState(false);

  // Scan result: barcode information
  const [barcodeResult, setBarcodeResult] = useState('');
  const [productName, setProductName] = useState('');
  const [barcodeIngredients, setBarcodeIngredients] = useState([]);
  // Scan result: allergen detection
  const [hasAllergen, setHasAllergen] = useState(false);
  const [matchingAllergens, setMatchingAllergens] = useState([]);
  // Scan result: user's allergen information
  const [userAllergen, setUserAllergen] = useState([]);
  const [barcodeError, setBarcodeError] = useState('');
  const [barcodeTouched, setBarcodeTouched] = useState(false);

  const handleFetchResult = (message, toast_function) => {
    toast_function(message, {
      position: "top-center",
      autoClose: true,
      closeOnClick: true,
      style: {
        fontSize: "1.1rem",
        fontWeight: "bold",
        padding: "1.2rem",
        borderRadius: "10px",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        backgroundColor: "#d1f0ff",
        color: "#0d47a1",
      }
    });
  }

  const handleBarcodeScanning = async (e) => {
    e.preventDefault();

    const err = validateBarcode(barcodeInput);
    if (err) {
      setBarcodeError(err);
      setBarcodeTouched(true);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/barcode?code=${barcodeInput}`, {
        method: "POST",
        body: JSON.stringify({ user_id }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBarcodeResult(barcodeInput);
        setProductName(data.product_name);
        setBarcodeIngredients(data.barcode_ingredients);

        setHasAllergen(data.detection_result.hasUserAllergen);
        setMatchingAllergens(data.detection_result.matchingAllergens);

        setUserAllergen(data.user_allergen_ingredients);

        setShowBarcodeInfo(true);
        handleFetchResult("Get barcode data successful!", toast.success);
      } else {
        const data = await response.json();
        setShowBarcodeInfo(false);
        handleFetchResult(data.error || "Failed to fetch data. Please check your input and try again later.", toast.warning);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setShowBarcodeInfo(false);
      handleFetchResult("Failed to fetch data. An error occurred: " + error.message, toast.error);
    }
  };

  return (
    <div className="scan-barcode-flow">
      <section className="scan-products-container scan-barcode-panel">
        <div className="scan-barcode-copy">
          <span className="scan-review-kicker">Barcode scan</span>
          <h2 className="scan-barcode-title">Enter barcode number</h2>
          <p className="scan-muted">
            Enter the full number exactly as shown on the package to fetch product and ingredient data.
          </p>
        </div>
        <BarcodeInputForm
          value={barcodeInput}
          handleOnchange={(val) => {
            setBarcodeInput(val);
            setBarcodeError('');
          }}
          handleBlur={() => setBarcodeTouched(true)}
          error={barcodeError}
          touched={barcodeTouched}
          handleSubmit={handleBarcodeScanning}
        />
      </section>

      {/* Barcode Information */}
      {showBarcodeInfo ? (
      <section className="scan-products-container scan-barcode-results-panel">
        {/* Allergen information */}
        <UserAllergenInformation isLoggedIn={user_id != undefined} userAllergen={userAllergen} />

        {/* Barcode information */}
        <h2 className="scan-barcode-section-title">Barcode information</h2>
        <div className="scan-barcode-center-row">
          <DetectionResult isLoggedIn={user_id != undefined} hasAllergen={hasAllergen} matchingAllergens={matchingAllergens} />
        </div>
        <div className="scan-barcode-center-row">
          <BarcodeInformation barcodeResult={barcodeResult} productName={productName} barcodeIngredients={barcodeIngredients} />
        </div>
      </section>
      ) : null}
    </div>
  );
}

export default ScanBarcode;
