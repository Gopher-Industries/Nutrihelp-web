import React, { useState } from 'react'
import './SearchRecipes.css'
import SubHeading from '../../components/general_components/headings/SubHeading'
import RecipeCardList from './RecipeCardList'

function SearchRecipes() {
    //Use destructuring to set the value of "searchTerm" to ''
    // and the function "setSearchTerm" to set/update the value of "searchTerm"
    const [recipeNameSearchTerm, setRecipeNameSearchTerm] = useState('')
    const [cuisineSearchTerm, setCusineSearchTerm] = useState('')


    //==================== Set listener for Search Title/Position input box ====================
    //Function to be called by listener
    const onSearchRecipeNameChange = (e) => {
        setRecipeNameSearchTerm(e.target.value) //Assign the value of "searchTerm" to the value
        //                              typed into the input box
    }


    //==================== Set listener for Search Skills input box ====================
    //Function to be called by listener
    const onSearchCuisineChange = (e) => {
        setCusineSearchTerm(e.target.value) //Assign the value of "searchTerm" to the value
        //                              typed into the input box
    }

    //==================== Render the component ====================
    return (
        <div>
            <SubHeading
                text="Search Recipes"
            />

            <br></br>

            <div className='search-input'>
                <input className='search-box'
                    type='text'
                    placeholder='Search Recipe Name'
                    onChange={onSearchRecipeNameChange}
                    value={recipeNameSearchTerm}
                />
            </div>

            <br></br>

            <div className='search-input'>
                <input className='search-box'
                    type='text'
                    placeholder='Search Cuisine'
                    onChange={onSearchCuisineChange}
                    value={cuisineSearchTerm}
                />
            </div>

            <br></br>

            <RecipeCardList
                recipeNameSearchTerm={recipeNameSearchTerm}
                cuisineSearchTerm={cuisineSearchTerm}
            />

        </div>
    );
}

export default SearchRecipes