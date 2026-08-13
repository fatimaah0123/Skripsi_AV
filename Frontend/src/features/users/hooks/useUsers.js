import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

const EMPTY_ADD_FORM = {
  employee_id: '',
  name:        '',
  email:       '',
  password:    '',
  role:        'Engineer',
};

const useUsers = () => {
  const [users, setUsers]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [formData, setFormData]         = useState(EMPTY_ADD_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError]       = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = useCallback(async (search = '') => {
    setIsLoading(true);
    setError('');
    try {
      const data = await userService.getAll(search);
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data pengguna.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm, fetchUsers]);

  const openAddModal = () => {
    setEditTarget(null);
    setFormData(EMPTY_ADD_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditTarget(user);
    setFormData({
      employee_id: user.employee_id || '',
      email:       user.email || '',
      name:        user.name  || '',
      password:    '',
      role:        user.role  || 'Engineer',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTarget(null);
    setFormData(EMPTY_ADD_FORM);
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
        // PUT /api/users/{id} mewajibkan `name`, dan (per Swagger saat ini) juga `password`.
        // `role` opsional, hanya efektif kalau yang mengedit Admin.
        const payload = { name: formData.name, role: formData.role };
        if (formData.password) payload.password = formData.password;

        await userService.update(editTarget.id, payload);

        // PENTING: PUT /api/users/{id} cuma balikin { status, message },
        // BUKAN objek user yang sudah diupdate. Jadi kita update state lokal
        // secara manual dari data yang baru saja dikirim, bukan dari response API.
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editTarget.id
              ? { ...u, name: payload.name, role: payload.role }
              : u
          )
        );
      } else {
        const created = await userService.create(formData);
        setUsers((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      // Kalau backend masih mewajibkan password di PUT dan kita tidak mengirimnya,
      // beri pesan yang jelas alih-alih pesan generik.
      if (editTarget && !formData.password && err.response?.status === 400) {
        setFormError(
          backendMessage || 'Server mewajibkan password diisi saat mengedit pengguna ini.'
        );
      } else {
        setFormError(backendMessage || 'Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus pengguna.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return {
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
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

export default useUsers;