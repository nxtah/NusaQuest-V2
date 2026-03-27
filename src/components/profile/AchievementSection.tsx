const achievementText = 'Memenangkan permainan dalam kurang dari 10 menit';

export default function AchievementSection() {
  return (
    <section className="profile-section">
      <h3 className="profile-section-title">Achievement</h3>
      <div className="achievement-grid">
        <article className="achievement-card">{achievementText}</article>
        <article className="achievement-card">{achievementText}</article>
      </div>
    </section>
  );
}