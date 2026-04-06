import { createContext, useContext, useState, useMemo } from 'react';
import { LOANS } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [filters, setFilters] = useState({ status: '', loanType: '', stage: '', search: '' });
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [modalType, setModalType] = useState(null); // 'extraction' | 'ruleReview'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredLoans = useMemo(() => {
    return LOANS.filter(loan => {
      if (filters.status && loan.status !== filters.status) return false;
      if (filters.loanType && loan.loanType !== filters.loanType) return false;
      if (filters.stage && loan.currentStage !== filters.stage) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return loan.id.toLowerCase().includes(q) ||
          loan.borrowerName.toLowerCase().includes(q) ||
          loan.propertyAddress.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filters]);

  const openModal = (loan, type) => { setSelectedLoan(loan); setModalType(type); };
  const closeModal = () => { setSelectedLoan(null); setModalType(null); };

  return (
    <AppContext.Provider value={{
      loans: LOANS,
      filteredLoans,
      filters, setFilters,
      selectedLoan, modalType,
      openModal, closeModal,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
