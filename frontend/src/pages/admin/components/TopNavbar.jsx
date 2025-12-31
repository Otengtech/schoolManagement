const TopNavbar = () => {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between pl-16 pr-4 md:px-6">
      <h1 className="text-sm md:text-lg md:flex font-semibold">School Management System</h1>
      <button className="bg-blue-600 text-white px-4 py-1 rounded">
        Logout
      </button>
    </div>
  );
};

export default TopNavbar;
