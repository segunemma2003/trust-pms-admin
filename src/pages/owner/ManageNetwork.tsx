
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Mail, 
  Plus, 
  Search, 
  User, 
  Users,
  Edit,
  Trash,
} from "lucide-react";
import TrustLevelBadge from "@/components/ui/trust-level-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Define the schema for network user form
const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  trustLevel: z.string().min(1, {
    message: "Trust level must be selected.",
  }),
});

type NetworkUserFormValues = z.infer<typeof userFormSchema>;

// Mock trust levels data
const trustLevels = [
  { id: "1", name: "Family", level: 5, discount: 20 },
  { id: "2", name: "Close Friends", level: 4, discount: 15 },
  { id: "3", name: "Friends", level: 3, discount: 10 },
  { id: "4", name: "Acquaintances", level: 2, discount: 5 },
  { id: "5", name: "First Time", level: 1, discount: 0 },
];

// Mock network users data
const initialNetworkUsers = [
  {
    id: "1",
    name: "Jane Smith",
    email: "jane@example.com",
    trustLevelId: "1",
    status: "active",
  },
  {
    id: "2",
    name: "Robert Johnson",
    email: "robert@example.com",
    trustLevelId: "2",
    status: "pending",
  },
  {
    id: "3",
    name: "Maria Garcia",
    email: "maria@example.com",
    trustLevelId: "3",
    status: "active",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    trustLevelId: "4",
    status: "active",
  },
];

const ManageNetwork = () => {
  const [networkUsers, setNetworkUsers] = useState(initialNetworkUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(typeof initialNetworkUsers)[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = networkUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addForm = useForm<NetworkUserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      trustLevel: "",
    },
  });

  const editForm = useForm<NetworkUserFormValues>({
    resolver: zodResolver(userFormSchema),
  });

  const onAddSubmit = (values: NetworkUserFormValues) => {
    // In a real app, this would send the invitation via API
    const newUser = {
      id: Date.now().toString(),
      name: values.name,
      email: values.email,
      trustLevelId: values.trustLevel,
      status: "pending",
    };

    setNetworkUsers([...networkUsers, newUser]);
    toast.success("Network invitation sent successfully");
    addForm.reset();
    setIsAddDialogOpen(false);
  };

  const onEditSubmit = (values: NetworkUserFormValues) => {
    if (!selectedUser) return;

    // In a real app, this would update the user via API
    const updatedUsers = networkUsers.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            name: values.name,
            email: values.email,
            trustLevelId: values.trustLevel,
          } 
        : user
    );
    
    setNetworkUsers(updatedUsers);
    toast.success("User updated successfully");
    setSelectedUser(null);
    setIsEditDialogOpen(false);
  };

  const handleEdit = (user: (typeof networkUsers)[0]) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      trustLevel: user.trustLevelId,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    // In a real app, this would delete the user via API
    setNetworkUsers(networkUsers.filter(user => user.id !== id));
    toast.success("User removed from network");
  };

  const getTrustLevelName = (id: string) => {
    const level = trustLevels.find(level => level.id === id);
    return level ? level.name : "Unknown";
  };

  const getTrustLevelNumber = (id: string) => {
    const level = trustLevels.find(level => level.id === id);
    return level ? level.level : 1;
  };

  return (
    <Layout userType="owner" hideFooter>
      <div className="flex">
        <Sidebar type="owner" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">My Network</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage your trusted network of users
              </p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add User to Network</DialogTitle>
                  <DialogDescription>
                    Send an invitation to a user to join your trusted network.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="trustLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trust Level</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              {...field}
                            >
                              <option value="">Select a trust level</option>
                              {trustLevels.map(level => (
                                <option key={level.id} value={level.id}>
                                  {level.name} (Level {level.level}) - {level.discount}% discount
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="mt-6">
                      <Button type="submit">Send Invitation</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Network Users
              </CardTitle>
              <CardDescription>
                People who can access your properties with trust-based discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center border rounded-lg overflow-hidden mb-6">
                <div className="pl-3 text-airbnb-light">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  placeholder="Search users by name or email"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Trust Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-airbnb-primary/10 text-airbnb-primary">
                              {user.name.charAt(0) + user.name.split(" ")[1]?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-airbnb-light" />
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrustLevelBadge 
                            level={getTrustLevelNumber(user.trustLevelId) as 1 | 2 | 3 | 4 | 5} 
                            size="sm" 
                          />
                          <span>{getTrustLevelName(user.trustLevelId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "pending" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user details and trust level.
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="trustLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trust Level</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            {...field}
                          >
                            <option value="">Select a trust level</option>
                            {trustLevels.map(level => (
                              <option key={level.id} value={level.id}>
                                {level.name} (Level {level.level}) - {level.discount}% discount
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                      className="mr-2"
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default ManageNetwork;
