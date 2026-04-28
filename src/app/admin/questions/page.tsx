'use client';

import {useEffect, useState} from 'react';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {subscribeAdminQuestions} from '@/src/features/admin/services/admin.service';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Record<string, any>>({});
  const [selectedTopic, setSelectedTopic] = useState('daerah_jawa_barat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedTopic) return;

    setLoading(true);
    const unsubscribe = subscribeAdminQuestions(selectedTopic, (data) => {
      setQuestions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedTopic]);

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h1>Manage Questions</h1>

        <div className="mb-4">
          <label htmlFor="topic-select">Select Topic:</label>
          <select
            id="topic-select"
            className="form-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="daerah_jawa_barat">Daerah Jawa Barat</option>
            <option value="kuliner_jawa_barat">Kuliner Jawa Barat</option>
            <option value="pariwisata_bahari">Pariwisata Bahari</option>
            <option value="pariwisata_darat">Pariwisata Darat</option>
            <option value="permainan_daerah">Permainan Daerah</option>
          </select>
        </div>

        {loading ? (
          <p>Loading questions...</p>
        ) : (
          <div>
            <p>Total Questions: {Object.keys(questions).length}</p>
            <button className="btn btn-primary mb-3">Add New Question</button>

            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Question</th>
                    <th>Correct Answer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(questions).map(([id, question]: [string, any]) => (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{question.question?.substring(0, 50)}...</td>
                      <td>{question.options?.[question.correctAnswer] || 'N/A'}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1">Edit</button>
                        <button className="btn btn-sm btn-danger">Delete</button>
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
