"use client";

import Link from "next/link";

const stats = [
  { id: "users", label: "Users", value: 124 },
  { id: "projects", label: "Projects", value: 32 },
  { id: "invoices", label: "Invoices", value: 58 },
];

const recentActivity = [
  { id: 1, text: "Invoice #204 paid", when: "2h ago" },
  { id: 2, text: "New user registered: alice@example.com", when: "5h ago" },
  { id: 3, text: "Project “Website Redesign” created", when: "1d ago" },
];

const users = [
  { id: "u1", name: "Alice", email: "alice@example.com", role: "Admin", created: "2025-08-01" },
  { id: "u2", name: "Bob", email: "bob@example.com", role: "Member", created: "2025-09-12" },
  { id: "u3", name: "Charlie", email: "charlie@example.com", role: "Member", created: "2025-10-02" },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-light-heading dark:text-dark-heading">Admin Dashboard</h1>
            <p className="text-sm text-light-subheading dark:text-dark-subheading mt-1">Overview of users, projects, and recent activity</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/users" className="inline-flex items-center px-3 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark">
              Manage users
            </Link>
            <Link href="/" className="text-sm text-light-subheading dark:text-dark-subheading hover:underline">Back to site</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.id} className="bg-light-surface dark:bg-dark-surface border border-light-divider dark:border-dark-divider rounded-lg p-4">
              <div className="text-sm text-light-subheading dark:text-dark-subheading">{s.label}</div>
              <div className="mt-2 text-2xl font-semibold text-light-heading dark:text-dark-heading">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main area */}
          <section className="lg:col-span-2 bg-light-surface dark:bg-dark-surface border border-light-divider dark:border-dark-divider rounded-lg p-6">
            <h2 className="text-lg font-medium text-light-heading dark:text-dark-heading">Recent activity</h2>
            <ul className="mt-4 space-y-3">
              {recentActivity.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <div className="text-sm text-light-subheading dark:text-dark-subheading">{r.text}</div>
                  <div className="text-xs text-gray-400">{r.when}</div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-light-heading dark:text-dark-heading">Users</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-light-subheading dark:text-dark-subheading">
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-divider dark:divide-dark-divider">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-3 py-2 text-light-heading dark:text-dark-heading">{u.name}</td>
                        <td className="px-3 py-2 text-light-subheading dark:text-dark-subheading">{u.email}</td>
                        <td className="px-3 py-2"><span className={"inline-flex items-center px-2 py-1 text-xs rounded-md " + (u.role === 'Admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700')}>{u.role}</span></td>
                        <td className="px-3 py-2 text-xs text-gray-400">{u.created}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="bg-light-surface dark:bg-dark-surface border border-light-divider dark:border-dark-divider rounded-lg p-6">
            <h3 className="text-sm font-medium text-light-heading dark:text-dark-heading">Quick actions</h3>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/admin/new" className="inline-flex items-center px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark">Create project</Link>
              <Link href="/admin/invoices" className="inline-flex items-center px-3 py-2 border border-light-divider dark:border-dark-divider rounded-md text-sm text-light-heading dark:text-dark-heading hover:bg-gray-50">View invoices</Link>
              <Link href="/admin/settings" className="inline-flex items-center px-3 py-2 border border-light-divider dark:border-dark-divider rounded-md text-sm text-light-heading dark:text-dark-heading hover:bg-gray-50">Settings</Link>
            </div>

            <div className="mt-6">
              <h4 className="text-xs text-light-subheading dark:text-dark-subheading">Support</h4>
              <a className="mt-2 block text-sm text-primary hover:underline" href="mailto:support@solopreneur.local">support@solopreneur.local</a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

