import { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import Button from "../ui/Button";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold"
        >
          Interview
          <span className="text-blue-600">AI</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden gap-8 font-medium md:flex">

          <li>
            <a href="#features" className="hover:text-blue-600">
              Features
            </a>
          </li>

          <li>
            <a href="#pricing" className="hover:text-blue-600">
              Pricing
            </a>
          </li>

          <li>
            <a href="#about" className="hover:text-blue-600">
              About
            </a>
          </li>

        </ul>

        {/* Desktop Buttons */}
        <div className="hidden gap-4 md:flex">

          <Link to="/login">
            <Button variant="secondary">
              Login
            </Button>
          </Link>

          <Link to="/signup">
            <Button>
              Get Started
            </Button>
          </Link>

        </div>

        {/* Mobile Menu Button */}
        <button
          className="text-3xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>

      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t bg-white px-6 py-6 md:hidden">

          <div className="flex flex-col gap-5">

            <a href="#features">Features</a>

            <a href="#pricing">Pricing</a>

            <a href="#about">About</a>

            <Link to="/login">
              Login
            </Link>

            <Link to="/signup">
              <Button>
                Get Started
              </Button>
            </Link>

          </div>

        </div>
      )}

    </header>
  );
};

export default Navbar;