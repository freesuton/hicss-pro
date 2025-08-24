"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import { useContext, useEffect, useRef } from "react"
import { MapPin, Map } from "lucide-react"
import type { JSONContent } from '@tiptap/core'

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"

// --- Custom Extensions ---
import { Link } from "@/components/tiptap-extension/link-extension"
import { Selection } from "@/components/tiptap-extension/selection-extension"
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockQuoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import { GalleryButton } from "@/components/tiptap-ui/gallery-button/gallery-button"
import { MediaUploadButton } from "@/components/tiptap-ui/media-upload-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useImageUpload } from "@/hooks/use-image-upload"
import { useDebounce } from '@/hooks/use-debounced';
import LocationSearchInput from '@/components/map/LocationSearchInput';
import { toDMS } from "@/components/map/utils";
import { UploadImageType } from "@/hooks/use-image-upload";

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"
import '@/styles/_keyframe-animations.scss'
import '@/styles/_variables.scss'
import content from "@/components/tiptap-templates/simple/data/content.json"
import { Gallery } from "@/components/tiptap-node/gallery-node/gallery-node"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  const { editor } = useContext(EditorContext);

  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2]} />
        <MarkButton type="bold" />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        {/* <BlockQuoteButton />
        <CodeBlockButton />
        <TextAlignButton align="center" />
        <TextAlignButton align="left" />
        <TextAlignButton align="right" /> */}

      </ToolbarGroup>

      {/* <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup> */}

      <ToolbarSeparator />

      <ToolbarGroup>
        {/* <ImageUploadButton text="Add" /> */}
        <MediaUploadButton editor={editor} />
        <GalleryButton editor={editor}/>
        {process.env.NODE_ENV === 'development' && (
          <>
            <Button
              type="button"
              aria-label="Print JSON"
              onClick={() => {
                if (editor) {
                  console.log(editor.getJSON());
                }
              }}
            >
              Print JSON
            </Button>
            <Button
              type="button"
              aria-label="Print HTML"
              onClick={() => {
                if (editor) {
                  console.log(editor.getHTML());
                }
              }}
            >
              Print HTML
            </Button>
          </>
        )}
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({ initialTitle, initialContent, onTitleChange, onContentChange, coverImage, onCoverImageChange, location, onLocationChange, initialCoordinate, onCoordinateChange }: {
  initialTitle?: string,
  initialContent?: JSONContent,
  onTitleChange?: (title: string) => void,
  onContentChange?: (content: JSONContent) => void,
  coverImage?: string | null,
  onCoverImageChange?: (url: string | null) => void,
  location?: string | null,
  onLocationChange?: (location: string | null) => void,
  initialCoordinate?: {
    type: string,
    coordinates: [number, number]
  } | null,
  onCoordinateChange?: (coordinate: any) => void
}) {
  const isMobile = useMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [locationModalOpen, setLocationModalOpen] = React.useState(false);
  const [internalLocation, setInternalLocation] = React.useState<string | null>(location ?? null);
  const [locationSearch, setLocationSearch] = React.useState("");
  const [autocompleteResults, setAutocompleteResults] = React.useState<any[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = React.useState(false);
  const [internalCoverImage, setInternalCoverImage] = React.useState<string | null>(coverImage ?? null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { uploadImages: uploadCoverImage, isUploading } = useImageUpload({
    maxFiles: 1,
    onSuccess: (urls) => {
      if (urls && urls[0]) {
        setInternalCoverImage(urls[0]);
        onCoverImageChange?.(urls[0]);
      }
    },
    onError: (err) => {
      // Optionally show error
      console.error(err);
    },
  });

  // Separate hook instance for pasting images into editor content
  const { uploadImages: uploadEditorImage } = useImageUpload({
    maxFiles: 1,
    onError: (err) => {
      console.error('Failed to upload pasted image:', err);
    },
  });

  // Keep internal state in sync with prop
  React.useEffect(() => {
    if (coverImage !== undefined && coverImage !== internalCoverImage) {
      setInternalCoverImage(coverImage);
    }
  }, [coverImage]);

  const debouncedLocationSearch = useDebounce(locationSearch, 1000);

  // Fetch autocomplete results when locationSearch changes
  React.useEffect(() => {
    if (!debouncedLocationSearch) {
      setAutocompleteResults([]);
      return;
    }

    setAutocompleteLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/google/maps/autocomplete?input=${encodeURIComponent(debouncedLocationSearch)}`);
        const data = await res.json();
        console.log("autocompleteResults", data)
        if (Array.isArray(data)) {
          setAutocompleteResults(data);
        } else if (Array.isArray(data?.suggestions)) {
          setAutocompleteResults(data.suggestions);
        } else {
          setAutocompleteResults([]);
        }
      } catch (e) {
        setAutocompleteResults([]);
      } finally {
        setAutocompleteLoading(false);
      }
    })();
  }, [debouncedLocationSearch]);


  const editor = useEditor({
    // autofocus: true,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
      },
      handlePaste: (view, event) => {
        // Handle pasted files (images)
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter(item => item.type.startsWith('image/'));
        
        if (imageItems.length > 0) {
          event.preventDefault();
          
          imageItems.forEach(item => {
            const file = item.getAsFile();
            if (file) {
              // Use the separate upload hook for pasted images
              uploadEditorImage([file], { imageType: UploadImageType.Default })
                .then((urls: string[]) => {
                  if (urls[0]) {
                    // Insert the image at current cursor position
                    editor?.chain().focus().setImage({ src: urls[0] }).run();
                  }
                })
                .catch((error: Error) => {
                  console.error('Failed to upload pasted image:', error);
                });
            }
          });
          
          return true; // Prevent default paste behavior
        }
        
        return false; // Allow default paste behavior for non-image content
      },
    },
    extensions: [
      StarterKit.configure({
        hardBreak: false,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,

      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
      Gallery,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      console.log("eidot changes")
      if (onContentChange) {
        onContentChange(editor.getJSON());
      }
    },
  })


  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // Add this effect to update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent) {
      setTimeout(() => {
        editor.commands.setContent(initialContent);
      }, 0);
    }
  }, [editor, initialContent]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <Toolbar
        ref={toolbarRef}
        style={
          isMobile
            ? {
                bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
              }
            : {}
        }
      >
        {mobileView === "main" ? (
          <MainToolbarContent
            onHighlighterClick={() => setMobileView("highlighter")}
            onLinkClick={() => setMobileView("link")}
            isMobile={isMobile}
          />
        ) : (
          <MobileToolbarContent
            type={mobileView === "highlighter" ? "highlighter" : "link"}
            onBack={() => setMobileView("main")}
          />
        )}
      </Toolbar>

      <div className="content-wrapper">
        <div className="max-w-[780px] w-full mx-auto">
          {/* Title and location fields */}
          <div className="flex flex-col gap-0 my-6 px-[1rem] md:px-[3rem]">
            <div className="flex items-center min-h-12">
              <input
                type="text"
                placeholder="Title"
                className="border-none bg-transparent text-3xl font-bold outline-none text-gray-900 flex-1 placeholder-gray-400 h-12"
                style={{ padding: 0 }}
                value={initialTitle}
                onChange={e => onTitleChange?.(e.target.value)}
              />
            </div>

            <div className="flex items-center min-h-10">
              <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {internalCoverImage ? (
                <div className="flex items-center gap-2 flex-1">
                  <img src={internalCoverImage} alt="Cover" className="h-12 w-20 object-cover rounded-md border" />
                  <button
                    type="button"
                    className="ml-2 text-sm text-red-500 hover:underline"
                    onClick={() => {
                      setInternalCoverImage(null);
                      onCoverImageChange?.(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="bg-none border-none text-gray-500 cursor-pointer font-medium text-lg p-0 leading-tight hover:underline"
                    style={{ height: '48px', display: 'flex', alignItems: 'center' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Another Cover Image"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        await uploadCoverImage(files);
                        e.target.value = "";
                      }
                    }}
                    disabled={isUploading}
                  />
                </>
              )}
            </div>
            <div className="flex items-center min-h-10">
              <MapPin className="w-6 h-6 text-gray-400 mr-2" />
              <button
                type="button"
                className="bg-none border-none text-gray-500 cursor-pointer font-medium text-lg p-0 leading-tight hover:underline"
                style={{ height: '48px', display: 'flex', alignItems: 'center' }}
                onClick={() => setLocationModalOpen(true)}
                // disabled={Boolean(location && initialCoordinate && Array.isArray(initialCoordinate.coordinates) && initialCoordinate.coordinates.length === 2)}
              >
                {location && initialCoordinate && Array.isArray(initialCoordinate.coordinates) && initialCoordinate.coordinates.length === 2
                  ? location
                  : (!location && initialCoordinate && Array.isArray(initialCoordinate.coordinates) && initialCoordinate.coordinates.length === 2
                      ? `${toDMS(initialCoordinate.coordinates[1], true)} ${toDMS(initialCoordinate.coordinates[0], false)}`
                      : "Choose Location")}
              </button>
              {/* <span className="text-gray-500 text-sm ml-1"> coordinates</span> */}
            </div>

          </div>
          {/* Location Modal */}
          {locationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
                <Map className="w-5 h-5 text-gray-500 absolute top-5 right-11" />
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={() => setLocationModalOpen(false)}
                >
                  ×
                </button>
                <h2 className="text-lg font-semibold mb-4">Choose a location</h2>
                <LocationSearchInput
                  onSelect={({ placeName, coordinate }) => {
                    setInternalLocation(placeName);
                    onLocationChange?.(placeName);
                    setLocationModalOpen(false);
                    if (coordinate && onCoordinateChange) {
                      onCoordinateChange(coordinate);
                    } else if (onCoordinateChange) {
                      onCoordinateChange(null);
                    }
                  }}
                />
              </div>
            </div>
          )}

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
        </div>
      </div>
    </EditorContext.Provider>
  )
}
