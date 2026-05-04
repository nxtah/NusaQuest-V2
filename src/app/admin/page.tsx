'use client';

import Link from 'next/link';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';

export default function AdminPage() {
  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h1>Admin Dashboard</h1>
        <div className="row mt-4">
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5>Manage Questions</h5>
                <p>Create, edit, and delete game questions</p>
                <Link href="/admin/questions" className="btn btn-primary">
                  Go to Questions
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5>Manage Topics</h5>
                <p>Create, edit, and delete game topics</p>
                <Link href="/admin/topics" className="btn btn-primary">
                  Go to Topics
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5>Manage Games</h5>
                <p>Create, edit, and delete games</p>
                <Link href="/admin/games" className="btn btn-primary">
                  Go to Games
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5>Manage Users</h5>
                <p>View and manage user accounts</p>
                <Link href="/admin/users" className="btn btn-primary">
                  Go to Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
