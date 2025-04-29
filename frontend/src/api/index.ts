// src/api/index.ts

import {
    Author,
    Title,
    Publisher,
    CreateTextChunkManualPayload,
    FileUploadResponse,
    SaveTextChunkMetadataPayload,
} from '../types';

// --- Placeholder API Functions ---
// Replace these with your actual API calls using fetch, axios, etc.
// Ensure CSRF token is handled if not using simple GET requests.

// const API_BASE_URL = '/api'; // Adjust to your Django API base URL

export const fetchAuthors = async (): Promise<Author[]> => {
    console.log('Fetching authors...');
    // Example using fetch:
    // const response = await fetch(`${API_BASE_URL}/authors/`);
    // if (!response.ok) throw new Error('Failed to fetch authors');
    // return response.json();

    // Mock data for now:
    return new Promise((resolve) =>
        setTimeout(
            () =>
                resolve([
                    { id: 1, first_name: 'John', last_name: 'Doe', alternate_name: null, name: 'Doe, John' },
                    { id: 2, first_name: 'Jane', last_name: 'Smith', alternate_name: 'J. Smith', name: 'Smith, Jane' },
                    { id: 3, first_name: 'Anon', last_name: null, alternate_name: null, name: 'Anon' },
                ]),
            500
        )
    );
};

export const fetchTitles = async (): Promise<Title[]> => {
    console.log('Fetching titles...');
    // Example using fetch:
    // const response = await fetch(`${API_BASE_URL}/titles/`);
    // if (!response.ok) throw new Error('Failed to fetch titles');
    // return response.json();

    // Mock data for now:
    return new Promise((resolve) =>
        setTimeout(
            () => resolve([{ id: 1, title: 'The Great Novel' }, { id: 2, title: 'Another Story' }]),
            500
        )
    );
};

export const fetchPublishers = async (): Promise<Publisher[]> => {
    console.log('Fetching publishers...');
    // Example using fetch:
    // const response = await fetch(`${API_BASE_URL}/publishers/`);
    // if (!response.ok) throw new Error('Failed to fetch publishers');
    // return response.json();

    // Mock data for now:
    return new Promise((resolve) =>
        setTimeout(
            () => resolve([{ id: 1, name: 'Publisher A' }, { id: 2, name: 'Publisher B' }]),
            500
        )
    );
};

export const createTextChunkManual = async (
    payload: CreateTextChunkManualPayload
): Promise<any> => { // Replace 'any' with actual success response type
    console.log('Creating text chunk manually:', payload);
    // Example using fetch:
    // const response = await fetch(`${API_BASE_URL}/textchunks/create_manual/`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         // Include CSRF token if needed
    //     },
    //     body: JSON.stringify(payload),
    // });
    // if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.detail || 'Failed to create text chunk manually');
    // }
    // return response.json();

    // Mock success response:
    return new Promise((resolve, reject) => {
        setTimeout(() => {
             // Simulate a unique text constraint error sometimes
            if (payload.text.includes("duplicate")) {
                 reject(new Error("This text already exists."));
            } else {
                resolve({ success: true, message: 'Text chunk created successfully.' });
            }
        }, 1000);
    });
};

export const uploadTextFile = async (file: File): Promise<FileUploadResponse> => {
    console.log('Uploading file:', file.name);
    // Example using fetch with FormData:
    // const formData = new FormData();
    // formData.append('file', file);
    // // Append other initial metadata if needed, e.g., formData.append('title', 'Initial Title')
    //
    // const response = await fetch(`${API_BASE_URL}/textchunks/create_from_file/`, {
    //     method: 'POST',
    //     // No Content-Type header needed for FormData
    //     // Include CSRF token if needed
    //     body: formData,
    // });
    //
    // if (!response.ok) {
    //      const errorData = await response.json();
    //      throw new Error(errorData.detail || 'Failed to upload file and process');
    // }
    // return response.json();

    // Mock response:
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate processing based on file name
            if (file.name.includes("error")) {
                 reject(new Error("Simulated file processing error."));
            } else {
                resolve({
                    text_chunk_id: Math.floor(Math.random() * 1000) + 1, // Simulate new ID
                    metadata: {
                        title_id: file.name.includes("great") ? 1 : (file.name.includes("another") ? 2 : null),
                        author_ids: file.name.includes("jane") ? [2] : (file.name.includes("john") ? [1] : []),
                        publisher_ids: file.name.includes("pubA") ? [1] : (file.name.includes("pubB") ? [2] : []),
                        publish_date: '2023-10-27', // Simulate extracted date
                        edition: file.name.includes("edition2") ? "Second Edition" : "",
                        identifier: `ISBN-${Math.random().toString(36).substring(7)}`, // Simulate extracted identifier
                        publication_status: file.name.includes("draft") ? "draft" : "published", // Simulate extracted status
                    },
                } as FileUploadResponse);
            }
        }, 1500); // Simulate network delay and processing
    });
};

// This function is called AFTER file upload, to save the potentially edited metadata
export const saveTextChunkMetadata = async (
    payload: SaveTextChunkMetadataPayload
): Promise<any> => { // Replace 'any' with actual success response type
     console.log(`Saving metadata for TextChunk ID ${payload.text_chunk_id}:`, payload.metadata);
     // Example using fetch:
     // const response = await fetch(`${API_BASE_URL}/textchunks/${payload.text_chunk_id}/metadata/`, {
     //     method: 'PUT', // Or PATCH, depending on your API
     //     headers: {
     //         'Content-Type': 'application/json',
     //         // Include CSRF token if needed
     //     },
     //     body: JSON.stringify(payload.metadata),
     // });
     // if (!response.ok) {
     //      const errorData = await response.json();
     //      throw new Error(errorData.detail || `Failed to save metadata for ID ${payload.text_chunk_id}`);
     // }
     // return response.json();

    // Mock success response:
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: `Metadata saved successfully for ID ${payload.text_chunk_id}.` });
        }, 800);
    });
};