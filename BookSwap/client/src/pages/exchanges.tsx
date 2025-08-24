import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";
import type { ExchangeRequestWithDetails } from "@shared/schema";

export default function Exchanges() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  const { data: myRequests = [], isLoading: myRequestsLoading } = useQuery<ExchangeRequestWithDetails[]>({
    queryKey: ["/api/my-requests"],
    enabled: !!user,
  });

  const { data: incomingRequests = [], isLoading: incomingRequestsLoading } = useQuery<ExchangeRequestWithDetails[]>({
    queryKey: ["/api/incoming-requests"],
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      await apiRequest("PUT", `/api/exchange-requests/${requestId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-requests"] });
      toast({
        title: "Success",
        description: "Exchange request updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update exchange request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = (requestId: string, status: string) => {
    updateStatusMutation.mutate({ requestId, status });
  };

  if (authLoading || myRequestsLoading || incomingRequestsLoading) {
    return (
      <div className="min-h-screen bg-shelf-bg">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shelf-brown mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exchanges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shelf-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-shelf-charcoal">Exchange Requests</h1>
          <p className="text-gray-600 mt-2">Manage your book exchange requests and responses</p>
        </div>

        <Tabs defaultValue="my-requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-requests" data-testid="tab-my-requests">
              My Requests ({myRequests.length})
            </TabsTrigger>
            <TabsTrigger value="incoming-requests" data-testid="tab-incoming-requests">
              Incoming Requests ({incomingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests" className="space-y-4">
            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-no-requests-title">
                    No exchange requests yet
                  </h3>
                  <p className="text-gray-600" data-testid="text-no-requests-description">
                    Browse books and start requesting exchanges with other readers!
                  </p>
                </CardContent>
              </Card>
            ) : (
              myRequests.map((request: ExchangeRequestWithDetails) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                        {request.book.coverImageUrl ? (
                          <img
                            src={request.book.coverImageUrl}
                            alt={request.book.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Cover
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-shelf-charcoal" data-testid={`text-book-title-${request.id}`}>
                              {request.book.title}
                            </h3>
                            <p className="text-gray-600" data-testid={`text-book-author-${request.id}`}>
                              by {request.book.author}
                            </p>
                            <p className="text-sm text-gray-500" data-testid={`text-book-owner-${request.id}`}>
                              Owner: {request.book.owner.firstName} {request.book.owner.lastName}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`} data-testid={`badge-status-${request.id}`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                        
                        {request.message && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700" data-testid={`text-message-${request.id}`}>
                              <MessageSquare className="h-4 w-4 inline mr-1" />
                              {request.message}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-500" data-testid={`text-request-date-${request.id}`}>
                          Requested on {new Date(request.createdAt!).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="incoming-requests" className="space-y-4">
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-no-incoming-title">
                    No incoming requests
                  </h3>
                  <p className="text-gray-600" data-testid="text-no-incoming-description">
                    When someone requests to exchange one of your books, it will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              incomingRequests.map((request: ExchangeRequestWithDetails) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                        {request.book.coverImageUrl ? (
                          <img
                            src={request.book.coverImageUrl}
                            alt={request.book.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Cover
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-shelf-charcoal" data-testid={`text-incoming-book-title-${request.id}`}>
                              {request.book.title}
                            </h3>
                            <p className="text-gray-600" data-testid={`text-incoming-book-author-${request.id}`}>
                              by {request.book.author}
                            </p>
                            <p className="text-sm text-gray-500" data-testid={`text-requester-${request.id}`}>
                              Requested by: {request.requester.firstName} {request.requester.lastName}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`} data-testid={`badge-incoming-status-${request.id}`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                        
                        {request.message && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700" data-testid={`text-incoming-message-${request.id}`}>
                              <MessageSquare className="h-4 w-4 inline mr-1" />
                              {request.message}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500" data-testid={`text-incoming-date-${request.id}`}>
                            Requested on {new Date(request.createdAt!).toLocaleDateString()}
                          </div>
                          
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(request.id, "rejected")}
                                disabled={updateStatusMutation.isPending}
                                data-testid={`button-reject-${request.id}`}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-shelf-green hover:bg-green-700 text-white"
                                onClick={() => handleStatusUpdate(request.id, "accepted")}
                                disabled={updateStatusMutation.isPending}
                                data-testid={`button-accept-${request.id}`}
                              >
                                Accept
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
