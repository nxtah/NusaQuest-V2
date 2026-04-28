'use client';

import {useEffect, useState} from 'react';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {subscribeUserProfile, subscribeUserAchievements, subscribeUserInventory} from '@/src/features/profile/services/profile.service';
import type {UserProfile, UserAchievement, UserInventory} from '@/src/features/profile/services/profile.service';

export default function ProfilePage() {
  const {user, isInitialized} = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Record<string, UserAchievement>>({});
  const [inventory, setInventory] = useState<UserInventory>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!isInitialized || !user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubProfile = subscribeUserProfile(user.uid, (data) => {
      setProfile(data);
      if (data?.displayName) setDisplayName(data.displayName);
      setLoading(false);
    });

    const unsubAchievements = subscribeUserAchievements(user.uid, setAchievements);
    const unsubInventory = subscribeUserInventory(user.uid, setInventory);

    return () => {
      unsubProfile();
      unsubAchievements();
      unsubInventory();
    };
  }, [user?.uid, isInitialized]);

  if (loading) {
    return (
      <main>
        <Header showBackIcon />
        <div className="py-5 text-center">Loading profile...</div>
        <Footer />
      </main>
    );
  }

  if (!profile) {
    return (
      <main>
        <Header showBackIcon />
        <div className="py-5 text-center">Profile not found</div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <div className="row">
          {/* Profile Info */}
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body text-center">
                {profile.photoURL && (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="rounded-circle mb-3"
                    width="120"
                  />
                )}
                <h5>{profile.displayName}</h5>
                <p className="text-muted">{profile.email}</p>

                {editMode ? (
                  <div>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="New display name"
                    />
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => setEditMode(false)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setDisplayName(profile.displayName);
                        setEditMode(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Achievements & Inventory */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5>Achievements</h5>
              </div>
              <div className="card-body">
                {Object.keys(achievements).length === 0 ? (
                  <p>No achievements yet</p>
                ) : (
                  <div className="row">
                    {Object.entries(achievements).map(([id, achievement]) => (
                      <div key={id} className="col-md-4 mb-3">
                        <div className="card text-center">
                          {achievement.icon && <div className="fs-1">{achievement.icon}</div>}
                          <h6>{achievement.name}</h6>
                          <small>{achievement.description}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5>Inventory</h5>
              </div>
              <div className="card-body">
                {Object.keys(inventory).length === 0 ? (
                  <p>Inventory empty</p>
                ) : (
                  <div>
                    {inventory.potions && (
                      <div>
                        <h6>Potions</h6>
                        <div className="row">
                          {Object.entries(inventory.potions).map(([potion, count]) => (
                            <div key={potion} className="col-md-6 mb-2">
                              <span>{potion}: </span>
                              <strong>{count}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
