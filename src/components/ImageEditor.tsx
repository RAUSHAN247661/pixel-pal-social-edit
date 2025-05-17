
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { 
  Download, 
  Crop, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Facebook,
  Instagram,
  Youtube
} from "lucide-react";

const FILTER_TYPES = [
  { name: 'Normal', filter: 'none' },
  { name: 'Grayscale', filter: 'grayscale(100%)' },
  { name: 'Sepia', filter: 'sepia(100%)' },
  { name: 'Vintage', filter: 'sepia(80%) contrast(110%) brightness(110%) saturate(130%)' },
  { name: 'Cool', filter: 'saturate(140%) hue-rotate(20deg)' },
  { name: 'Warm', filter: 'sepia(30%) saturate(140%)' },
  { name: 'Dramatic', filter: 'contrast(140%) brightness(90%)' },
  { name: 'Vivid', filter: 'saturate(180%) contrast(120%)' },
];

const SOCIAL_CROP_PRESETS = {
  facebook: { width: 170, height: 170, label: "Facebook Profile", icon: Facebook },
  instagram: { width: 110, height: 110, label: "Instagram Profile", icon: Instagram },  
  youtube: { width: 800, height: 800, label: "YouTube Profile", icon: Youtube },
  original: { width: 0, height: 0, label: "Original", icon: Crop }
};

interface ImageEditorProps {
  imageUrl: string;
  onBack: () => void;
}

export function ImageEditor({ imageUrl, onBack }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [textOverlay, setTextOverlay] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  const [cropPreset, setCropPreset] = useState<keyof typeof SOCIAL_CROP_PRESETS>('original');

  // Initialize the image when the URL changes
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      imageRef.current = image;
      renderCanvas();
    };
    image.src = imageUrl;
  }, [imageUrl]);

  // Re-render when any parameter changes
  useEffect(() => {
    renderCanvas();
  }, [brightness, contrast, saturation, rotation, selectedFilter, zoomLevel, textOverlay, textColor, textSize, cropPreset]);

  // Canvas rendering function
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = imageRef.current;
    
    // Determine canvas dimensions based on crop preset
    let canvasWidth, canvasHeight;
    if (cropPreset !== 'original' && SOCIAL_CROP_PRESETS[cropPreset].width > 0) {
      canvasWidth = SOCIAL_CROP_PRESETS[cropPreset].width;
      canvasHeight = SOCIAL_CROP_PRESETS[cropPreset].height;
    } else {
      canvasWidth = img.width;
      canvasHeight = img.height;
    }
    
    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context before transformations
    ctx.save();
    
    // Move to center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply zoom
    ctx.scale(zoomLevel, zoomLevel);
    
    // Calculate source and destination rectangles for centered crop
    const aspectRatio = img.width / img.height;
    let drawWidth, drawHeight;
    
    if (cropPreset !== 'original' && SOCIAL_CROP_PRESETS[cropPreset].width > 0) {
      const cropAspectRatio = canvasWidth / canvasHeight;
      
      if (aspectRatio > cropAspectRatio) {
        // Image is wider than crop area - crop sides
        drawHeight = img.height;
        drawWidth = img.height * cropAspectRatio;
      } else {
        // Image is taller than crop area - crop top/bottom
        drawWidth = img.width;
        drawHeight = img.width / cropAspectRatio;
      }
    } else {
      drawWidth = img.width;
      drawHeight = img.height;
    }
    
    // Draw image centered and cropped
    ctx.drawImage(
      img,
      (img.width - drawWidth) / 2, 
      (img.height - drawHeight) / 2,
      drawWidth,
      drawHeight,
      -canvasWidth / 2,
      -canvasHeight / 2,
      canvasWidth,
      canvasHeight
    );
    
    // Restore context for filter application
    ctx.restore();
    
    // Apply filters using CSS filters (cannot directly manipulate pixels w/o extra libraries)
    if (selectedFilter !== 'none' || brightness !== 100 || contrast !== 100 || saturation !== 100) {
      const selectedFilterStyle = FILTER_TYPES.find(f => f.filter === selectedFilter)?.filter || '';
      
      // Get the image data to apply back
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Create a temporary canvas for filter application
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      
      // Put the image data on temp canvas
      tempCtx.putImageData(imageData, 0, 0);
      
      // Clear original canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set the filters on the main canvas context
      ctx.filter = `${selectedFilterStyle} 
                   brightness(${brightness}%) 
                   contrast(${contrast}%) 
                   saturate(${saturation}%)`;
      
      // Draw the temp canvas back to the main canvas with filters applied
      ctx.drawImage(tempCanvas, 0, 0);
      
      // Reset the filter
      ctx.filter = 'none';
    }
    
    // Add text overlay if exists
    if (textOverlay) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      ctx.font = `${textSize}px Arial`;
      ctx.fillText(textOverlay, canvas.width / 2, canvas.height / 2);
    }
    
  }, [brightness, contrast, saturation, rotation, selectedFilter, zoomLevel, textOverlay, textColor, textSize, cropPreset]);

  // Function to handle the download
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'social-profile-image.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  // Handle rotation
  const handleRotate = (direction: 'cw' | 'ccw') => {
    setRotation(prev => {
      const change = direction === 'cw' ? 90 : -90;
      return (prev + change) % 360;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Preview Area */}
        <div className="flex-1 h-full">
          <div className="editor-panel h-full flex flex-col">
            <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Preview</h3>
              <Button variant="outline" size="sm" onClick={onBack}>
                Back to Upload
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <div className="relative rounded-md overflow-hidden shadow-md border border-border">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-[50vh] object-contain"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => handleRotate('ccw')}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Rotate Left
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleRotate('cw')}>
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate Right
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 3))}
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              >
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
              </Button>
              <Button variant="default" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Controls Area */}
        <div className="w-full md:w-[320px]">
          <div className="editor-panel">
            <Tabs defaultValue="crop">
              <TabsList className="w-full bg-muted/50 p-0 border-b border-border">
                <TabsTrigger className="flex-1" value="crop">Crop</TabsTrigger>
                <TabsTrigger className="flex-1" value="adjust">Adjust</TabsTrigger>
                <TabsTrigger className="flex-1" value="filters">Filters</TabsTrigger>
                <TabsTrigger className="flex-1" value="text">Text</TabsTrigger>
              </TabsList>
              
              <div className="p-4 custom-scrollbar overflow-y-auto max-h-[50vh]">
                <TabsContent value="crop" className="mt-0 space-y-4">
                  <h3 className="font-medium text-sm">Platform Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(SOCIAL_CROP_PRESETS) as Array<keyof typeof SOCIAL_CROP_PRESETS>).map((key) => {
                      const preset = SOCIAL_CROP_PRESETS[key];
                      const Icon = preset.icon;
                      return (
                        <Button
                          key={key}
                          onClick={() => setCropPreset(key)}
                          variant={cropPreset === key ? "default" : "outline"}
                          className="h-auto py-2 justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          <span className="text-xs">{preset.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="adjust" className="mt-0 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Brightness: {brightness}%</Label>
                    </div>
                    <Slider
                      className="slider-control"
                      min={50}
                      max={150}
                      step={1}
                      value={[brightness]}
                      onValueChange={(vals) => setBrightness(vals[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Contrast: {contrast}%</Label>
                    </div>
                    <Slider
                      className="slider-control"
                      min={50}
                      max={150}
                      step={1}
                      value={[contrast]}
                      onValueChange={(vals) => setContrast(vals[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Saturation: {saturation}%</Label>
                    </div>
                    <Slider
                      className="slider-control"
                      min={0}
                      max={200}
                      step={1}
                      value={[saturation]}
                      onValueChange={(vals) => setSaturation(vals[0])}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="filters" className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {FILTER_TYPES.map((filter) => (
                      <Button
                        key={filter.name}
                        onClick={() => setSelectedFilter(filter.filter)}
                        variant={selectedFilter === filter.filter ? "default" : "outline"}
                        className="h-auto py-2"
                      >
                        {filter.name}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-overlay">Text Overlay</Label>
                    <Input
                      id="text-overlay"
                      placeholder="Add text to your image"
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-color">Color</Label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-full border border-border" 
                          style={{ backgroundColor: textColor }}
                        />
                        <Input
                          id="text-color"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="text-size">Size: {textSize}px</Label>
                      <Slider
                        id="text-size"
                        className="slider-control"
                        min={10}
                        max={100}
                        step={1}
                        value={[textSize]}
                        onValueChange={(vals) => setTextSize(vals[0])}
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
