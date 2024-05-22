import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useState } from "react";

function DashboardGraph(props) {

    const { totalNutritionCalorie, totalNutritionProtiens, totalNutritionFats, totalNutritionVitamins, totalNutritionSodium } = props;

    const nutrition_data = [
        { name: 'Calories', data_value: totalNutritionCalorie },
        { name: 'Proteins', data_value: totalNutritionProtiens },
        { name: 'Fats', data_value: totalNutritionFats },
        { name: 'Vitamins', data_value: totalNutritionVitamins },
        { name: 'Sodium', data_value: totalNutritionSodium }
    ];

    return (
        <>
        <br />
        <br />

                <BarChart
                    width={400}
                    height={400}
                    data={nutrition_data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="data_value" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
                </BarChart>


            {/* <div>
                <p>{props.totalNutritionCalorie}</p>
                <p>{props.totalNutritionProtiens}</p>
                <p>{props.totalNutritionFats}</p>
                <p>{props.totalNutritionVitamins}</p>
                <p>{props.totalNutritionSodium}</p>
            </div> */}
        </>
    )
}

export default DashboardGraph;
