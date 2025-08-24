"use client";
import React from "react";
import { GalleryView } from "@/components/tiptap-node/gallery-node/GalleryView";

export default function ProseMirrorContent({ content }: { content: any }) {
  if (!content) return null;

  // Helper to render nodes recursively
  const renderNode = (node: any, idx: number) => {
    if (node.type === "gallery") {
      return <GalleryView key={idx} images={node.attrs.images || []} />;
    }
    if (node.type === "image") {
      return <img key={node.attrs.src || idx} src={node.attrs.src} alt="image" className="mx-auto" />;
    }
    if (node.type === "paragraph") {
      return (
        <p key={idx}>
          {(node.content || []).map((child: any, cidx: number) =>
            child.type === "text" ? child.text : null
          )}
        </p>
      );
    }
    if (node.type === "heading") {
      const level = node.attrs?.level || 1;
      const content = (node.content || []).map((child: any, cidx: number) => {
        if (child.type === "text") {
          // Handle text with marks (bold, italic, etc.)
          let text: React.ReactNode = child.text;
          if (child.marks && child.marks.length > 0) {
            text = child.marks.reduce((acc: React.ReactNode, mark: any) => {
              switch (mark.type) {
                case "bold":
                  return <strong key={`bold-${cidx}`} className="font-bold">{acc}</strong>;
                case "italic":
                  return <em key={`italic-${cidx}`} className="italic">{acc}</em>;
                default:
                  return acc;
              }
            }, text);
          }
          return text;
        }
        return null;
      });
      
      const baseClasses = "font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4";
      const alignClass = node.attrs?.textAlign ? `text-${node.attrs.textAlign}` : "";
      
      switch (level) {
        case 1:
          return <h1 key={idx} className={`text-3xl ${baseClasses} ${alignClass}`}>{content}</h1>;
        case 2:
          return <h2 key={idx} className={`text-2xl ${baseClasses} ${alignClass}`}>{content}</h2>;
        case 3:
          return <h3 key={idx} className={`text-xl ${baseClasses} ${alignClass}`}>{content}</h3>;
        case 4:
          return <h4 key={idx} className={`text-lg ${baseClasses} ${alignClass}`}>{content}</h4>;
        case 5:
          return <h5 key={idx} className={`text-base ${baseClasses} ${alignClass}`}>{content}</h5>;
        case 6:
          return <h6 key={idx} className={`text-sm ${baseClasses} ${alignClass}`}>{content}</h6>;
        default:
          return <h1 key={idx} className={`text-3xl ${baseClasses} ${alignClass}`}>{content}</h1>;
      }
    }
    if (node.type === "bulletList") {
      return (
        <ul key={idx} className="list-disc pl-6 space-y-1 my-6">
          {(node.content || []).map((listItem: any, listIdx: number) => 
            renderNode(listItem, listIdx)
          )}
        </ul>
      );
    }
    if (node.type === "listItem") {
      return (
        <li key={idx}>
          {(node.content || []).map((child: any, childIdx: number) => {
            if (child.type === "paragraph") {
              // For list items, render text content without <p> wrapper
              return (
                <span key={childIdx}>
                  {(child.content || []).map((textChild: any, textIdx: number) => {
                    if (textChild.type === "text") {
                      return textChild.text;
                    }
                    return null;
                  })}
                </span>
              );
            }
            return renderNode(child, childIdx);
          })}
        </li>
      );
    }
    if (node.type === "orderedList") {
      return (
        <ol key={idx} className="list-decimal pl-6 space-y-1 my-6">
          {(node.content || []).map((listItem: any, listIdx: number) => 
            renderNode(listItem, listIdx)
          )}
        </ol>
      );
    }
    if (node.type === "taskList") {
      return (
        <ul key={idx} className="space-y-2 my-6">
          {(node.content || []).map((taskItem: any, taskIdx: number) => 
            renderNode(taskItem, taskIdx)
          )}
        </ul>
      );
    }
    if (node.type === "taskItem") {
      const isChecked = node.attrs?.checked || false;
      return (
        <li key={idx} className="flex items-start gap-2 list-none">
          <input 
            type="checkbox" 
            checked={isChecked} 
            readOnly 
            className="mt-1 rounded border-gray-300"
          />
          <div className="flex-1">
            {(node.content || []).map((child: any, childIdx: number) => {
              if (child.type === "paragraph") {
                return (
                  <span key={childIdx}>
                    {(child.content || []).map((textChild: any, textIdx: number) => {
                      if (textChild.type === "text") {
                        return textChild.text;
                      }
                      return null;
                    })}
                  </span>
                );
              }
              return renderNode(child, childIdx);
            })}
          </div>
        </li>
      );
    }

    // Add more node types as needed...
    return null;
  };

  return (
    <article className="prose prose-neutral max-w-none">
      {(content.content || []).map(renderNode)}
    </article>
  );
} 