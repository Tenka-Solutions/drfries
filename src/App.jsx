import { useState, useEffect } from 'react';
import { products as initialProducts } from './mocks/products.json';
import { Products } from './components/Products.jsx';
import { Header } from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { useFilters } from './hooks/useFilters.js';
import { Cart } from './components/Cart.jsx';
import { CartProvider } from './context/cart.jsx';
import HomePage from './components/HomePage.jsx';
import Contacto from './components/Contacto.jsx';
import { Eventos } from './components/Eventos.jsx';
import { Sugerencias } from './components/Sugerencias.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Trabaja from './components/Trabaja.jsx';
import Acerca from './components/Acerca.jsx';
import ConfirmationPage from './components/ConfirmationPage.jsx';
import ResultadoTransaccion from './pages/ResultadoTransaccion';
import './index.css';

function App() {
  const { filterProducts } = useFilters();
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('currentPage') || 'homepage');
  const [searchText, setSearchText] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  const handleGoToPage = (page) => {
    setCurrentPage(page);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const filteredProducts = initialProducts.filter((product) => {
    const matchesTitle = product.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = product.category.toLowerCase().includes(searchText.toLowerCase());
    return matchesTitle || matchesCategory;
  });

  return (
    <Router>
      <CartProvider>
        <Header onNavigate={handleGoToPage} onSearchTextChange={setSearchText} toggleCart={toggleCart} />
        <div className="content">
          <Cart isOpen={isCartOpen} toggleCart={toggleCart} />
          <Routes>
            <Route path="/" element={<HomePage onStartShopping={() => handleGoToPage('products')} isCartOpen={isCartOpen} />} />
            <Route path="/inicio" element={<HomePage onStartShopping={() => handleGoToPage('products')} isCartOpen={isCartOpen} />} />
            <Route path="/products" element={<Products products={filteredProducts} searchText={searchText} />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/sugerencias" element={<Sugerencias />} />
            <Route path="/trabaja" element={<Trabaja />} />
            <Route path="/acerca" element={<Acerca />} />
            <Route path="/confirmacion" element={<ConfirmationPage />} />
            <Route path="/resultado-transaccion" element={<ResultadoTransaccion />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
