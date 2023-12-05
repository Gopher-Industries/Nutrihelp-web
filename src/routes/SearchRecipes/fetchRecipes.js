import { getDocs, collection } from 'firebase/firestore';
import { db, storage } from '../../utils/firebase';
import { ref, getDownloadURL, listAll } from 'firebase/storage'; // Corrected import here

//==================== Fetch data from the Firestore ====================
export async function fetchRecipes() {
    const recipeListSnapshot = await getDocs(collection(db, "recipesData"));
    const recipesArray = [];

    // Reference to the images directory in Firebase Storage
    const imagesDirectoryRef = ref(storage, 'images'); // Ensure you've defined 'storage' properly.

    // List all files in the 'images' directory
    const imageFiles = await listAll(imagesDirectoryRef);

    for (let i = 0; i < recipeListSnapshot.docs.length; i++) {
        const doc = recipeListSnapshot.docs[i];
        const {
            recipeName,
            cuisine,
            preparationTime,
            totalServings,
            caloriesPerServing,
            recipeNotes,
            ingredients,
            instructions
        } = doc.data();

        // Fetch download URL for each image reference
        const imageUrl = await getDownloadURL(imageFiles.items[i]);

        recipesArray.push({
            recipeName,
            cuisine,
            preparationTime,
            totalServings,
            caloriesPerServing,
            recipeNotes,
            ingredients,
            instructions,
            imageUrl
        });
    }

    return recipesArray;
}