import React, { useEffect, useState } from 'react';
import { Menu, Search, Bell, Moon, Sun, User, Settings, CreditCard, HelpCircle, LogOut, X, Home, FolderKanban, Users, FileText, Calendar, TrendingUp, Clock, DollarSign, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function HeaderWithSidebar({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const notifications = [
    { id: 1, title: 'New project assigned', time: '5 min ago', unread: true },
    { id: 2, title: 'Invoice payment received', time: '1 hour ago', unread: true },
    { id: 3, title: 'Team meeting in 30 minutes', time: '2 hours ago', unread: false },
    { id: 4, title: 'Project milestone completed', time: '1 day ago', unread: false },
  ];

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FolderKanban, label: 'Projects', active: false },
    { icon: Users, label: 'Clients', active: false },
    { icon: FileText, label: 'Invoices', active: false },
    { icon: Calendar, label: 'Calendar', active: false },
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen" style={{ 
        backgroundColor: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#f9fafb' : '#111827'
      }}>
        {/* Header */}
        <header className="sticky top-0 z-50 border-b" style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#374151' : '#e5e7eb'
        }}>
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-opacity-10"
                style={{
                  backgroundColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(17, 24, 39, 0.05)'
                }}
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="text-2xl font-bold text-[var(--color-primary)] hover:text-[var(--color-text-secondary)] dark:text-[var(--color-primary-dark)] dark:hover:text-[var(--color-primary)] transition-colors duration-300">
                Solopreneur
              </Link>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{
                  color: isDark ? '#9ca3af' : '#6b7280'
                }} />
                <input
                  type="text"
                  placeholder="Search projects, clients, invoices..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[#00a63e]"
                  style={{
                    backgroundColor: isDark ? '#111827' : '#f9fafb',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    color: isDark ? '#f9fafb' : '#111827'
                  }}
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg hover:bg-opacity-10"
                style={{
                  backgroundColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(17, 24, 39, 0.05)'
                }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-lg relative hover:bg-opacity-10"
                  style={{
                    backgroundColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(17, 24, 39, 0.05)'
                  }}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#00a63e' }}></span>
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border overflow-hidden" style={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#e5e7eb'
                  }}>
                    <div className="p-4 border-b" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 border-b hover:bg-opacity-5 cursor-pointer"
                          style={{
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            backgroundColor: notif.unread ? (isDark ? 'rgba(0, 166, 62, 0.1)' : 'rgba(0, 166, 62, 0.05)') : 'transparent'
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notif.title}</p>
                              <p className="text-xs mt-1" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                                {notif.time}
                              </p>
                            </div>
                            {notif.unread && (
                              <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: '#00a63e' }}></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: '#00a63e' }}
                >
                  JD
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border overflow-hidden" style={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#e5e7eb'
                  }}>
                    <div className="p-4 border-b" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                      <img
                        src="/avatar-placeholder.png"
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full mb-2"
                      />
                      <p className="font-semibold">John Doe</p>
                      <p className="text-sm" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>john@solopreneur.com</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-opacity-5 hover:bg- duration-300 transition-all">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </button>
                      <button className="w-full px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-opacity-5">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">Billing</span>
                      </button>
                      <button className="w-full px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-opacity-5">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </button>
                      <button className="w-full px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-opacity-5">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm">Support</span>
                      </button>
                      <div className="border-t my-2" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}></div>
                      <button className="w-full text-red-700 px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-opacity-5 hover:bg-red-600 duration-300 transition-all hover:text-white">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)'
            }}
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 border-r ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb'
          }}
        >
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <div className="text-xl font-bold" style={{ color: '#00a63e' }}>
              Solopreneur
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-opacity-10"
              style={{
                backgroundColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(17, 24, 39, 0.05)'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                className="w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors"
                style={{
                  backgroundColor: item.active ? '#00a63e' : 'transparent',
                  color: item.active ? '#ffffff' : (isDark ? '#f9fafb' : '#111827')
                }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content - Children will be rendered here */}
        {children}
      </div>
    </div>
  );
}

// Separate Dashboard Component
export function DashboardContent() {
  const [isDark, setIsDark] = useState(false);

  const stats = [
    { icon: FolderKanban, label: 'Active Projects', value: '12', change: '+2 this month', color: '#00a63e' },
    { icon: Users, label: 'Total Clients', value: '28', change: '+5 this month', color: '#3b82f6' },
    { icon: DollarSign, label: 'Revenue (MTD)', value: '$14,250', change: '+18% vs last month', color: '#f59e0b' },
    { icon: Clock, label: 'Hours Tracked', value: '142h', change: 'This month', color: '#8b5cf6' },
  ];

  const recentProjects = [
    { name: 'E-commerce Website', client: 'Tech Corp', status: 'In Progress', progress: 75, deadline: '5 days left' },
    { name: 'Mobile App Design', client: 'Startup Inc', status: 'Review', progress: 90, deadline: '2 days left' },
    { name: 'Brand Identity', client: 'Creative Co', status: 'In Progress', progress: 45, deadline: '12 days left' },
    { name: 'Marketing Campaign', client: 'Media Group', status: 'Planning', progress: 20, deadline: '20 days left' },
  ];

  const upcomingTasks = [
    { title: 'Client meeting - Tech Corp', time: 'Today, 2:00 PM', priority: 'high' },
    { title: 'Submit design mockups', time: 'Today, 5:00 PM', priority: 'high' },
    { title: 'Review project proposal', time: 'Tomorrow, 10:00 AM', priority: 'medium' },
    { title: 'Send invoice to Startup Inc', time: 'Tomorrow, 3:00 PM', priority: 'medium' },
    { title: 'Update project timeline', time: 'Oct 31, 9:00 AM', priority: 'low' },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return '#00a63e';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return '#ef4444';
    if (priority === 'medium') return '#f59e0b';
    return '#6b7280';
  };

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <main className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p style={{ color: isDark ? '#e5e7eb' : '#4b5563' }}>
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <ArrowUpRight className="w-4 h-4" style={{ color: '#00a63e' }} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>{stat.label}</div>
            <div className="text-xs mt-2" style={{ color: '#00a63e' }}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <button className="text-sm" style={{ color: '#00a63e' }}>
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: isDark ? '#111827' : '#f9fafb',
                    borderColor: isDark ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">{project.name}</h3>
                      <p className="text-sm" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        {project.client}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: project.status === 'In Progress' ? 'rgba(0, 166, 62, 0.1)' : 
                                       project.status === 'Review' ? 'rgba(59, 130, 246, 0.1)' : 
                                       'rgba(245, 158, 11, 0.1)',
                        color: project.status === 'In Progress' ? '#00a63e' : 
                              project.status === 'Review' ? '#3b82f6' : 
                              '#f59e0b'
                      }}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: getProgressColor(project.progress)
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                      <Clock className="w-3 h-3" />
                      <span>{project.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks - Takes 1 column */}
        <div>
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Upcoming Tasks</h2>
              <button className="text-sm" style={{ color: '#00a63e' }}>
                Add Task
              </button>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border flex items-start gap-3 cursor-pointer hover:border-opacity-70"
                  style={{
                    backgroundColor: isDark ? '#111827' : '#f9fafb',
                    borderColor: isDark ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div
                    className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">{task.title}</p>
                    <p className="text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                      {task.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-6 rounded-lg border mt-6"
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb'
            }}
          >
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                className="w-full p-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#00a63e' }}
              >
                New Project
              </button>
              <button
                className="w-full p-3 rounded-lg font-medium transition-colors hover:bg-opacity-50"
                style={{
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  border: '1px solid',
                  borderColor: isDark ? '#374151' : '#e5e7eb'
                }}
              >
                Add Client
              </button>
              <button
                className="w-full p-3 rounded-lg font-medium transition-colors hover:bg-opacity-50"
                style={{
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  border: '1px solid',
                  borderColor: isDark ? '#374151' : '#e5e7eb'
                }}
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}