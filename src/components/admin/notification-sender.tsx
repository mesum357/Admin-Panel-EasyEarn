import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Bell } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import axios from 'axios';

export function NotificationSender() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/notifications`,
        { title, message }
      );
      toast({
        title: "Notification Sent!",
        description: `Notification "${title}" has been sent to all users successfully.`,
      })
      // Reset form
      setTitle("")
      setMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Send Notification to All Users
        </CardTitle>
        <CardDescription>
          Broadcast important messages to your entire user base
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-title">Notification Title</Label>
            <Input
              id="notification-title"
              placeholder="Enter notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notification-message">Message Body</Label>
            <Textarea
              id="notification-message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full resize-none"
            />
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isLoading ? "Sending..." : "Send Notification"}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              This will notify all registered users
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}