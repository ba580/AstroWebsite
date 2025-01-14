'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeft, Clock, Trash2, Edit2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InfractionPage() {
  const router = useRouter()
  const { id, infid } = router.query 

  const [isEditing, setIsEditing] = useState(false)
  const [editedReason, setEditedReason] = useState('')
  const [editedAction, setEditedAction] = useState('')
  const [infraction, setInfraction] = useState<any>(null)

  useEffect(() => {
    if (!infid) return 
    const fetchInfraction = async () => {
      try {
        const res = await fetch(`/api/infractions/${id}/${infid}`)
        if (!res.ok) {
          const errorData = await res.json()
          console.error('Error fetching infraction:', errorData)
          return
        }

        const data = await res.json()
        setInfraction(data)
        setEditedReason(data.action.details)
        setEditedAction(data.action.type)
      } catch (error) {
        console.error('Error fetching infraction:', error)
      }
    }

    fetchInfraction()
  }, [infid])

  const handleEdit = async () => {
    if (!infraction) return

    try {
      const updatedInfraction = {
        ...infraction,
        
        action: {
          ...infraction.action,
          type: editedAction,
          details: editedReason
        },
      }

      const res = await fetch(`/api/infractions/${id}/${infid}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInfraction),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Error updating infraction:', errorData)
        return
      }

      const data = await res.json()
      console.log('Updated infraction:', data)
      setIsEditing(false)
      setInfraction(updatedInfraction)
    
    } catch (error) {
      console.error('Error updating infraction:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/infractions/${id}/${infid}/delete`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Error deleting infraction:', errorData)
        return
      }

      router.push(`/panel/${id}`) 
    } catch (error) {
      console.error('Error deleting infraction:', error)
    }
  }

  if (!infraction) return       <main className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans">
  <div className="flex items-center justify-center h-screen">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      className="animate-spin text-indigo-500"
    >
      <path
        fill="none"
        stroke="#fff"
        strokeDasharray="16"
        strokeDashoffset="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 3c4.97 0 9 4.03 9 9"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.2s"
          values="16;0"
        />
        <animateTransform
          attributeName="transform"
          dur="1.5s"
          repeatCount="indefinite"
          type="rotate"
          values="0 12 12;360 12 12"
        />
      </path>
    </svg>
  </div>
</main>
  return (
    <div className="dark min-h-screen bg-gradient-to-b from-gray-900 to-black text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push(`/panel/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Infractions
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Case Information
                <Badge 
                  variant={infraction.status === 'active' ? 'destructive' : 'secondary'}
                >
                  {infraction.status.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>Case ID: {infid}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>User</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={infraction.user.avatar} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{infraction.user.name}</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {infraction.user.id}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Moderator</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={infraction.author.avatar} />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">{infraction.author.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {infraction.author.id}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Created on {new Date(infraction.created).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Action Details
                <Badge variant="secondary">
                  {infraction.action.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <div className="font-medium">{infraction.action.details}</div>
                </div>

                <div className="space-y-2">
                  <Label>Details</Label>
                  <div className="text-sm text-muted-foreground">
                    {infraction.action.evidence}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Case
                  </Button>
                </DialogTrigger>
                <DialogContent className='dark'>
                  <DialogHeader className='text-white'>
                    <DialogTitle>Edit Infraction</DialogTitle>
                    <DialogDescription>
                      Make changes to this infraction case. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2 ">
                      <Label className='text-gray-200' >Reason</Label>
                      <Input
                        value={editedReason}
                        onChange={(e) => setEditedReason(e.target.value)}
                        className='text-gray-200'
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className='text-gray-200' >Action</Label>
                      <Input
                        value={editedAction}
                        onChange={(e) => setEditedAction(e.target.value)}
                        className='text-gray-200'
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button className="text-white" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEdit}>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Case
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className='dark'>
                  <AlertDialogHeader>
                    <AlertDialogTitle className='text-white'>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this
                      infraction case and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='text-white'>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete Case
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
