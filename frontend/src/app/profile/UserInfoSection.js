// profile/UserInfoSection.js
import React from 'react';

const UserInfoSection = ({ userData }) => {
  if (!userData) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <p className="mt-1 text-sm text-gray-900">{userData.firstName} {userData.lastName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
        </div>
        {userData.phone && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <p className="mt-1 text-sm text-gray-900">{userData.phone}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoSection;