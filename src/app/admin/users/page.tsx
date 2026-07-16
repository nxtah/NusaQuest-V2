'use client';

import {useEffect, useState} from 'react';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {subscribeAdminUsers} from '@/src/features/admin/services/admin.service';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAdminUsers((data) => {
      setUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h1>Manage Users</h1>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div>
            <p>Total Users: {Object.keys(users).length}</p>

            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(users).map(([uid, user]: [string, any]) => (
                    <tr key={uid}>
                      <td>{uid.substring(0, 8)}...</td>
                      <td>{user.displayName}</td>
                      <td>{user.email}</td>
                      <td>{user.role || 'user'}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1">Edit Role</button>
                        <button className="btn btn-sm btn-danger">Deactivate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
