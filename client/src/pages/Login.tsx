
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Shield, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, loginWithCredentials } = useAuth();
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCitizenLogin = () => {
    login("citizen");
    setLocation("/reports");
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithCredentials(username, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplets className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold">AquaFlow</h1>
          </div>
          <p className="text-lg text-muted-foreground">Water Distribution Management System</p>
        </div>

        {!showAdminForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-16 w-16 text-blue-600" />
                </div>
                <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
                <CardDescription className="text-center">
                  Access dashboard, monitoring, and system management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setShowAdminForm(true)}
                >
                  Login as Admin
                </Button>
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  <p>Features:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Real-time monitoring dashboard</li>
                    <li>• Zone management</li>
                    <li>• Pump scheduling</li>
                    <li>• AI insights & analytics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Users className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle className="text-center text-2xl">Citizen Portal</CardTitle>
                <CardDescription className="text-center">
                  Report issues and track water supply status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  size="lg"
                  variant="outline"
                  onClick={handleCitizenLogin}
                >
                  Enter Citizen Portal
                </Button>
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  <p>Features:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Report water issues</li>
                    <li>• Track report status</li>
                    <li>• View water schedules</li>
                    <li>• Community updates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-16 w-16 text-blue-600" />
                </div>
                <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access the admin dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                    <p className="font-medium mb-1">Demo Credentials:</p>
                    <p>Username: <code className="font-mono">admin</code></p>
                    <p>Password: <code className="font-mono">admin123</code></p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setShowAdminForm(false);
                        setError("");
                        setUsername("");
                        setPassword("");
                      }}
                    >
                      Back
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
