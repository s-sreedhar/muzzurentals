"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Camera } from "@/lib/types"

export function CamerasManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [cameras, setCameras] = useState<Camera[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null)
  const [newCamera, setNewCamera] = useState<Partial<Camera>>({
    name: "",
    brand: "",
    category: "Mirrorless",
    description: "",
    pricePerDay: 0,
    image: "/placeholder.svg?height=400&width=600",
    available: true,
    isNew: false,
    specs: [],
    included: [],
  })
  const [newSpec, setNewSpec] = useState("")
  const [newIncluded, setNewIncluded] = useState("")

  useEffect(() => {
    // Fetch cameras
    const fetchCameras = async () => {
      try {
        const response = await fetch("/api/cameras")
        const data = await response.json()

        if (data.success) {
          setCameras(data.cameras)
        }
      } catch (error) {
        console.error("Error fetching cameras:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCameras()
  }, [])

  const handleAddCamera = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/cameras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCamera),
      })

      const data = await response.json()

      if (data.success) {
        // Add new camera to state
        setCameras((prev) => [...prev, data.camera])

        // Reset form
        setNewCamera({
          name: "",
          brand: "",
          category: "Mirrorless",
          description: "",
          pricePerDay: 0,
          image: "/placeholder.svg?height=400&width=600",
          available: true,
          isNew: false,
          specs: [],
          included: [],
        })
      }
    } catch (error) {
      console.error("Error adding camera:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCamera = async () => {
    if (!editingCamera) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/cameras/${editingCamera.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingCamera),
      })

      const data = await response.json()

      if (data.success) {
        // Update camera in state
        setCameras((prev) => prev.map((camera) => (camera.id === editingCamera.id ? data.camera : camera)))

        // Reset editing state
        setEditingCamera(null)
      }
    } catch (error) {
      console.error("Error updating camera:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCamera = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/cameras/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Remove camera from state
        setCameras((prev) => prev.filter((camera) => camera.id !== id))
      }
    } catch (error) {
      console.error("Error deleting camera:", error)
    }
  }

  const addSpec = () => {
    if (!newSpec.trim()) return

    if (editingCamera) {
      setEditingCamera({
        ...editingCamera,
        specs: [...(editingCamera.specs || []), newSpec],
      })
    } else {
      setNewCamera({
        ...newCamera,
        specs: [...(newCamera.specs || []), newSpec],
      })
    }

    setNewSpec("")
  }

  const removeSpec = (index: number) => {
    if (editingCamera) {
      const updatedSpecs = [...editingCamera.specs]
      updatedSpecs.splice(index, 1)
      setEditingCamera({
        ...editingCamera,
        specs: updatedSpecs,
      })
    } else {
      const updatedSpecs = [...(newCamera.specs || [])]
      updatedSpecs.splice(index, 1)
      setNewCamera({
        ...newCamera,
        specs: updatedSpecs,
      })
    }
  }

  const addIncluded = () => {
    if (!newIncluded.trim()) return

    if (editingCamera) {
      setEditingCamera({
        ...editingCamera,
        included: [...(editingCamera.included || []), newIncluded],
      })
    } else {
      setNewCamera({
        ...newCamera,
        included: [...(newCamera.included || []), newIncluded],
      })
    }

    setNewIncluded("")
  }

  const removeIncluded = (index: number) => {
    if (editingCamera) {
      const updatedIncluded = [...editingCamera.included]
      updatedIncluded.splice(index, 1)
      setEditingCamera({
        ...editingCamera,
        included: updatedIncluded,
      })
    } else {
      const updatedIncluded = [...(newCamera.included || [])]
      updatedIncluded.splice(index, 1)
      setNewCamera({
        ...newCamera,
        included: updatedIncluded,
      })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px] bg-gray-800">
          <TabsTrigger value="list">Camera List</TabsTrigger>
          <TabsTrigger value="add">Add Camera</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Camera Inventory</CardTitle>
              <CardDescription className="text-gray-400">Manage your camera inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : cameras.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cameras.map((camera) => (
                    <motion.div
                      key={camera.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600"
                    >
                      <div className="relative h-48 bg-gray-600">
                        <img
                          src={camera.image || "/placeholder.svg"}
                          alt={camera.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          {camera.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
                          <Badge className={camera.available ? "bg-blue-500 text-white" : "bg-red-500 text-white"}>
                            {camera.available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg">{camera.name}</h3>
                        <div className="flex items-center justify-between mt-1 mb-2">
                          <div className="text-sm text-gray-300">{camera.brand}</div>
                          <div className="font-bold text-purple-400">${camera.pricePerDay}/day</div>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-4">{camera.description}</p>
                        <div className="flex justify-between">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-white hover:bg-gray-600"
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700 text-white">
                              <DialogHeader>
                                <DialogTitle>Edit Camera</DialogTitle>
                                <DialogDescription className="text-gray-400">Update camera details</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name" className="text-sm text-gray-400">
                                      Camera Name
                                    </Label>
                                    <Input
                                      id="edit-name"
                                      value={editingCamera?.name || ""}
                                      onChange={(e) =>
                                        setEditingCamera({
                                          ...editingCamera!,
                                          name: e.target.value,
                                        })
                                      }
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-brand" className="text-sm text-gray-400">
                                      Brand
                                    </Label>
                                    <Input
                                      id="edit-brand"
                                      value={editingCamera?.brand || ""}
                                      onChange={(e) =>
                                        setEditingCamera({
                                          ...editingCamera!,
                                          brand: e.target.value,
                                        })
                                      }
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-category" className="text-sm text-gray-400">
                                      Category
                                    </Label>
                                    <Select
                                      value={editingCamera?.category || ""}
                                      onValueChange={(value) =>
                                        setEditingCamera({
                                          ...editingCamera!,
                                          category: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger
                                        id="edit-category"
                                        className="bg-gray-700 border-gray-600 text-white"
                                      >
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        <SelectItem value="Mirrorless" className="hover:bg-gray-700">
                                          Mirrorless
                                        </SelectItem>
                                        <SelectItem value="DSLR" className="hover:bg-gray-700">
                                          DSLR
                                        </SelectItem>
                                        <SelectItem value="Cinema Camera" className="hover:bg-gray-700">
                                          Cinema Camera
                                        </SelectItem>
                                        <SelectItem value="Action Camera" className="hover:bg-gray-700">
                                          Action Camera
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-price" className="text-sm text-gray-400">
                                      Price Per Day ($)
                                    </Label>
                                    <Input
                                      id="edit-price"
                                      type="number"
                                      value={editingCamera?.pricePerDay || 0}
                                      onChange={(e) =>
                                        setEditingCamera({
                                          ...editingCamera!,
                                          pricePerDay: Number.parseFloat(e.target.value),
                                        })
                                      }
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-description" className="text-sm text-gray-400">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editingCamera?.description || ""}
                                    onChange={(e) =>
                                      setEditingCamera({
                                        ...editingCamera!,
                                        description: e.target.value,
                                      })
                                    }
                                    className="bg-gray-700 border-gray-600 text-white"
                                    rows={3}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-image" className="text-sm text-gray-400">
                                      Image URL
                                    </Label>
                                    <Input
                                      id="edit-image"
                                      value={editingCamera?.image || ""}
                                      onChange={(e) =>
                                        setEditingCamera({
                                          ...editingCamera!,
                                          image: e.target.value,
                                        })
                                      }
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label htmlFor="edit-available" className="text-sm text-gray-400">
                                        Available
                                      </Label>
                                      <Switch
                                        id="edit-available"
                                        checked={editingCamera?.available || false}
                                        onCheckedChange={(checked) =>
                                          setEditingCamera({
                                            ...editingCamera!,
                                            available: checked,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="flex justify-between mt-4">
                                      <Label htmlFor="edit-new" className="text-sm text-gray-400">
                                        Mark as New
                                      </Label>
                                      <Switch
                                        id="edit-new"
                                        checked={editingCamera?.isNew || false}
                                        onCheckedChange={(checked) =>
                                          setEditingCamera({
                                            ...editingCamera!,
                                            isNew: checked,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-400">Specifications</Label>
                                  <div className="flex space-x-2">
                                    <Input
                                      value={newSpec}
                                      onChange={(e) => setNewSpec(e.target.value)}
                                      placeholder="Add a specification"
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={addSpec}
                                      className="border-gray-600 text-white hover:bg-gray-600"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2 mt-2">
                                    {editingCamera?.specs?.map((spec, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-700 p-2 rounded-md"
                                      >
                                        <span className="text-sm">{spec}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeSpec(index)}
                                          className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-gray-400">Included Items</Label>
                                  <div className="flex space-x-2">
                                    <Input
                                      value={newIncluded}
                                      onChange={(e) => setNewIncluded(e.target.value)}
                                      placeholder="Add an included item"
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={addIncluded}
                                      className="border-gray-600 text-white hover:bg-gray-600"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2 mt-2">
                                    {editingCamera?.included?.map((item, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-700 p-2 rounded-md"
                                      >
                                        <span className="text-sm">{item}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeIncluded(index)}
                                          className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingCamera(null)}
                                  className="border-gray-600 text-white hover:bg-gray-600"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  onClick={handleUpdateCamera}
                                  disabled={isSubmitting}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="mr-2 h-4 w-4" /> Save Changes
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  This action cannot be undone. This will permanently delete the camera from the
                                  database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-600 text-white hover:bg-gray-600">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCamera(camera.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No cameras found. Add your first camera to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Add New Camera</CardTitle>
              <CardDescription className="text-gray-400">Add a new camera to your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-gray-400">
                      Camera Name
                    </Label>
                    <Input
                      id="name"
                      value={newCamera.name}
                      onChange={(e) =>
                        setNewCamera({
                          ...newCamera,
                          name: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm text-gray-400">
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      value={newCamera.brand}
                      onChange={(e) =>
                        setNewCamera({
                          ...newCamera,
                          brand: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm text-gray-400">
                      Category
                    </Label>
                    <Select
                      value={newCamera.category}
                      onValueChange={(value) =>
                        setNewCamera({
                          ...newCamera,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger id="category" className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="Mirrorless" className="hover:bg-gray-700">
                          Mirrorless
                        </SelectItem>
                        <SelectItem value="DSLR" className="hover:bg-gray-700">
                          DSLR
                        </SelectItem>
                        <SelectItem value="Cinema Camera" className="hover:bg-gray-700">
                          Cinema Camera
                        </SelectItem>
                        <SelectItem value="Action Camera" className="hover:bg-gray-700">
                          Action Camera
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm text-gray-400">
                      Price Per Day ($)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={newCamera.pricePerDay || ""}
                      onChange={(e) =>
                        setNewCamera({
                          ...newCamera,
                          pricePerDay: Number.parseFloat(e.target.value),
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm text-gray-400">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newCamera.description}
                    onChange={(e) =>
                      setNewCamera({
                        ...newCamera,
                        description: e.target.value,
                      })
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-sm text-gray-400">
                      Image URL
                    </Label>
                    <Input
                      id="image"
                      value={newCamera.image}
                      onChange={(e) =>
                        setNewCamera({
                          ...newCamera,
                          image: e.target.value,
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="available" className="text-sm text-gray-400">
                        Available
                      </Label>
                      <Switch
                        id="available"
                        checked={newCamera.available || false}
                        onCheckedChange={(checked) =>
                          setNewCamera({
                            ...newCamera,
                            available: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-between mt-4">
                      <Label htmlFor="new" className="text-sm text-gray-400">
                        Mark as New
                      </Label>
                      <Switch
                        id="new"
                        checked={newCamera.isNew || false}
                        onCheckedChange={(checked) =>
                          setNewCamera({
                            ...newCamera,
                            isNew: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Specifications</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newSpec}
                      onChange={(e) => setNewSpec(e.target.value)}
                      placeholder="Add a specification"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addSpec}
                      className="border-gray-600 text-white hover:bg-gray-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {newCamera.specs?.map((spec, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                        <span className="text-sm">{spec}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSpec(index)}
                          className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Included Items</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newIncluded}
                      onChange={(e) => setNewIncluded(e.target.value)}
                      placeholder="Add an included item"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addIncluded}
                      className="border-gray-600 text-white hover:bg-gray-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {newCamera.included?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                        <span className="text-sm">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIncluded(index)}
                          className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                onClick={handleAddCamera}
                disabled={isSubmitting || !newCamera.name || !newCamera.brand}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Add Camera
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
