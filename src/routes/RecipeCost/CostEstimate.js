import { useState, useEffect } from "react";
import { Fetching } from "./Fetching";

const CostEstimate = () =>{
    const [recipeId, setRecipeId] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [serving, setServing] = useState(null);
    const [partial, setPartial] = useState(null);

    
    const handleChange = (event) =>{
        const {name , value} = event.target;
        if(name === "Recipe")
        setRecipeId(value);
        else if(name === "Serving")
        setServing(value);
        else if(name === "Partial")
        setPartial(value);
    }

    const handleSubmit = async (event) =>{
        event.preventDefault();
        console.log("recipe id: "+recipeId);
        console.log("serving size: "+serving);
        console.log("partial id: "+partial);
        try{
        const json = await Fetching(recipeId, serving, partial)
        setData(json);
        alert("The high cost is: " + json.high_cost.price +"\nThe low cost is: "+ json.low_cost.price);
        }
        catch(err){
            setError(err.message);
        }
}

    return(
        <form onSubmit = {handleSubmit}>
        <label htmlFor="userInput">Enter Recipe Id:</label>
        <input
            name = "Recipe"
            type="text"
            value={recipeId} 
            onChange={handleChange} 
        />
        <label htmlFor="userInput">Enter Serving Size:</label>
        <input
            name = "Serving"
            type="text"
            value={serving} 
            onChange={handleChange} 
        />
        <label htmlFor="userInput">Enter Ingredients to remove:</label>
        <input
            name = "Partial"
            type="text"
            value={partial} 
            onChange={handleChange} 
        />
            <br />
            <button type = "Submit">Submit</button>
        </form>
    );

}

export default CostEstimate;