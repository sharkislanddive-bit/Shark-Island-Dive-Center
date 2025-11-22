import React, { useState } from 'react';
import { ViewState } from './types';
import { BookingEngine } from './components/BookingEngine';
import { AdminPanel } from './components/AdminPanel';
import { Hero } from './components/Hero';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.BOOKING);

  const handleAdminEntry = () => {
    // Simple mock auth
    const pass = prompt("Enter Admin Password (hint: 'shark')");
    if (pass === 'shark') {
      setView(ViewState.ADMIN);
    } else {
      alert("Access Denied");
    }
  };

  const scrollToBooking = () => {
    const element = document.getElementById('booking-start');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-shark-50">
      {/* Navbar */}
      <nav className="bg-shark-950 text-white py-4 px-6 sticky top-0 z-50 shadow-md border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <div 
            className="font-bold text-lg md:text-2xl tracking-tighter flex items-center gap-2 cursor-pointer"
            onClick={() => setView(ViewState.BOOKING)}
          >
            <span className="text-teal-400">SHARK ISLAND</span> DIVE CENTER FUVAHMULAH
          </div>
          <div className="flex gap-6 text-sm font-medium items-center">
             <a 
               href="https://www.sharkislanddive.com" 
               className="text-white hover:text-teal-400 transition-colors font-bold tracking-wide border border-white/20 hover:border-teal-400 px-4 py-2 rounded-full"
             >
               HOME
             </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-grow flex flex-col">
        {view === ViewState.BOOKING && (
          <>
            <Hero onBookNow={scrollToBooking} />
            <div id="booking-start">
              <BookingEngine onBookingComplete={() => window.location.reload()} />
            </div>
          </>
        )}
        
        {view === ViewState.ADMIN && (
          <AdminPanel onClose={() => setView(ViewState.BOOKING)} />
        )}
      </main>

      {/* Custom Footer */}
      <footer id="sidc-footer">
        <style>{`
          #sidc-footer{
            --sidc-footer-bg:#000056;
            --sidc-footer-text:#e6edff;
            --sidc-footer-muted:#9aa6d9;
            --sidc-aqua:#02c2c2;
            --sidc-aqua-soft:rgba(2,194,194,.15);
            --sidc-radius:14px;

            font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
            background:var(--sidc-footer-bg);
            color:var(--sidc-footer-text);
            padding:46px 0 22px;
            position:relative;
            overflow:hidden;
          }
          #sidc-footer::before{
            content:"";
            position:absolute;
            top:0;
            left:0;
            right:0;
            height:3px;
            background:linear-gradient(90deg, var(--sidc-aqua), transparent);
            opacity:.7;
          }
          #sidc-footer .wrap{
            max-width:1180px;
            margin:0 auto;
            padding:0 18px;
            opacity:0;
            transform:translateY(20px);
            animation:sidc-footer-fadeUp .7s ease-out .05s forwards;
          }
          #sidc-footer .grid{
            display:flex;
            flex-wrap:wrap;
            gap:34px;
            margin-bottom:26px;
          }
          #sidc-footer .brand-col{
            flex:1 1 300px;
            min-width:260px;
            opacity:0;
            transform:translateY(18px);
            animation:sidc-footer-itemUp .7s ease-out .12s forwards;
          }
          #sidc-footer .col-links{
            flex:0 0 190px;
            min-width:170px;
            opacity:0;
            transform:translateY(18px);
            animation:sidc-footer-itemUp .7s ease-out .19s forwards;
          }
          #sidc-footer .col-contact{
            flex:1 1 260px;
            min-width:220px;
            opacity:0;
            transform:translateY(18px);
            animation:sidc-footer-itemUp .7s ease-out .26s forwards;
          }
          #sidc-footer .brand-row{
            display:flex;
            align-items:center;
            gap:12px;
            margin-bottom:12px;
          }
          #sidc-footer .brand-logo{
            width:64px;
            height:auto;
            display:block;
            filter:drop-shadow(0 6px 16px rgba(0,0,0,.55));
          }
          #sidc-footer .brand-name{
            font-size:16px;
            font-weight:700;
            letter-spacing:.16em;
            text-transform:uppercase;
          }
          #sidc-footer .brand-text{
            font-size:14px;
            line-height:1.7;
            color:var(--sidc-footer-muted);
            max-width:380px;
          }
          #sidc-footer .social-row{
            display:flex;
            flex-wrap:wrap;
            gap:10px;
            margin-top:14px;
          }
          #sidc-footer .social-pill{
            padding:7px 14px;
            border-radius:999px;
            border:1px solid rgba(255,255,255,.14);
            background:rgba(255,255,255,.04);
            font-size:12px;
            color:var(--sidc-footer-text);
            display:inline-flex;
            align-items:center;
            gap:6px;
            text-decoration:none;
            backdrop-filter:blur(12px);
            opacity:.9;
            transition:background .22s ease,border-color .22s ease,color .22s ease,transform .22s ease,box-shadow .22s ease;
          }
          #sidc-footer .social-pill:hover{
            background:var(--sidc-aqua-soft);
            border-color:var(--sidc-aqua);
            color:#ffffff;
            transform:translateY(-2px);
            box-shadow:0 8px 20px rgba(0,0,0,.5);
            opacity:1;
          }
          #sidc-footer h4{
            font-size:13px;
            text-transform:uppercase;
            letter-spacing:.18em;
            margin:0 0 10px;
            color:#ffffff;
          }
          #sidc-footer .footer-links,
          #sidc-footer .contact-list{
            list-style:none;
            padding:0;
            margin:0;
            display:grid;
            gap:7px;
          }
          #sidc-footer a{
            color:var(--sidc-footer-text);
            text-decoration:none;
            opacity:.86;
            transition:color .22s ease,opacity .22s ease,transform .22s ease;
          }
          #sidc-footer .footer-links a:hover{
            opacity:1;
            color:var(--sidc-aqua);
            transform:translateX(2px);
          }
          #sidc-footer .contact-item{
            display:flex;
            align-items:flex-start;
            gap:8px;
            font-size:13px;
            color:var(--sidc-footer-muted);
          }
          #sidc-footer .contact-icon{
            width:16px;
            flex-shrink:0;
            margin-top:2px;
            opacity:.85;
          }
          #sidc-footer .contact-icon svg{
            stroke:var(--sidc-footer-text);
          }
          #sidc-footer .contact-label{
            font-weight:600;
            color:var(--sidc-footer-text);
            display:block;
            margin-bottom:1px;
            font-size:12px;
          }
          #sidc-footer .contact-link{
            display:inline-block;
          }
          #sidc-footer .contact-link:hover{
            color:var(--sidc-aqua);
            opacity:1;
            transform:translateX(2px);
          }
          #sidc-footer .grid-divider{
            border-top:1px solid rgba(255,255,255,.08);
            margin:10px 0 0;
          }
          #sidc-footer-bottom{
            border-top:1px solid rgba(255,255,255,.10);
            margin-top:18px;
            padding-top:10px;
            display:flex;
            flex-wrap:wrap;
            justify-content:space-between;
            gap:10px;
            font-size:12px;
            color:var(--sidc-footer-muted);
            opacity:0;
            transform:translateY(12px);
            animation:sidc-footer-itemUp .7s ease-out .32s forwards;
          }
          #sidc-footer-bottom .bottom-right{
            display:flex;
            flex-wrap:wrap;
            gap:14px;
          }
          @keyframes sidc-footer-fadeUp{
            from{opacity:0;transform:translateY(20px);}
            to{opacity:1;transform:translateY(0);}
          }
          @keyframes sidc-footer-itemUp{
            from{opacity:0;transform:translateY(18px);}
            to{opacity:1;transform:translateY(0);}
          }
          @media(max-width:768px){
            #sidc-footer{
              padding:40px 0 20px;
            }
            #sidc-footer .grid{
              flex-direction:column;
            }
            #sidc-footer .brand-text{
              max-width:none;
            }
          }
        `}</style>

        <div className="wrap">
          <div className="grid">
            <div className="brand-col">
              <div className="brand-row">
                <img
                  src="https://assets.zyrosite.com/bDCPmsHCWq3kN8C5/sid_logo-07-1-Wmq015ro04DJCat3.png"
                  alt="Shark Island Dive logo"
                  className="brand-logo"
                />
                <div className="brand-name">Shark Island Dive</div>
              </div>

              <p className="brand-text">
                Shark-focused diving in Fuvahmulah guided by owner &amp; local shark expert <strong>Lonu</strong>.  
                Small groups, safety-first operations and year-round tiger shark encounters in the deep blue.
              </p>

              <div className="social-row">
                <a href="https://www.instagram.com/sharkislanddive/" className="social-pill" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
                <a href="https://www.facebook.com/sharkislanddivemv" className="social-pill" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                <a href="https://www.tiktok.com/@sharkislanddive" className="social-pill" target="_blank" rel="noopener noreferrer">
                  TikTok
                </a>
                <a href="https://wa.me/9607786655" className="social-pill" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="col-links">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#" onClick={(e) => e.preventDefault()}>Diving in Fuvahmulah</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Diving Price List</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Diving Packages</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Getting Here</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>About Us</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a></li>
              </ul>
            </div>

            <div className="col-contact">
              <h4>Contact</h4>
              <ul className="contact-list">
                <li className="contact-item">
                  <span className="contact-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" strokeWidth="1.5"/>
                      <path d="M4 7l8 6 8-6" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </span>
                  <span>
                    <span className="contact-label">Email</span>
                    <a href="mailto:hello@sharkislanddive.com" className="contact-link">hello@sharkislanddive.com</a>
                  </span>
                </li>

                <li className="contact-item">
                  <span className="contact-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.5 4.5c.3-.9 1.1-1.5 2.1-1.5h1c.9 0 1.7.6 1.9 1.5l.4 1.6c.2.8-.2 1.7-.9 2.1l-.9.5c.7 1.4 1.8 2.6 3.2 3.3l.5-.9c.4-.7 1.3-1.1 2.1-.9l1.6.4c.9.2 1.5 1 1.5 1.9v1c0 1-.6 1.8-1.5 2.1-1.3.4-3.4.8-6.1-.4-2.5-1.1-4.4-3-5.5-5.5-1.2-2.7-.8-4.8-.4-6.1z" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </span>
                  <span>
                    <span className="contact-label">Call / WhatsApp</span>
                    <a href="tel:+9607786655" className="contact-link">+960 778-6655</a>
                  </span>
                </li>

                <li className="contact-item">
                  <span className="contact-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3.5c-2.5 0-4.5 2-4.5 4.5 0 3.2 3.2 6.9 4.1 7.9.2.2.6.2.8 0 .9-1 4.1-4.7 4.1-7.9 0-2.5-2-4.5-4.5-4.5z" strokeWidth="1.5" fill="none"/>
                      <circle cx="12" cy="8" r="1.8" strokeWidth="1.4" fill="none"/>
                    </svg>
                  </span>
                  <span>
                    <span className="contact-label">Location</span>
                    Fuvahmulah, Maldives
                  </span>
                </li>

                <li className="contact-item">
                  <span className="contact-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 5h14v10H5z" strokeWidth="1.5" fill="none"/>
                      <path d="M5 9h14" strokeWidth="1.5"/>
                      <path d="M9 5v14" strokeWidth="1.5"/>
                    </svg>
                  </span>
                  <span>
                    <span className="contact-label">Google Maps</span>
                    <a href="https://maps.app.goo.gl/1ruA9G1YtRC696u49" target="_blank" rel="noopener noreferrer" className="contact-link">
                      Open Shark Island Dive on Google Maps
                    </a>
                  </span>
                </li>
              </ul>
              <div className="grid-divider"></div>
            </div>
          </div>

          <div id="sidc-footer-bottom">
            <div className="bottom-left">
              © {new Date().getFullYear()} Shark Island Dive Center · Fuvahmulah, Maldives
            </div>
            <div className="bottom-right">
              <span>Responsible shark diving</span>
              <span>Safety-focused operations</span>
              <button onClick={handleAdminEntry} className="text-shark-300/20 hover:text-shark-300 transition-colors text-[10px]">Admin</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;