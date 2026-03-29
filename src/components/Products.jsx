import React, { useState, useEffect, useRef } from 'react';
import './Products.css';
import { useCart } from '../hooks/useCart.js';
import Banner from './Banner';
import { Filters } from './Filters.jsx';

//banners
import banner1 from '/assets/banner1.jpg'
import banner2 from '/assets/banner2.jpg'
import banner3 from '/assets/banner3.jpg'
import banner4 from '/assets/banner4.jpg'
import banner5 from '/assets/banner5.jpg'
import banner6 from '/assets/banner6.jpg'
import banner1_pc from '/assets/banner1.jpg';
import banner2_pc from '/assets/banner2.jpg';
import banner3_pc from '/assets/banner3.jpg';
import Swal from 'sweetalert2';

import { FaHamburger, FaIceCream, FaHotdog } from "react-icons/fa";
import { FaBowlFood } from "react-icons/fa6";
import { GiFrenchFries, GiChickenLeg } from "react-icons/gi";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { RiDrinks2Fill } from "react-icons/ri";
import { LuCoffee } from "react-icons/lu";
import { IoFastFood } from "react-icons/io5";

export function Products({ products, searchText }) {
  const { addToCart } = useCart(); 
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState([]);  // Extra products with quantity
  const [selectedAcompanamientos, setSelectedAcompanamientos] = useState([]);
  const [selectedBebidas, setSelectedBebidas] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [selectedFlavors, setSelectedFlavors] = useState([]); // Selected flavors
  const [selectedSauce, setSelectedSauce] = useState(null); // Selected sauce
  const [selectedProtein, setSelectedProtein] = useState(null); // Selected protein
  const [selectedAderesos, setSelectedAderesos] = useState([]); // Selected aderezos
  const [selectedVariety, setSelectedVariety] = useState(null); // Selected variety
  const [expandedFlavors, setExpandedFlavors] = useState(false); // Expanded flavors
  const [expandedSauces, setExpandedSauces] = useState(false); // Expanded sauces
  const [expandedProteins, setExpandedProteins] = useState(false); // Expanded proteins
  const [expandedAderesos, setExpandedAderesos] = useState(false); // Expanded aderezos
  const [expandedVarieties, setExpandedVarieties] = useState(false); // Expanded varieties
  const [banners, setBanners] = useState([banner1, banner2, banner3, banner4, banner5, banner6, banner1_pc, banner2_pc, banner3_pc]);
  const modalRef = useRef(null);

  const flavorLimits = {
    66: 1,
    67: 2,
    68: 3,
    69: 1,
    70: 1
  };

  const aderesoLimit = 4;

  const normalizeText = (text) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  useEffect(() => {
    setIsSearching(true);
    const timeout = setTimeout(() => {
      const newFilteredProducts = products.filter((product) => {
        const matchesTitle = normalizeText(product.title).includes(normalizeText(searchText));
        const matchesCategory = normalizeText(product.category).includes(normalizeText(searchText));
        return matchesTitle || matchesCategory;
      });
      setFilteredProducts(newFilteredProducts);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchText, products]);

  const handleCategoryClick = (categoryId) => {
    const newSelectedCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newSelectedCategory);
    setFilteredProducts(products.filter((product) =>
      newSelectedCategory === null || product.category === newSelectedCategory
    ));
  };

  const handleToggleCategory = (category) => {
    setExpandedCategories((prev) => 
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleToggleFlavors = () => {
    setExpandedFlavors((prev) => !prev);
  };

  const handleToggleSauces = () => {
    setExpandedSauces((prev) => !prev);
  };

  const handleToggleProteins = () => {
    setExpandedProteins((prev) => !prev);
  };

  const handleToggleAderesos = () => {
    setExpandedAderesos((prev) => !prev);
  };

  const handleToggleVarieties = () => {
    setExpandedVarieties((prev) => !prev);
  };

  const categories = [...new Set(products.map((product) => product.category))].filter(category => category !== 'Extras' && category !== 'Especiales').concat('Especiales'); // Ensure "Especiales" is included

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setSelectedExtras([]);  
    setSelectedFlavors([]); // Reset selected flavors
    setSelectedSauce(null); // Reset selected sauce
    setSelectedProtein(null); // Reset selected protein
    setSelectedAderesos([]); // Reset selected aderezos
    setSelectedVariety(null); // Reset selected variety
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      if (selectedProduct.category === 'Sandwich' && !selectedProtein) {
        Swal.fire({
          icon: 'warning',
          title: 'No se ha seleccionado una proteína',
          text: 'Por favor, seleccione una proteína antes de continuar.',
          customClass: {
            confirmButton: 'swal2-styled swal2-confirm',
            cancelButton: 'swal2-styled swal2-cancel'
          },
        });
        return;
      }

    // Validación para Postres y Dulces (sabor)
    const productosConSabores = [66, 67, 68, 69, 70, 76]; // IDs de productos que requieren sabores
    if (
      selectedProduct.category === 'Postres y Dulces' && productosConSabores.includes(selectedProduct.id) && selectedFlavors.length === 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'No se ha seleccionado un sabor',
        text: 'Por favor, seleccione un sabor antes de continuar.',
        customClass: {
          confirmButton: 'swal2-styled swal2-confirm',
          cancelButton: 'swal2-styled swal2-cancel'
        },
      });
      return;
    }

      const selections = [
        ...selectedFlavors,
        selectedSauce,
        selectedProtein,
        ...selectedAderesos,
        selectedVariety,
        ...selectedExtras.map(extra => `${extra.title} (+${extra.price}) x${extra.quantity}`)
      ].filter(Boolean).join(', ');

      const totalPrice = selectedProduct.price + selectedExtras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0);

      const productToAdd = {
        ...selectedProduct,
        title: selections ? `${selectedProduct.title} (${selections})` : selectedProduct.title,
        price: totalPrice,
        selections // Add selections to differentiate products
      };

      addToCart(productToAdd); 
      handleCloseModal(); 
    }
  };

  const handleExtraQuantityChange = (extraProduct, increment) => {
    setSelectedExtras((prevExtras) => {
      const existingExtra = prevExtras.find((item) => item.id === extraProduct.id);
      if (existingExtra) {
        const updatedExtras = prevExtras.map((item) =>
          item.id === extraProduct.id
            ? { ...item, quantity: Math.max(0, item.quantity + increment) }
            : item
        );
        return updatedExtras.filter((item) => item.quantity > 0); // Filtrar los extras con cantidad mayor a 0
      } else {
        return [...prevExtras, { ...extraProduct, quantity: 1 }];
      }
    });
  };

  const handleFlavorSelect = (flavor) => {
    const limit = flavorLimits[selectedProduct.id] || 1;
    setSelectedFlavors((prevFlavors) => {
      if (prevFlavors.includes(flavor)) {
        return prevFlavors.filter((item) => item !== flavor);
      } else if (prevFlavors.length < limit) {
        return [...prevFlavors, flavor];
      } else {
        return prevFlavors;
      }
    });
  };

  const handleSauceSelect = (sauce) => {
    setSelectedSauce(sauce === selectedSauce ? null : sauce);
  };

  const handleProteinSelect = (protein) => {
    setSelectedProtein(protein === selectedProtein ? null : protein);
  };

  const handleAderesoSelect = (adereso) => {
    setSelectedAderesos((prevAderesos) => {
      if (prevAderesos.includes(adereso)) {
        return prevAderesos.filter((item) => item !== adereso);
      } else if (prevAderesos.length < aderesoLimit) {
        return [...prevAderesos, adereso];
      } else {
        return prevAderesos;
      }
    });
  };

  const handleVarietySelect = (variety) => {
    setSelectedVariety(variety === selectedVariety ? null : variety);
  };

  const categoryIcons = {
    'Sandwich': <FaHamburger style={{ color: '#9b282b' }} />,
    'Papas Fritas': <GiFrenchFries style={{ color: '#9b282b' }} />,
    'Bebidas': <RiDrinks2Fill style={{ color: '#9b282b' }} />,
    'Cafeteria': <LuCoffee style={{ color: '#9b282b' }} />,
    'Pollo Crispy': <GiChickenLeg style={{ color: '#9b282b' }} />,
    'Postres y Dulces': <FaIceCream style={{ color: '#9b282b' }} />,
    'Acompañamientos': <FaBowlFood style={{ color: '#9b282b' }} />,
    'Promociones': <IoFastFood style={{ color: '#9b282b' }} />,
    'Completos': <FaHotdog style={{ color: '#9b282b' }} />,
    'Cono Papas': <TbTriangleInvertedFilled style={{ color: '#9b282b' }} />,
    'Especiales': <FaStar style={{ color: '#9b282b' }} /> // New category icon
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderFlavors = (flavors) => {
    return (
      <div className="extra-category">
        <h4 onClick={handleToggleFlavors}>
          Sabores Disponibles
          <span>{expandedFlavors ? ' ▼' : ' ►'}</span>
        </h4>
        {expandedFlavors && (
          <div className="extra-items">
            {flavors.map((flavor, index) => (
              <div key={index} className="extra-item" onClick={() => handleFlavorSelect(flavor)}>
                <span>{flavor}</span>
                <span className="checkmark">{selectedFlavors.includes(flavor) && '✔'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSauces = (sauces) => {
    return (
      <div className="extra-category">
        <h4 onClick={handleToggleSauces}>
          Salsas Disponibles
          <span>{expandedSauces ? ' ▼' : ' ►'}</span>
        </h4>
        {expandedSauces && (
          <div className="extra-items">
            {sauces.map((sauce, index) => (
              <div key={index} className="extra-item" onClick={() => handleSauceSelect(sauce)}>
                <span>{sauce}</span>
                <span className="checkmark">{selectedSauce === sauce && '✔'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProteins = (proteins) => {
    return (
      <div className="extra-category">
        <h4 onClick={handleToggleProteins}>
          Proteinas Disponibles
          <span>{expandedProteins ? ' ▼' : ' ►'}</span>
        </h4>
        {expandedProteins && (
          <div className="extra-items">
            {proteins.map((protein, index) => (
              <div key={index} className="extra-item" onClick={() => handleProteinSelect(protein)}>
                <span>{protein}</span>
                <span className="checkmark">{selectedProtein === protein && '✔'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAderesos = (aderesos) => {
    return (
      <div className="extra-category">
        <h4 onClick={handleToggleAderesos}>
          Aderezos Disponibles
          <span>{expandedAderesos ? ' ▼' : ' ►'}</span>
        </h4>
        {expandedAderesos && (
          <div className="extra-items">
            {aderesos.map((adereso, index) => (
              <div key={index} className="extra-item" onClick={() => handleAderesoSelect(adereso)}>
                <span>{adereso}</span>
                <span className="checkmark">{selectedAderesos.includes(adereso) && '✔'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderVarieties = (varieties) => {
    return (
      <div className="extra-category">
        <h4 onClick={handleToggleVarieties}>
          Variedades Disponibles
          <span>{expandedVarieties ? ' ▼' : ' ►'}</span>
        </h4>
        {expandedVarieties && (
          <div className="extra-items">
            {varieties.map((variety, index) => (
              <div key={index} className="extra-item" onClick={() => handleVarietySelect(variety)}>
                <span>{variety}</span>
                <span className="checkmark">{selectedVariety === variety && '✔'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBebida = (bebidas) => {
    return (
      <div className="extra-category">
        <h4 onClick={handleToggleVarieties}>
          Bebidas Disponibles
          <span>{expandedVarieties ? ' ▼' : ' ►'}</span>
        </h4>
        {expandedVarieties && (
          <div className="extra-items">
            {bebidas.map((bebida, index) => (
              <div key={index} className="extra-item" onClick={() => handleVarietySelect(bebida)}>
                <span>{bebida}</span>
                <span className="checkmark">{selectedVariety === bebida && '✔'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBebida15 = (bebidas) => {
    return (
      <div className="extra-category">
        <h4 onClick={handleToggleVarieties}>
          Bebidas Disponibles
          <span>{expandedVarieties ? ' ▼' : ' ►'}</span>
        </h4>
        {expandedVarieties && (
          <div className="extra-items">
            {bebidas.map((bebida, index) => (
              <div key={index} className="extra-item" onClick={() => handleVarietySelect(bebida)}>
                <span>{bebida}</span>
                <span className="checkmark">{selectedVariety === bebida && '✔'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBebida350 = (bebidas) => {
    return (
      <div className="extra-category">
        <h4 onClick={handleToggleVarieties}>
          Bebidas Disponibles
          <span>{expandedVarieties ? ' ▼' : ' ►'}</span>
        </h4>
        {expandedVarieties && (
          <div className="extra-items">
            {bebidas.map((bebida, index) => (
              <div key={index} className="extra-item" onClick={() => handleVarietySelect(bebida)}>
                <span>{bebida}</span>
                <span className="checkmark">{selectedVariety === bebida && '✔'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const calculateTotalPrice = () => {
    let totalPrice = selectedProduct.price; // Precio base del producto

    // Sumar el precio de los acompañamientos seleccionados
    selectedAcompanamientos.forEach(acomp => {
      totalPrice += acomp.price * (acomp.quantity || 1);
    });

    // Sumar el precio de las bebidas seleccionadas
    selectedBebidas.forEach(bebida => {
      totalPrice += bebida.price * (bebida.quantity || 1);
    });

    // Sumar el precio de los extras seleccionados
    selectedExtras.forEach(extra => {
      totalPrice += extra.price * (extra.quantity || 1);
    });

    return Math.round(totalPrice); // Precio como Entero
  };

  /*eliminar scroll modal*/
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isModalOpen]);

    useEffect(() => {
      const updateBanners = () => {
        if (window.innerWidth > 768) {
          setBanners([banner1_pc, banner2_pc, banner3_pc]);
        } else {
          setBanners([banner1, banner2, banner3, banner4, banner5, banner6]);
        }
      };
  
      updateBanners(); // Llamada inicial
      window.addEventListener('resize', updateBanners);
  
      return () => {
        window.removeEventListener('resize', updateBanners);
      };
    }, []);

  return (
    <main className="products">

      <Filters onFilterChange={() => {}} />
     
      <div className="category-buttons-container">
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              <span>{category}</span>
              {categoryIcons[category]} 
            </button>
          ))}
        </div>
      </div>
      
      <div className="banner-wrapper">
        <Banner banners={banners} className="products-banner-container" />
      </div>
      
      <div className="products-section-title">
        {isSearching ? 'Buscando Resultados...' : (selectedCategory ? selectedCategory : 'Todos los productos')}
      </div>

      {selectedCategory ? (
        <ul className="product-list">
          {filteredProducts.slice(0, 99).map((product) => (
            <li key={product.id} onClick={() => handleOpenModal(product)}>
              <div className="product-info">
                <h2 className="product-title">{product.title}</h2>
                <p className="product-description">{product.description}</p>
                <div className="product-price-row">
                  <span className="product-price">${product.price.toLocaleString('es-CL')}</span>
                  <span className="product-add-hint">Toca para pedir →</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        categories.map((category) => (
          <div key={category}>
            <h2 className="products-section-title">{category}</h2>
            <ul className="product-list">
              {products.filter((product) => product.category === category).map((product) => (
                <li key={product.id} onClick={() => handleOpenModal(product)}>
                  <div className="product-info">
                    <h2 className="product-title">{product.title}</h2>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price-row">
                      <span className="product-price">${product.price.toLocaleString('es-CL')}</span>
                      <span className="product-add-hint">Toca para pedir →</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      {isModalOpen && selectedProduct && (
        <div className="modal" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <div className="modal-body-header">
                  <h2 className='modal-prod-name'>{selectedProduct.title}</h2>
                  <p className='modal-prod-description'>{selectedProduct.description}</p>
              </div>
            <div className="modal-body">
            
              
              {selectedProduct.flavors && renderFlavors(selectedProduct.flavors)}
              {selectedProduct.sabores && renderFlavors(selectedProduct.sabores)}
              {selectedProduct.salsas && renderSauces(selectedProduct.salsas)}
              {selectedProduct.Proteina && renderProteins(selectedProduct.Proteina)}
              {selectedProduct.Aderezos && renderAderesos(selectedProduct.Aderezos)}
              {selectedProduct.Variedades && renderVarieties(selectedProduct.Variedades)}
              {selectedProduct.Bebida && renderBebida(selectedProduct.Bebida)}
              {selectedProduct.Bebida15 && renderBebida15(selectedProduct.Bebida15)}
              {selectedProduct.Bebida350 && renderBebida350(selectedProduct.Bebida350)}
              {/*<p className='modal-prod-precio'>Precio: ${selectedProduct.price}</p>*/}
              <h3 className='modal-pedido'>Complementa Tu Pedido!</h3>
              {['Acompañamientos', 'Bebidas','Extras'].map((category) => (
                (category !== 'Extras' || !['Postres y Dulces', 'Acompañamientos', 'Pollo Crispy', 'Promociones', 'Bebidas', 'Cafeteria','Especiales'].includes(selectedProduct.category)) && (
                  <div key={category} className={`extra-category ${expandedCategories.includes(category) ? 'expanded' : ''}`}>
                    <h4 onClick={() => handleToggleCategory(category)}>
                      {category}
                      <span>{expandedCategories.includes(category) ? ' ▼' : ' ►'}</span>
                    </h4>
                    {expandedCategories.includes(category) && (
                      <div className="extra-items">
                        {products.filter(product => product.category === category).map(extra => (
                          <div key={extra.id} className="extra-item">
                            <span>{extra.title} (+${extra.price})</span>
                            <div className="extra-item-buttons">
                              <button onClick={() => handleExtraQuantityChange(extra, -1)}>-</button>
                              <span>{selectedExtras.find(item => item.id === extra.id)?.quantity || 0}</span>
                              <button onClick={() => handleExtraQuantityChange(extra, 1)}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
              <button className="button-add" onClick={handleAddToCart}>Añadir al pedido (${calculateTotalPrice()})</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Products;