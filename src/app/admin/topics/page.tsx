'use client';

import {useEffect, useState} from 'react';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {subscribeAdminTopics} from '@/src/features/admin/services/admin.service';

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAdminTopics((data) => {
      setTopics(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h1>Manage Topics</h1>

        {loading ? (
          <p>Loading topics...</p>
        ) : (
          <div>
            <button className="btn btn-primary mb-3">Add New Topic</button>
            <p>Total Topics: {Object.keys(topics).length}</p>

            <div className="row">
              {Object.entries(topics).map(([id, topic]: [string, any]) => (
                <div key={id} className="col-md-4 mb-3">
                  <div className="card">
                    {topic.image && <img src={topic.image} alt={topic.name} className="card-img-top" />}
                    <div className="card-body">
                      <h5>{topic.name}</h5>
                      <p>{topic.description}</p>
                      <button className="btn btn-sm btn-warning me-1">Edit</button>
                      <button className="btn btn-sm btn-danger">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
