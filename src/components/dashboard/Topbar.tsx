import useUser from "../../hooks/useUser";

const Topbar = () => {
  const { user, loading } = useUser();

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-5">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>

        <p className="text-slate-500">
          Welcome back 👋
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-semibold">
            {loading ? "Loading..." : user?.name}
          </p>

          <p className="text-sm text-slate-500">
            {user?.email}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Topbar;