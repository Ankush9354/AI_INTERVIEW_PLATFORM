import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  HiHome,
  HiUser,
  HiClipboardList,
  HiDocumentText,
  HiSparkles,
  HiLogout,
} from "react-icons/hi";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold">AI Interview</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-slate-800"
        >
          <HiHome size={22} />
          Dashboard
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-slate-800"
        >
          <HiUser size={22} />
          Profile
        </Link>

        <Link
          to="/interviews"
          className="flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-slate-800"
        >
          <HiClipboardList size={22} />
          Interviews
        </Link>

        <Link
          to="/resume"
          className="flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-slate-800"
        >
          <HiDocumentText size={22} />
          Resume
        </Link>

        <Link
          to="/interview"
          className="flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-slate-800"
        >
          <HiSparkles size={22} />
          AI Interview
        </Link>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="m-4 flex items-center justify-center gap-3 rounded-lg bg-red-500 px-4 py-3 font-medium transition hover:bg-red-600"
      >
        <HiLogout size={22} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;