import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Doodle çizgi arka plan - Tek kalın çizgi */}
        <div className="fixed inset-0 pointer-events-none">
          <svg 
            className="absolute w-full h-[200%]" 
            width="100%" 
            height="200%" 
            viewBox="0 0 1920 2160" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path 
              d="M-100,200 C100,300 300,150 400,250 
                 C500,350 450,500 600,450 
                 C750,400 850,650 950,550 
                 C1050,450 1200,300 1300,400 
                 C1400,500 1300,700 1500,800 
                 C1700,900 1800,750 1900,850 
                 C2000,950 2100,800 2200,900
                 
                 M-150,900 C0,950 100,1050 300,950 
                 C500,850 700,1000 800,1100 
                 C900,1200 1100,1100 1200,1200 
                 C1300,1300 1500,1150 1700,1250 
                 C1900,1350 2100,1250 2300,1300
                 
                 M50,1400 C200,1300 350,1500 450,1600 
                 C550,1700 750,1500 900,1600 
                 C1050,1700 1200,1500 1350,1650 
                 C1500,1800 1650,1600 1800,1700 
                 C1950,1800 2100,1700 2250,1800" 
              stroke="#16a34a" 
              strokeWidth="25" 
              fill="none" 
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0"
              strokeOpacity="0.3"
            />
          </svg>
        </div>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;