import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, Loader2, Search, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/queryClient';

interface WiringDiagram {
  id: number;
  modelId: number | null;
  brandId: number | null;
  title: string;
  description: string | null;
  year: number | null;
  imageData: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  uploadedAt: string;
  imageUrl: string | null;
  isCustomDrawing: boolean;
  tags: string[] | null;
}

interface Brand {
  id: number;
  name: string;
}

export function WiringPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    year: '',
    brandId: '',
    modelId: '',
    isCustomDrawing: false,
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const { data: diagrams, isLoading } = useQuery<WiringDiagram[]>({
    queryKey: ['wiring-diagrams'],
    queryFn: () => api.get<WiringDiagram[]>('/api/wiring-diagrams'),
  });

  const { data: brands } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => api.get<Brand[]>('/api/brands'),
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.upload<WiringDiagram>('/api/wiring-diagrams', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wiring-diagrams'] });
      setIsUploadOpen(false);
      resetUploadForm();
    },
  });

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      year: '',
      brandId: '',
      modelId: '',
      isCustomDrawing: false,
      tags: '',
    });
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.title) {
      alert('Please enter a title');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    if (uploadForm.description) formData.append('description', uploadForm.description);
    if (uploadForm.year) formData.append('year', uploadForm.year);
    if (uploadForm.brandId) formData.append('brandId', uploadForm.brandId);
    if (uploadForm.modelId) formData.append('modelId', uploadForm.modelId);
    formData.append('isCustomDrawing', uploadForm.isCustomDrawing.toString());

    if (uploadForm.tags) {
      const tagsArray = uploadForm.tags.split(',').map((t) => t.trim());
      formData.append('tags', JSON.stringify(tagsArray));
    }

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    uploadMutation.mutate(formData);
  };

  const filteredDiagrams = diagrams?.filter((diagram) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      diagram.title.toLowerCase().includes(query) ||
      diagram.description?.toLowerCase().includes(query) ||
      diagram.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const handleDownload = (diagram: WiringDiagram) => {
    // Open image in new tab
    if (diagram.imageData) {
      window.open(`/api/wiring-diagrams/${diagram.id}/image`, '_blank');
    } else if (diagram.imageUrl) {
      window.open(diagram.imageUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Wiring Diagrams</h1>
          <p className="text-lg text-muted-foreground">
            Find or upload wiring diagrams for any golf cart model
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(!isUploadOpen)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Diagram
        </Button>
      </div>

      {/* Upload Form */}
      {isUploadOpen && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Wiring Diagram</CardTitle>
            <CardDescription>
              Share your wiring diagram or custom AutoCAD drawing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Club Car DS 48V Wiring Diagram"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2023"
                    value={uploadForm.year}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, year: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Additional details about this diagram"
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, description: e.target.value })
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandId">Brand</Label>
                  <select
                    id="brandId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={uploadForm.brandId}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, brandId: e.target.value })
                    }
                  >
                    <option value="">Select a brand</option>
                    {brands?.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="electric, 48v, controller"
                    value={uploadForm.tags}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, tags: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload File (Image or PDF)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCustomDrawing"
                  checked={uploadForm.isCustomDrawing}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      isCustomDrawing: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isCustomDrawing" className="font-normal">
                  This is a custom AutoCAD drawing
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Diagram'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search diagrams by title, description, or tags..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Diagrams Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiagrams && filteredDiagrams.length > 0 ? (
            filteredDiagrams.map((diagram) => (
              <Card key={diagram.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="flex-1">{diagram.title}</span>
                    {diagram.isCustomDrawing && (
                      <Badge variant="secondary" className="ml-2">
                        Custom CAD
                      </Badge>
                    )}
                  </CardTitle>
                  {diagram.year && (
                    <Badge variant="outline" className="w-fit">
                      {diagram.year}
                    </Badge>
                  )}
                  {diagram.description && (
                    <CardDescription className="mt-2">
                      {diagram.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {diagram.tags && diagram.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {diagram.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {diagram.fileName && (
                    <p className="text-sm text-muted-foreground">
                      {diagram.fileName} •{' '}
                      {diagram.fileSize
                        ? (diagram.fileSize / 1024).toFixed(2) + ' KB'
                        : 'Unknown size'}
                    </p>
                  )}

                  <Button
                    onClick={() => handleDownload(diagram)}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    View Diagram
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                No wiring diagrams found.{' '}
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Upload one to get started!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
