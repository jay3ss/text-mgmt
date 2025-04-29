// src/pages/CreateTextView.tsx
import React, { useState, useEffect } from 'react';
import TextChunkForm from './TextChunkForm';
import { Author, Title, Publisher, CreateTextChunkManualPayload, SaveTextChunkMetadataPayload } from '../types';
import { fetchAuthors, fetchTitles, fetchPublishers, createTextChunkManual, saveTextChunkMetadata } from '../api'; // Import API functions

const CreateTextView: React.FC = () => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [titles, setTitles] = useState<Title[]>([] as Title[]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [optionsError, setOptionsError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

    useEffect(() => {
        const loadOptions = async () => {
            setIsLoadingOptions(true);
            setOptionsError(null);
            try {
                const [authorsData, titlesData, publishersData] = await Promise.all([
                    fetchAuthors(),
                    fetchTitles(),
                    fetchPublishers(),
                ]);
                setAuthors(authorsData);
                setTitles(titlesData);
                setPublishers(publishersData);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                setOptionsError(error.message || 'Failed to load form options.');
            } finally {
                setIsLoadingOptions(false);
            }
        };

        loadOptions();
    }, []); // Empty dependency array means this runs once on mount

    const handleSubmit = async (
         data:
            | { type: 'manual'; payload: CreateTextChunkManualPayload }
            | { type: 'file'; payload: SaveTextChunkMetadataPayload }
    ) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);

        try {
            if (data.type === 'manual') {
                await createTextChunkManual(data.payload);
                setSubmitSuccess('Text chunk and metadata created successfully!');
                 // Optionally redirect or clear form
            } else { // type === 'file'
                 // The file upload already happened in the form, creating the TextChunk.
                 // This final submit saves the potentially edited metadata associated with that ID.
                await saveTextChunkMetadata(data.payload);
                 setSubmitSuccess(`Metadata updated successfully for Text Chunk ID ${data.payload.text_chunk_id}!`);
                 // Optionally redirect or clear form
            }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setSubmitError(error.message || 'An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 dark:bg-gray-800 dark:text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Text Chunk</h1>

            {isLoadingOptions ? (
                <p className="text-blue-600 dark:text-blue-400">Loading form options...</p>
            ) : optionsError ? (
                <p className="text-red-600 dark:text-red-400">Error loading options: {optionsError}</p>
            ) : (
                <TextChunkForm
                    authorsOptions={authors}
                    titlesOptions={titles}
                    publishersOptions={publishers}
                    onSubmit={handleSubmit}
                    isLoadingOptions={isLoadingOptions} // Pass loading state down
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                />
            )}

            {submitSuccess && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md dark:bg-green-800 dark:text-green-100">
                    {submitSuccess}
                </div>
            )}
             {/* submitError is handled within the form */}

        </div>
    );
};

export default CreateTextView;