import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { teamApi } from '../../services/adminApi';
import { useDebounce } from '../../hooks/useDebounce';
import { DataState } from '../../components/ui/DataState';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  createdAt: string;
}

export const TeamList: React.FC = () => {
  const { isDarkMode, showToast } = useAdmin();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamApi.getAll();
      setTeamMembers(data);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load team members'));
      showToast('Failed to load team members', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleDelete = async (id: string) => {
    try {
      await teamApi.delete(id);
      setTeamMembers(teamMembers.filter((t) => t.id !== id));
      showToast('Team member deleted successfully', 'success');
      setDeleteId(null);
    } catch {
      showToast('Failed to delete team member', 'error');
    }
  };

  const filteredTeamMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    member.role.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Team Members
        </h1>
        <Link
          to="/admin/team/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-primary`}
          />
        </div>
      </div>

      {/* Team Members List */}
      <DataState
        isLoading={loading}
        isError={isError}
        error={error}
        isEmpty={filteredTeamMembers.length === 0}
        onRetry={fetchTeamMembers}
        variant="default"
        messages={{
          loading: 'Loading team members...',
          error: 'Failed to load team members. Please try again.',
          empty: 'No team members found'
        }}
      >
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className={`w-full rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Photo
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bio
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredTeamMembers.map((member) => (
                  <tr key={member.id} className={isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="font-medium">{member.name}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {member.role}
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="max-w-md truncate">{member.bio}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/team/edit/${member.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredTeamMembers.map((member) => (
              <div
                key={member.id}
                className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {member.name}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {member.role}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/team/edit/${member.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </>
      </DataState>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Confirm Delete
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete this team member? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
