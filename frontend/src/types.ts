// src/types.ts

export interface Author {
    id: number;
    first_name: string;
    last_name: string | null;
    alternate_name: string | null;
    name: string; // The @property `name` from your model
}

export interface Title {
    id: number;
    title: string;
}

export interface Publisher {
    id: number;
    name: string;
}

// Corresponds to PublicationStatusChoices
export type PublicationStatus = "draft" | "published" | "archived" | "unknown";

export const PublicationStatusChoices = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
    { value: "unknown", label: "Unknown" },
];

// Shape of the metadata within the form state
export interface TextChunkMetadataFormData {
    edition: string;
    publish_date: string; // Use string for input type="date"
    publication_status: PublicationStatus;
    identifier: string;
    author_ids: number[]; // Array of selected Author IDs
    title_id: number | null; // Selected Title ID
    publisher_ids: number[]; // Array of selected Publisher IDs
    // We don't include text_chunk here directly as it's handled
    // by the creation process (either manual text or file upload result)
}

// Shape of the data sent for manual creation
export interface CreateTextChunkManualPayload {
    text: string;
    metadata: TextChunkMetadataFormData;
}

// Shape of the data sent for saving metadata after file upload
export interface SaveTextChunkMetadataPayload {
    text_chunk_id: number;
    metadata: TextChunkMetadataFormData;
}

// Shape of the response from the file upload API
export interface FileUploadResponse {
    text_chunk_id: number;
    metadata: Partial<TextChunkMetadataFormData>; // Metadata might not be fully populated
}

// src/types.ts

export interface TextChunkWithMetadata {
    id: number;
    text: string;
    metadata: {
      id: number;
      edition: string | null;
      publish_date: string | null;
      publication_status: PublicationStatus;
      identifier: string | null;
      title: Title | null;
      authors: Author[];
      publishers: Publisher[];
    } | null;
  }
