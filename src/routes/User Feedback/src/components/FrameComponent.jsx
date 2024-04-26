import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FrameComponent.module.css";

const FrameComponent = () => {
  const navigate = useNavigate();

  const onMenuItemContainerClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className={styles.fRAME}>
      <div className={styles.header}>
        <button className={styles.logo}>
          <img className={styles.logo1Icon} alt="" />
          <b className={styles.visionCapital}>NutriHelp™</b>
        </button>
        <div className={styles.colright}>
          <nav className={styles.menu}>
            <div className={styles.menuItem} onClick={onMenuItemContainerClick}>
              <h1 className={styles.placeholder}>Your Menu</h1>
            </div>
            <div className={styles.menuItem1}>
              <h1 className={styles.placeholder1}>Recipes</h1>
            </div>
            <div className={styles.menuItem2}>
              <h1 className={styles.placeholder2}>Shopping list</h1>
            </div>
            <div className={styles.menuItem3}>
              <h1 className={styles.placeholder3}>Settings</h1>
            </div>
          </nav>
          <h1 className={styles.profile}> Profile</h1>
        </div>
      </div>
    </div>
  );
};

export default FrameComponent;
