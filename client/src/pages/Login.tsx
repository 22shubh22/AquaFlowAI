
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Shield, Users } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const handleLogin = (role: "admin" | "citizen") => {
    login(role);
    setLocation(role === "admin" ? "/" : "/reports");
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
                onClick={() => handleLogin("admin")}
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
                onClick={() => handleLogin("citizen")}
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
      </div>
    </div>
  );
}
