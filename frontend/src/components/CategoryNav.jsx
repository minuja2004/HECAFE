import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CategoryNav = ({ activeCategory, onSelectCategory }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([
    { name: 'Birthday Cakes', label: 'Birthday Cakes' },
    { name: 'Wedding Cakes', label: 'Wedding Cakes' },
    { name: 'Cupcakes', label: 'Cupcakes' },
    { name: 'Pastries', label: 'Pastries' },
    { name: 'Ingredients', label: 'Baking Ingredients' },
    { name: 'Baking Tools', label: 'Baking Tools' }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        if (res.data && Array.isArray(res.data)) {
          const mapped = res.data.map(cat => ({
            name: cat.name,
            label: cat.name === 'Ingredients' ? 'Baking Ingredients' : cat.name
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.error('Error fetching categories in nav', err);
      }
    };
    fetchCategories();

    const interval = setInterval(fetchCategories, 4000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (categoryName) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
    setIsOpen(false);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  // Find if any of the categories are currently active
  const isCategoryActive = categories.some(cat => cat.name === activeCategory);

  return (
    <div className="cat-nav">
      <div className="cat-dropdown-container" ref={dropdownRef}>
        <button 
          className={`cat-dropdown-trigger ${isCategoryActive ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          Categories <span className="arrow">▾</span>
        </button>
        <div className={`cat-dropdown-menu ${isOpen ? 'show' : ''}`}>
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`cat-dropdown-item ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => handleSelect(cat.name)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <a
        className={`highlight ${activeCategory === 'all' ? 'active' : ''}`}
        onClick={() => {
          if (onSelectCategory) onSelectCategory('all');
          navigate('/products');
        }}
      >
        All Products
      </a>
    </div>
  );
};

export default CategoryNav;
