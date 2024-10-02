import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { ThemeSwitcher } from "./ThemeSwitcher";
import Image from "next/image";
import { useTheme } from "next-themes";

function Header() {
  // Step 2: Add a state variable to track the menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { resolvedTheme } = useTheme();
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    // Determine the image source based on the resolved theme
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
    setImageSrc(src);
    console.log("Theme changed to:", resolvedTheme); // テーマ変更時にログを出力
  }, [resolvedTheme]);

  // Step 3: Create a function to toggle the menu state
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
            <Link href="../../../../">
              <h1 className="sitetitle2">- movie event</h1>
              <h1 className="sitetitle">Event Archives</h1>
            </Link>
          </div>
          <div className="menubar">
          <div className="menubars ms2">
              <Link href="../../../../user">user</Link>
            </div>


          </div>
          <ThemeSwitcher />

        </div>
      </div>
    </header>
  );
}

export default Header;
