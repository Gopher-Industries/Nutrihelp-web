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
        if(recipeId == null){
        alert("RecipeId is required");}
        else if((partial == null) && (serving == null)){
            fetch(`http://localhost:80/api/recipe/cost/${recipeId}`, {
                method: 'GET',
                headers: {
                    'Origin' : 'http://localhost:3000/',
                    'Content-type' : 'application/json'
                }, 
            })
                .then(response => response.json())
                .then((json) => {
                    setData(json);
                    var high = data.high_cost.price;
                    var low = data.low_cost.price;
                    console.log("The data is:" , data.high_cost.price);
                    alert("The high cost is: " + high +"\nThe low cost is: " + low);
                })
                .catch((err) => setError(err.message));
    }
        else if(partial == null){
            console.log("The serving is working: " ,serving);
            fetch(`http://localhost:80/api/recipe/cost/${recipeId}?desired_servings=${serving}`,{
                method : 'GET',
                headers :{
                    'Origin' : 'http://localhost:3000/',
                    'Content-type' : 'application/json'
                }
            })
            .then(response => response.json())
            .then((json) => {
                setData(json);
                var high = data.high_cost.price;
                var low = data.low_cost.price;
                console.log("The data is:" , data);
                alert("The high cost is: " + high +"\nThe low cost is: " + low);
            })
            .catch((err) => setError(err.message));
        }

        else if(serving == null){
            fetch(`http://localhost:80/api/recipe/cost/${recipeId}?exclude_ids=${partial}`,{
                method : 'GET',
                headers :{
                    'Origin' : 'http://localhost:3000/',
                    'Content-type' : 'application/json'
                }
            })
            .then(response => response.json())
            .then((json) => {
                setData(json);
                var high = data.high_cost.price;
                var low = data.low_cost.price;
                console.log("The data is:" , data);
                alert("The high cost is: " + high +"\nThe low cost is: " + low);
            })
            .catch((err) => setError(err.message));
        }
        else{
            fetch(`http://localhost:80/api/recipe/cost/${recipeId}?desired_servings=${serving}&exclude_ids=${partial}`,{
                method : 'GET',
                headers :{
                    'Origin' : 'http://localhost:3000/',
                    'Content-type' : 'application/json'
                }
            })
            .then(response => response.json())
            .then((json) => {
                setData(json);
                var high = data.high_cost.price;
                var low = data.low_cost.price;
                console.log("The data is:" , data);
                alert("The high cost is: " + high +"\nThe low cost is: " + low);
            })
            .catch((err) => setError(err.message));
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