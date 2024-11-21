import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useTheme } from "next-themes";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <div className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}>
        <div
          className={`menu-btn ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <div className="menu-btn__burger"></div>
          <div className="menu-btn__burger"></div>
          <div className="menu-btn__burger"></div>
        </div>
        <div className="menu-items">
          <div className="title">
            <Link href="../../../../">Event Archives</Link>
          </div>
          <div className="menubar">
            <div className="menubars">
              <Link href="../../../../user">
                <div className="en">CREATOR</div>
                クリエイターから探す
              </Link>
            </div>
            <div className="menubars">
              <Link href="../../../../event">
                <div className="en">EVENT</div>
                イベントから探す
              </Link>
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export default Header;
