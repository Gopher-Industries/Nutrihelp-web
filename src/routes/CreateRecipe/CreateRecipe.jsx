import { motion } from "framer-motion";
import { useRef, useState, useEffect, useMemo, useContext } from "react";
import "./CreateRecipe.css";
import { MdArrowDropDown, MdArrowDropUp, MdEdit } from "react-icons/md";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import FramerClient from "../../components/framer-client.jsx";
import {
  cuisineListDB,
  getCuisineList,
  getIngredientsList,
  getCookingMethodList,
  ingredientListDB,
  cookingMethodListDB,
} from '../../services/recepieApi.js';
import { recipeApi } from '../../services/recepieApi.js';
import { UserContext } from "../../context/user.context.jsx";
import { ERROR_MESSAGES } from "../../utils/validationRules";
import FieldError from "../../components/FieldError";
import { toast } from "react-toastify";

// Create Recipe page
function CreateRecipe() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { currentUser } = useContext(UserContext); // <-- add this line

  // Consolidated form data state (similar to Appointment component pattern)
  const [formData, setFormData] = useState({
    // Recipe Description
    recipeName: "",
    cuisine: "",
    // Cooking Details
    preparationTime: "",
    totalServings: "",
    cookingMethod: "",
    // Current Ingredient being added
    ingredientCategory: "",
    ingredient: "",
    ingredientQuantity: "",
    ingredientCost: "",
    // image file (optional)
    imageFile: null,
    // Current Instruction being added
    currentInstruction: "",
  });

  // Arrays for ingredients and instructions lists
  const [instruction, setInstruction] = useState([]);
  const [tableData, setRecipeTable] = useState([]);
  const [showIngredients, setShowIngredients] = useState(true);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [ingredients, setIngredients] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  //==================== Handle changes to the fields ====================

  // Generic field change handler - works for any field in formData
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Replace the previous top-level fetch calls with local state + effect
  const [cuisines, setCuisines] = useState(cuisineListDB);
  const [ingredientsList, setIngredientsList] = useState(ingredientListDB);
  const [cookingMethods, setCookingMethods] = useState(cookingMethodListDB);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [c, ing, m] = await Promise.all([
          getCuisineList(),
          getIngredientsList(),
          getCookingMethodList(),
        ]);
        if (!mounted) return;
        if (c) setCuisines([...c]);
        if (ing) setIngredientsList({
          ingredient: [...(ing.ingredient || [])],
          category: [...(ing.category || [])],
        });
        if (m) setCookingMethods([...m]);
      } catch (err) {
        // silent fail — keep legacy lists
        console.error("recipe lists fetch failed", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Memoize mapped options to avoid remapping on every render
  const cuisineOptions = useMemo(() => {
    const list = cuisines || [];
    const unique = Array.from(new Map(list.filter(Boolean).map((c) => [c.id, c])).values());
    return unique.filter((c) => c.label).map((c) => (
      <option key={`${c.id}-${c.label}`} value={c.label}>
        {c.label}
      </option>
    ));
  }, [cuisines]);

  const ingredientOptions = useMemo(() => {
    const list = ingredientsList?.ingredient || [];
    const unique = Array.from(new Map(list.filter(Boolean).map((i) => [i.id, i])).values());
    return unique.filter((i) => i.label || i.value);
  }, [ingredientsList]);

  const cookingMethodOptions = useMemo(() => {
    const list = cookingMethods || [];
    const unique = Array.from(new Map(list.filter(Boolean).map((m) => [m.id, m])).values());
    return unique.filter((m) => m.label || m.value).map((m) => (
      <option key={`${m.id}-${m.label ?? m.value}`} value={m.value ?? m.label}>
        {m.label ?? m.value}
      </option>
    ));
  }, [cookingMethods]);

  const parsePositiveNumberInput = (value, options = {}) => {
    const { allowBlank = false, integer = false, maxDecimals = null } = options;
    const raw = String(value ?? "").trim().replace(",", ".");
    if (!raw) return { value: null, error: allowBlank ? null : ERROR_MESSAGES.REQUIRED };
    const pattern = integer ? /^[1-9]\d*$/ : /^(?:[1-9]\d*|0?\.\d+)(?:\.\d+)?$/;
    if (!pattern.test(raw)) {
      return { value: null, error: integer ? "Enter a positive whole number." : "Enter a positive number." };
    }
    if (maxDecimals !== null) {
      const decimals = raw.split(".")[1] || "";
      if (decimals.length > maxDecimals) {
        return { value: null, error: `Use at most ${maxDecimals} decimal places.` };
      }
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { value: null, error: integer ? "Enter a positive whole number." : "Enter a positive number." };
    }
    return { value: integer ? Math.trunc(parsed) : parsed, error: null };
  };

  const parseIngredientCostInput = (value) => {
    const parsed = parsePositiveNumberInput(value, { allowBlank: true, maxDecimals: 2 });
    return parsed.error ? null : parsed.value === null ? null : Number(parsed.value.toFixed(2));
  };

  const handelIngredientsInTable = () => {
    const { ingredientCategory, ingredient, ingredientQuantity, ingredientCost } = formData;

    // Validate ingredient fields before adding
    const ingErrors = {};
    if (!ingredientCategory) ingErrors.ingredientCategory = ERROR_MESSAGES.REQUIRED;
    if (!ingredient) ingErrors.ingredient = ERROR_MESSAGES.REQUIRED;
    if (ingredient && !resolveOptionId(ingredientsList?.ingredient || [], ingredient)) {
      ingErrors.ingredient = "Choose an ingredient from the suggestions.";
    }
    const parsedQuantity = parsePositiveNumberInput(ingredientQuantity);
    if (parsedQuantity.error) ingErrors.ingredientQuantity = "Enter quantity as a positive number, e.g. 150 or 0.5.";
    const parsedCostResult = parsePositiveNumberInput(ingredientCost, { allowBlank: true, maxDecimals: 2 });
    if (parsedCostResult.error) {
      ingErrors.ingredientCost = "Enter cost as AUD number, e.g. 2.65, or leave blank.";
    }
    const parsedCost = parsedCostResult.value === null ? null : Number(parsedCostResult.value.toFixed(2));

    if (Object.keys(ingErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...ingErrors }));
      setTouched(prev => ({
        ...prev,
        ingredientCategory: true,
        ingredient: true,
        ingredientQuantity: true,
        ingredientCost: true,
      }));
      return;
    }

    setIngredients((prev) => [
      ...prev,
      { ingredientCategory, ingredient, ingredientQuantity: parsedQuantity.value, ingredientCost: parsedCost },
    ]);
    setRecipeTable((prev) => [
      ...prev,
      { ingredientCategory, ingredient, ingredientQuantity: parsedQuantity.value, ingredientCost: parsedCost },
    ]);
    setFormData((prev) => ({
      ...prev,
      ingredientCategory: "",
      ingredient: "",
      ingredientQuantity: "",
      ingredientCost: "",
    }));
    // Clear ingredient related errors
    setErrors(prev => ({
      ...prev,
      ingredientCategory: undefined,
      ingredient: undefined,
      ingredientQuantity: undefined,
      ingredientCost: undefined
    }));
    setTouched(prev => ({
      ...prev,
      ingredientCategory: false,
      ingredient: false,
      ingredientQuantity: false,
      ingredientCost: false
    }));
  };

  const handleRemoveTableData = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
    setRecipeTable((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedImageName("");
      setImagePreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      event.target.value = "";
      setSelectedImageName("");
      setImagePreviewUrl("");
      return;
    }

    setSelectedImageName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedImageName("");
    setImagePreviewUrl("");
  };

  const resolveOptionId = (list, selectedValue) => {
    const normalized = String(selectedValue || "").trim().toLowerCase();
    const match = (Array.isArray(list) ? list : []).find((item) =>
      String(item?.label || item?.value || "").trim().toLowerCase() === normalized
    );
    return match?.id;
  };

  //==================== Send data to the Supabase ====================
  const sendDataToSupabase = async (event) => {
    event.preventDefault();

    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        setAttemptedSubmit(true);

        // Focus first error
        const firstErrorKey = Object.keys(validationErrors)[0];
        const element = document.getElementsByName(firstErrorKey)[0];
        if (element) {
          element.focus();
        }

        window.scrollTo(0, 0);
        toast.error("Please fix the errors in the form.");
        return;
      }

      setAttemptedSubmit(false);

      const file = fileInputRef.current.files[0];

      const ingredientId = [];
      const ingredientQuantityList = [];
      const ingredientCostList = [];
      let cuisineId;
      let cookingMethodId;
      const userId = currentUser?.user_id ?? currentUser?.id ?? recipeApi.getCurrentUserId?.();

      cuisineId = resolveOptionId(cuisines, formData.cuisine);
      cookingMethodId = resolveOptionId(cookingMethods, formData.cookingMethod);

      tableData.forEach((row) => {
        const resolvedIngredientId = resolveOptionId(ingredientsList?.ingredient || [], row.ingredient);
        if (resolvedIngredientId) {
          ingredientId.push(resolvedIngredientId);
          ingredientQuantityList.push(parsePositiveNumberInput(row.ingredientQuantity).value);
          ingredientCostList.push(parseIngredientCostInput(row.ingredientCost));
        }
      });

      // Format data to match backend expectations
      const recipeData = {
        user_id: userId,
        recipe_name: formData.recipeName,
        cuisine_id: cuisineId,
        preparation_time: parsePositiveNumberInput(formData.preparationTime, { integer: true }).value,
        total_servings: parsePositiveNumberInput(formData.totalServings, { integer: true }).value,
        ingredient_id: ingredientId,
        ingredient_quantity: ingredientQuantityList,
        ingredient_cost: ingredientCostList,
        ingredient_costs: ingredientCostList,
        ingredientCost: ingredientCostList,
        ingredient_details: tableData.map((row) => ({
          name: row.ingredient,
          category: row.ingredientCategory,
          quantity: parsePositiveNumberInput(row.ingredientQuantity).value,
          cost: parseIngredientCostInput(row.ingredientCost),
        })),
        cooking_method_id: cookingMethodId,
        instructions: instruction.join('\n'),
      };

      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Image = reader.result;

            const recipeDataWithImage = {
              ...recipeData,
              recipe_image: base64Image,
            };

            await recipeApi.createRecepie(recipeDataWithImage);
            window.dispatchEvent(new Event("recipeUpdated"));
            toast.success("Recipe created successfully.");
            navigate("/recipe");
          } catch (error) {
            console.error("Error creating recipe with image:", error);
            toast.error(error.message || "Recipe creation failed.");
          }
        };
        reader.readAsDataURL(file);
      } else {
        const recipeDataWithoutImage = {
          ...recipeData,
        };

        await recipeApi.createRecepie(recipeDataWithoutImage);
        window.dispatchEvent(new Event("recipeUpdated"));
        toast.success("Recipe created successfully.");
        navigate("/recipe");

        // fetch("http://localhost:80/api/recipe/", {
        //   method: "POST",
        //   body: JSON.stringify(recipeDataWithoutImage),
        //   headers: {
        //     Origin: "http://localhost:3000/",
        //     "Content-Type": "application/json",
        //   },
        // })
        //   .then((response) => response.json())
        //   .then((data) => {
        //     if (data.statusCode === 201) {
        //       console.log("Data successfully written to Supabase!");
        //       //alert("Recipe Creation was successful!");
        //       navigate("/searchRecipes");
        //     } else {
        //       console.log(data);
        //       alert("Recipe Creation was unsuccessful! Please try Again");
        //     }
        //   })
        //   .catch((error) => {
        //     console.error("Error sending message:", error);
        //   });
      }
    } catch (error) {
      console.error("Error writing document:", error);
      toast.error(error.message || "Recipe creation failed.");
    }
    setFormData((prev) => ({ ...prev, currentInstruction: "" }));
    // navigate("/recipe");
  };

  // Function to validate all fields
  const validateForm = () => {
    const err = {};
    if (!formData.recipeName.trim()) err.recipeName = ERROR_MESSAGES.REQUIRED;
    if (!formData.cuisine) err.cuisine = ERROR_MESSAGES.REQUIRED;

    const servingsResult = parsePositiveNumberInput(formData.totalServings, { integer: true });
    if (servingsResult.error) err.totalServings = "Enter servings as a positive whole number, e.g. 2.";

    const timeResult = parsePositiveNumberInput(formData.preparationTime, { integer: true });
    if (timeResult.error) err.preparationTime = "Enter minutes as a positive whole number, e.g. 40.";

    if (!formData.cookingMethod) err.cookingMethod = ERROR_MESSAGES.REQUIRED;

    if (!tableData || tableData.length === 0) {
      err.tableData = "At least one ingredient is required";
    }

    if (!instruction.some((step) => String(step || "").trim())) {
      err.instructions = "At least one instruction step is required";
    }

    return err;
  };

  const isFormValid = () => Object.keys(validateForm()).length === 0;

  const [isImageAdded, setIsImageAdded] = useState(false);

  const handleImageAdded = () => {
    setIsImageAdded(true);
  };

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  //==================== Render the component ====================
  return (
    <FramerClient>
      <div
        id="no-bg"
        className="create-recipe-page w-full flex justify-center items-center bg-[#FFFEFE]"
      >
        <form
          onSubmit={sendDataToSupabase}
          id="no-bg"
          className="create-recipe-shell w-full min-h-screen flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
        >
          <div
            id="no-bg"
            className="create-recipe-panel w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] max-w-[1400px] bg-[#FFFFFF] rounded-lg flex flex-col sm:flex-row  border border-[#005BBB]"
          >
            {/* Main Form Area - full width on mobile, constrained on larger screens */}
            <div
              id="no-bg"
              className="create-recipe-content w-full  p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
            >
              {/* Header - flex column on mobile, row on sm+ */}
              <div
                id="no-bg"
              //className="flex flex-col bg-[#E8F1FF] sm:flex-row justify-between items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12"
              >
                <div id="no-bg" className="create-recipe-hero w-full flex justify-center">
                  <span className="create-recipe-kicker">Personal Recipe Builder</span>
                  <h1
                    id="no-bg"
                    className="font-[Arial] text-2xl sm:text-3xl md:text-4xl lg:text-5xl  font-medium text-center sm:text-left mb-4 sm:mb-0 text-[#1A1A1A]"
                  >
                    Create Recipe
                  </h1>
                  <p className="create-recipe-subtitle">
                    Add the essentials only. NutriHelp will save your recipe privately and show it in My Recipes.
                  </p>
                </div>
              </div>
              {/* Recipe Description Section */}
              <div
                id="no-bg"
                className="bg-[#d8edfd] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8  border border-[#005BBB]"
              >
                <h2
                  id="no-bg"
                  className="font-[Arial] text-lg sm:text-xl md:text-2xl font-medium mb-4 sm:mb-6"
                >
                  Recipe Description
                </h2>
                <div
                  id="no-bg"
                  className="flex flex-col gap-6 w-full"
                >
                  <div
                    id="no-bg"
                    className="flex flex-col justify-start items-start gap-4 sm:gap-6 w-full"
                  >
                    <div
                      id="no-bg"
                      className="flex flex-col w-full gap-2"
                    >
                      <label
                        id="no-bg"
                        className="font-[Arial] text-lg sm:text-base md:text-lg "
                      >
                        Recipe Name
                      </label>
                      <input
                        id="no-bg"
                        name="recipeName"
                        className={`w-full rounded-xl h-10 sm:h-12 border px-4 ${errors.recipeName && touched.recipeName ? 'border-red-500' : 'border-gray-400'}`}
                        placeholder="Enter Recipe Name"
                        value={formData.recipeName}
                        onChange={(e) => handleFieldChange("recipeName", e.target.value)}
                        onBlur={() => setTouched(prev => ({ ...prev, recipeName: true }))}
                      />
                      <FieldError error={errors.recipeName} touched={touched.recipeName} />
                    </div>

                    <div
                      id="no-bg"
                      className="flex flex-col w-full gap-2"
                    >
                      <label
                        id="no-bg"
                        className="font-[Arial] text-sm sm:text-base md:text-lg"
                      >
                        Cuisine Type
                      </label>
                      <select
                        id="no-bg"
                        name="cuisine"
                        className={`w-full rounded-xl h-10 sm:h-12 border px-4 bg-white ${errors.cuisine && touched.cuisine ? 'border-red-500' : 'border-gray-400'}`}
                        value={formData.cuisine}
                        onChange={(e) => handleFieldChange("cuisine", e.target.value)}
                        onBlur={() => setTouched(prev => ({ ...prev, cuisine: true }))}
                      >
                        <option value="">Select Cuisine Type</option>
                        {cuisineOptions}
                      </select>
                      <FieldError error={errors.cuisine} touched={touched.cuisine} />
                    </div>
                  </div>

                  <div
                    id="no-bg"
                    className="flex flex-col w-full gap-3 mt-2"
                  >
                    <label
                      id="no-bg"
                      className="font-[Arial] text-sm sm:text-base md:text-lg sm:mr-4"
                    >
                      Add Image
                    </label>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      id="file-upload"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="create-recipe-upload-row">
                      <label
                        htmlFor="file-upload"
                        id="no-bg"
                        className="font-[Arial] bg-[#005BBB] text-white px-4 sm:px-6 py-3 sm:py-6 rounded-full font-semibold text-sm sm:text-base cursor-pointer w-fit"
                      >
                        {selectedImageName ? "Change Image" : "Choose Image"}
                      </label>
                      {selectedImageName ? (
                        <button
                          type="button"
                          className="create-recipe-clear-image"
                          onClick={clearSelectedImage}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <p className="create-recipe-upload-hint">
                      {selectedImageName || "PNG, JPG, or WEBP. Image is optional."}
                    </p>
                    {imagePreviewUrl ? (
                      <div className="create-recipe-image-preview">
                        <img src={imagePreviewUrl} alt="Selected recipe preview" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              {/* Cooking Description Section */}
              <div
                id="no-bg"
                className="bg-[#d8edfd] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8  border border-[#005BBB]"
              >
                <h2
                  id="no-bg"
                  className="font-[Arial] text-lg sm:text-xl md:text-2xl font-medium mb-4 sm:mb-6"
                >
                  Cooking Description
                </h2>
                <div id="no-bg"
                  className="flex flex-col gap-6 w-full"
                >
                  <div
                    id="no-bg"
                    className="flex flex-col w-full gap-2"
                  >
                    <label
                      id="no-bg"
                      className="font-[Arial] text-lg sm:text-base md:text-lg"
                    >
                      Preparation Time
                    </label>
                    <input
                      id="no-bg"
                      name="preparationTime"
                      inputMode="numeric"
                      pattern="[1-9][0-9]*"
                      className={`w-full rounded-xl h-10 sm:h-12 border px-4 ${errors.preparationTime && touched.preparationTime ? 'border-red-500' : 'border-gray-400'}`}
                      placeholder="Minutes, e.g. 40"
                      value={formData.preparationTime}
                      onChange={(e) =>
                        handleFieldChange("preparationTime", e.target.value)
                      }
                      onBlur={() => setTouched(prev => ({ ...prev, preparationTime: true }))}
                    />
                    <FieldError error={errors.preparationTime} touched={touched.preparationTime} />
                  </div>

                  <div
                    id="no-bg"
                    className="flex flex-col w-full gap-2"
                  >
                    <label
                      id="no-bg"
                      className="font-[Arial] text-sm sm:text-base md:text-lg"
                    >
                      Total Servings
                    </label>
                    <input
                      id="no-bg"
                      name="totalServings"
                      inputMode="numeric"
                      pattern="[1-9][0-9]*"
                      className={`w-full rounded-xl h-10 sm:h-12 border px-4 ${errors.totalServings && touched.totalServings ? 'border-red-500' : 'border-gray-400'}`}
                      placeholder="Servings, e.g. 2"
                      value={formData.totalServings}
                      onChange={(e) =>
                        handleFieldChange("totalServings", e.target.value)
                      }
                      onBlur={() => setTouched(prev => ({ ...prev, totalServings: true }))}
                    />
                    <FieldError error={errors.totalServings} touched={touched.totalServings} />
                  </div>

                  <div
                    id="no-bg"
                    className="flex flex-col w-full gap-2"
                  >
                    <label
                      id="no-bg"
                      className="font-[Arial] text-sm sm:text-base md:text-lg"
                    >
                      Cooking Method
                    </label>
                    <select
                      id="no-bg"
                      name="cookingMethod"
                      className={`w-full rounded-xl h-10 sm:h-12 border px-4 bg-white ${errors.cookingMethod && touched.cookingMethod ? 'border-red-500' : 'border-gray-400'}`}
                      value={formData.cookingMethod}
                      onChange={(e) =>
                        handleFieldChange("cookingMethod", e.target.value)
                      }
                      onBlur={() => setTouched(prev => ({ ...prev, cookingMethod: true }))}
                    >
                      <option value="">Select Cooking Method</option>
                      {cookingMethodOptions}
                    </select>
                    <FieldError error={errors.cookingMethod} touched={touched.cookingMethod} />
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div
                id="no-bg"
                className="bg-[#d8edfd] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8  border border-[#005BBB]"
              >
                <div className="w-full flex justify-between items-center">
                  <h2
                    id="no-bg"
                    className="font-[Arial] text-lg sm:text-xl md:text-2xl font-medium mb-4 sm:mb-6"
                  >
                    Ingredients
                  </h2>
                  {showIngredients ? (
                    <MdArrowDropUp
                      size={24}
                      className="cursor-pointer text-black"
                      onClick={() => setShowIngredients(!showIngredients)}
                    />
                  ) : (
                    <MdArrowDropDown
                      size={24}
                      className="cursor-pointer text-black"
                      onClick={() => setShowIngredients(!showIngredients)}
                    />
                  )}
                </div>
                <FieldError error={errors.tableData} touched={attemptedSubmit} />
                {showIngredients && (
                  <FramerClient>
                    <div
                      id="no-bg"
                      className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6"
                    >
                      <div
                        id="no-bg"
                        className="flex flex-col w-full sm:w-1/2"
                      >
                        <label
                          id="no-bg"
                          className="font-[Arial] text-sm sm:text-base md:text-lg mb-1"
                        >
                          Category
                        </label>
                        <select
                          id="no-bg"
                          className="w-full sm:w-2/3 rounded-xl h-10 sm:h-12 border border-gray-400 px-4 bg-white"
                          defaultValue=""
                          onChange={(e) =>
                            handleFieldChange("ingredientCategory", e.target.value)
                          }
                          value={formData.ingredientCategory}
                        >
                          <option value="" disabled>
                            Select one
                          </option>
                          <option value="meat">Meat</option>
                          <option value="vegetables">Vegetables</option>
                          <option value="grains">Grains</option>
                          <option value="carbs">Carbs</option>
                          <option value="dairy">Dairy</option>
                          <option value="spices">Spices</option>
                        </select>
                        <FieldError error={errors.ingredientCategory} touched={touched.ingredientCategory} />
                      </div>

                      <div
                        id="no-bg"
                        className="flex flex-col w-full sm:w-1/2"
                      >
                        <label
                          id="no-bg"
                          className="font-[Arial] text-lg sm:text-base md:text-lg mb-2"
                        >
                          Ingredient Name
                        </label>
                        <input
                          id="no-bg"
                          name="ingredient"
                          list="create-recipe-ingredient-options"
                          className="w-full sm:w-2/3 rounded-xl h-10 sm:h-12 border border-gray-400 px-4 bg-white"
                          value={formData.ingredient}
                          onChange={(e) =>
                            handleFieldChange("ingredient", e.target.value)
                          }
                          onBlur={() => setTouched(prev => ({ ...prev, ingredient: true }))}
                          placeholder="Type ingredient name"
                        />
                        <datalist id="create-recipe-ingredient-options">
                          {ingredientOptions.map((ingredient) => (
                            <option
                              key={`${ingredient.id}-${ingredient.label || ingredient.value}`}
                              value={ingredient.label || ingredient.value}
                            />
                          ))}
                        </datalist>
                        <FieldError error={errors.ingredient} touched={touched.ingredient} />
                      </div>
                    </div>

                    <div
                      id="no-bg"
                      className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8 w-full"
                    >
                      <div
                        id="no-bg"
                        className="flex flex-col w-full sm:w-1/2"
                      >
                        <label
                          id="no-bg"
                          className="font-[Arial] text-lg sm:text-base md:text-lg mb-1"
                        >
                          Quantity
                        </label>
                        <div className="flex items-center w-full sm:w-2/3 space-x-2">
                          <input
                            id="no-bg"
                            //list="units"
                            inputMode="decimal"
                            pattern="^(?:[1-9][0-9]*|0?\\.[0-9]+)(?:\\.[0-9]+)?$"
                            className="w-full sm:w-2/3 rounded-xl h-10 sm:h-12 border border-gray-400 px-4 bg-white"
                            defaultValue=""
                            value={formData.ingredientQuantity}
                            onChange={(e) =>
                              handleFieldChange("ingredientQuantity", e.target.value)
                            }
                            onBlur={() => setTouched(prev => ({ ...prev, ingredientQuantity: true }))}
                          />
                          <FieldError error={errors.ingredientQuantity} touched={touched.ingredientQuantity} />
                          {/*      <datalist id="units">
                          <option value="ml" />
                          <option value="g" />
                          <option value="cups" />
                          <option value="tbsp" />
                          <option value="tsp" />
                        </datalist> */}
                          <select
                            id="no-bg"
                            className="w-full sm:w-2/3 rounded-xl h-10 sm:h-12 border border-gray-400 px-4 bg-white"
                            defaultValue=""
                          /*   value={ingredientQuantity}
                          onChange={(e) =>
                            handleIngredientQuantityChange(e.target.value)
                          } */
                          >
                            <option value="" disabled>
                              Select one
                            </option>
                            <option value="ml">Ml</option>
                            <option value="g">G</option>
                            <option value="cups">Cups</option>
                            <option value="tbsp">Tbsp</option>
                            <option value="tsp"></option>
                          </select>
                        </div>
	                      </div>

	                      <div
	                        id="no-bg"
	                        className="flex flex-col w-full sm:w-1/2"
	                      >
	                        <label
	                          id="no-bg"
	                          className="font-[Arial] text-lg sm:text-base md:text-lg mb-1"
	                        >
	                          Estimated Cost (AUD)
	                        </label>
	                        <input
	                          id="no-bg"
	                          name="ingredientCost"
	                          inputMode="decimal"
	                          pattern="^(?:[1-9][0-9]*|0?\\.[0-9]+)(?:\\.[0-9]{1,2})?$"
	                          className="w-full sm:w-2/3 rounded-xl h-10 sm:h-12 border border-gray-400 px-4 bg-white"
	                          value={formData.ingredientCost}
	                          onChange={(e) =>
	                            handleFieldChange("ingredientCost", e.target.value)
	                          }
	                          onBlur={() => setTouched(prev => ({ ...prev, ingredientCost: true }))}
	                          placeholder="Optional, e.g. 2.50"
	                        />
	                        <FieldError error={errors.ingredientCost} touched={touched.ingredientCost} />
	                      </div>

	                      <div
	                        id="no-bg"
	                        className="flex items-center justify-start sm:justify-start sm:w-1/2"
                      >
                        <button
                          type="button"
                          id="no-bg"
                          className="font-[Arial] bg-[#005BBB] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
                          onClick={() => handelIngredientsInTable()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div id="no-bg" className="overflow-x-auto">
                      <table
                        id="no-bg"
                        className="min-w-full border border-gray-300"
                      >
                        <thead id="no-bg" className="bg-[#005BBB] text-white">
                          <tr>
                            <th
                              id="no-bg"
                              className="font-[Arial] border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                            >
                              Category
                            </th>
                            <th
                              id="no-bg"
                              className="font-[Arial] border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                            >
                              Ingredient
                            </th>
	                            <th
	                              id="no-bg"
	                              className="font-[Arial] border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
	                            >
	                              Quantity
	                            </th>
	                            <th
	                              id="no-bg"
	                              className="font-[Arial] border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
	                            >
	                              Cost (AUD)
	                            </th>
	                            <th
	                              id="no-bg"
	                              className="font-[Arial] border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ingredients.map((item, index) => (
                            <motion.tr
                              id="no-bg"
                              className="bg-[#F4F4F4]"
                              key={index}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <td
                                id="no-bg"
                                className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                              >
                                {item.ingredientCategory}
                              </td>
                              <td
                                id="no-bg"
                                className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                              >
                                {item.ingredient}
                              </td>
                              <td
                                id="no-bg"
                                className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
	                              >
	                                {item.ingredientQuantity}
	                              </td>
	                              <td
	                                id="no-bg"
	                                className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
	                              >
	                                {item.ingredientCost ? `$${Number(item.ingredientCost).toFixed(2)}` : "NA"}
	                              </td>
	                              <td
	                                id="no-bg"
	                                className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                              >
                                {item.ingredientCategory &&
                                  item.ingredient &&
                                  item.ingredientQuantity && (
                                    <div className="flex justify-center items-center gap-x-4">
                                      <div
                                        id="no-bg"
                                        className="text-red-500 cursor-pointer"
                                        onClick={() => {
                                          handleRemoveTableData(index);
                                        }}
                                      >
                                        <RiDeleteBin6Fill
                                          className="text-black"
                                          size={24}
                                        />
                                      </div>
                                      <div
                                        id="no-bg"
                                        className="text-blue-500 mr-2 cursor-pointer"
                                        onClick={() => {
                                          setFormData((prev) => ({
                                            ...prev,
	                                            ingredientCategory: item.ingredientCategory,
	                                            ingredient: item.ingredient,
	                                            ingredientQuantity: item.ingredientQuantity,
	                                            ingredientCost: item.ingredientCost || "",
	                                          }));
                                          handleRemoveTableData(index);
                                        }}
                                      >
                                        <MdEdit
                                          className="text-black"
                                          size={24}
                                        />
                                      </div>
                                    </div>
                                  )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </FramerClient>
                )}
              </div>

              {/* Instructions Section */}
              <div
                id="no-bg"
                className="bg-[#d8edfd] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 w-full  border border-[#005BBB]"
              >
                <h2
                  id="no-bg"
                  className="font-[Arial] text-lg sm:text-xl md:text-2xl font-medium mb-4 sm:mb-6"
                >
                  Instructions
                </h2>
                <FieldError error={errors.instructions} touched={attemptedSubmit} />
                {instruction.length > 0 && (
                  <div className="mt-4 w-full">
                    {instruction.map((item, index) => (
                      <FramerClient key={index}>
                        <div
                          id="no-bg"
                          className="w-full flex flex-col justify-start sm:flex-row mb-4 sm:mb-6"
                        >
                          <div id="no-bg" className="w-full sm:w-1/6">
                            <button
                              type="button"
                              id="no-bg"
                              className="w-full bg-[#005BBB] text-white py-2 sm:py-3 px-4 font-semibold text-sm sm:text-base"
                            >
                              Step {index + 1}:
                            </button>
                          </div>
                          <div className="flex justify-start items-center w-full sm:w-3/4">
                            <input
                              id="no-bg"
                              className="w-full sm:w-3/4 h-full py-2 sm:py-3 px-4 bg-white"
                              placeholder="Enter step by step instructions here..."
                              value={item}
                              disabled
                            />
                            <div className="w-full -ml-[8px] bg-white text-black px-2 sm:px-3 py-1 sm:py-2 cursor-pointer flex items-center justify-end h-full gap-4">
                              <RiDeleteBin6Fill
                                onClick={() => {
                                  setInstruction((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                              />
                              <MdEdit
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    currentInstruction: item,
                                  }));
                                  setInstruction((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </FramerClient>
                    ))}
                  </div>
                )}

                <FramerClient>
                  <div
                    id="no-bg"
                    className="w-full flex flex-col justify-start sm:flex-row mb-4 sm:mb-6"
                    style={{ gap: "16px", alignItems: "center" }}
                  >
                    <div id="no-bg" className="w-full sm:w-1/6">
                      <button
                        type="button"
                        id="no-bg"
                        className="w-full bg-[#005BBB] text-white py-2 sm:py-3 px-4 font-semibold text-sm sm:text-base"
                      >
                        Step {instruction.length + 1}:
                      </button>
                    </div>
                    <input
                      id="no-bg"
                      className="w-full -ml-[8px] sm:w-3/4 border border-gray-400 py-2 sm:py-3 px-4"
                      placeholder="Enter step by step instructions here..."
                      value={formData.currentInstruction}
                      onChange={(e) => handleFieldChange("currentInstruction", e.target.value)}
                    />
                  </div>

                  <div id="no-bg"
                    className="flex items-center justify-start sm:justify-start sm:w-1/2"
                  >
                    <button
                      id="no-bg"
                      type="button"
                      className="font-[Arial] bg-[#005BBB] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
                      onClick={() => {
                        const nextInstruction = String(formData.currentInstruction || "").trim();
                        if (!nextInstruction) return;
                        setInstruction((prev) => [...prev, nextInstruction]);
                        setErrors((prev) => ({ ...prev, instructions: undefined }));
                        setFormData((prev) => ({ ...prev, currentInstruction: "" }));
                      }}
                    >
                      Add
                    </button>
                  </div>
                </FramerClient>
              </div>

              {/* Submit Button */}
              <div id="no-bg" className="flex justify-center">
                <button
                  type="submit"
                  id="no-bg"
                  // disabled={!instructions.trim()}
                  className="font-[Arial] bg-[#005BBB] text-white w-full max-w-xs px-8 py-3 rounded-full font-semibold text-lg shadow-xl shadow-blue-800/50  hover:bg-[#003f8a] transition duration-300"
                >
                  Save  Recipe
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </FramerClient>
  );
}

export default CreateRecipe;
