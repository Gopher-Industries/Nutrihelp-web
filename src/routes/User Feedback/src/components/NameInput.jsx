import { useMemo } from "react";
import styles from "./NameInput.module.css";

const NameInput = ({
  contactNumber,
  enterUsernamePlaceholder,
  propMinWidth,
  propWidth,
}) => {
  const contactNumberStyle = useMemo(() => {
    return {
      minWidth: propMinWidth,
    };
  }, [propMinWidth]);

  const enterUsernameStyle = useMemo(() => {
    return {
      width: propWidth,
    };
  }, [propWidth]);

  return (
    <div className={styles.nameInput}>
      <b className={styles.contactNumber} style={contactNumberStyle}>
        {contactNumber}
      </b>
      <div className={styles.movingMadeEasy}>
        <input
          className={styles.enterUsername}
          placeholder={enterUsernamePlaceholder}
          type="text"
          style={enterUsernameStyle}
        />
      </div>
    </div>
  );
};

export default NameInput;
