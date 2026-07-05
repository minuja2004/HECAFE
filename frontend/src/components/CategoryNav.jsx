import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryNav = ({ activeCategory, onSelectCategory }) => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Birthday Cakes', label: 'Birthday Cakes ▾' },
    { name: 'Wedding Cakes', label: 'Wedding Cakes ▾' },
    { name: 'Cupcakes', label: 'Cupcakes & Pastries ▾' },
    { name: 'Ingredients', label: 'Baking Ingredients ▾' },
    { name: 'Baking Tools', label: 'Baking Tools ▾' }
  ];

  const handleSelect = (categoryName) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="cat-nav">
      {categories.map((cat) => (
        <a
          key={cat.name}
          className={activeCategory === cat.name ? 'active' : ''}
          onClick={() => handleSelect(cat.name)}
        >
          {cat.label}
        </a>
      ))}
      <a
        className="highlight"
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
