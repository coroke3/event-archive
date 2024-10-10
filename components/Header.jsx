import { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useTheme } from "next-themes";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [language, setLanguage] = useState("EN");
  const [inProp, setInProp] = useState(true); // フェードイン/アウト制御

  // 言語を localStorage に保存して、ページリロード時に保持する
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    let src;
    switch (resolvedTheme) {
      case "light":
        src = "https://i.gyazo.com/70f00bd1015f6f121eb099b11ce450c0.png";
        break;
      case "dark":
        src = "https://i.gyazo.com/f736d6fc965df51b682ccc29bc842eaf.png";
        break;
      default:
        src = "https://i.gyazo.com/70f00bd1015f6f121eb099b11ce450c0.png";
        break;
    }
  }, [resolvedTheme]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setInProp(false); // フェードアウト開始
    setTimeout(() => {
      const newLanguage = language === "JP" ? "EN" : "JP";
      setLanguage(newLanguage);
      localStorage.setItem("language", newLanguage); // 言語をlocalStorageに保存
      setInProp(true); // フェードイン開始
    }, 500); // アニメーション時間と一致させる
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
            <Link href="../../../../">
              <CSSTransition
                in={inProp}
                timeout={500}
                classNames="fade"
                unmountOnExit
              >
                <h1 className="sitetitle">
               Event Archives
                </h1>
              </CSSTransition>
            </Link>
          </div>
          <div className="menubar">
            <div className="menubars ms2">
              <Link href="../../../../user">
                <CSSTransition
                  in={inProp}
                  timeout={500}
                  classNames="fade"
                  unmountOnExit
                >
                  <span>
                 クリエイター
                  </span>
                </CSSTransition>
              </Link>
            </div>
            <div className="menubars ms2">
              <Link href="../../../../event">
                <CSSTransition
                  in={inProp}
                  timeout={500}
                  classNames="fade"
                  unmountOnExit
                >
                  <span>
                イベント
                  </span>
                </CSSTransition>
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
