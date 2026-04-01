import { Link, useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const roleLinks = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/bugs', label: 'All Bugs' },
  ],
  DEVELOPER: [
    { to: '/developer', label: 'Dashboard' },
    { to: '/bugs', label: 'All Bugs' },
    { to: '/my-bugs', label: 'My Bugs' },
  ],
  TESTER: [
    { to: '/tester', label: 'Dashboard' },
    { to: '/bugs', label: 'All Bugs' },
    { to: '/report', label: 'Report Bug' },
  ],
}

const roleBadgeColor = {
  ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  DEVELOPER: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  TESTER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = localStorage.getItem('role')
  const name = localStorage.getItem('name') || role

  const links = roleLinks[role] || []

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 shrink-0">
          <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-black">B</span>
          BugFlow
        </Link>

        {/* Nav Links */}
        <div className="hidden sm:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                location.pathname === to
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${roleBadgeColor[role]}`}>{role}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{name}</span>
          </div>
          <button onClick={handleLogout} className="btn-secondary text-xs py-1.5 px-3">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
