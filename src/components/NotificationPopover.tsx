'use client';
import { useState } from 'react';
import BasePopover from './BasePopover';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react'; // Assuming next-auth is used
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from 'contents/authContext';
import { Bell } from 'lucide-react';

export default function NotificationPopover() {
  const { data: session } = useSession();
  const [reply, setReply] = useState('');
  const user = useAuth().user;
  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axios.get('/api/contact-us');
      return data as Array<{ id: string; message: string; type: string; email?: string }>;
    },
  });

  const handleReply = async (id: string) => {
    if (!reply.trim()) return;
    await axios.post('/api/contact-us', { message: reply, type: 'reply', email: user?.email });
    setReply('');
    refetch();
  };

  const isAuthorized = user?.role === 'Owner' || user?.role === 'Admin';

  return (
    <BasePopover title="Notifications" icon={true}>
      <div className="space-y-4">
        {notifications?.length === 0 ? (
          <p className="text-center text-gray-500">No notifications yet.</p>
        ) : (
          notifications?.map((notification: any) => (
            <Card key={notification.id} className="bg-sidebar">
              <CardHeader>
                <CardTitle>{notification.type}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
                {notification.email && <p className="text-sm text-gray-500">From: {notification.email}</p>}
                {isAuthorized && (
                  <div className="mt-4">
                    <Input
                      placeholder="Reply..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <Button
                      className="mt-2"
                      onClick={() => handleReply(notification.id)}
                    >
                      Reply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </BasePopover>
  );
}
