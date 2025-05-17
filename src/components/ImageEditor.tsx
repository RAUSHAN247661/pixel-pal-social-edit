
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Youtube,
  Circle,
  FlipHorizontal,
  FlipVertical,
  Palette,
  AlignCenter,
  Undo,
  Redo,
  SlidersHorizontal,
  Maximize,
  Shrink
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Updated filter types with more options
const FILTER_TYPES = [
  { name: 'Normal', filter: 'none' },
  { name: 'Grayscale', filter: 'grayscale(100%)' },
  { name: 'Sepia', filter: 'sepia(100%)' },
  { name: 'Vintage', filter: 'sepia(80%) contrast(110%) brightness(110%) saturate(130%)' },
  { name: 'Cool', filter: 'saturate(140%) hue-rotate(20deg)' },
  { name: 'Warm', filter: 'sepia(30%) saturate(140%)' },
  { name: 'Dramatic', filter: 'contrast(140%) brightness(90%)' },
  { name: 'Vivid', filter: 'saturate(180%) contrast(120%)' },
  { name: 'Matte', filter: 'brightness(90%) saturate(80%) contrast(90%)' },
  { name: 'Retro', filter: 'sepia(50%) hue-rotate(-30deg) saturate(140%)' },
  { name: 'Cold', filter: 'brightness(100%) saturate(80%) hue-rotate(180deg)' },
  { name: 'Noir', filter: 'grayscale(100%) contrast(120%)' },
  { name: 'Vintage Film', filter: 'sepia(30%) contrast(110%) brightness(110%) hue-rotate(-10deg)' },
  { name: 'Faded', filter: 'opacity(80%) saturate(80%) brightness(110%)' },
  { name: 'Pastel', filter: 'saturate(50%) brightness(120%)' },
];

const SOCIAL_CROP_PRESETS = {
  facebook: { width: 170, height: 170, label: "Facebook Profile", icon: Facebook },
  instagram: { width: 110, height: 110, label: "Instagram Profile", icon: Instagram },  
  youtube: { width: 800, height: 800, label: "YouTube Profile", icon: Youtube },
  linkedin: { width: 400, height: 400, label: "LinkedIn Profile", icon: Facebook },
  twitter: { width: 400, height: 400, label: "Twitter/X Profile", icon: Instagram },
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
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [textOverlay, setTextOverlay] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  const [cropPreset, setCropPreset] = useState<keyof typeof SOCIAL_CROP_PRESETS>('original');
  const [isCircleCrop, setIsCircleCrop] = useState(false);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [textShadow, setTextShadow] = useState(false);
  const [textBgColor, setTextBgColor] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [sharpness, setSharpness] = useState(0);
  const [exposure, setExposure] = useState(100);
  const [textFont, setTextFont] = useState('Arial');
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save current state for undo/redo
  const saveState = useCallback(() => {
    const currentState = {
      brightness,
      contrast,
      saturation,
      hue,
      blur,
      rotation,
      selectedFilter,
      zoomLevel,
      textOverlay,
      textColor,
      textSize,
      cropPreset,
      isCircleCrop,
      flipHorizontal,
      flipVertical,
      textPosition,
      textShadow,
      textBgColor,
      backgroundColor,
      sharpness,
      exposure,
      textFont,
      textBold,
      textItalic
    };
    
    const newHistoryStack = historyStack.slice(0, historyIndex + 1);
    newHistoryStack.push(currentState);
    
    setHistoryStack(newHistoryStack);
    setHistoryIndex(newHistoryStack.length - 1);
  }, [
    brightness, contrast, saturation, hue, blur, rotation, 
    selectedFilter, zoomLevel, textOverlay, textColor, 
    textSize, cropPreset, isCircleCrop, flipHorizontal, 
    flipVertical, textPosition, textShadow, textBgColor, 
    backgroundColor, sharpness, exposure, textFont, 
    textBold, textItalic, historyStack, historyIndex
  ]);

  // Initialize the image when the URL changes
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      imageRef.current = image;
      renderCanvas();
      // Initialize history
      saveState();
    };
    image.src = imageUrl;
  }, [imageUrl]);

  // Re-render when any parameter changes
  useEffect(() => {
    renderCanvas();
  }, [
    brightness, contrast, saturation, rotation, selectedFilter, zoomLevel, 
    textOverlay, textColor, textSize, cropPreset, isCircleCrop, 
    flipHorizontal, flipVertical, hue, blur, textPosition, 
    textShadow, textBgColor, backgroundColor, sharpness,
    exposure, textFont, textBold, textItalic
  ]);

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
    
    // Apply background color if set
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Save context before transformations
    ctx.save();
    
    // Move to center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply horizontal and vertical flips
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    
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
    
    // Create a circle clip path if circle crop is enabled
    if (isCircleCrop) {
      ctx.beginPath();
      const radius = Math.min(canvasWidth, canvasHeight) / 2;
      ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
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
    
    // Apply filters using CSS filters
    if (selectedFilter !== 'none' || brightness !== 100 || contrast !== 100 || 
        saturation !== 100 || hue !== 0 || blur !== 0 || exposure !== 100) {
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
      
      // Apply background color if set (after clearing the canvas)
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Set the filters on the main canvas context
      ctx.filter = `${selectedFilterStyle} 
                   brightness(${brightness}%) 
                   contrast(${contrast}%) 
                   saturate(${saturation}%)
                   hue-rotate(${hue}deg)
                   blur(${blur}px)
                   brightness(${exposure/100})`;
      
      // Draw the temp canvas back to the main canvas with filters applied
      ctx.drawImage(tempCanvas, 0, 0);
      
      // Reset the filter
      ctx.filter = 'none';
      
      // Apply sharpness (using a convolution filter - simulated effect)
      if (sharpness > 0) {
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const factor = sharpness / 10;
          
          // Simple sharpening effect
          for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
              const idx = (y * canvas.width + x) * 4;
              
              // Apply a simple sharpening effect (simulated)
              if (factor > 0 && x > 0 && x < canvas.width - 1 && y > 0 && y < canvas.height - 1) {
                for (let c = 0; c < 3; c++) {
                  const current = data[idx + c];
                  const neighbors = (
                    data[idx - 4 + c] + 
                    data[idx + 4 + c] + 
                    data[idx - canvas.width * 4 + c] + 
                    data[idx + canvas.width * 4 + c]
                  ) / 4;
                  
                  data[idx + c] = Math.min(255, Math.max(0, current + (current - neighbors) * factor));
                }
              }
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        } catch (e) {
          console.error("Error applying sharpness:", e);
        }
      }
    }
    
    // Add text overlay if exists
    if (textOverlay) {
      ctx.textAlign = 'center';
      
      // Set text position
      let textY;
      switch (textPosition) {
        case 'top':
          textY = textSize + 10;
          break;
        case 'bottom':
          textY = canvas.height - textSize - 10;
          break;
        case 'center':
        default:
          textY = canvas.height / 2;
      }
      
      ctx.textBaseline = textPosition === 'center' ? 'middle' : 'top';
      
      // Draw text background if color set
      if (textBgColor) {
        ctx.save();
        ctx.fillStyle = textBgColor;
        const textWidth = ctx.measureText(textOverlay).width + 20; // Add padding
        const textHeight = textSize * 1.5;
        const textBgY = textPosition === 'center' ? 
          textY - textHeight / 2 : 
          (textPosition === 'top' ? textY - 5 : textY - textHeight + 5);
        
        ctx.fillRect(canvas.width / 2 - textWidth / 2, textBgY, textWidth, textHeight);
        ctx.restore();
      }
      
      // Apply text shadow if enabled
      if (textShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      
      ctx.fillStyle = textColor;
      
      // Apply font styling
      let fontStyle = '';
      if (textBold) fontStyle += 'bold ';
      if (textItalic) fontStyle += 'italic ';
      ctx.font = `${fontStyle}${textSize}px ${textFont}`;
      
      ctx.fillText(textOverlay, canvas.width / 2, textY);
      
      // Reset shadow
      if (textShadow) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
    
  }, [
    brightness, contrast, saturation, rotation, selectedFilter, zoomLevel, 
    textOverlay, textColor, textSize, cropPreset, isCircleCrop, 
    flipHorizontal, flipVertical, hue, blur, textPosition, 
    textShadow, textBgColor, backgroundColor, sharpness,
    exposure, textFont, textBold, textItalic
  ]);

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
      const newRotation = (prev + change) % 360;
      saveState();
      return newRotation;
    });
  };

  // Toggle circle crop
  const toggleCircleCrop = () => {
    setIsCircleCrop(prev => {
      const newValue = !prev;
      saveState();
      return newValue;
    });
  };
  
  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = historyStack[newIndex];
      
      setBrightness(prevState.brightness);
      setContrast(prevState.contrast);
      setSaturation(prevState.saturation);
      setHue(prevState.hue);
      setBlur(prevState.blur);
      setRotation(prevState.rotation);
      setSelectedFilter(prevState.selectedFilter);
      setZoomLevel(prevState.zoomLevel);
      setTextOverlay(prevState.textOverlay);
      setTextColor(prevState.textColor);
      setTextSize(prevState.textSize);
      setCropPreset(prevState.cropPreset);
      setIsCircleCrop(prevState.isCircleCrop);
      setFlipHorizontal(prevState.flipHorizontal);
      setFlipVertical(prevState.flipVertical);
      setTextPosition(prevState.textPosition);
      setTextShadow(prevState.textShadow);
      setTextBgColor(prevState.textBgColor);
      setBackgroundColor(prevState.backgroundColor);
      setSharpness(prevState.sharpness);
      setExposure(prevState.exposure);
      setTextFont(prevState.textFont);
      setTextBold(prevState.textBold);
      setTextItalic(prevState.textItalic);
      
      setHistoryIndex(newIndex);
    }
  };
  
  // Handle redo
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = historyStack[newIndex];
      
      setBrightness(nextState.brightness);
      setContrast(nextState.contrast);
      setSaturation(nextState.saturation);
      setHue(nextState.hue);
      setBlur(nextState.blur);
      setRotation(nextState.rotation);
      setSelectedFilter(nextState.selectedFilter);
      setZoomLevel(nextState.zoomLevel);
      setTextOverlay(nextState.textOverlay);
      setTextColor(nextState.textColor);
      setTextSize(nextState.textSize);
      setCropPreset(nextState.cropPreset);
      setIsCircleCrop(nextState.isCircleCrop);
      setFlipHorizontal(nextState.flipHorizontal);
      setFlipVertical(nextState.flipVertical);
      setTextPosition(nextState.textPosition);
      setTextShadow(nextState.textShadow);
      setTextBgColor(nextState.textBgColor);
      setBackgroundColor(nextState.backgroundColor);
      setSharpness(nextState.sharpness);
      setExposure(nextState.exposure);
      setTextFont(nextState.textFont);
      setTextBold(nextState.textBold);
      setTextItalic(nextState.textItalic);
      
      setHistoryIndex(newIndex);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Preview Area */}
        <div className="flex-1 h-full">
          <div className="editor-panel h-full flex flex-col">
            <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Preview</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleRedo} disabled={historyIndex >= historyStack.length - 1}>
                  <Redo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onBack}>
                  Back to Upload
                </Button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <div className="relative rounded-md overflow-hidden shadow-md border border-border max-w-full max-h-full">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-[50vh] object-contain"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => handleRotate('ccw')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Rotate Left</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleRotate('cw')}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Rotate Right</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setZoomLevel(prev => {
                      const newValue = Math.min(prev + 0.1, 3);
                      saveState();
                      return newValue;
                    });
                  }}
                >
                  <ZoomIn className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Zoom In</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setZoomLevel(prev => {
                      const newValue = Math.max(prev - 0.1, 0.5);
                      saveState();
                      return newValue;
                    });
                  }}
                >
                  <ZoomOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Zoom Out</span>
                </Button>
                <Button 
                  variant={isCircleCrop ? "default" : "outline"} 
                  size="sm" 
                  onClick={toggleCircleCrop}
                >
                  <Circle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{isCircleCrop ? "Disable" : "Enable"} Circle</span>
                </Button>
                
                {/* Mobile Editor Sheet */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] pt-10">
                      <div className="h-full overflow-y-auto pb-24">
                        <MobileEditorControls 
                          brightness={brightness}
                          setBrightness={(val) => { setBrightness(val); saveState(); }}
                          contrast={contrast}
                          setContrast={(val) => { setContrast(val); saveState(); }}
                          saturation={saturation} 
                          setSaturation={(val) => { setSaturation(val); saveState(); }}
                          hue={hue}
                          setHue={(val) => { setHue(val); saveState(); }}
                          blur={blur}
                          setBlur={(val) => { setBlur(val); saveState(); }}
                          sharpness={sharpness}
                          setSharpness={(val) => { setSharpness(val); saveState(); }}
                          exposure={exposure}
                          setExposure={(val) => { setExposure(val); saveState(); }}
                          selectedFilter={selectedFilter}
                          setSelectedFilter={(val) => { setSelectedFilter(val); saveState(); }}
                          filterTypes={FILTER_TYPES}
                          cropPreset={cropPreset}
                          setCropPreset={(val) => { setCropPreset(val); saveState(); }}
                          socialCropPresets={SOCIAL_CROP_PRESETS}
                          flipHorizontal={flipHorizontal}
                          setFlipHorizontal={(val) => { setFlipHorizontal(val); saveState(); }}
                          flipVertical={flipVertical}
                          setFlipVertical={(val) => { setFlipVertical(val); saveState(); }}
                          textOverlay={textOverlay}
                          setTextOverlay={(val) => { setTextOverlay(val); saveState(); }}
                          textColor={textColor}
                          setTextColor={(val) => { setTextColor(val); saveState(); }}
                          textSize={textSize}
                          setTextSize={(val) => { setTextSize(val); saveState(); }}
                          textPosition={textPosition}
                          setTextPosition={(val) => { setTextPosition(val); saveState(); }}
                          textShadow={textShadow}
                          setTextShadow={(val) => { setTextShadow(val); saveState(); }}
                          textBgColor={textBgColor}
                          setTextBgColor={(val) => { setTextBgColor(val); saveState(); }}
                          backgroundColor={backgroundColor}
                          setBackgroundColor={(val) => { setBackgroundColor(val); saveState(); }}
                          textFont={textFont}
                          setTextFont={(val) => { setTextFont(val); saveState(); }}
                          textBold={textBold}
                          setTextBold={(val) => { setTextBold(val); saveState(); }}
                          textItalic={textItalic}
                          setTextItalic={(val) => { setTextItalic(val); saveState(); }}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                
                <Button variant="default" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Area - Desktop */}
        <div className="hidden md:block w-full md:w-[320px]">
          <div className="editor-panel">
            <Tabs defaultValue="crop">
              <TabsList className="w-full bg-muted/50 p-0 border-b border-border">
                <TabsTrigger className="flex-1" value="crop">Crop</TabsTrigger>
                <TabsTrigger className="flex-1" value="adjust">Adjust</TabsTrigger>
                <TabsTrigger className="flex-1" value="filters">Filters</TabsTrigger>
                <TabsTrigger className="flex-1" value="text">Text</TabsTrigger>
                <TabsTrigger className="flex-1" value="effects">Effects</TabsTrigger>
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
                          onClick={() => {
                            setCropPreset(key);
                            saveState();
                          }}
                          variant={cropPreset === key ? "default" : "outline"}
                          className="h-auto py-2 justify-start"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          <span className="text-xs">{preset.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  
                  <div className="flex flex-col space-y-4 pt-2 border-t border-border mt-4">
                    <h3 className="font-medium text-sm">Transform</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setFlipHorizontal(prev => !prev);
                          saveState();
                        }}
                        variant={flipHorizontal ? "default" : "outline"}
                        className="w-full"
                      >
                        <FlipHorizontal className="h-4 w-4 mr-2" />
                        Flip Horizontal
                      </Button>
                      <Button
                        onClick={() => {
                          setFlipVertical(prev => !prev);
                          saveState();
                        }}
                        variant={flipVertical ? "default" : "outline"}
                        className="w-full"
                      >
                        <FlipVertical className="h-4 w-4 mr-2" />
                        Flip Vertical
                      </Button>
                    </div>
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
                      onValueCommit={() => saveState()}
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
                      onValueCommit={() => saveState()}
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
                      onValueCommit={() => saveState()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Hue Rotation: {hue}°</Label>
                    </div>
                    <Slider
                      className="slider-control"
                      min={0}
                      max={360}
                      step={1}
                      value={[hue]}
                      onValueChange={(vals) => setHue(vals[0])}
                      onValueCommit={() => saveState()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Blur: {blur}px</Label>
                    </div>
                    <Slider
                      className="slider-control"
                      min={0}
                      max={10}
                      step={0.5}
                      value={[blur]}
                      onValueChange={(vals) => setBlur(vals[0])}
                      onValueCommit={() => saveState()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Sharpness: {sharpness}</Label>
                    </div>
                    <Slider
                      className="slider-control"
                      min={0}
                      max={10}
                      step={0.5}
                      value={[sharpness]}
                      onValueChange={(vals) => setSharpness(vals[0])}
                      onValueCommit={() => saveState()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Exposure: {exposure}%</Label>
                    </div>
                    <Slider
                      className="slider-control"
                      min={50}
                      max={150}
                      step={1}
                      value={[exposure]}
                      onValueChange={(vals) => setExposure(vals[0])}
                      onValueCommit={() => saveState()}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="filters" className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {FILTER_TYPES.map((filter) => (
                      <Button
                        key={filter.name}
                        onClick={() => {
                          setSelectedFilter(filter.filter);
                          saveState();
                        }}
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
                      onBlur={() => saveState()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="text-font">Font</Label>
                    <Select 
                      value={textFont} 
                      onValueChange={(value) => {
                        setTextFont(value);
                        saveState();
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                        <SelectItem value="Impact">Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-color">Text Color</Label>
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
                          onBlur={() => saveState()}
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
                        onValueCommit={() => saveState()}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={textBold ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setTextBold(!textBold);
                        saveState();
                      }}
                    >
                      Bold
                    </Button>
                    <Button
                      variant={textItalic ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setTextItalic(!textItalic);
                        saveState();
                      }}
                    >
                      Italic
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Text Position</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={textPosition === 'top' ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setTextPosition('top');
                          saveState();
                        }}
                      >
                        Top
                      </Button>
                      <Button
                        variant={textPosition === 'center' ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setTextPosition('center');
                          saveState();
                        }}
                      >
                        <AlignCenter className="h-4 w-4 mr-1" />
                        Center
                      </Button>
                      <Button
                        variant={textPosition === 'bottom' ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setTextPosition('bottom');
                          saveState();
                        }}
                      >
                        Bottom
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="text-shadow">Text Shadow</Label>
                      <Button
                        variant={textShadow ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setTextShadow(prev => !prev);
                          saveState();
                        }}
                      >
                        {textShadow ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="text-bg-color">Text Background</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <div 
                            className="w-4 h-4 rounded-full border border-border mr-2" 
                            style={{ backgroundColor: textBgColor || 'transparent' }}
                          />
                          {textBgColor ? 'Background Color' : 'No Background'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-4">
                        <div className="space-y-2">
                          <Label htmlFor="text-bg-color-picker">Choose Color</Label>
                          <Input
                            id="text-bg-color-picker"
                            type="color"
                            value={textBgColor || '#000000'}
                            onChange={(e) => setTextBgColor(e.target.value)}
                            onBlur={() => saveState()}
                            className="w-full"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setTextBgColor('');
                                saveState();
                              }}
                              className="flex-1"
                            >
                              Clear
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setTextBgColor('#000000');
                                saveState();
                              }}
                              className="flex-1"
                            >
                              Black
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TabsContent>
                
                <TabsContent value="effects" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bg-color">Background Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Palette className="h-4 w-4 mr-2" />
                          {backgroundColor ? 'Change Color' : 'Add Background'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-4">
                        <div className="space-y-2">
                          <Label htmlFor="bg-color-picker">Choose Color</Label>
                          <Input
                            id="bg-color-picker"
                            type="color"
                            value={backgroundColor || '#ffffff'}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            onBlur={() => saveState()}
                            className="w-full"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setBackgroundColor('');
                                saveState();
                              }}
                              className="flex-1"
                            >
                              Transparent
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setBackgroundColor('#ffffff');
                                saveState();
                              }}
                              className="flex-1"
                            >
                              White
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Image Shape</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={!isCircleCrop ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setIsCircleCrop(false);
                          saveState();
                        }}
                      >
                        <Maximize className="h-4 w-4 mr-2" />
                        Rectangle
                      </Button>
                      <Button
                        variant={isCircleCrop ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setIsCircleCrop(true);
                          saveState();
                        }}
                      >
                        <Circle className="h-4 w-4 mr-2" />
                        Circle
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Zoom: {Math.round(zoomLevel * 100)}%</Label>
                    <Slider
                      className="slider-control"
                      min={50}
                      max={300}
                      step={10}
                      value={[zoomLevel * 100]}
                      onValueChange={(vals) => setZoomLevel(vals[0] / 100)}
                      onValueCommit={() => saveState()}
                    />
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

// Mobile editor controls component
interface MobileEditorControlsProps {
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  saturation: number;
  setSaturation: (val: number) => void;
  hue: number;
  setHue: (val: number) => void;
  blur: number;
  setBlur: (val: number) => void;
  sharpness: number;
  setSharpness: (val: number) => void;
  exposure: number;
  setExposure: (val: number) => void;
  selectedFilter: string;
  setSelectedFilter: (val: string) => void;
  filterTypes: Array<{ name: string; filter: string }>;
  cropPreset: string;
  setCropPreset: (val: any) => void;
  socialCropPresets: any;
  flipHorizontal: boolean;
  setFlipHorizontal: (val: boolean) => void;
  flipVertical: boolean;
  setFlipVertical: (val: boolean) => void;
  textOverlay: string;
  setTextOverlay: (val: string) => void;
  textColor: string;
  setTextColor: (val: string) => void;
  textSize: number;
  setTextSize: (val: number) => void;
  textPosition: 'top' | 'center' | 'bottom';
  setTextPosition: (val: 'top' | 'center' | 'bottom') => void;
  textShadow: boolean;
  setTextShadow: (val: boolean) => void;
  textBgColor: string;
  setTextBgColor: (val: string) => void;
  backgroundColor: string;
  setBackgroundColor: (val: string) => void;
  textFont: string;
  setTextFont: (val: string) => void;
  textBold: boolean;
  setTextBold: (val: boolean) => void;
  textItalic: boolean;
  setTextItalic: (val: boolean) => void;
}

function MobileEditorControls({
  brightness, setBrightness, contrast, setContrast,
  saturation, setSaturation, hue, setHue, blur, setBlur,
  sharpness, setSharpness, exposure, setExposure,
  selectedFilter, setSelectedFilter, filterTypes,
  cropPreset, setCropPreset, socialCropPresets,
  flipHorizontal, setFlipHorizontal, flipVertical, setFlipVertical,
  textOverlay, setTextOverlay, textColor, setTextColor,
  textSize, setTextSize, textPosition, setTextPosition,
  textShadow, setTextShadow, textBgColor, setTextBgColor,
  backgroundColor, setBackgroundColor, textFont, setTextFont,
  textBold, setTextBold, textItalic, setTextItalic
}: MobileEditorControlsProps) {
  return (
    <Tabs defaultValue="crop" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger className="flex-1" value="crop">Crop</TabsTrigger>
        <TabsTrigger className="flex-1" value="adjust">Adjust</TabsTrigger>
        <TabsTrigger className="flex-1" value="filters">Filters</TabsTrigger>
        <TabsTrigger className="flex-1" value="text">Text</TabsTrigger>
        <TabsTrigger className="flex-1" value="effects">Effects</TabsTrigger>
      </TabsList>
      
      <TabsContent value="crop" className="mt-0 space-y-4">
        <h3 className="font-medium text-sm">Platform Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(socialCropPresets) as Array<keyof typeof SOCIAL_CROP_PRESETS>).map((key) => {
            const preset = socialCropPresets[key];
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
        
        <div className="flex flex-col space-y-4 pt-2 border-t border-border mt-4">
          <h3 className="font-medium text-sm">Transform</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setFlipHorizontal(!flipHorizontal)}
              variant={flipHorizontal ? "default" : "outline"}
              className="w-full"
            >
              <FlipHorizontal className="h-4 w-4 mr-2" />
              Flip Horizontal
            </Button>
            <Button
              onClick={() => setFlipVertical(!flipVertical)}
              variant={flipVertical ? "default" : "outline"}
              className="w-full"
            >
              <FlipVertical className="h-4 w-4 mr-2" />
              Flip Vertical
            </Button>
          </div>
        </div>
      </TabsContent>
              
      <TabsContent value="adjust" className="mt-0 space-y-4">
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
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Hue Rotation: {hue}°</Label>
          </div>
          <Slider
            className="slider-control"
            min={0}
            max={360}
            step={1}
            value={[hue]}
            onValueChange={(vals) => setHue(vals[0])}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Blur: {blur}px</Label>
          </div>
          <Slider
            className="slider-control"
            min={0}
            max={10}
            step={0.5}
            value={[blur]}
            onValueChange={(vals) => setBlur(vals[0])}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Sharpness: {sharpness}</Label>
          </div>
          <Slider
            className="slider-control"
            min={0}
            max={10}
            step={0.5}
            value={[sharpness]}
            onValueChange={(vals) => setSharpness(vals[0])}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Exposure: {exposure}%</Label>
          </div>
          <Slider
            className="slider-control"
            min={50}
            max={150}
            step={1}
            value={[exposure]}
            onValueChange={(vals) => setExposure(vals[0])}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="filters" className="mt-0">
        <div className="grid grid-cols-2 gap-2">
          {filterTypes.map((filter) => (
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
          <Label htmlFor="text-overlay-mobile">Text Overlay</Label>
          <Input
            id="text-overlay-mobile"
            placeholder="Add text to your image"
            value={textOverlay}
            onChange={(e) => setTextOverlay(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="text-font-mobile">Font</Label>
          <Select 
            value={textFont} 
            onValueChange={setTextFont}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Impact">Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="text-color-mobile">Text Color</Label>
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-full border border-border" 
                style={{ backgroundColor: textColor }}
              />
              <Input
                id="text-color-mobile"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text-size-mobile">Size: {textSize}px</Label>
            <Slider
              id="text-size-mobile"
              className="slider-control"
              min={10}
              max={100}
              step={1}
              value={[textSize]}
              onValueChange={(vals) => setTextSize(vals[0])}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={textBold ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setTextBold(!textBold)}
          >
            Bold
          </Button>
          <Button
            variant={textItalic ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setTextItalic(!textItalic)}
          >
            Italic
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>Text Position</Label>
          <div className="flex gap-2">
            <Button
              variant={textPosition === 'top' ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setTextPosition('top')}
            >
              Top
            </Button>
            <Button
              variant={textPosition === 'center' ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setTextPosition('center')}
            >
              <AlignCenter className="h-4 w-4 mr-1" />
              Center
            </Button>
            <Button
              variant={textPosition === 'bottom' ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setTextPosition('bottom')}
            >
              Bottom
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="text-shadow-mobile">Text Shadow</Label>
            <Button
              variant={textShadow ? "default" : "outline"}
              size="sm"
              onClick={() => setTextShadow(!textShadow)}
            >
              {textShadow ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="text-bg-color-mobile">Text Background</Label>
          <div className="flex gap-2">
            <div 
              className="w-8 h-8 rounded border border-border flex-shrink-0" 
              style={{ backgroundColor: textBgColor || 'transparent' }}
            />
            <Input
              id="text-bg-color-mobile"
              type="color"
              value={textBgColor || '#000000'}
              onChange={(e) => setTextBgColor(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTextBgColor('')}
            >
              Clear
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="effects" className="mt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bg-color-mobile">Background Color</Label>
          <div className="flex gap-2">
            <div 
              className="w-8 h-8 rounded border border-border flex-shrink-0" 
              style={{ backgroundColor: backgroundColor || 'transparent' }}
            />
            <Input
              id="bg-color-mobile"
              type="color"
              value={backgroundColor || '#ffffff'}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBackgroundColor('')}
            >
              Clear
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
