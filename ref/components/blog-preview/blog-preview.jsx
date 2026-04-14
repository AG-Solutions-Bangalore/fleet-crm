import React from "react";
import { useState, useEffect } from "react";
import { ExternalLink, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const BlogPreview = ({ formData, blogSubs, selectedRelatedBlogs, previewImage, imageDimensions }) => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);


  const scrollToSection = (index) => {
    setActiveSection(index);
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };


  const activeRelatedBlogs = selectedRelatedBlogs.filter(blog => blog.status === 'Active');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Website Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1400px] max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Website Preview</DialogTitle>
        </DialogHeader>
        

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-10px)] container mx-auto">
  
          <header className="mb-8 flex flex-row w-full gap-4 ">
           

          
            <div className=" w-[50%]">
              {formData.blog_course && (
                <Badge className="mb-3 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {formData.blog_course}
                </Badge>
              )}
              
              <h1 className="text-3xl font-bold mb-4 text-gray-900">
                {formData.blog_heading || "Blog Heading"}
              </h1>
              
              {formData.blog_short_description && (
                <p className="text-lg text-gray-600 mb-4">
                  {formData.blog_short_description}
                </p>
              )}
              
              <div className="flex items-center text-gray-500 text-sm">
                <time dateTime={formData.blog_created}>
                  {formatDate(formData.blog_created) || "Publish date"}
                </time>
                {formData.blog_slug && (
                  <span className="mx-2">•</span>
                )}
                {formData.blog_slug && (
                  <span className="font-mono text-gray-600">
                    /blog/{formData.blog_slug}
                  </span>
                )}
              </div>
            </div>


            <div className="relative w-[50%] aspect-[1400/450] rounded-md bg-gray-100 overflow-hidden">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt={formData.blog_images_alt || "Blog image"} 
                          className="w-full h-full object-cover"
                          style={{ 
                            objectFit: imageDimensions.width === 1400 && imageDimensions.height === 450 ? 'cover' : 'contain',
                            backgroundColor: imageDimensions.width === 1400 && imageDimensions.height === 450 ? 'transparent' : '#f3f4f6'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
                          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">1400×450 pixels</p>
                        </div>
                      )}
                      {formData.blog_images_alt && (
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 text-gray-800">
                            {formData.blog_images_alt}
                          </Badge>
                        </div>
                      )}
                      {previewImage && imageDimensions.width > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${imageDimensions.width === 1400 && imageDimensions.height === 450 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                          >
                            {imageDimensions.width}×{imageDimensions.height}
                          </Badge>
                        </div>
                      )}
                    </div>
            
          </header>




      
          <div className="flex flex-row gap-8 w-full">
          
            {blogSubs.length > 0 && (
              <aside className="w-[30%]">
                <div className="sticky top-6">
                  <nav className="bg-gray-50 rounded-lg p-4 border">
                    <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b">Table of Contents</h3>
                    <ul className="space-y-2">
                      {blogSubs.map((sub, index) => (
                        <li key={index}>
                          <button
                            onClick={() => scrollToSection(index)}
                            className={`w-full text-left p-2 rounded text-sm transition-colors ${
                              activeSection === index
                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {sub.blog_sub_heading || `Section ${index + 1}`}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
          
                 
                </div>
              </aside>
            )}

        
            <main className={`w-[70%]`}>
            
              {blogSubs.length > 0 ? (
                <div className="space-y-8">
                  {blogSubs.map((sub, index) => (
                    <article 
                      key={index}
                      id={`section-${index}`}
                      className="scroll-mt-6"
                    >
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 pb-3 border-b">
                        {sub.blog_sub_heading || `Section ${index + 1}`}
                      </h2>
                      <div className="prose prose-gray max-w-none">
                 
                      <div 
              className="ck-content"
              dangerouslySetInnerHTML={{ __html: sub.blog_sub_description }} 
            />
                          
                       
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No sections added yet.
                </div>
              )}

             
            </main>
            
          </div>
















       
           {activeRelatedBlogs.length > 0 && (
                <section className="mt-12 pt-8 border-t">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Related Articles</h3>
                    <p className="text-gray-600 mt-1">You might also be interested in these articles</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeRelatedBlogs.map((blog ,index) => (
                      <article 
                        key={index}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-5">
                          <Badge className="mb-3 bg-gray-100 text-gray-800">
                            {blog.status}
                          </Badge>
                          <h4 className="text-lg font-semibold mb-3 text-gray-900 line-clamp-2">
                            {blog.label}
                          </h4>
                          <div className="flex items-center text-gray-500 text-sm">
                            <span className="font-mono">/{blog.slug}</span>
                 
                   
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
        </div>

    
        
      </DialogContent>
    </Dialog>
  );
};

export default BlogPreview;