import './Meal.css'; // Import your CSS file here

import { Link, Outlet, useNavigate } from 'react-router-dom';
import React, { createContext, useCallback, useState } from 'react';
import { Grid, GridColumn, GridRow, Segment } from 'semantic-ui-react';

const Meal = () => {
	const [selectedItems, setSelectedItems] = useState([]);
	const [totalNutrition, setTotalNutrition] = useState({
		calories: 0,
		proteins: 0,
		fats: 0,
		vitamins: 0,
		sodium: 0,
	});
	const [showBreakfast, setShowBreakfast] = useState(true);
	const [showLunch, setShowLunch] = useState(false);
	const [showDinner, setShowDinner] = useState(false);
	const date = new Date();

	const toggleItemSelection = (item, mealType) => {
		setSelectedItems((prevSelectedItems) => {
			const itemExists = prevSelectedItems.find(
				(selectedItem) => selectedItem.name === item.name
			);
			if (itemExists) {
				return prevSelectedItems.filter(
					(selectedItem) => selectedItem.name !== item.name
				);
			} else {
				return [...prevSelectedItems, { ...item, mealType }];
			}
		});
	};
	// List of food items
	const breakfast = [
		{
			name: 'Oats',
			imageUrl:
				'https://images.immediate.co.uk/production/volatile/sites/30/2023/08/Porridge-oats-d09fae8.jpg?quality=90&resize=440,400',
			details: {
				calories: 150,
				fats: 300,
				proteins: 500,
				vitamins: 80,
				sodium: 300,
			},
		},
		{
			name: 'Juice',
			imageUrl:
				'https://www.eatingwell.com/thmb/NJFf9k59wViDdqO_0kp-Mc-KNH8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/3749033-b30c69279d9341468bb4cf5dab18c578.jpg',
			details: {
				calories: 150,
				fats: 300,
				proteins: 500,
				vitamins: 180,
				sodium: 100,
			},
		},
		{
			name: 'Coffee',
			imageUrl:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQspESde7KZewIFjQzIIZYHXP0pwks2AhfSIw&s',
			details: {
				calories: 200,
				fats: 100,
				proteins: 600,
				vitamins: 880,
				sodium: 30,
			},
		},
		{
			name: 'Bread',
			imageUrl:
				'https://www.allrecipes.com/thmb/CjzJwg2pACUzGODdxJL1BJDRx9Y=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/6788-amish-white-bread-DDMFS-4x3-6faa1e552bdb4f6eabdd7791e59b3c84.jpg',
			details: {
				calories: 500,
				fats: 700,
				proteins: 600,
				vitamins: 50,
				sodium: 60,
			},
		},
	];

	const lunch = [
		{
			name: 'Rice',
			imageUrl:
				'https://www.health.com/thmb/AcaOIOijkWe2IaNA13jnRHlMPuM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/GettyImages-1734160670-0157c2daf8e841d6a783b38aedc51aa8.jpg',
			details: {
				calories: 350,
				fats: 500,
				proteins: 100,
				vitamins: 90,
				sodium: 5,
			},
		},
		{
			name: 'Chicken',
			imageUrl:
				'https://www.savorynothings.com/wp-content/uploads/2022/05/bbq-chicken-recipe-image-sq.jpg',
			details: {
				calories: 150,
				fats: 300,
				proteins: 500,
				vitamins: 30,
				sodium: 30,
			},
		},
		{
			name: 'Eggs',
			imageUrl:
				'https://img.taste.com.au/82yZmkbv/w720-h480-cfill-q80/taste/2018/02/cls0318eggss_eggs-135792-1.jpg',
			details: {
				calories: 20,
				fats: 600,
				proteins: 700,
				vitamins: 180,
				sodium: 30,
			},
		},
		{
			name: 'Vegetables',
			imageUrl:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNULJ6YE0WsLqqBUs3ozHh6rkZDFAJlXzlFw&s',
			details: {
				calories: 500,
				fats: 700,
				proteins: 600,
				vitamins: 220,
				sodium: 20,
			},
		},
	];

	const dinner = [
		{
			name: 'Chapati',
			imageUrl:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRou7RdQv8MvcMRYOHpQW6bs_XY0JEcqyijYA&s',
			details: {
				calories: 250,
				fats: 500,
				proteins: 100,
				vitamins: 30,
				sodium: 90,
			},
		},
		{
			name: 'Fish',
			imageUrl:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3FMXHDRZBtsdJHVpdJQtnsQBcCuuJWJn4hQ&s',
			details: {
				calories: 150,
				fats: 100,
				proteins: 500,
				vitamins: 80,
				sodium: 300,
			},
		},
		{
			name: 'Milk',
			imageUrl:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyZvE6VXWPj1pHJ8_-osnBvnxxtfIlpwghBg&s',
			details: {
				calories: 800,
				fats: 700,
				proteins: 900,
				vitamins: 880,
				sodium: 0,
			},
		},
		{
			name: 'Meat',
			imageUrl:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW6g56cRr8GIUoVEj2sLhohIJp1NMTVulnAg&s',
			details: {
				calories: 150,
				fats: 300,
				proteins: 500,
				vitamins: 680,
				sodium: 30,
			},
		},
	];
	// Function to find the details for a specific meal type
	const findItemDetails = (itemName) => {
		// Search in breakfast array
		let item = breakfast.find((item) => item.name === itemName);
		if (item) return item.details;

		// Search in lunch array
		item = lunch.find((item) => item.name === itemName);
		if (item) return item.details;

		// Search in dinner array
		item = dinner.find((item) => item.name === itemName);
		if (item) return item.details;

		// Item not found, return empty details
		return { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 };
	};
	// Update total nutrition whenever selected items change
	React.useEffect(() => {
		let totalCalories = 0;
		let totalProteins = 0;
		let totalFats = 0;
		let totalVitamins = 0;
		let totalSodium = 0;

		selectedItems.forEach((item) => {
			const details = findItemDetails(item.name);
			totalCalories += details.calories;
			totalProteins += details.proteins;
			totalFats += details.fats;
			totalVitamins += details.vitamins;
			totalSodium += details.sodium;
		});

		setTotalNutrition({
			calories: totalCalories,
			proteins: totalProteins,
			fats: totalFats,
			vitamins: totalVitamins,
			sodium: totalSodium,
		});
	}, [selectedItems]);

	const isItemSelected = useCallback(
		(item) => {
			return !!selectedItems.find((menuItem) => {
				return menuItem.name === item.name;
			});
		},
		[selectedItems]
	);

	return (
		<div className='meal-planner-container'>
			<Grid>
				<GridRow className='meal-planner-heading-wrapper'>
					<GridColumn width={10} className='heading-container'>
						<span className='main-heading'>Today's</span> Meal Plan
					</GridColumn>
					<GridColumn width={6} className='date-container'>
						{date.getDate()} / {date.getMonth()} / {date.getFullYear()}
					</GridColumn>
				</GridRow>
				<GridRow>
					<GridColumn className='banner-container' />
				</GridRow>
				{
					<GridRow>
						<GridColumn width={10}>
							<Grid columns='equal' className='meal-content-container'>
								<GridRow className='meal-portion-text'>
									<GridColumn width={16}>Breakfast</GridColumn>
								</GridRow>
								<GridRow>
									<GridColumn width={16}>
										<Grid columns='equal'>
											<GridRow>
												{breakfast.map((item) => (
													<GridColumn
														className='meal-breakfast-image-container'
														key={item.name}
													>
														<img
															onClick={() =>
																toggleItemSelection(item, 'breakfast')
															}
															src={item.imageUrl}
															alt={item.name}
															className={`meal-image ${
																isItemSelected(item) && 'selected'
															}`}
														/>
														<div className='meal-name'>{item.name}</div>
													</GridColumn>
												))}
											</GridRow>
										</Grid>
									</GridColumn>
								</GridRow>

								<GridRow className='meal-portion-text'>
									<GridColumn width={16}>Lunch</GridColumn>
								</GridRow>
								<GridRow>
									<GridColumn width={16}>
										<Grid columns='equal'>
											<GridRow>
												{lunch.map((item) => (
													<GridColumn
														className='meal-breakfast-image-container'
														key={item.name}
													>
														<img
															onClick={() => toggleItemSelection(item, 'lunch')}
															src={item.imageUrl}
															alt={item.name}
															className={`meal-image ${
																isItemSelected(item) && 'selected'
															}`}
														/>
														<div className='meal-name'>{item.name}</div>
													</GridColumn>
												))}
											</GridRow>
										</Grid>
									</GridColumn>
								</GridRow>

								<GridRow className='meal-portion-text'>
									<GridColumn width={16}>Dinner</GridColumn>
								</GridRow>
								<GridRow>
									<GridColumn width={16}>
										<Grid columns='equal'>
											<GridRow>
												{dinner.map((item) => (
													<GridColumn
														className='meal-breakfast-image-container'
														key={item.name}
													>
														<img
															onClick={() =>
																toggleItemSelection(item, 'dinner')
															}
															src={item.imageUrl}
															alt={item.name}
															className={`meal-image ${
																isItemSelected(item) && 'selected'
															}`}
														/>
														<div className='meal-name'>{item.name}</div>
													</GridColumn>
												))}
											</GridRow>
										</Grid>
									</GridColumn>
								</GridRow>
							</Grid>
						</GridColumn>
						{/* nutrition value code here */}
					</GridRow>
				}
			</Grid>
		</div>
	);
};

export default Meal;
