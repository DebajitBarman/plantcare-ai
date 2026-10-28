import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Streamlined Pages
import Detection from './pages/Detection';
import Result from './pages/Result';
import DiseaseLibrary from './pages/DiseaseLibrary';
import DiseaseDetail from './pages/DiseaseDetail';
import TreatmentsSupplements from './pages/TreatmentsSupplements';
import History from './pages/History';
import About from './pages/About';

export default function App() {
  const [activePage, setActivePage] = useState('detect');
  const [currentReport, setCurrentReport] = useState(null);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null);

  const handleScanComplete = (report) => {
    setCurrentReport(report);
    setActivePage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDisease = (diseaseId) => {
    setSelectedDiseaseId(diseaseId);
    setActivePage('disease-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'detect' && (
          <Detection onScanComplete={handleScanComplete} />
        )}

        {activePage === 'result' && (
          <Result
            report={currentReport}
            onNewScan={() => setActivePage('detect')}
          />
        )}

        {activePage === 'library' && (
          <DiseaseLibrary onSelectDisease={handleSelectDisease} />
        )}

        {activePage === 'disease-detail' && (
          <DiseaseDetail
            diseaseId={selectedDiseaseId}
            onBack={() => setActivePage('library')}
          />
        )}

        {activePage === 'treatments' && <TreatmentsSupplements />}

        {activePage === 'history' && (
          <History
            onViewReport={(rep) => {
              setCurrentReport(rep);
              setActivePage('result');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNewScan={() => setActivePage('detect')}
          />
        )}

        {activePage === 'about' && <About setActivePage={setActivePage} />}
      </main>

      {/* Global Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
