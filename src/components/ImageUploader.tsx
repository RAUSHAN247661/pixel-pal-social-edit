
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragging(false);
    
    if (acceptedFiles.length === 0) {
      toast.error("Please upload an image file (JPEG, PNG, WebP)");
      return;
    }
    
    const file = acceptedFiles[0];
    
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onImageUploaded(reader.result as string);
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  }, [onImageUploaded]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    multiple: false
  });

  return (
    <div className="flex flex-col items-center space-y-4 p-6 text-center">
      <div
        {...getRootProps()}
        className={cn(
          "image-drag-area w-full h-64 flex flex-col items-center justify-center p-6 cursor-pointer",
          isDragging && "dragging"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-secondary p-3">
            <Upload className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">Drag & drop your image here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse files (JPEG, PNG, WebP)
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={open} 
          variant="secondary"
          className="flex items-center space-x-2"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Select Image</span>
        </Button>
      </div>
    </div>
  );
}
