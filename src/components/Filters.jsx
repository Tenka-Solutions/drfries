import React, { useState } from 'react';
import './Filters.css';

export function Filters({ onFilterChange }) {
  const [filters, setFilters] = useState({ categories: [] });

  const handleFilterChange = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setFilters((prevFilters) => ({ ...prevFilters, categories: newCategories }));
    onFilterChange({ ...filters, categories: newCategories });
  };

  return null; 
}

export default Filters;
