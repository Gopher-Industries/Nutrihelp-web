import { createClient } from '@supabase/supabase-js';

//Please refactor it to using recipe API
//let supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
//let supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
//let supabase = createClient(supabaseUrl, supabaseKey);



export async function fetchRecipes() {
  /*  try {
        let { data, error } = await supabase
            .from('recipes')
            .select('*');

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.log(error)
    }*/

        return  {
            "recipes": [
              {
                "id": 0,
                "created_at": "string",
                "recipe_name": "string",
                "cuisine_id": 0,
                "total_servings": 0,
                "preparation_time": 0,
                "ingredients": {
                  "id": [
                    0
                  ],
                  "quantity": [
                    0
                  ],
                  "category": [
                    "string"
                  ],
                  "name": [
                    "string"
                  ]
                },
                "instructions": "string",
                "calories": 0,
                "fat": 0,
                "carbohydrates": 0,
                "protein": 0,
                "fiber": 0,
                "vitamin_a": 0,
                "vitamin_b": 0,
                "vitamin_c": 0,
                "vitamin_d": 0,
                "sodium": 0,
                "sugar": 0,
                "cuisine_name": "string"
              }
            ]
          }
   
}