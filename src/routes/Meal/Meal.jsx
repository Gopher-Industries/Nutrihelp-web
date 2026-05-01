import "./Meal.css";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BarChart3,
  Check,
  Calculator,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { fetchDishImage } from "../../services/dishImageApi";
import { readScanLogEntries, SCAN_LOG_UPDATED_EVENT } from "../../utils/scanLogStorage";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PersonalizedPlanForm from "./PersonalizedPlanForm";
import PersonalizedWeeklyPlan from "./PersonalizedWeeklyPlan";

const FILTERS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "others", label: "Others" },
  { key: "scan", label: "Scan" },
  { key: "all", label: "All" },
  { key: "selected", label: "Selected" },
];

const SELECTED_VIEW_SECTIONS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "others", label: "Snack" },
];

const MEAL_SELECTIONS_STORAGE_KEY = "nutrihelp_add_meal_selections_by_date_v1";
const DEFAULT_FLOATING_BOTTOM = 18;
const FLOATING_STACK_GAP = 12;
const DEFAULT_WIDGET_BOTTOM = DEFAULT_FLOATING_BOTTOM + 48 + FLOATING_STACK_GAP;
const RECOMMENDED_SCROLLBAR_INSET = 2;
const RECOMMENDED_SCROLLBAR_MIN_THUMB = 56;

function getTodayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function readSelectionsByDateFromStorage() {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(MEAL_SELECTIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function shiftISODate(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function getMealGridColumns() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth <= 900) return 1;
  if (window.innerWidth <= 1360) return 2;
  return 3;
}

const IMAGE_FALLBACK_SRC = "/images/meal-mock/placeholder.svg";
const DYNAMIC_IMAGE_ENRICHMENT_STORAGE_KEY = "nutrihelp_meal_image_enrichment_queue_v1";

const UNSPLASH_MOCK_MEAL_IMAGES = {
  "rec-1": {
    image: "https://images.unsplash.com/photo-1585218308917-a1657a10c5ae?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxPYXRtZWFsJTIwd2l0aCUyMEJsdWViZXJyaWVzJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgwM3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/blue-berries-on-brown-ceramic-bowl-qQl4Ga5NjMA",
    attribution: "Yehor Milohrodskyi",
    alt: "blue berries on brown ceramic bowl"
  },
  "rec-2": {
    image: "https://images.unsplash.com/photo-1593450298063-4e08a162a437?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxHcmVlayUyMFlvZ3VydCUyMFBhcmZhaXQlMjBmb29kJTIwZGlzaHxlbnwxfDB8fHwxNzc3MzEwODA0fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/ice-cream-with-sliced-lemon-on-white-ceramic-plate-uTOUS5_guHg",
    attribution: "Daniel Cabriles",
    alt: "ice cream with sliced lemon on white ceramic plate"
  },
  "rec-3": {
    image: "https://images.unsplash.com/photo-1580683750935-cecfc7ea57f0?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxRdWlub2ElMjBTYWxtb24lMjBCb3dsJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgwNHww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/vegetable-salad-on-blue-ceramic-bowl-dcUigR5qrD4",
    attribution: "Anton Jansson",
    alt: "vegetable salad on blue ceramic bowl"
  },
  "rec-4": {
    image: "https://images.unsplash.com/photo-1771384552858-feb0574f958d?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxDaGlja2VuJTIwVGVyaXlha2klMjBSaWNlJTIwQm93bCUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MDV8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-delicious-meal-of-grilled-salmon-with-rice-and-vegetables-fahnPDK0GQA",
    attribution: "Jonathan Majam",
    alt: "A delicious meal of grilled salmon with rice and vegetables"
  },
  "rec-5": {
    image: "https://images.unsplash.com/photo-1767114915989-c6ab3c8fc42e?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxMZW50aWwlMjAlMjYlMjBWZWdldGFibGUlMjBDdXJyeSUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MDZ8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/three-bowls-of-indian-food-with-rice-and-spices-aq8v45EwCa0",
    attribution: "Chetanya Sharma",
    alt: "Three bowls of indian food with rice and spices"
  },
  "rec-6": {
    image: "https://images.unsplash.com/photo-1573691843386-8b311aefa811?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxHcmlsbGVkJTIwU2FsbW9uJTIwJTI2JTIwQXNwYXJhZ3VzJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgwN3ww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/plate-of-asparagus-beside-fork-i31hiD8LINA",
    attribution: "Tim Bish",
    alt: "plate of asparagus beside fork"
  },
  "rec-7": {
    image: "https://images.unsplash.com/photo-1631606517999-3778ba6f7d0b?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxNYW5nbyUyMENoaWElMjBQdWRkaW5nJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgwOHww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-glass-filled-with-a-drink-sitting-on-top-of-a-wooden-table-xMTdy87_bPs",
    attribution: "Alexey Demidov",
    alt: "a glass filled with a drink sitting on top of a wooden table"
  },
  "rec-8": {
    image: "https://images.unsplash.com/photo-1732216714035-90972b82b6c0?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxIdW1tdXMlMjBWZWdnaWUlMjBTbmFjayUyMFBsYXRlJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgwOXww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-person-dipping-dip-into-a-bowl-of-vegetables-ekPs0NUwLzU",
    attribution: "Amber BC",
    alt: "A person dipping dip into a bowl of vegetables"
  },
  "meal-1": {
    image: "https://images.unsplash.com/photo-1559753475-d6165680861f?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxBdm9jYWRvJTIwVG9hc3QlMjB3aXRoJTIwUG9hY2hlZCUyMEVnZyUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MDl8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/plate-of-cooked-food-F2bvs85qmCU",
    attribution: "Fatema Enayath",
    alt: "plate of cooked food"
  },
  "meal-2": {
    image: "https://images.unsplash.com/photo-1626026670784-5f4550b9d01e?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxTcGluYWNoJTIwTXVzaHJvb20lMjBPbWVsZXR0ZSUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MTB8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/green-vegetable-on-white-ceramic-bowl-dM7JCxPvr8o",
    attribution: "Mikey Frost",
    alt: "green vegetable on white ceramic bowl"
  },
  "meal-3": {
    image: "https://images.unsplash.com/photo-1570696516188-ade861b84a49?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxCZXJyeSUyMEJhbmFuYSUyMFNtb290aGllJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgxMXww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/pink-smoothie-hsTwPUzFegQ",
    attribution: "Denis",
    alt: "pink smoothie"
  },
  "meal-4": {
    image: "https://images.unsplash.com/photo-1613939490799-4a500f7120b7?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxTbW9rZWQlMjBTYWxtb24lMjBCYWdlbCUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MTJ8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/sliced-tomato-and-green-vegetable-on-white-ceramic-plate-Q-rJdmXfpQo",
    attribution: "Patrick Perkins",
    alt: "sliced tomato and green vegetable on white ceramic plate"
  },
  "meal-5": {
    image: "https://images.unsplash.com/photo-1496568554266-bc8a06b4d8b5?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxQcm90ZWluJTIwUGFuY2FrZXMlMjBmb29kJTIwZGlzaHxlbnwxfDB8fHwxNzc3MzEwODEzfDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/shallow-focus-photography-of-pancake-with-strawberries-and-blueberries-on-top-CKipn7XSyEU",
    attribution: "Piotr Chrobot",
    alt: "shallow focus photography of pancake with strawberries and blueberries on top"
  },
  "meal-6": {
    image: "https://images.unsplash.com/photo-1565843671519-32c5e41ba754?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxDaGlhJTIwU2VlZCUyMFB1ZGRpbmclMjBmb29kJTIwZGlzaHxlbnwxfDB8fHwxNzc3MzEwODE0fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/clear-drinking-glass-Jwz8ZMxhoSs",
    attribution: "Marc Mintel",
    alt: "clear drinking glass"
  },
  "meal-7": {
    image: "https://images.unsplash.com/photo-1631021967255-898a52176fea?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxDaGlja2VuJTIwQ2Flc2FyJTIwV3JhcCUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MTV8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/white-ceramic-plate-with-green-vegetable-and-meat-dish-Ztwy9M_vDZg",
    attribution: "Vije Vijendranath",
    alt: "white ceramic plate with green vegetable and meat dish"
  },
  "meal-8": {
    image: "https://images.unsplash.com/photo-1580683750935-cecfc7ea57f0?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxRdWlub2ElMjBTYWxtb24lMjBCb3dsJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgwNHww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/vegetable-salad-on-blue-ceramic-bowl-dcUigR5qrD4",
    attribution: "Anton Jansson",
    alt: "vegetable salad on blue ceramic bowl"
  },
  "meal-9": {
    image: "https://images.unsplash.com/photo-1729708475167-71a6eb3cd741?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxTaHJpbXAlMjBQYWQlMjBUaGFpJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgxNnww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-plate-of-food-with-shrimp-rice-and-lime-m-NH87VbQK0",
    attribution: "Antonio Araujo",
    alt: "A plate of food with shrimp, rice, and lime"
  },
  "meal-10": {
    image: "https://images.unsplash.com/photo-1624801111298-28ae6b0c2242?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxUdW5hJTIwTmljb2lzZSUyMFNhbGFkJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgxNnww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/vegetable-salad-on-white-ceramic-plate-Tac7_RQFFh4",
    attribution: "tommao wang",
    alt: "vegetable salad on white ceramic plate"
  },
  "meal-11": {
    image: "https://images.unsplash.com/photo-1628191010210-a59de33e5941?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxUdXJrZXklMjBWZWdnaWUlMjBTYW5kd2ljaCUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MTd8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/burger-with-lettuce-and-tomato-U0BzBTt-5so",
    attribution: "Hillshire Farm",
    alt: "burger with lettuce and tomato"
  },
  "meal-12": {
    image: "https://images.unsplash.com/photo-1680990999782-ba7fe26e4d0b?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxNZWRpdGVycmFuZWFuJTIwQnVkZGhhJTIwQm93bCUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MTd8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-white-plate-topped-with-meatballs-and-a-salad-WVoLfiKbYBQ",
    attribution: "Zoshua Colah",
    alt: "a white plate topped with meatballs and a salad"
  },
  "meal-13": {
    image: "https://images.unsplash.com/photo-1649366095449-128ddc5ac76f?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxMZW1vbiUyMEhlcmIlMjBCYWtlZCUyMFNhbG1vbiUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MTh8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-white-bowl-filled-with-sliced-up-lemons-and-broccoli-1tfY-1x5kV0",
    attribution: "Hyeonyoung Yang",
    alt: "a white bowl filled with sliced up lemons and broccoli"
  },
  "meal-14": {
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxDaGlja2VuJTIwVGlra2ElMjBNYXNhbGElMjBmb29kJTIwZGlzaHxlbnwxfDB8fHwxNzc3MzEwODE5fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/roti-and-meat-slices-with-sauce-on-plate-ZSukCSw5VV4",
    attribution: "amirali mirhashemian",
    alt: "roti and meat slices with sauce on plate"
  },
  "meal-15": {
    image: "https://images.unsplash.com/photo-1695720247911-817755ad7d02?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxWZWdldGFibGUlMjBDb2NvbnV0JTIwQ3VycnklMjBmb29kJTIwZGlzaHxlbnwxfDB8fHwxNzc3MzEwODIwfDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-yellow-bowl-filled-with-rice-and-vegetables-1xsOZ-wzl3I",
    attribution: "Markus Winkler",
    alt: "a yellow bowl filled with rice and vegetables"
  },
  "meal-16": {
    image: "https://images.unsplash.com/photo-1709096723102-327e4187cc15?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxHYXJsaWMlMjBCdXR0ZXIlMjBTaHJpbXAlMjBQYXN0YSUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MjF8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-white-bowl-filled-with-pasta-and-shrimp-pktPLU9H37g",
    attribution: "David Trinks",
    alt: "a white bowl filled with pasta and shrimp"
  },
  "meal-17": {
    image: "https://images.unsplash.com/photo-1676300185292-e23bb3db50fa?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxHcmlsbGVkJTIwU3RlYWslMjAlMjYlMjBWZWdldGFibGVzJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgyMnww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-white-plate-topped-with-meat-and-veggies-wkms_RlOuDU",
    attribution: "Orkun Orcan",
    alt: "a white plate topped with meat and veggies"
  },
  "meal-18": {
    image: "https://images.unsplash.com/photo-1742633882711-ef7b3cee63d7?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxNaXNvJTIwUmFtZW4lMjBCb3dsJTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgyMnww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/delicious-ramen-bowl-with-pork-and-noodles-iEm6W1jxa3k",
    attribution: "Allen Y",
    alt: "Delicious ramen bowl with pork and noodles."
  },
  "meal-19": {
    image: "https://images.unsplash.com/photo-1543340713-1bf56d3d1b68?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxIdW1tdXMlMjAlMjYlMjBWZWdnaWUlMjBQbGF0ZSUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MjN8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/plate-of-cooked-food-with-vegetable-sQDTlaADDGM",
    attribution: "Louis Hansel",
    alt: "plate of cooked food with vegetable"
  },
  "meal-20": {
    image: "https://images.unsplash.com/photo-1578554814282-785ed35be0a3?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxGcnVpdCUyMCUyNiUyMFlvZ3VydCUyMEN1cCUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MjR8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/cup-of-strawberry-infoZsRZvvo",
    attribution: "Redd Francisco",
    alt: "cup of strawberry"
  },
  "meal-21": {
    image: "https://images.unsplash.com/photo-1633983053464-be76e8a86899?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxEYXJrJTIwQ2hvY29sYXRlJTIwT2F0JTIwQml0ZXMlMjBmb29kJTIwZGlzaHxlbnwxfDB8fHwxNzc3MzEwODI1fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-plate-of-cookies-next-to-a-glass-of-milk-pgMH1J_WgRk",
    attribution: "American Heritage Chocolate",
    alt: "a plate of cookies next to a glass of milk"
  },
  "meal-22": {
    image: "https://images.unsplash.com/photo-1639667870348-ac4c31dd31f9?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxDb3R0YWdlJTIwQ2hlZXNlJTIwd2l0aCUyMFBpbmVhcHBsZSUyMGZvb2QlMjBkaXNofGVufDF8MHx8fDE3NzczMTA4MjV8MA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-plate-of-food-on-a-wooden-table-y39xLLiWEpg",
    attribution: "Luis Covarrubias",
    alt: "a plate of food on a wooden table"
  },
  "meal-23": {
    image: "https://images.unsplash.com/photo-1543158181-1274e5362710?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxNaXhlZCUyME51dHMlMjAlMjYlMjBEcmllZCUyMEZydWl0JTIwZm9vZCUyMGRpc2h8ZW58MXwwfHx8MTc3NzMxMDgyNnww&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/cooked-beans-pUa1On18Jno",
    attribution: "Maksim Shutov",
    alt: "cooked beans"
  },
  "meal-24": {
    image: "https://images.unsplash.com/photo-1730231218047-aee2e8fe894d?ixid=M3w5MzY4NDV8MHwxfHNlYXJjaHwxfHxHcmVlbiUyMERldG94JTIwSnVpY2UlMjBmb29kJTIwZGlzaHxlbnwxfDB8fHwxNzc3MzEwODI3fDA&ixlib=rb-4.1.0&auto=format&fit=crop&w=1400&q=85",
    sourceUrl: "https://unsplash.com/photos/a-table-topped-with-plates-of-food-and-a-drink-W7H41s5M_-A",
    attribution: "Ruyan Ayten",
    alt: "A table topped with plates of food and a drink"
  },
};

function getMockMealImage(id) {
  return UNSPLASH_MOCK_MEAL_IMAGES[id]?.image || IMAGE_FALLBACK_SRC;
}

function getMockMealImageMeta(id) {
  return UNSPLASH_MOCK_MEAL_IMAGES[id] || {};
}

const handleMealImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMAGE_FALLBACK_SRC;
};

function shouldEnrichMealImage(meal) {
  const imageValue = String(meal?.image || "").trim();
  const isScanMeal =
    String(meal?.id || "").startsWith("scan-") ||
    String(meal?.time || "").toLowerCase() === "ai scan";

  return (
    isScanMeal &&
    (!imageValue ||
      imageValue.startsWith("blob:") ||
      imageValue.includes("/images/meal-mock/") ||
      imageValue === IMAGE_FALLBACK_SRC)
  );
}

function getImageEnrichmentKey(date, entryId, meal) {
  return [date, entryId, normalize(meal?.title || meal?.name)].filter(Boolean).join("|");
}

function readImageEnrichmentQueue() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(DYNAMIC_IMAGE_ENRICHMENT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeImageEnrichmentQueue(queue) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DYNAMIC_IMAGE_ENRICHMENT_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore queue persistence issues.
  }
}

const recommendedMeals = [
  {
    id: "rec-1",
    title: "Oatmeal with Blueberries",
    image: getMockMealImage("rec-1"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("rec-1").attribution || "",
    imageSourceUrl: getMockMealImageMeta("rec-1").sourceUrl || "",
    time: "8 mins",
    servings: "1 Serving",
    level: "Easy",
    tags: ["High Fiber", "Heart-Healthy"],
    mealType: "breakfast",
  },
  {
    id: "rec-2",
    title: "Greek Yogurt Parfait",
    image: getMockMealImage("rec-2"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("rec-2").attribution || "",
    imageSourceUrl: getMockMealImageMeta("rec-2").sourceUrl || "",
    time: "7 mins",
    servings: "1 Serving",
    level: "Easy",
    tags: ["Protein", "Gut-Friendly"],
    mealType: "breakfast",
  },
  {
    id: "rec-3",
    title: "Quinoa Salmon Bowl",
    image: getMockMealImage("rec-3"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("rec-3").attribution || "",
    imageSourceUrl: getMockMealImageMeta("rec-3").sourceUrl || "",
    time: "22 mins",
    servings: "2 Servings",
    level: "Easy",
    tags: ["Omega-3", "High Protein"],
    mealType: "lunch",
  },
  {
    id: "rec-4",
    title: "Chicken Teriyaki Rice Bowl",
    image: getMockMealImage("rec-4"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("rec-4").attribution || "",
    imageSourceUrl: getMockMealImageMeta("rec-4").sourceUrl || "",
    time: "25 mins",
    servings: "2 Servings",
    level: "Medium",
    tags: ["Balanced", "Vitamin-Rich"],
    mealType: "lunch",
  },
  {
    id: "rec-5",
    title: "Lentil & Vegetable Curry",
    image: getMockMealImage("rec-5"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("rec-5").attribution || "",
    imageSourceUrl: getMockMealImageMeta("rec-5").sourceUrl || "",
    time: "28 mins",
    servings: "2 Servings",
    level: "Medium",
    tags: ["Plant Protein", "High Fiber"],
    mealType: "dinner",
  },
  {
    id: "rec-6",
    title: "Grilled Salmon & Asparagus",
    image: getMockMealImage("rec-6"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("rec-6").attribution || "",
    imageSourceUrl: getMockMealImageMeta("rec-6").sourceUrl || "",
    time: "24 mins",
    servings: "2 Servings",
    level: "Easy",
    tags: ["Low Carb", "Omega-3"],
    mealType: "dinner",
  },
  {
    id: "rec-7",
    title: "Mango Chia Pudding",
    image: getMockMealImage("rec-7"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("rec-7").attribution || "",
    imageSourceUrl: getMockMealImageMeta("rec-7").sourceUrl || "",
    time: "10 mins",
    servings: "1 Serving",
    level: "Easy",
    tags: ["Calcium", "Antioxidant"],
    mealType: "others",
  },
  {
    id: "rec-8",
    title: "Hummus Veggie Snack Plate",
    image: getMockMealImage("rec-8"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("rec-8").attribution || "",
    imageSourceUrl: getMockMealImageMeta("rec-8").sourceUrl || "",
    time: "6 mins",
    servings: "1 Serving",
    level: "Easy",
    tags: ["High Fiber", "Snack"],
    mealType: "others",
  },
];

const mockAllMeals = [
  {
    id: "meal-1",
    title: "Avocado Toast with Poached Egg",
    image: getMockMealImage("meal-1"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-1").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-1").sourceUrl || "",
    time: "12 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-2",
    title: "Spinach Mushroom Omelette",
    image: getMockMealImage("meal-2"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-2").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-2").sourceUrl || "",
    time: "14 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-3",
    title: "Berry Banana Smoothie",
    image: getMockMealImage("meal-3"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-3").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-3").sourceUrl || "",
    time: "6 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-4",
    title: "Smoked Salmon Bagel",
    image: getMockMealImage("meal-4"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-4").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-4").sourceUrl || "",
    time: "10 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-5",
    title: "Protein Pancakes",
    image: getMockMealImage("meal-5"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-5").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-5").sourceUrl || "",
    time: "18 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-6",
    title: "Chia Seed Pudding",
    image: getMockMealImage("meal-6"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-6").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-6").sourceUrl || "",
    time: "8 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "breakfast",
    recipeId: null,
  },
  {
    id: "meal-7",
    title: "Chicken Caesar Wrap",
    image: getMockMealImage("meal-7"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-7").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-7").sourceUrl || "",
    time: "20 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-8",
    title: "Quinoa Salmon Bowl",
    image: getMockMealImage("meal-8"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-8").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-8").sourceUrl || "",
    time: "24 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-9",
    title: "Shrimp Pad Thai",
    image: getMockMealImage("meal-9"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-9").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-9").sourceUrl || "",
    time: "27 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-10",
    title: "Tuna Nicoise Salad",
    image: getMockMealImage("meal-10"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-10").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-10").sourceUrl || "",
    time: "15 Mins",
    servings: "2 Servings",
    level: "Easy",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-11",
    title: "Turkey Veggie Sandwich",
    image: getMockMealImage("meal-11"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-11").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-11").sourceUrl || "",
    time: "10 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-12",
    title: "Mediterranean Buddha Bowl",
    image: getMockMealImage("meal-12"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-12").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-12").sourceUrl || "",
    time: "22 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "lunch",
    recipeId: null,
  },
  {
    id: "meal-13",
    title: "Lemon Herb Baked Salmon",
    image: getMockMealImage("meal-13"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-13").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-13").sourceUrl || "",
    time: "26 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-14",
    title: "Chicken Tikka Masala",
    image: getMockMealImage("meal-14"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-14").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-14").sourceUrl || "",
    time: "35 Mins",
    servings: "3 Servings",
    level: "Hard",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-15",
    title: "Vegetable Coconut Curry",
    image: getMockMealImage("meal-15"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-15").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-15").sourceUrl || "",
    time: "30 Mins",
    servings: "3 Servings",
    level: "Medium",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-16",
    title: "Garlic Butter Shrimp Pasta",
    image: getMockMealImage("meal-16"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-16").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-16").sourceUrl || "",
    time: "29 Mins",
    servings: "2 Servings",
    level: "Medium",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-17",
    title: "Grilled Steak & Vegetables",
    image: getMockMealImage("meal-17"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-17").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-17").sourceUrl || "",
    time: "32 Mins",
    servings: "2 Servings",
    level: "Hard",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-18",
    title: "Miso Ramen Bowl",
    image: getMockMealImage("meal-18"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-18").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-18").sourceUrl || "",
    time: "33 Mins",
    servings: "2 Servings",
    level: "Hard",
    mealType: "dinner",
    recipeId: null,
  },
  {
    id: "meal-19",
    title: "Hummus & Veggie Plate",
    image: getMockMealImage("meal-19"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-19").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-19").sourceUrl || "",
    time: "7 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-20",
    title: "Fruit & Yogurt Cup",
    image: getMockMealImage("meal-20"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-20").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-20").sourceUrl || "",
    time: "5 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-21",
    title: "Dark Chocolate Oat Bites",
    image: getMockMealImage("meal-21"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-21").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-21").sourceUrl || "",
    time: "9 Mins",
    servings: "2 Servings",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-22",
    title: "Cottage Cheese with Pineapple",
    image: getMockMealImage("meal-22"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-22").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-22").sourceUrl || "",
    time: "4 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-23",
    title: "Mixed Nuts & Dried Fruit",
    image: getMockMealImage("meal-23"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-23").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-23").sourceUrl || "",
    time: "3 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
  {
    id: "meal-24",
    title: "Green Detox Juice",
    image: getMockMealImage("meal-24"),
    imageSource: "Unsplash",
    imageAttribution: getMockMealImageMeta("meal-24").attribution || "",
    imageSourceUrl: getMockMealImageMeta("meal-24").sourceUrl || "",
    time: "6 Mins",
    servings: "1 Serving",
    level: "Easy",
    mealType: "others",
    recipeId: null,
  },
];

const normalize = (value) => String(value || "").trim().toLowerCase();

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightParts(text, query) {
  const source = String(text || "");
  const normalizedQuery = normalize(query);
  if (!source || !normalizedQuery) return [{ text: source, matched: false }];

  const escapedQuery = escapeRegExp(normalizedQuery);
  const queryRegex = new RegExp(`(${escapedQuery})`, "ig");

  return source
    .split(queryRegex)
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      matched: part.toLowerCase() === normalizedQuery,
    }));
}

function includesQuery(item, query) {
  if (!query) return true;

  const haystack = [
    item.title,
    item.time,
    item.servings,
    item.level,
    item.mealType,
    ...(item.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function isScanLogMeal(item) {
  const sourceKey = normalize(item?.source);
  return sourceKey === "scan_log" || normalize(item?.id).startsWith("scanlog-");
}

function matchesMealFilter(item, activeFilter) {
  if (activeFilter === "all") return true;
  if (activeFilter === "scan") return isScanLogMeal(item);
  return normalize(item.mealType) === activeFilter;
}

function formatMealTypeLabel(mealType) {
  const normalized = normalize(mealType);
  if (!normalized) return "Meal";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeMealType(value) {
  const normalized = normalize(value);
  if (normalized === "breakfast" || normalized === "lunch" || normalized === "dinner") return normalized;
  if (normalized === "snack" || normalized === "snacks" || normalized === "other") return "others";
  return "others";
}

function parseRequestedMealFilter(value) {
  const normalized = normalize(value);
  if (
    normalized === "breakfast" ||
    normalized === "lunch" ||
    normalized === "dinner" ||
    normalized === "others" ||
    normalized === "scan"
  ) {
    return normalized;
  }
  if (normalized === "snack" || normalized === "snacks" || normalized === "other") return "others";
  return null;
}

function resolveInitialMealFilter(location, routeMealType) {
  const routeRequestedType = parseRequestedMealFilter(routeMealType);
  if (routeRequestedType) return routeRequestedType;

  if (!location) return null;

  const stateMealType =
    location.state?.defaultMealType ||
    location.state?.mealType ||
    location.state?.activeFilter;

  if (stateMealType) {
    const parsedFromState = parseRequestedMealFilter(stateMealType);
    if (parsedFromState) return parsedFromState;
  }

  const searchParams = new URLSearchParams(location.search || "");
  const queryMealType = searchParams.get("mealType") || searchParams.get("tab");
  return parseRequestedMealFilter(queryMealType);
}

function isISODateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function resolveInitialPlanDate(location) {
  if (!location) return null;

  const stateDate = location.state?.planDate || location.state?.selectedDate || location.state?.targetDate;
  if (isISODateString(stateDate)) return stateDate;

  const searchParams = new URLSearchParams(location.search || "");
  const queryDate = searchParams.get("date") || searchParams.get("planDate");
  if (isISODateString(queryDate)) return queryDate;

  return null;
}

function getMealIdentityKey(meal, fallback = "") {
  if (isScanLogMeal(meal)) {
    const scanKey = normalize(meal?.scanKey || meal?.title || meal?.name || meal?.id);
    if (scanKey) return `scan:${scanKey}`;
  }

  const titleKey = normalize(meal?.title || meal?.name);
  if (titleKey) return `title:${titleKey}`;

  const recipeIdKey = normalize(meal?.recipeId);
  if (recipeIdKey && recipeIdKey !== "null") return `recipe:${recipeIdKey}`;

  const idKey = normalize(meal?.id);
  if (idKey) return `id:${idKey}`;

  const fallbackKey = normalize(fallback);
  if (fallbackKey) return `legacy:${fallbackKey}`;

  return "";
}

function mapScanLogEntryToMeal(entry, index = 0) {
  const title = entry?.title || entry?.name || entry?.label || `Scan dish ${index + 1}`;
  const mealType = normalizeMealType(entry?.mealType);
  const estimatedCalories = Number.isFinite(Number(entry?.nutrition?.calories))
    ? Math.max(0, Math.round(Number(entry.nutrition.calories)))
    : null;

  return {
    id: entry?.id || `scanlog-${normalize(title) || index}`,
    scanKey: normalize(entry?.scanKey || title),
    recipeId: null,
    title,
    name: title,
    image: entry?.image || IMAGE_FALLBACK_SRC,
    imageSource: entry?.imageSource || "Scan Log",
    imageAttribution: entry?.imageAttribution || "",
    imageSourceUrl: entry?.imageSourceUrl || "",
    time: entry?.time || "AI Scan",
    servings: entry?.servings || "1 Serving",
    level: entry?.level || "Ready",
    mealType,
    source: "scan_log",
    description: entry?.about || `${title} saved from Scan Log for quick reuse.`,
    tags: [
      entry?.cuisine || null,
      estimatedCalories != null ? `${estimatedCalories} kcal` : null,
      "Scan Log",
    ].filter(Boolean),
    nutrition: entry?.nutrition || null,
    savedAt: entry?.savedAt || entry?.updatedAt || "",
  };
}

function getMealSlotKey(meal, fallback = "") {
  const identityKey = getMealIdentityKey(meal, fallback);
  if (!identityKey) return "";

  const mealTypeKey = normalizeMealType(meal?.mealType);
  return `slot:${identityKey}|${mealTypeKey}`;
}

function hasUsableSelectedMealImage(meal) {
  const imageValue = String(meal?.image || meal?.imageUrl || "").trim();
  return Boolean(
    imageValue &&
      !imageValue.startsWith("blob:") &&
      !imageValue.includes("/images/meal-mock/placeholder")
  );
}

function getSelectedMealScore(meal) {
  return (
    (hasUsableSelectedMealImage(meal) ? 10 : 0) +
    (meal?.description ? 2 : 0) +
    (meal?.nutrition && typeof meal.nutrition === "object" ? 1 : 0)
  );
}

function normalizeSelectionMap(selectionMap) {
  if (!selectionMap || typeof selectionMap !== "object") return {};

  const normalizedMap = {};
  Object.entries(selectionMap).forEach(([entryKey, meal], index) => {
    if (!meal || typeof meal !== "object") return;
    const normalizedMeal = {
      ...meal,
      mealType: normalizeMealType(meal?.mealType),
    };
    const selectionKey = getMealSlotKey(normalizedMeal, `${entryKey || index}`);
    if (!selectionKey) return;
    if (
      normalizedMap[selectionKey] &&
      getSelectedMealScore(normalizedMap[selectionKey]) > getSelectedMealScore(normalizedMeal)
    ) {
      return;
    }
    normalizedMap[selectionKey] = normalizedMeal;
  });

  return normalizedMap;
}

function normalizeSelectionsByDate(selectionsByDate) {
  if (!selectionsByDate || typeof selectionsByDate !== "object") return {};

  const normalizedByDate = {};
  Object.entries(selectionsByDate).forEach(([isoDate, selectionMap]) => {
    const normalizedSelectionMap = normalizeSelectionMap(selectionMap);
    if (Object.keys(normalizedSelectionMap).length === 0) return;
    normalizedByDate[isoDate] = normalizedSelectionMap;
  });

  return normalizedByDate;
}

const NUTRITION_BY_TYPE = {
  breakfast: { calories: 290, proteins: 16, fats: 9, vitamins: 120, sodium: 180 },
  lunch: { calories: 430, proteins: 26, fats: 14, vitamins: 170, sodium: 360 },
  dinner: { calories: 520, proteins: 32, fats: 18, vitamins: 210, sodium: 460 },
  others: { calories: 210, proteins: 8, fats: 7, vitamins: 90, sodium: 140 },
};

const LEVEL_FACTOR = {
  easy: 1,
  medium: 1.15,
  hard: 1.3,
};

function estimateMealNutrition(meal) {
  const type = normalize(meal?.mealType) || "breakfast";
  const level = normalize(meal?.level) || "easy";
  const base = NUTRITION_BY_TYPE[type] || NUTRITION_BY_TYPE.breakfast;
  const factor = LEVEL_FACTOR[level] || 1;

  return {
    calories: Math.round(base.calories * factor),
    proteins: Math.round(base.proteins * factor),
    fats: Math.round(base.fats * factor),
    vitamins: Math.round(base.vitamins * factor),
    sodium: Math.round(base.sodium * factor),
  };
}

const Meal = () => {
  const { preselectedMealType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [todayISO, setTodayISO] = useState(() => getTodayISO());
  const [activeFilter, setActiveFilter] = useState(
    () => resolveInitialMealFilter(location, preselectedMealType) || "all",
  );
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [gridColumns, setGridColumns] = useState(() => getMealGridColumns());
  const [widgetFabBottom, setWidgetFabBottom] = useState(DEFAULT_WIDGET_BOTTOM);
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => resolveInitialPlanDate(location) || getTodayISO());
  const dateInputRef = useRef(null);
  const searchWrapRef = useRef(null);
  const widgetFabRef = useRef(null);
  const previousTodayISORef = useRef(getTodayISO());
  const recommendedRowRef = useRef(null);
  const recommendedScrollbarTrackRef = useRef(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [recommendedScrollbar, setRecommendedScrollbar] = useState({
    thumbWidthPx: 0,
    thumbOffsetPx: 0,
  });
  const [mealSelectionsByDate, setMealSelectionsByDate] = useState(() =>
    normalizeSelectionsByDate(readSelectionsByDateFromStorage()),
  );
  const [scanLogMeals, setScanLogMeals] = useState(() =>
    readScanLogEntries().map((entry, index) => mapScanLogEntryToMeal(entry, index)),
  );

  const [activeTab, setActiveTab] = useState('addMeal');
  const [planFilters, setPlanFilters] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const requestedFilter = resolveInitialMealFilter(location, preselectedMealType);
    if (requestedFilter) {
      setActiveFilter(requestedFilter);
    }
  }, [preselectedMealType, location.key, location.search]);

  useEffect(() => {
    const requestedDate = resolveInitialPlanDate(location);
    if (requestedDate && requestedDate !== selectedDate) {
      setSelectedDate(requestedDate);
    }
  }, [selectedDate, location.key, location.search]);

  useEffect(() => {
    const syncScanMeals = () => {
      const latest = readScanLogEntries().map((entry, index) => mapScanLogEntryToMeal(entry, index));
      setScanLogMeals(latest);
    };

    syncScanMeals();
    window.addEventListener(SCAN_LOG_UPDATED_EVENT, syncScanMeals);
    window.addEventListener("storage", syncScanMeals);
    return () => {
      window.removeEventListener(SCAN_LOG_UPDATED_EVENT, syncScanMeals);
      window.removeEventListener("storage", syncScanMeals);
    };
  }, []);

  const normalizedQuery = normalize(query);

  const selectedMealMap = useMemo(
    () => normalizeSelectionMap(mealSelectionsByDate[selectedDate] || {}),
    [mealSelectionsByDate, selectedDate],
  );

  const selectedMealEntries = useMemo(
    () =>
      Object.entries(selectedMealMap).map(([entryId, meal]) => ({
        entryId,
        meal,
      })),
    [selectedMealMap],
  );

  const selectedMeals = useMemo(
    () => selectedMealEntries.map(({ meal }) => meal),
    [selectedMealEntries],
  );

  const selectedSlotKeySet = useMemo(() => {
    const slotKeySet = new Set();
    selectedMealEntries.forEach(({ entryId, meal }) => {
      const slotKey = getMealSlotKey(meal, entryId);
      if (slotKey) slotKeySet.add(slotKey);
    });
    return slotKeySet;
  }, [selectedMealEntries]);

  const selectedIdentityKeySet = useMemo(() => {
    const identitySet = new Set();
    selectedMealEntries.forEach(({ entryId, meal }) => {
      const identityKey = getMealIdentityKey(meal, entryId);
      if (identityKey) identitySet.add(identityKey);
    });
    return identitySet;
  }, [selectedMealEntries]);

  const selectedMealGroups = useMemo(() => {
    const groups = {
      breakfast: [],
      lunch: [],
      dinner: [],
      others: [],
    };

    selectedMealEntries
      .filter(({ meal }) => includesQuery(meal, normalizedQuery))
      .forEach(({ entryId, meal }) => {
        const mealType = normalizeMealType(meal?.mealType);
        if (mealType === "breakfast" || mealType === "lunch" || mealType === "dinner" || mealType === "others") {
          groups[mealType].push({ entryId, meal });
          return;
        }

        groups.others.push({ entryId, meal });
      });

    return groups;
  }, [normalizedQuery, selectedMealEntries]);

  const filteredRecommended = useMemo(
    () =>
      recommendedMeals.filter(
        (item) =>
          matchesMealFilter(item, activeFilter) && includesQuery(item, normalizedQuery),
      ),
    [activeFilter, normalizedQuery],
  );

  const filteredAllMeals = useMemo(
    () =>
      [...scanLogMeals, ...mockAllMeals].filter(
        (item) =>
          matchesMealFilter(item, activeFilter) && includesQuery(item, normalizedQuery),
      ),
    [activeFilter, normalizedQuery, scanLogMeals],
  );

  const searchableMeals = useMemo(() => {
    const uniqueByTitle = new Map();
    [...recommendedMeals, ...scanLogMeals, ...mockAllMeals].forEach((meal) => {
      const titleKey = normalize(meal?.title);
      if (!titleKey || uniqueByTitle.has(titleKey)) return;
      uniqueByTitle.set(titleKey, meal);
    });
    return Array.from(uniqueByTitle.values());
  }, [scanLogMeals]);

  const searchSuggestions = useMemo(() => {
    if (!normalizedQuery) return [];

    return searchableMeals
      .map((meal) => {
        const titleText = normalize(meal.title);
        const tagsText = Array.isArray(meal.tags) ? meal.tags.join(" ").toLowerCase() : "";
        const metaText = `${normalize(meal.mealType)} ${normalize(meal.time)} ${normalize(meal.servings)}`;

        let score = 0;
        if (titleText.startsWith(normalizedQuery)) score += 4;
        if (titleText.includes(normalizedQuery)) score += 2;
        if (tagsText.includes(normalizedQuery)) score += 1;
        if (metaText.includes(normalizedQuery)) score += 1;
        if (score === 0) return null;

        return { meal, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.meal.title.localeCompare(b.meal.title))
      .slice(0, 6)
      .map(({ meal }) => meal);
  }, [normalizedQuery, searchableMeals]);

  const showSearchSuggestions =
    isSuggestionOpen && Boolean(normalizedQuery) && searchSuggestions.length > 0;

  const rowsPerPage = 3;
  const itemsPerPage = gridColumns * rowsPerPage;
  const totalPages = Math.max(1, Math.ceil(filteredAllMeals.length / itemsPerPage));

  const paginatedAllMeals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAllMeals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAllMeals, currentPage, itemsPerPage]);

  const totalNutrition = useMemo(
    () =>
      selectedMeals.reduce(
        (accumulator, meal) => {
          const estimated = estimateMealNutrition(meal);
          return {
            calories: accumulator.calories + estimated.calories,
            proteins: accumulator.proteins + estimated.proteins,
            fats: accumulator.fats + estimated.fats,
            vitamins: accumulator.vitamins + estimated.vitamins,
            sodium: accumulator.sodium + estimated.sodium,
          };
        },
        { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 },
      ),
    [selectedMeals],
  );

  const selectedDish = useMemo(() => {
    if (selectedMealEntries.length === 0) return null;
    return selectedMealEntries[selectedMealEntries.length - 1].meal;
  }, [selectedMealEntries]);

  const selectedDishKey = useMemo(
    () => (selectedDish ? getMealIdentityKey(selectedDish, selectedDish.id || selectedDish.title) : ""),
    [selectedDish],
  );

  const selectedDishNutrition = useMemo(
    () =>
      selectedDish
        ? estimateMealNutrition(selectedDish)
        : { calories: 0, proteins: 0, fats: 0, vitamins: 0, sodium: 0 },
    [selectedDish],
  );

  const syncRecommendedScrollbar = useCallback(() => {
    const rowElement = recommendedRowRef.current;
    const trackElement = recommendedScrollbarTrackRef.current;

    if (!rowElement || !trackElement) {
      setRecommendedScrollbar({ thumbWidthPx: 0, thumbOffsetPx: 0 });
      return;
    }

    const maxScroll = Math.max(0, rowElement.scrollWidth - rowElement.clientWidth);
    const trackWidth = trackElement.clientWidth;
    const usableTrackWidth = Math.max(0, trackWidth - RECOMMENDED_SCROLLBAR_INSET * 2);
    if (usableTrackWidth <= 0) {
      setRecommendedScrollbar({ thumbWidthPx: 0, thumbOffsetPx: 0 });
      return;
    }

    if (maxScroll <= 0) {
      setRecommendedScrollbar({ thumbWidthPx: usableTrackWidth, thumbOffsetPx: 0 });
      return;
    }

    const rawThumbWidth = (rowElement.clientWidth / rowElement.scrollWidth) * usableTrackWidth;
    const minThumb = Math.min(RECOMMENDED_SCROLLBAR_MIN_THUMB, usableTrackWidth);
    const thumbWidthPx = Math.max(minThumb, Math.min(usableTrackWidth, rawThumbWidth));
    const maxThumbTravel = Math.max(0, usableTrackWidth - thumbWidthPx);
    const progress = rowElement.scrollLeft / maxScroll;
    const thumbOffsetPx = Math.max(0, Math.min(maxThumbTravel, maxThumbTravel * progress));

    setRecommendedScrollbar((previous) => {
      const widthDiff = Math.abs(previous.thumbWidthPx - thumbWidthPx);
      const offsetDiff = Math.abs(previous.thumbOffsetPx - thumbOffsetPx);
      if (widthDiff < 0.1 && offsetDiff < 0.1) return previous;
      return { thumbWidthPx, thumbOffsetPx };
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(MEAL_SELECTIONS_STORAGE_KEY, JSON.stringify(mealSelectionsByDate));
  }, [mealSelectionsByDate]);

  useEffect(() => {
    const queue = readImageEnrichmentQueue();
    const jobs = [];

    Object.entries(mealSelectionsByDate).forEach(([date, mealMap]) => {
      Object.entries(normalizeSelectionMap(mealMap)).forEach(([entryId, meal]) => {
        if (!shouldEnrichMealImage(meal)) return;
        const jobKey = getImageEnrichmentKey(date, entryId, meal);
        if (queue[jobKey]) return;

        queue[jobKey] = "pending";
        jobs.push({ date, entryId, meal, jobKey });
      });
    });

    if (jobs.length === 0) return;

    writeImageEnrichmentQueue(queue);

    jobs.slice(0, 6).forEach(({ date, entryId, meal, jobKey }) => {
      fetchDishImage(meal.title || meal.name, {
        cuisine: Array.isArray(meal.tags) ? meal.tags[0] : "",
      })
        .then((result) => {
          const nextQueue = readImageEnrichmentQueue();
          if (!result?.imageUrl) {
            nextQueue[jobKey] = "missing";
            writeImageEnrichmentQueue(nextQueue);
            return;
          }

          nextQueue[jobKey] = "done";
          writeImageEnrichmentQueue(nextQueue);

          setMealSelectionsByDate((previousByDate) => {
            const dateMap = normalizeSelectionMap(previousByDate[date] || {});
            const currentMeal = dateMap[entryId];
            if (!currentMeal || !shouldEnrichMealImage(currentMeal)) return previousByDate;

            return {
              ...previousByDate,
              [date]: {
                ...dateMap,
                [entryId]: {
                  ...currentMeal,
                  image: result.imageUrl,
                  imageSource: result.source || currentMeal.imageSource || "",
                  imageAttribution: result.attribution || currentMeal.imageAttribution || "",
                  imageSourceUrl: result.sourceUrl || currentMeal.imageSourceUrl || "",
                },
              },
            };
          });
        })
        .catch(() => {
          const nextQueue = readImageEnrichmentQueue();
          nextQueue[jobKey] = "failed";
          writeImageEnrichmentQueue(nextQueue);
        });
    });
  }, [mealSelectionsByDate]);

  useEffect(() => {
    const syncTodayISO = () => {
      setTodayISO((previous) => {
        const current = getTodayISO();
        return previous === current ? previous : current;
      });
    };

    syncTodayISO();
    const intervalId = window.setInterval(syncTodayISO, 60 * 1000);
    const handleFocus = () => syncTodayISO();
    const handleVisibility = () => {
      if (!document.hidden) syncTodayISO();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const previousTodayISO = previousTodayISORef.current;
    if (todayISO === previousTodayISO) return;

    if (selectedDate === previousTodayISO) {
      setSelectedDate(todayISO);
    }

    previousTodayISORef.current = todayISO;
  }, [todayISO, selectedDate]);

  useEffect(() => {
    const rowElement = recommendedRowRef.current;
    if (!rowElement) return undefined;

    let frameId = 0;
    const queueSync = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        syncRecommendedScrollbar();
      });
    };

    queueSync();

    rowElement.addEventListener("scroll", queueSync, { passive: true });
    window.addEventListener("resize", queueSync);

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(queueSync);
      resizeObserver.observe(rowElement);
    }

    return () => {
      rowElement.removeEventListener("scroll", queueSync);
      window.removeEventListener("resize", queueSync);
      if (resizeObserver) resizeObserver.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [syncRecommendedScrollbar, filteredRecommended.length, activeFilter, normalizedQuery]);

  const syncWidgetFabBottom = useCallback(() => {
    const ttsButton = document.querySelector(
      '.tts-ignore button[aria-label="Open Text-to-Speech controls"]',
    );

    if (!ttsButton) {
      setWidgetFabBottom(DEFAULT_WIDGET_BOTTOM);
      return;
    }

    const computedStyle = window.getComputedStyle(ttsButton);
    if (
      computedStyle.display === "none" ||
      computedStyle.visibility === "hidden" ||
      computedStyle.opacity === "0"
    ) {
      setWidgetFabBottom(DEFAULT_WIDGET_BOTTOM);
      return;
    }

    const rect = ttsButton.getBoundingClientRect();
    const ttsBottom = Math.max(0, window.innerHeight - rect.bottom);
    const nextOffset = ttsBottom + rect.height + FLOATING_STACK_GAP;
    setWidgetFabBottom(Math.max(DEFAULT_WIDGET_BOTTOM, Math.ceil(nextOffset)));
  }, []);

  useEffect(() => {
    const handleResize = () => setGridColumns(getMealGridColumns());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    syncWidgetFabBottom();

    const ttsButton = document.querySelector(
      '.tts-ignore button[aria-label="Open Text-to-Speech controls"]',
    );

    const hasResizeObserver = typeof ResizeObserver !== "undefined";
    const resizeObserver =
      hasResizeObserver && ttsButton
        ? new ResizeObserver(() => {
            syncWidgetFabBottom();
          })
        : null;

    if (resizeObserver && ttsButton) {
      resizeObserver.observe(ttsButton);
    }

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => {
            syncWidgetFabBottom();
          })
        : null;

    if (mutationObserver) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    window.addEventListener("resize", syncWidgetFabBottom);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener("resize", syncWidgetFabBottom);
    };
  }, [syncWidgetFabBottom]);

  useEffect(() => {
    if (!isWidgetMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!widgetFabRef.current) return;
      if (!widgetFabRef.current.contains(event.target)) {
        setIsWidgetMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsWidgetMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isWidgetMenuOpen]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(event.target)) {
        setIsSuggestionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSearch);
    document.addEventListener("touchstart", handleClickOutsideSearch);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSearch);
      document.removeEventListener("touchstart", handleClickOutsideSearch);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, normalizedQuery, selectedDate]);

  const toggleMealSelection = (meal) => {
    const selectionKey = getMealSlotKey(meal, meal?.id || meal?.title || selectedDate);
    if (!selectionKey) return;

    setMealSelectionsByDate((previousByDate) => {
      const currentDateMap = normalizeSelectionMap(previousByDate[selectedDate] || {});
      const nextDateMap = { ...currentDateMap };

      if (nextDateMap[selectionKey]) {
        delete nextDateMap[selectionKey];
      } else {
        nextDateMap[selectionKey] = {
          ...meal,
          mealType: normalizeMealType(meal?.mealType),
        };
      }

      const nextByDate = { ...previousByDate };
      if (Object.keys(nextDateMap).length === 0) {
        delete nextByDate[selectedDate];
      } else {
        nextByDate[selectedDate] = nextDateMap;
      }

      return nextByDate;
    });
  };

  const removeSelectionEntry = (entryId) => {
    if (!entryId) return;

    setMealSelectionsByDate((previousByDate) => {
      const currentDateMap = normalizeSelectionMap(previousByDate[selectedDate] || {});
      if (!currentDateMap[entryId]) return previousByDate;

      const nextDateMap = { ...currentDateMap };
      delete nextDateMap[entryId];

      const nextByDate = { ...previousByDate };
      if (Object.keys(nextDateMap).length === 0) {
        delete nextByDate[selectedDate];
      } else {
        nextByDate[selectedDate] = nextDateMap;
      }

      return nextByDate;
    });
  };

  const handleClearSelectedDishes = () => {
    setMealSelectionsByDate((previousByDate) => {
      if (!previousByDate[selectedDate]) return previousByDate;
      const nextByDate = { ...previousByDate };
      delete nextByDate[selectedDate];
      return nextByDate;
    });
  };

  const applySelectedDate = (nextDate) => {
    setSelectedDate(nextDate);
  };

  const handleDateChange = (event) => {
    const nextDate = event.target.value;
    if (!nextDate) return;
    if (nextDate < todayISO) return;
    applySelectedDate(nextDate);
  };

  const handlePrevDate = () => {
    if (selectedDate <= todayISO) return;
    const previousDate = shiftISODate(selectedDate, -1);
    if (previousDate < todayISO) return;
    applySelectedDate(previousDate);
  };

  const handleNextDate = () => {
    const nextDate = shiftISODate(selectedDate, 1);
    applySelectedDate(nextDate);
  };

  const goToPreviousPage = () => {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((previous) => Math.min(totalPages, previous + 1));
  };

  const handleSearchInputChange = (event) => {
    setQuery(event.target.value);
    setIsSuggestionOpen(true);
  };

  const handleSelectSuggestion = (meal) => {
    setQuery(meal.title);
    setIsSuggestionOpen(false);
  };

  const handleRecommendedScrollbarTrackClick = (event) => {
    const rowElement = recommendedRowRef.current;
    const trackElement = recommendedScrollbarTrackRef.current;
    if (!rowElement || !trackElement) return;

    const maxScroll = Math.max(0, rowElement.scrollWidth - rowElement.clientWidth);
    if (maxScroll <= 0) return;

    const rect = trackElement.getBoundingClientRect();
    const trackWidth = trackElement.clientWidth;
    const usableTrackWidth = Math.max(0, trackWidth - RECOMMENDED_SCROLLBAR_INSET * 2);
    const thumbWidth = Math.max(
      1,
      Math.min(usableTrackWidth, Number(recommendedScrollbar.thumbWidthPx) || usableTrackWidth),
    );
    const maxThumbTravel = Math.max(0, usableTrackWidth - thumbWidth);
    if (rect.width <= 0 || usableTrackWidth <= 0) return;

    const clickX = event.clientX - rect.left;
    const clickOnRail = Math.max(0, Math.min(usableTrackWidth, clickX - RECOMMENDED_SCROLLBAR_INSET));
    const targetThumbOffset = Math.max(
      0,
      Math.min(maxThumbTravel, clickOnRail - thumbWidth / 2),
    );
    const ratio = maxThumbTravel > 0 ? targetThumbOffset / maxThumbTravel : 0;

    rowElement.scrollTo({
      left: maxScroll * ratio,
      behavior: "smooth",
    });
  };

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
      return;
    }
    dateInputRef.current?.focus();
    dateInputRef.current?.click();
  };

  const handleViewDetail = (meal) => {
    if (meal) {
      sessionStorage.setItem("selectedMealDetail", JSON.stringify(meal));
    }
    navigate("/dish/detail", { state: { meal } });
  };

  const handleViewRecipe = (meal) => {
    if (!meal) return;

    try {
      sessionStorage.setItem("selectedMealDetail", JSON.stringify(meal));
    } catch {
      // Ignore storage write errors and continue navigation.
    }

    const targetRecipeId = meal.recipeId || meal.id || "recipe";
    navigate(`/recipe/${encodeURIComponent(String(targetRecipeId))}`, {
      state: { meal },
    });
  };

  const handleGeneratePlan = (filters) => {
    setPlanFilters(filters);
  };

  const handleExportPDF = () => {
    const printArea = document.getElementById('personalized-meal-plan');
    if (!printArea) return;
    html2canvas(printArea, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Personalized_Meal_Plan.pdf');
    });
  };

  const selectedCount = selectedMeals.length;
  const selectedViewCount = SELECTED_VIEW_SECTIONS.reduce(
    (total, section) => total + selectedMealGroups[section.key].length,
    0,
  );
  const isSelectedView = activeFilter === "selected";
  const isScanLogView = activeFilter === "scan";
  const isTodaySelected = selectedDate === todayISO;
  const dateDisplayLabel = isTodaySelected ? "Today" : selectedDate;

  return (
    <div className="add-meal-page">
      <div className="add-meal-shell">
        <div className="add-meal-breadcrumb" aria-label="breadcrumb">
          <button
            type="button"
            className="add-meal-back"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <span className="crumb-divider">/</span>
          <span className="crumb-muted">Meal Planning</span>
          <span className="crumb-divider">/</span>
          <span className="crumb-current">Add Meal</span>
        </div>

        <div className="meal-tab-switcher">
          <button
            type="button"
            className={`meal-tab-btn ${activeTab === 'addMeal' ? 'active' : ''}`}
            onClick={() => setActiveTab('addMeal')}
          >
            Add Meal
          </button>
          <button
            type="button"
            className={`meal-tab-btn ${activeTab === 'personalizedPlan' ? 'active' : ''}`}
            onClick={() => setActiveTab('personalizedPlan')}
          >
            <Sparkles size={15} />
            AI Personalized Plan
          </button>
        </div>

        {activeTab === 'addMeal' && (<>
        <div className="add-meal-toolbar">
          <div className="add-meal-date-row" aria-label="Plan date controls">
            <button
              type="button"
              className="add-meal-date-nav"
              onClick={handlePrevDate}
              disabled={selectedDate <= todayISO}
            >
              ← Prev
            </button>

            <div className="add-meal-date-display-wrap">
              <button
                type="button"
                className="add-meal-date-display"
                onClick={openDatePicker}
                aria-label="Choose planning date"
              >
                <CalendarDays size={16} className="add-meal-date-icon" />
                <span>{dateDisplayLabel}</span>
              </button>

              <input
                ref={dateInputRef}
                id="add-meal-plan-date"
                type="date"
                className="add-meal-date-picker-hidden"
                value={selectedDate}
                min={todayISO}
                onChange={handleDateChange}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              className="add-meal-date-nav"
              onClick={handleNextDate}
            >
              Next →
            </button>

          </div>

          <div className="add-meal-search-wrap" ref={searchWrapRef}>
            <label className="add-meal-search" htmlFor="add-meal-search">
              <Search size={22} strokeWidth={2.2} className="search-icon" />
              <input
                id="add-meal-search"
                type="text"
                value={query}
                onChange={handleSearchInputChange}
                onFocus={() => setIsSuggestionOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSuggestionOpen(false);
                    return;
                  }

                  if (event.key === "Enter" && showSearchSuggestions) {
                    event.preventDefault();
                    handleSelectSuggestion(searchSuggestions[0]);
                  }
                }}
                placeholder="Search for foods, recipes, or meals"
              />
            </label>

            {showSearchSuggestions ? (
              <ul className="add-meal-suggestions" role="listbox" aria-label="Meal search suggestions">
                {searchSuggestions.map((meal) => (
                  <li key={`suggestion-${meal.id}`}>
                    <button
                      type="button"
                      className="add-meal-suggestion-item"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectSuggestion(meal)}
                    >
                      <span className="add-meal-suggestion-title">
                        {getHighlightParts(meal.title, normalizedQuery).map((part, index) => (
                          <span
                            key={`${meal.id}-title-part-${index}`}
                            className={part.matched ? "add-meal-suggestion-highlight" : undefined}
                          >
                            {part.text}
                          </span>
                        ))}
                      </span>
                      <span className="add-meal-suggestion-meta">
                        {getHighlightParts(
                          `${formatMealTypeLabel(meal.mealType)} · ${meal.time || "N/A"}`,
                          normalizedQuery,
                        ).map((part, index) => (
                          <span
                            key={`${meal.id}-meta-part-${index}`}
                            className={part.matched ? "add-meal-suggestion-highlight" : undefined}
                          >
                            {part.text}
                          </span>
                        ))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="add-meal-filters" role="tablist" aria-label="Meal type filter">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`filter-chip ${isActive ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="add-meal-content-grid">
          <div className="add-meal-main">
            {isSelectedView ? (
              <section className="add-meal-section selected-view-section">
                <div className="section-title-row">
                  <h2 className="section-title">Selected Meals</h2>
                  <button
                    type="button"
                    className="clear-selected-btn"
                    onClick={handleClearSelectedDishes}
                    disabled={selectedCount === 0}
                  >
                    <Trash2 size={15} />
                    Clear all selected dishes
                  </button>
                </div>

                {selectedViewCount === 0 ? (
                  <p className="empty-state">
                    {normalizedQuery
                      ? "No selected dishes matched your search."
                      : "No dishes selected for this date yet."}
                  </p>
                ) : (
                  <div className="selected-meal-groups">
                    {SELECTED_VIEW_SECTIONS.map((section) => {
                      const sectionMeals = selectedMealGroups[section.key];

                      return (
                        <article key={section.key} className="selected-meal-group">
                          <div className="selected-meal-group-header">
                            <h3>{section.label}</h3>
                            <span>
                              {sectionMeals.length} {sectionMeals.length === 1 ? "dish" : "dishes"}
                            </span>
                          </div>

                          {sectionMeals.length === 0 ? (
                            <p className="selected-group-empty">No selected dishes in this meal.</p>
                          ) : (
                            <div className="selected-group-list">
                              {sectionMeals.map(({ entryId, meal }, index) => {
                                const mealKey = getMealIdentityKey(
                                  meal,
                                  `${entryId || meal.id || meal.recipeId || meal.title || index}`,
                                );
                                return (
                                <article
                                  key={`selected-${section.key}-${entryId || mealKey}`}
                                  className="selected-dish-card"
                                >
                                  <div className="selected-dish-thumb">
                                    <img
                                      src={meal.image}
                                      alt={meal.title}
                                      loading="lazy"
                                      onError={handleMealImageError}
                                    />
                                    <span
                                      className={`meal-type-badge type-${normalize(meal.mealType)}`}
                                    >
                                      {formatMealTypeLabel(meal.mealType)}
                                    </span>
                                  </div>

                                  <div className="selected-dish-body">
                                    <h4>{meal.title}</h4>
                                    <div className="selected-dish-meta">
                                      <span>
                                        <Clock3 size={14} />
                                        {meal.time || "N/A"}
                                      </span>
                                      <span>
                                        <Users size={14} />
                                        {meal.servings || "N/A"}
                                      </span>
                                      <span>
                                        <BarChart3 size={14} />
                                        {meal.level || "Easy"}
                                      </span>
                                    </div>

                                        {Array.isArray(meal.tags) && meal.tags.length > 0 ? (
                                      <div className="selected-dish-tags">
                                        {meal.tags.slice(0, 3).map((tag) => (
                                          <span key={`${entryId || mealKey}-${tag}`}>{tag}</span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="selected-dish-actions">
                                    <button
                                      type="button"
                                      className="add-meal-action-btn add-meal-detail-btn"
                                      onClick={() => handleViewDetail(meal)}
                                    >
                                      View Detail
                                    </button>
                                    <button
                                      type="button"
                                      className="add-meal-action-btn add-meal-recipe-btn"
                                      onClick={() => handleViewRecipe(meal)}
                                    >
                                      View Recipe
                                    </button>
                                    <button
                                      type="button"
                                      className="selected-remove-btn"
                                      onClick={() => removeSelectionEntry(entryId)}
                                      aria-label={`Remove ${meal.title}`}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </article>
                                );
                              })}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              <>
                {!isScanLogView ? (
                  <section className="add-meal-section">
                    <h2 className="section-title">Recommended Meals</h2>

                    {filteredRecommended.length === 0 ? (
                      <p className="empty-state">No recommended meals found for the selected filter.</p>
                    ) : (
                      <div className="recommended-row-shell">
                        <div className="recommended-row" ref={recommendedRowRef}>
                          {filteredRecommended.map((meal) => {
                            const mealSlotKey = getMealSlotKey(
                              meal,
                              meal.id || meal.recipeId || meal.title,
                            );
                            const mealIdentityKey = getMealIdentityKey(
                              meal,
                              meal.id || meal.recipeId || meal.title,
                            );
                            const isSelectedInCurrentSlot =
                              Boolean(mealSlotKey) && selectedSlotKeySet.has(mealSlotKey);
                            const isSelected =
                              isSelectedInCurrentSlot ||
                              (Boolean(mealIdentityKey) && selectedIdentityKeySet.has(mealIdentityKey));
                            const isSelectedDish =
                              Boolean(selectedDishKey) &&
                              Boolean(mealIdentityKey) &&
                              selectedDishKey === mealIdentityKey;

                            return (
                              <article
                                key={meal.id}
                                className={`recommend-card ${isSelected ? "selected" : ""} ${isSelectedDish ? "selected-dish" : ""}`}
                                onClick={() => toggleMealSelection(meal)}
                              >
                                <div className="recommend-image-wrap">
                                  <img
                                    src={meal.image}
                                    alt={meal.title}
                                    loading="lazy"
                                    onError={handleMealImageError}
                                  />
                                  <span className={`meal-type-badge type-${normalize(meal.mealType)}`}>
                                    {formatMealTypeLabel(meal.mealType)}
                                  </span>
                                  {isSelected ? (
                                    <span className="selected-check" aria-label="Selected">
                                      <span className="selected-check-icon" aria-hidden="true">
                                        <Check size={13} strokeWidth={3} />
                                      </span>
                                      <span className="selected-check-label">Selected</span>
                                    </span>
                                  ) : null}
                                  <span className="recommend-time">
                                    <Clock3 size={13} />
                                    {meal.time}
                                  </span>
                                </div>

                                <div className="recommend-content">
                                  <h3>{meal.title}</h3>
                                  <div className="recipe-meta recommend-meta">
                                    <span>
                                      <Clock3 size={16} />
                                      {meal.time || "N/A"}
                                    </span>
                                    <span>
                                      <Users size={16} />
                                      {meal.servings || "N/A"}
                                    </span>
                                    <span>
                                      <BarChart3 size={16} />
                                      {meal.level || "Easy"}
                                    </span>
                                  </div>
                                  <div className="recommend-tags">
                                    {(Array.isArray(meal.tags) ? meal.tags : []).map((tag) => (
                                      <span key={`${meal.id}-${tag}`}>{tag}</span>
                                    ))}
                                  </div>
                                  <div className="meal-card-actions recommend-card-actions">
                                    <button
                                      type="button"
                                      className="add-meal-action-btn add-meal-detail-btn"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleViewDetail(meal);
                                      }}
                                    >
                                      View Detail
                                    </button>
                                    <button
                                      type="button"
                                      className="add-meal-action-btn add-meal-recipe-btn"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleViewRecipe(meal);
                                      }}
                                    >
                                      View Recipe
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="recommended-scrollbar-track"
                          ref={recommendedScrollbarTrackRef}
                          onClick={handleRecommendedScrollbarTrackClick}
                          aria-label="Scroll recommended meals"
                        >
                          <span
                            className="recommended-scrollbar-thumb"
                            style={{
                              width: `${recommendedScrollbar.thumbWidthPx}px`,
                              left: `${RECOMMENDED_SCROLLBAR_INSET + recommendedScrollbar.thumbOffsetPx}px`,
                            }}
                          />
                        </button>
                      </div>
                    )}
                  </section>
                ) : null}

                <section className="add-meal-section">
                  <div className="section-title-row">
                    <h2 className="section-title">
                      {isScanLogView ? "Saved Scan Meals" : "All Meals & Recipes"}
                    </h2>
                    <button
                      type="button"
                      className="clear-selected-btn"
                      onClick={handleClearSelectedDishes}
                      disabled={selectedCount === 0}
                    >
                      <Trash2 size={15} />
                      Clear all selected dishes
                    </button>
                  </div>

                  {filteredAllMeals.length === 0 ? (
                    <p className="empty-state">
                      {isScanLogView
                        ? "No dishes in Scan Log yet. Save dishes from Scan page using the star button."
                        : "No meals matched your search."}
                    </p>
                  ) : (
                    <div className="all-meals-wrap">
                      <div className="all-meals-grid">
                        {paginatedAllMeals.map((meal) => {
                          const mealSlotKey = getMealSlotKey(
                            meal,
                            meal.id || meal.recipeId || meal.title,
                          );
                          const mealIdentityKey = getMealIdentityKey(
                            meal,
                            meal.id || meal.recipeId || meal.title,
                          );
                          const isSelectedInCurrentSlot =
                            Boolean(mealSlotKey) && selectedSlotKeySet.has(mealSlotKey);
                          const isSelected =
                            isSelectedInCurrentSlot ||
                            (Boolean(mealIdentityKey) && selectedIdentityKeySet.has(mealIdentityKey));
                          const isSelectedDish =
                            Boolean(selectedDishKey) &&
                            Boolean(mealIdentityKey) &&
                            selectedDishKey === mealIdentityKey;

                          return (
                            <article
                              key={meal.id}
                              className={`all-meal-card ${isSelected ? "selected" : ""} ${isSelectedDish ? "selected-dish" : ""}`}
                              onClick={() => toggleMealSelection(meal)}
                            >
                              <div className="all-meal-image-wrap">
                                <img
                                  src={meal.image}
                                  alt={meal.title}
                                  loading="lazy"
                                  onError={handleMealImageError}
                                />
                                <span className={`meal-type-badge type-${normalize(meal.mealType)}`}>
                                  {formatMealTypeLabel(meal.mealType)}
                                </span>
                                {isSelected ? (
                                  <span className="selected-check" aria-label="Selected">
                                    <span className="selected-check-icon" aria-hidden="true">
                                      <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span className="selected-check-label">Selected</span>
                                  </span>
                                ) : null}
                              </div>

                              <div className="all-meal-content">
                                <h3>{meal.title}</h3>

                                <div className="recipe-meta">
                                  <span>
                                    <Clock3 size={16} />
                                    {meal.time}
                                  </span>
                                  <span>
                                    <Users size={16} />
                                    {meal.servings}
                                  </span>
                                  <span>
                                    <BarChart3 size={16} />
                                    {meal.level}
                                  </span>
                                </div>

                                <div className="meal-card-actions">
                                  <button
                                    type="button"
                                    className="add-meal-action-btn add-meal-detail-btn"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleViewDetail(meal);
                                    }}
                                  >
                                    View Detail
                                  </button>
                                  <button
                                    type="button"
                                    className="add-meal-action-btn add-meal-recipe-btn"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleViewRecipe(meal);
                                    }}
                                  >
                                    View Recipe
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      {totalPages > 1 ? (
                        <div className="all-meals-pagination" aria-label="All meals pagination">
                          <button
                            type="button"
                            className="pagination-nav"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                          >
                            Prev
                          </button>

                          <div className="pagination-index-list">
                            {Array.from({ length: totalPages }, (_, index) => {
                              const pageNumber = index + 1;
                              const isActive = currentPage === pageNumber;

                              return (
                                <button
                                  key={pageNumber}
                                  type="button"
                                  className={`pagination-index ${isActive ? "active" : ""}`}
                                  onClick={() => setCurrentPage(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            className="pagination-nav"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          <aside className="add-meal-sidebar">
            <div className="nutrition-panel">
              <h3>Nutritional Value</h3>
              <div className="nutrition-section selected-dish-nutrition">
                <h4>Selected Dish Nutrition</h4>
                {selectedDish ? (
                  <>
                    <p className="selected-dish-name">{selectedDish.title}</p>
                    <ul className="nutrition-kpi-list">
                      <li>
                        <span>Calories</span>
                        <strong>{selectedDishNutrition.calories} kcal</strong>
                      </li>
                      <li>
                        <span>Proteins</span>
                        <strong>{selectedDishNutrition.proteins}g</strong>
                      </li>
                      <li>
                        <span>Fats</span>
                        <strong>{selectedDishNutrition.fats}g</strong>
                      </li>
                      <li>
                        <span>Vitamins</span>
                        <strong>{selectedDishNutrition.vitamins}mg</strong>
                      </li>
                      <li>
                        <span>Sodium</span>
                        <strong>{selectedDishNutrition.sodium}mg</strong>
                      </li>
                    </ul>
                  </>
                ) : (
                  <p className="selected-dish-empty">
                    Select a dish card to see its individual nutrition.
                  </p>
                )}
              </div>

              <div className="nutrition-section total-nutrition-section">
                <h4>Total Nutrition</h4>
                <p>Total items selected: {selectedCount}</p>
                <ul className="nutrition-kpi-list">
                  <li>
                    <span>Calories</span>
                    <strong>{totalNutrition.calories} kcal</strong>
                  </li>
                  <li>
                    <span>Proteins</span>
                    <strong>{totalNutrition.proteins}g</strong>
                  </li>
                  <li>
                    <span>Fats</span>
                    <strong>{totalNutrition.fats}g</strong>
                  </li>
                  <li>
                    <span>Vitamins</span>
                    <strong>{totalNutrition.vitamins}mg</strong>
                  </li>
                  <li>
                    <span>Sodium</span>
                    <strong>{totalNutrition.sodium}mg</strong>
                  </li>
                </ul>
              </div>

              <div className="panel-action-list">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/dashboard", {
                      state: {
                        selectedItems: selectedMeals,
                        totalNutrition,
                      },
                    })
                  }
                >
                  View Meal Plan
                </button>
                <button type="button" onClick={() => navigate("/weekly-plan")}>
                  View Full Weekly Meal Plan
                </button>
              </div>
            </div>
          </aside>
        </div>
        </>)}

        {activeTab === 'personalizedPlan' && (
          <div className="personalized-plan-section">
            <PersonalizedPlanForm
              onGenerate={handleGeneratePlan}
              onExport={planFilters ? handleExportPDF : undefined}
              loading={false}
            />
            {planFilters && (
              <PersonalizedWeeklyPlan
                filters={planFilters}
                onExport={handleExportPDF}
                showExport={true}
              />
            )}
          </div>
        )}
      </div>

      <div
        ref={widgetFabRef}
        className="widget-fab-stack tts-ignore"
        data-tts-ignore="true"
        style={{ bottom: `${widgetFabBottom}px` }}
      >
        <div className={`widget-fab-actions ${isWidgetMenuOpen ? "open" : ""}`}>
          <button
            type="button"
            className="widget-fab-action widget-fab-shopping"
            onClick={() => {
              setIsWidgetMenuOpen(false);
              navigate("/shopping-list", {
                state: {
                  selectedItems: selectedMeals,
                  totalNutrition,
                },
              });
            }}
            aria-label="Go to Shopping List"
            title="Shopping List"
          >
            <ShoppingCart size={18} />
          </button>
          <button
            type="button"
            className="widget-fab-action widget-fab-calculator"
            onClick={() => {
              setIsWidgetMenuOpen(false);
              navigate("/nutrition-calculator");
            }}
            aria-label="Go to Nutrition Calculator"
            title="Nutrition Calculator"
          >
            <Calculator size={18} />
          </button>
        </div>

        <button
          type="button"
          className={`widget-fab-main ${isWidgetMenuOpen ? "open" : ""}`}
          onClick={() => setIsWidgetMenuOpen((previous) => !previous)}
          aria-label="Widget"
          title="Widget"
          aria-expanded={isWidgetMenuOpen}
        >
          <Settings2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Meal;
