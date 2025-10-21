import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inviteAdminSchema, type InviteAdminFormData } from '@/lib/validation/business'
import { useUsers, useToggleUserStatus, useInviteAdmin } from '@/hooks/useUsers'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, UserPlus, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function UserManagement() {
  const { toast } = useToast()
  const { data: users, isLoading } = useUsers()
  const toggleUserStatus = useToggleUserStatus()
  const inviteAdmin = useInviteAdmin()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const form = useForm<InviteAdminFormData>({
    resolver: zodResolver(inviteAdminSchema as any) as any,
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
    },
  })

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus.mutateAsync({
        userId,
        isActive: !currentStatus,
      })
      toast({
        title: 'User status updated',
        description: `User has been ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user status',
        variant: 'destructive',
      })
    }
  }

  const onSubmitInvite = async (data: InviteAdminFormData) => {
    try {
      await inviteAdmin.mutateAsync(data)
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${data.email}.`,
      })
      setInviteDialogOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to invite admin',
        variant: 'destructive',
      })
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      technician: 'secondary',
    }
    return (
      <Badge variant={variants[role] || 'outline'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'outline'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Users & Permissions</CardTitle>
              </div>
              <CardDescription>
                Manage admin users and technicians
              </CardDescription>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No users found</h3>
              <p className="text-sm text-muted-foreground">
                Get started by inviting an admin user.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.updated_at
                          ? formatDistanceToNow(new Date(user.updated_at), {
                              addSuffix: true,
                            })
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm text-muted-foreground">
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={() =>
                              handleToggleStatus(user.id, user.is_active)
                            }
                            disabled={toggleUserStatus.isPending}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Placeholder for future audit log */}
          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              User activity and audit log features coming soon...
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invite Admin Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Admin User</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new admin user. They will receive a magic link to set up their account.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitInvite)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                  disabled={inviteAdmin.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteAdmin.isPending}>
                  {inviteAdmin.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
