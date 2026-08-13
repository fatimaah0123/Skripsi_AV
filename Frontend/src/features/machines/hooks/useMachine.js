import { useState, useEffect, useCallback, useMemo } from 'react';
import { machineService } from '../services/machineServices';

const EMPTY_FORM = {
  name:         '',
  code:         '',
  type:         '',
  location:     '',
  install_date: '',
};

// Peringkat kekritisan mesin: Critical paling atas, lalu Warning, lalu Normal
const CRITICALITY_RANK = {
  H: 0, HIGH: 0, CRITICAL: 0,
  M: 1, MEDIUM: 1, WARNING: 1,
  L: 2, LOW: 2, NORMAL: 2,
};

const getCriticalityRank = (type) => {
  const normalized = String(type || '').toUpperCase();
  return CRITICALITY_RANK[normalized] ?? 3; // tipe tak dikenal ditaruh paling bawah
};

const useMachine = () => {
  const [machines, setMachines]     = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [sortBy, setSortBy]       = useState('name'); // 'name' | 'criticality' | 'install_date'
  const [sortOrder, setSortOrder] = useState('asc');  // 'asc' | 'desc'

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError]       = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchMachines = useCallback(async (search = '') => {
    setIsLoading(true);
    setError('');
    try {
      const data = await machineService.getAll(search);
      setMachines(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data mesin.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMachines(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchMachines]);

  // Urutkan mesin sesuai sortBy & sortOrder, default abjad (A-Z) berdasarkan nama
  const sortedMachines = useMemo(() => {
    const sorted = [...machines].sort((a, b) => {
      let compareResult = 0;

      if (sortBy === 'criticality') {
        compareResult = getCriticalityRank(a.type) - getCriticalityRank(b.type);
      } else if (sortBy === 'install_date') {
        const dateA = a.install_date ? new Date(a.install_date).getTime() : 0;
        const dateB = b.install_date ? new Date(b.install_date).getTime() : 0;
        compareResult = dateA - dateB;
      } else {
        compareResult = (a.name || '').localeCompare(b.name || '');
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });
    return sorted;
  }, [machines, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const openAddModal = () => {
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (machine) => {
    setEditTarget(machine);
    setFormData({
      name:         machine.name || '',
      code:         machine.code || '',
      type:         machine.type || '',
      location:     machine.location || '',
      install_date: machine.install_date ? machine.install_date.slice(0, 10) : '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTarget(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editTarget) {
        const updated = await machineService.update(editTarget.id, formData);
        setMachines((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
      } else {
        const created = await machineService.create(formData);
        setMachines((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await machineService.remove(id);
      setMachines((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus mesin.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return {
    machines: sortedMachines,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    isModalOpen,
    editTarget,
    formData,
    formError,
    isSubmitting,
    openAddModal,
    openEditModal,
    closeModal,
    handleChange,
    handleSubmit,
    deleteTarget,
    setDeleteTarget,
    handleDelete,
  };
};

export default useMachine;