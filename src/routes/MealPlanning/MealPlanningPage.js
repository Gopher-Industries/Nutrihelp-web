import { useState } from "react";
import "./MealPlanningPage.css";

// Import images with unique variable names and ensure the file extensions are correct
import lowCalorieImg from './images/lowcalorieimg.jpg'; // assuming the file is a .jpg
import balancedCalorieImg from './images/balancedcalorieimg.jpg';
import highCalorieImg from './images/highcalorieimg.jpg';

const MealPlanningPage = () => {
    const [age, setAge] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [result, setResult] = useState("");

    function calculateBMI() {
        const numHeight = parseFloat(height);
        const numWeight = parseFloat(weight);

        if (numHeight > 0 && numWeight > 0) {
            const bmi = (numWeight / ((numHeight * numHeight) / 10000)).toFixed(1);
            let description = "";
            let mealPlan = "";

            if (bmi < 18.5) {
                description = "Underweight";
                mealPlan = "Meal Plan A: High-calorie meals...";
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                description = "Normal weight";
                mealPlan = "Meal Plan B: Well-balanced meals...";
            } else {
                description = "Overweight";
                mealPlan = "Meal Plan C: Low-calorie meals...";
            }

            setResult(`Your BMI is ${bmi} which is considered ${description}. <br> Suggested Meal Plan: ${mealPlan}`);
        } else {
            setResult("Please enter valid height and weight.");
        }
    }

    return (
        <>
            <h1>Meal Planner</h1>
            <div id="form-wrapper">
                <form id="userInfo" onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="age">Age:</label>
                    <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} required />
                    <label htmlFor="weight">Weight (in kilograms):</label>
                    <input type="number" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                    <label htmlFor="height">Height (in centimeters):</label>
                    <input type="number" id="height" value={height} onChange={(e) => setHeight(e.target.value)} required />
                    <button type="button" onClick={calculateBMI}>
                        Create Meal Plan
                    </button>
                </form>
            </div>
            <div id="result" dangerouslySetInnerHTML={{ __html: result }} />
            <section className="services section-bg">
                <div className="container">
                    <div className="section-title">
                        <h2>Meal Plans</h2>
                        <p>
                        "Below, you will find a variety of meal plans categorized as Plan A, B, and C. Based on your calculated BMI above, 
                        please select the meal plan that best aligns with your dietary needs and health objectives."
                        </p>
                    </div>
                    <div className="row">
                        <div className="attributes">
                            <div className="icon-box">
                                
                                <h4 className="title"><a href="/MealPlanA">Meal Plan A: High-Calorie Foods</a></h4>
                                
                            </div>
                        </div>
                        <div className="attributes">
                            <div className="icon-box">
                                
                                <h4 className="title"><a href="/MealPlanB">Meal Plan B: Well-Balanced Foods</a></h4>
                                
                            </div>
                        </div>
                        <div className="attributes">
                            <div className="icon-box">
                                
                                <h4 className="title"><a href="/MealPlanC">Meal Plan C: Low-Calorie Foods</a></h4>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default MealPlanningPage;
