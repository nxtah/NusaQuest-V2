'use client';

import {useEffect, useState} from 'react';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';

export default function AdminGamesPage() {
  const [loading, setLoading] = useState(false);

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h1>Manage Games</h1>

        <div>
          <button className="btn btn-primary mb-3">Add New Game</button>

          <div className="alert alert-info">
            Games management interface - list and configure available games
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5>NusaCard</h5>
                  <p>Card matching game with Indonesian themes</p>
                  <button className="btn btn-sm btn-warning me-1">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5>Ular Tangga</h5>
                  <p>Snakes and Ladders board game</p>
                  <button className="btn btn-sm btn-warning me-1">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
