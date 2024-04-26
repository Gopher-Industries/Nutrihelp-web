import styles from "./Container.module.css";

const Container = () => {
  return (
    <div className={styles.container}>
      <img className={styles.groupIcon} alt="" src="/group@2x.png" />
      <img className={styles.groupIcon1} alt="" src="/group-1@2x.png" />
      <div className={styles.containerInner}>
        <div className={styles.image1Parent}>
          <img
            className={styles.image1Icon}
            loading="lazy"
            alt=""
            src="/image-1@2x.png"
          />
          <div className={styles.infoNoteActionWrapper}>
            <div className={styles.infoNoteAction}>
              <img
                className={styles.doubleArrowRightIcon}
                loading="lazy"
                alt=""
                src="/doublearrowright@2x.png"
              />
              <div className={styles.infoNoteActionInner}>
                <div className={styles.groupParent}>
                  <img
                    className={styles.groupIcon2}
                    loading="lazy"
                    alt=""
                    src="/group-2.svg"
                  />
                  <img
                    className={styles.groupIcon3}
                    loading="lazy"
                    alt=""
                    src="/group-3.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.heartCardiogram} />
      <div className={styles.nutritionPanelWrapper}>
        <img
          className={styles.nutritionPanelIcon}
          loading="lazy"
          alt=""
          src="/vector.svg"
        />
      </div>
      <div className={styles.alertTriangle} />
      <div className={styles.nutritionWrapper}>
        <img
          className={styles.nutritionIcon}
          loading="lazy"
          alt=""
          src="/nutrition.svg"
        />
      </div>
      <div className={styles.leftIndentMarker}>
        <img
          className={styles.iNoteActionIcon}
          loading="lazy"
          alt=""
          src="/i-note-action.svg"
        />
      </div>
      <div className={styles.squareFillShape}>
        <img
          className={styles.textLeftIndentSquareFillIcon}
          loading="lazy"
          alt=""
          src="/textleftindentsquarefill.svg"
        />
      </div>
    </div>
  );
};

export default Container;
