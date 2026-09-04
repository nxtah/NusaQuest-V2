'use client';
import { useEffect, useMemo, useState } from 'react';
import { listenToCollection, usersCollectionPath } from '@/src/services/firebase/firestore/base.service';
import { listenToFeedback, type FeedbackRecord } from '@/src/services/firebase/firestore/feedback.service';

// Bentuk data user secukupnya buat ditampilin di sini — `AppUser` (types/auth.ts)
// gak nyimpen createdAt/updatedAt di tipenya walau dokumen Firestore-nya
// beneran punya field itu (di-set upsertUserFromGoogle tiap kali login).
// `updatedAt` di-refresh SETIAP login (bukan cuma pas edit profil), jadi
// dipake di sini sebagai proksi "kapan terakhir aktif" — bukan makna
// literal namanya, tapi itu satu-satunya jejak login yang beneran ada.
interface MonitoredUser {
  id: string;
  displayName?: string;
  email?: string;
  googlePhotoURL?: string | null;
  firebasePhotoURL?: string | null;
  role?: string;
  stats?: { winStreak?: number };
  createdAt?: { toDate: () => Date } | number;
  updatedAt?: { toDate: () => Date } | number;
}

const GAME_LABEL: Record<FeedbackRecord['gameType'], string> = {
  'ular-tangga': 'Ular Tangga',
  'nusa-card': 'Nusa Card',
};

function formatDate(value: MonitoredUser['createdAt']): string {
  if (!value) return '—';
  const date = typeof value === 'number' ? new Date(value) : value.toDate();
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= rating ? '#f5a916' : 'none'} stroke="#f5a916" strokeWidth="1.5">
          <path d="M12 2l2.9 6.9L22 9.6l-5.5 5 1.6 7.4L12 18.3l-6.1 3.7 1.6-7.4L2 9.6l7.1-0.7z" />
        </svg>
      ))}
    </span>
  );
}

export default function MonitoringPanel() {
  const [tab, setTab] = useState<'users' | 'feedback'>('users');
  const [users, setUsers] = useState<MonitoredUser[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [gameFilter, setGameFilter] = useState<'all' | FeedbackRecord['gameType']>('all');

  useEffect(() => {
    const unsub = listenToCollection<Omit<MonitoredUser, 'id'>>(usersCollectionPath(), (result) => {
      setUsers(result);
      setLoadingUsers(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToFeedback((result) => {
      setFeedback(result);
      setLoadingFeedback(false);
    });
    return () => unsub();
  }, []);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => {
      const ta = typeof a.updatedAt === 'number' ? a.updatedAt : a.updatedAt?.toDate().getTime() ?? 0;
      const tb = typeof b.updatedAt === 'number' ? b.updatedAt : b.updatedAt?.toDate().getTime() ?? 0;
      return tb - ta;
    }),
    [users],
  );

  const filteredFeedback = useMemo(
    () => (gameFilter === 'all' ? feedback : feedback.filter((f) => f.gameType === gameFilter))
      .slice()
      .sort((a, b) => {
        const ta = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt as { toDate: () => Date } | undefined)?.toDate().getTime() ?? 0;
        const tb = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt as { toDate: () => Date } | undefined)?.toDate().getTime() ?? 0;
        return tb - ta;
      }),
    [feedback, gameFilter],
  );

  const avgRating = useMemo(() => {
    if (feedback.length === 0) return null;
    return feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
  }, [feedback]);

  return (
    <div className="nq-admin-panel flex-1 rounded-[1.75rem] p-5 sm:p-8 overflow-hidden flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('users')}
            className={`nq-admin-chip px-4 py-2 rounded-xl text-sm font-bold ${tab === 'users' ? 'nq-admin-chip--active' : ''}`}
          >
            Pengguna ({users.length})
          </button>
          <button
            onClick={() => setTab('feedback')}
            className={`nq-admin-chip px-4 py-2 rounded-xl text-sm font-bold ${tab === 'feedback' ? 'nq-admin-chip--active' : ''}`}
          >
            Feedback ({feedback.length})
          </button>
        </div>

        {tab === 'feedback' && avgRating !== null && (
          <div className="flex items-center gap-2 text-sm font-bold">
            <span>Rata-rata:</span>
            <Stars rating={Math.round(avgRating)} />
            <span className="opacity-70">({avgRating.toFixed(1)})</span>
          </div>
        )}
      </div>

      {tab === 'feedback' && (
        <div className="flex gap-2 mb-5">
          {(['all', 'ular-tangga', 'nusa-card'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGameFilter(g)}
              className={`nq-admin-chip px-4 py-2 rounded-xl text-sm font-bold ${gameFilter === g ? 'nq-admin-chip--active' : ''}`}
            >
              {g === 'all' ? 'Semua Game' : GAME_LABEL[g]}
            </button>
          ))}
        </div>
      )}

      <div className="nq-admin-table-wrap nq-admin-scrollbar flex-1 overflow-auto rounded-2xl">
        {tab === 'users' ? (
          loadingUsers ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#f5a916]/40 border-t-[#f5a916] rounded-full animate-spin" />
                <p className="opacity-60">Memuat...</p>
              </div>
            </div>
          ) : sortedUsers.length > 0 ? (
            <table className="nq-admin-table w-full text-sm text-left">
              <thead className="text-[11px] uppercase font-extrabold tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-5 w-16 text-center">Foto</th>
                  <th className="px-6 py-5">Nama</th>
                  <th className="px-6 py-5">Email</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Win Streak</th>
                  <th className="px-6 py-5">Terakhir Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedUsers.map((u) => {
                  const photo = u.firebasePhotoURL || u.googlePhotoURL;
                  return (
                    <tr key={u.id}>
                      <td className="px-6 py-5">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt={u.displayName || ''} className="w-10 h-10 rounded-full object-cover border border-black/10 mx-auto" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-black/10 mx-auto flex items-center justify-center text-xs font-bold">
                            {(u.displayName || '?')[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 font-bold">{u.displayName || '—'}</td>
                      <td className="px-6 py-5 opacity-80">{u.email || '—'}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 bg-black/5 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-5 opacity-80">{u.stats?.winStreak ?? 0}</td>
                      <td className="px-6 py-5 opacity-80">{formatDate(u.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="opacity-60 text-lg">Belum ada pengguna yang login.</p>
            </div>
          )
        ) : loadingFeedback ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#f5a916]/40 border-t-[#f5a916] rounded-full animate-spin" />
              <p className="opacity-60">Memuat...</p>
            </div>
          </div>
        ) : filteredFeedback.length > 0 ? (
          <table className="nq-admin-table w-full text-sm text-left">
            <thead className="text-[11px] uppercase font-extrabold tracking-widest sticky top-0 z-10">
              <tr>
                <th className="px-6 py-5">Pengguna</th>
                <th className="px-6 py-5">Game</th>
                <th className="px-6 py-5">Provinsi</th>
                <th className="px-6 py-5">Rating</th>
                <th className="px-6 py-5">Saran</th>
                <th className="px-6 py-5">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFeedback.map((f) => (
                <tr key={f.id}>
                  <td className="px-6 py-5 font-bold">{f.userName}</td>
                  <td className="px-6 py-5 opacity-80">{GAME_LABEL[f.gameType]}</td>
                  <td className="px-6 py-5 opacity-80">{f.regionId}</td>
                  <td className="px-6 py-5"><Stars rating={f.rating} /></td>
                  <td className="px-6 py-5 opacity-80 max-w-xs">{f.comment || <span className="opacity-40">—</span>}</td>
                  <td className="px-6 py-5 opacity-80">{formatDate(f.createdAt as MonitoredUser['createdAt'])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="opacity-60 text-lg">Belum ada feedback yang masuk.</p>
          </div>
        )}
      </div>
    </div>
  );
}
