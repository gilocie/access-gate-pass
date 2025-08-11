import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield, CreditCard, Trash2, Save, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "New password and confirm password do not match."
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating password",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Delete user events and tickets
      const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('organizer_id', user.id);

      if (eventsError) throw eventsError;

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully."
      });

      // Sign out user
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting account",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center mb-8">
            <Link to="/profile" className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </div>
          
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your security settings and account preferences
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Password Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  <h3 className="text-lg font-semibold">Change Password</h3>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={passwords.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={passwords.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-gradient-primary hover:opacity-90"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </div>

              <Separator />

              {/* Billing Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  <h3 className="text-lg font-semibold">Billing & Payment</h3>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage your subscription and payment methods
                  </p>
                  <Button variant="outline" disabled>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing (Coming Soon)
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Trash2 className="w-5 h-5 mr-2 text-destructive" />
                  <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                </div>
                
                <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10">
                  <h4 className="font-medium mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. This will permanently delete your account, events, and all associated data.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;