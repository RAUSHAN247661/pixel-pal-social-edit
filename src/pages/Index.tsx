
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ImageUploader } from "@/components/ImageUploader";
import { ImageEditor } from "@/components/ImageEditor";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };
  
  const handleBack = () => {
    setImageUrl(null);
  };

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        
        <main className="flex-1 container py-4 sm:py-8">
          <div className="max-w-5xl mx-auto">
            {!imageUrl ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Edit Your Social Media Profile Images
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Upload an image, customize it for different platforms, and download the perfect profile picture.
                  </p>
                </div>
                
                <div className="editor-panel animate-scale-in">
                  <ImageUploader onImageUploaded={handleImageUpload} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-center animate-slide-up">
                  <div className="p-3 sm:p-4 rounded-lg border border-border fade-in stagger-1">
                    <h3 className="font-semibold">Upload</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Drag & drop or select your image to get started
                    </p>
                  </div>
                  
                  <div className="p-3 sm:p-4 rounded-lg border border-border fade-in stagger-2">
                    <h3 className="font-semibold">Edit</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Crop, filter, adjust, and add text to your image
                    </p>
                  </div>
                  
                  <div className="p-3 sm:p-4 rounded-lg border border-border fade-in stagger-3">
                    <h3 className="font-semibold">Download</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Save your edited image ready for social media
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-scale-in">
                <ImageEditor imageUrl={imageUrl} onBack={handleBack} />
              </div>
            )}
          </div>
        </main>
        
        <footer className="border-t border-border py-4 mt-4 sm:py-6">
          <div className="container text-center text-xs sm:text-sm text-muted-foreground">
            <p>© 2025 Social Media Image Editor. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
