"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import NewPostPageContent from "./NewPostPageContent";

export default function NewPostPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPostPageContent />
    </Suspense>
  );
}