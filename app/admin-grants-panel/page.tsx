"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Link2, Calendar, Settings2 } from "lucide-react";

interface GrantUrl {
  id: string;
  url: string;
  created_at: string;
}

export default function AdminGrantsPanel() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [urls, setUrls] = useState<GrantUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Define fetchUrls before using it in useEffect
  const fetchUrls = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin-login');
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/get-grant-urls", {
        headers: {
          Authorization: `Bearer toetus_api_key`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          router.replace('/admin-login');
          return;
        }
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.status === "success") {
        setUrls(data.urls);
      } else {
        setError("Failed to load URLs");
      }
    } catch (err) {
      setError("Failed to load URLs");
    } finally {
      setLoading(false);
    }
  };

  // Authentication check effect
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.replace('/admin-login');
      } else {
        setIsAuthenticated(true);
        await fetchUrls();
      }
    };
    checkAuth();
  }, [router]);

  // Don't render until authentication is checked
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (isAuthenticated === false) {
    return null;
  }

  const addUrl = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin-login');
      return;
    }
    setIsAdding(true);
    try {
      const response = await fetch("http://localhost:5000/api/add-grant-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: newUrl }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          router.replace('/admin-login');
          return;
        }
      }
      const data = await response.json();
      if (data.status === "success") {
        setUrls([...urls, data.url]);
        setNewUrl("");
      } else {
        setError("Failed to add URL");
      }
    } catch (err) {
      setError("Failed to add URL");
    } finally {
      setIsAdding(false);
    }
  };

  const removeUrl = async (urlId: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin-login');
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/remove-grant-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url_id: urlId }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          router.replace('/admin-login');
          return;
        }
      }
      const data = await response.json();
      if (data.status === "success") {
        setUrls(urls.filter(url => url.id !== urlId));
      } else {
        setError("Failed to remove URL");
      }
    } catch (err) {
      setError("Failed to remove URL");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1336px]">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold">Toetuste URLide Haldamine</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
          {error === "Failed to load URLs" ? "URLide laadimine ebaõnnestus" : 
           error === "Failed to add URL" ? "URLi lisamine ebaõnnestus" : 
           error === "Failed to remove URL" ? "URLi eemaldamine ebaõnnestus" : 
           error}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Sisesta uus toetuse URL"
            className="flex-1 pl-10 pr-4 py-2 border rounded w-full"
          />
        </div>
        <Button 
          onClick={addUrl}
          disabled={isAdding || !newUrl}
        >
          {isAdding ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
          Lisa URL
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <strong>URL</strong>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <strong>Loodud</strong>
              </div>
            </TableHead>
            <TableHead><strong>Tegevused</strong></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url) => (
            <TableRow key={url.id}>
              <TableCell>
                <a 
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 h-full"
                >
                  {url.url}
                  <Link2 className="h-4 w-4" />
                </a>
              </TableCell>
              <TableCell>{new Date(url.created_at).toLocaleString('et-EE')}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeUrl(url.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eemalda
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}