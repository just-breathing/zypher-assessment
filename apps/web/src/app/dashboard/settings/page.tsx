'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-600">
        Settings
      </h1>

      <div className="grid gap-8">
        <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
          </div>

          <div className="grid gap-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" placeholder="Your name" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="your@email.com" className="bg-white/5 border-white/10" />
            </div>
            <Button className="w-fit bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Security</h2>
              <p className="text-muted-foreground">Manage your password and security settings</p>
            </div>
          </div>

          <div className="grid gap-4 max-w-xl">
            <Button variant="outline" className="w-fit border-white/10 hover:bg-white/5">Change Password</Button>
            <Button variant="outline" className="w-fit border-white/10 hover:bg-white/5 text-red-400 hover:text-red-300">Delete Account</Button>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-muted-foreground">Configure how you want to be notified</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <p>Notification settings coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
