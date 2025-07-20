import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { PendingRequests } from "@/components/admin/pending-requests"
import { NotificationSender } from "@/components/admin/notification-sender"
import { ThemeProvider } from "@/components/theme-provider"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import axios from 'axios';

const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 50,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users?page=${page}&limit=50`
      );
      
      if (response.data && response.data.users) {
        setUsers(response.data.users);
        setPagination(response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalUsers: response.data.users.length,
          limit: 50,
          hasNextPage: false,
          hasPrevPage: false
        });
        setCurrentPage(page);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.error || 'Failed to fetch users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers(1);
  }, []);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchUsers(page);
    }
  };
  
  const renderPageNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;
    
    // Always show first page
    if (totalPages > 0) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink 
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pages;
  };
  
  if (loading) {
    return (
      <div className="p-6 bg-card rounded-lg border border-border">
        <h2 className="text-2xl font-bold mb-4">All Users</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading users...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-card rounded-lg border border-border">
        <h2 className="text-2xl font-bold mb-4">All Users</h2>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive font-medium">Error</p>
          <p className="text-destructive/80 text-sm mt-1">{error}</p>
          <button 
            onClick={() => fetchUsers(currentPage)}
            className="mt-3 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm hover:bg-destructive/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Users</h2>
        <Badge variant="secondary">
          {pagination.totalUsers} Total Users
        </Badge>
      </div>
      
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">There are currently no users in the system.</p>
          <button 
            onClick={() => fetchUsers(1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Username</th>
                <th className="px-4 py-3 text-left font-medium">Created At</th>
                <th className="px-4 py-3 text-left font-medium">Verified</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id} className={`border-b ${index % 2 === 0 ? 'bg-muted/10' : 'bg-background'}`}>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.verified ? "default" : "destructive"}>
                      {user.verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination Info and Controls - only show when users exist */}
      {users.length > 0 && (
        <>
          {/* Pagination Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalUsers)} of {pagination.totalUsers} users
            </div>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {pagination.totalPages}
            </div>
          </div>
          
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`cursor-pointer ${!pagination.hasPrevPage ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
                
                {renderPageNumbers()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`cursor-pointer ${!pagination.hasNextPage ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            
            <div className="grid gap-6 lg:grid-cols-2">
              <PendingRequests />
              <NotificationSender />
            </div>
          </div>
        )
      case "users":
        return (
          <div className="space-y-6">
            <UsersTab />
          </div>
        )
      case "notifications":
        return (
          <div className="space-y-6">
            <NotificationSender />
          </div>
        )
      case "settings":
        return (
          <div className="p-6 bg-card rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="easylarn-theme">
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <AdminSidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
