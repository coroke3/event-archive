import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useTheme } from "next-themes";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [language, setLanguage] = useState("EN");
  const [inProp, setInProp] = useState(true); // フェードイン/アウト制御
  const [themeImageSrc, setThemeImageSrc] = useState(
    "https://i.gyazo.com/70f00bd1015f6f121eb099b11ce450c0.png"
  );

  // 言語を localStorage に保存して、ページリロード時に保持する
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <div className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="menu-btn" onClick={toggleMenu}>
          <div className="menu-btn__burger"></div>
          <div className="menu-btn__burger"></div>
          <div className="menu-btn__burger"></div>
        </div>
        <div className="menu-items">
          <div className="title">
            <Link href="../../../../">Event Archives</Link>
          </div>
          <div className="menubar">
            <div className="menubars ms2">
              <Link href="../../../../user">
                <div class="en">CREATOR</div>クリエイターから探す
              </Link>
            </div>
            <div className="menubars ms2">
              <Link href="../../../../event">
                <div class="en">EVENT</div>イベントから探す
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
