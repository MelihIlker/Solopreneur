import React, { useEffect, useState, useRef } from 'react';
import { Menu, Search, Bell, Moon, Sun, User, Settings, CreditCard, HelpCircle, LogOut, X, Home, FolderKanban, Users, FileText, Calendar, TrendingUp, Clock, DollarSign, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

export default function HeaderWithSidebar({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Click-outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isNotificationOpen || isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen, isProfileOpen]);

  return (
    <>
      <div className="min-h-screen bg-white text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-white border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-gray-900/5 hover:bg-gray-900/10"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors duration-300">
                Solopreneur
              </Link>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search projects, clients, invoices..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-100 border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 rounded-lg relative bg-gray-900/5 hover:bg-gray-900/10"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary"></span>
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border overflow-hidden bg-white border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                            notif.unread ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notif.title}</p>
                              <p className="text-xs mt-1 text-gray-600">
                                {notif.time}
                              </p>
                            </div>
                            {notif.unread && (
                              <div className="w-2 h-2 rounded-full mt-1 bg-primary"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold bg-primary hover:bg-primary-dark"
                >
                  JD
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border overflow-hidden bg-white border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex flex-col items-center">
                      <img
                        src="/avatar-placeholder.png"
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full mb-2 mx-auto"
                      />
                      <p className="font-semibold text-center">John Doe</p>
                      <p className="text-sm text-center text-gray-600">john@solopreneur.com</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-gray-100 duration-300 transition-all">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </button>
                      <button className="w-full px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-gray-100">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">Billing</span>
                      </button>
                      <button className="w-full px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-gray-100">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </button>
                      <button className="w-full px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-gray-100">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm">Support</span>
                      </button>
                      <div className="border-t my-2 border-gray-200"></div>
                      <button className="w-full text-error px-4 cursor-pointer py-2 text-left flex items-center gap-3 hover:bg-error hover:text-white duration-300 transition-all">
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
            className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 border-r bg-white border-gray-200 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="text-xl font-bold text-primary">
              Solopreneur
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg bg-gray-900/5 hover:bg-gray-900/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  item.active 
                    ? 'bg-primary text-white' 
                    : 'bg-transparent text-gray-900 hover:bg-gray-100'
                }`}
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
    </>
  );
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Separate Dashboard Component
export function DashboardContent() {
  const stats = [
    { icon: FolderKanban, label: 'Active Projects', value: '12', change: '+2 this month', trend: 'up', color: '#16A34A' },
    { icon: Users, label: 'Total Clients', value: '28', change: '+5 this month', trend: 'up', color: '#2563EB' },
    { icon: DollarSign, label: 'Revenue (MTD)', value: '$14,250', change: '+18% vs last month', trend: 'up', color: '#D97706' },
    { icon: Clock, label: 'Hours Tracked', value: '142h', change: 'This month', trend: 'neutral', color: '#8b5cf6' },
  ];

  const recentProjects = [
    { 
      name: 'E-commerce Website Redesign', 
      client: 'Tech Corp', 
      status: 'In Progress', 
      progress: 75, 
      deadline: '5 days left',
      budget: '$12,500',
      hours: '38h / 50h'
    },
    { 
      name: 'Mobile App UI/UX Design', 
      client: 'Startup Inc', 
      status: 'Review', 
      progress: 90, 
      deadline: '2 days left',
      budget: '$8,200',
      hours: '42h / 45h'
    },
    { 
      name: 'Brand Identity Package', 
      client: 'Creative Co', 
      status: 'In Progress', 
      progress: 45, 
      deadline: '12 days left',
      budget: '$6,800',
      hours: '18h / 40h'
    },
    { 
      name: 'Digital Marketing Campaign', 
      client: 'Media Group', 
      status: 'Planning', 
      progress: 20, 
      deadline: '20 days left',
      budget: '$15,000',
      hours: '8h / 60h'
    },
  ];

  const upcomingTasks = [
    { title: 'Client meeting - Tech Corp', time: 'Today, 2:00 PM', priority: 'high' },
    { title: 'Submit design mockups', time: 'Today, 5:00 PM', priority: 'high' },
    { title: 'Review project proposal', time: 'Tomorrow, 10:00 AM', priority: 'medium' },
    { title: 'Send invoice to Startup Inc', time: 'Tomorrow, 3:00 PM', priority: 'medium' },
    { title: 'Update project timeline', time: 'Oct 31, 9:00 AM', priority: 'low' },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return '#16A34A';
    if (progress >= 50) return '#2563EB';
    if (progress >= 25) return '#D97706';
    return '#DC2626';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return '#DC2626';
    if (priority === 'medium') return '#D97706';
    return '#4B5563';
  };



  // Chart data
  const chartData = {
    labels: ['June', 'July', 'August', 'September', 'October', 'November'],
    datasets: [
      {
        label: 'Revenue',
        data: [8500, 10200, 9800, 12400, 11800, 14250],
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Projects',
        data: [8, 10, 9, 11, 10, 12],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#FFFFFF',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#4B5563',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          color: '#4B5563',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#4B5563',
        },
      },
    },
  };

  return (
    <main className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-gray-600 dark:text-gray-200">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            <div className="text-xs mt-2 text-primary">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart - Full Width */}
      <div className="mb-8">
        <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Revenue Overview</h2>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Last 6 months performance</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-info"></div>
                <span className="text-gray-600 dark:text-gray-400">Projects</span>
              </div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Quick Summary Below Chart */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs mb-1 text-gray-600 dark:text-gray-400">Avg. Project Value</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">$8,450</p>
              <p className="text-xs text-primary">+12% from last month</p>
            </div>
            <div>
              <p className="text-xs mb-1 text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">94%</p>
              <p className="text-xs text-primary">+3% improvement</p>
            </div>
            <div>
              <p className="text-xs mb-1 text-gray-600 dark:text-gray-400">Client Satisfaction</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">4.8/5.0</p>
              <p className="text-xs text-primary">Based on 24 reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Projects</h2>
              <button className="text-sm text-primary hover:text-primary-dark">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">{project.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.client}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'In Progress' 
                          ? 'bg-primary/10 text-primary' 
                          : project.status === 'Review' 
                          ? 'bg-info/10 text-info' 
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: getProgressColor(project.progress)
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{project.deadline}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{project.budget}</span>
                        <span>•</span>
                        <span>{project.hours}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks - Takes 1 column */}
        <div>
          <div className="p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upcoming Tasks</h2>
              <button className="text-sm text-primary hover:text-primary-dark">
                Add Task
              </button>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border flex items-start gap-3 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                >
                  <div
                    className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">{task.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {task.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-lg border mt-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full p-3 rounded-lg font-medium text-white bg-primary hover:bg-primary-dark transition-colors">
                New Project
              </button>
              <button className="w-full p-3 rounded-lg font-medium border bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Add Client
              </button>
              <button className="w-full p-3 rounded-lg font-medium border bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}