import React from "react";
import styles from "./UserFeedbackUI.module.css";

const UserFeedbackUI = () => {
  return (
    <div className={styles.userFeedbackUi}>
      <FrameComponent />
      <main className={styles.ratingSliderContainerParent}>
        <div className={styles.ratingSliderContainer}>
          <div className={styles.emojiScale}>
            <div className={styles.feedbackContainer} />
          </div>
        </div>
        <section className={styles.containerWrapper}>
          <div className={styles.container}>
            <h1 className={styles.userFeedback}>User Feedback</h1>
            <div className={styles.feedbackWrapper}>
              <div className={styles.feedback}>
                <div className={styles.inputSection}>
                  <div className={styles.nameInputParent}>
                    <div className={styles.nameInput}>
                      <b className={styles.name}>Name</b>
                      <div className={styles.duisAtTellusAtUrnaCondime} />
                    </div>
                    <NameInput
                      contactNumber="Contact Number"
                      enterUsernamePlaceholder="+91 00000 00000"
                    />
                  </div>
                </div>
                <NameInput
                  contactNumber="Email Address"
                  enterUsernamePlaceholder="xyz123@gmail.com"
                  propMinWidth="105px"
                  propWidth="95px"
                />
                <div className={styles.shareYourExperienceInScaliParent}>
                  <b className={styles.shareYourExperience}>
                    Share your experience in scaling
                  </b>
                  <div className={styles.ratingScale}>
                    <div className={styles.emojis}>
                      <div className={styles.worst}>
                        <img
                          className={styles.worstStyleIcon}
                          loading="lazy"
                          alt=""
                          src="./images/worst-style@2x.png"
                        />
                        <div className={styles.worstWrapper}>
                          <b className={styles.worst1}>Worst</b>
                        </div>
                      </div>
                      <div className={styles.notGood}>
                        <img
                          className={styles.itsJustFineStyle}
                          loading="lazy"
                          alt=""
                          src="./images/its-just-fine-style@2x.png"
                        />
                        <div className={styles.notGoodWrapper}>
                          <b className={styles.notGood1}>
                            <p className={styles.not}>{`Not `}</p>
                            <p className={styles.good}>Good</p>
                          </b>
                        </div>
                      </div>
                      <div className={styles.fine}>
                        <img
                          className={styles.neutralIcon}
                          loading="lazy"
                          alt=""
                          src="./images/neutral@2x.png"
                        />
                        <div className={styles.fineWrapper}>
                          <b className={styles.fine1}>Fine</b>
                        </div>
                      </div>
                      <div className={styles.lookGood}>
                        <img
                          className={styles.goodStyleIcon}
                          loading="lazy"
                          alt=""
                          src="./images/good-style@2x.png"
                        />
                        <div className={styles.lookGoodWrapper}>
                          <b className={styles.lookGood1}>
                            <p className={styles.look}>Look</p>
                            <p className={styles.good1}>Good</p>
                          </b>
                        </div>
                      </div>
                      <div className={styles.veryGood}>
                        <img
                          className={styles.loveItStyle}
                          loading="lazy"
                          alt=""
                          src="./images/love-it-style@2x.png"
                        />
                        <div className={styles.veryGoodWrapper}>
                          <b className={styles.veryGood1}>
                            <p className={styles.very}>Very</p>
                            <p className={styles.good2}>Good</p>
                          </b>
                        </div>
                      </div>
                    </div>
                    <div className={styles.slider}>
                      <div className={styles.sliderBg} />
                      <div className={styles.sliderRuler}>
                        <div className={styles.sliderRulerInner}>
                          <div className={styles.frameChild} />
                        </div>
                        <div className={styles.sliderRulerChild}>
                          <div className={styles.frameWrapper}>
                            <img
                              className={styles.frameItem}
                              alt=""
                              src="./images/group-1.svg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.userFeedbackMessageArea}>
                  <textarea
                    className={styles.comments}
                    placeholder="Add your comments..."
                    rows={4}
                    cols={18}
                  />
                </div>
                <div className={styles.profileBox}>
                  <button className={styles.submitButton}>
                    <b className={styles.submit}>SUBMIT</b>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className={styles.ratingScale1} />
      </main>
    </div>
  );
};

export default UserFeedbackUI;
