"use client";

export const Navbar = () => {
  return (
    <nav className="flex gap-6 bg-gray-900 text-white p-5 rounded">
      <div>
        <a href="/" className="hover:bg-gray-700 p-3 rounded-sm">
          Home
        </a>
      </div>
      <div>
        <a href="/settings" className="hover:bg-gray-700 p-3 rounded-sm">
          Settings
        </a>
      </div>
      <div>
        <a href="/profile" className="hover:bg-gray-700 p-3 rounded-sm">
          Profile
        </a>
      </div>
    </nav>
  );
};
