'use client';

export interface FooterProps {
  textColor?: string;
}

export default function Footer({textColor = '#666'}: FooterProps) {
  return (
    <footer className="footer-container mt-5 py-4 border-top" style={{color: textColor}}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h6>About NusaQuest</h6>
            <p>Educational game platform exploring Indonesian culture.</p>
          </div>
          <div className="col-md-4">
            <h6>Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none">Home</a></li>
              <li><a href="/information" className="text-decoration-none">Information</a></li>
              <li><a href="/credit" className="text-decoration-none">Credit</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Follow Us</h6>
            <p>👀 Social media links coming soon</p>
          </div>
        </div>
        <hr />
        <div className="text-center mt-3">
          <p>&copy; 2026 NusaQuest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
