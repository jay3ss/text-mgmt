// src/components/TextChunkForm.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {
    Author,
    Title,
    Publisher,
    // PublicationStatus,
    PublicationStatusChoices,
    TextChunkMetadataFormData,
    FileUploadResponse,
} from '../types';
import { uploadTextFile } from '../api'; // Import the file upload API call

interface TextChunkFormProps {
    authorsOptions: Author[];
    titlesOptions: Title[];
    publishersOptions: Publisher[];
    onSubmit: (
        data:
            | { type: 'manual'; payload: { text: string; metadata: TextChunkMetadataFormData } }
            | { type: 'file'; payload: { text_chunk_id: number; metadata: TextChunkMetadataFormData } }
    ) => void;
    isLoadingOptions: boolean;
    isSubmitting: boolean;
    submitError: string | null;
}

const initialMetadataState: TextChunkMetadataFormData = {
    edition: '',
    publish_date: '',
    publication_status: 'published', // Default from Django model
    identifier: '',
    author_ids: [],
    title_id: null,
    publisher_ids: [],
};

const TextChunkForm: React.FC<TextChunkFormProps> = ({
    authorsOptions,
    titlesOptions,
    publishersOptions,
    onSubmit,
    isLoadingOptions,
    isSubmitting,
    submitError,
}) => {
    const [useFileInput, setUseFileInput] = useState(false);
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState<TextChunkMetadataFormData>(initialMetadataState);
    const [textChunkId, setTextChunkId] = useState<number | null>(null); // Stores ID if created via file upload

    const [isFileUploading, setIsFileUploading] = useState(false);
    const [fileUploadError, setFileUploadError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [uploadProgress, setUploadProgress] = useState(0); // Optional: track upload progress

    // Reset form when switching input type
    useEffect(() => {
        setText('');
        setFile(null);
        setMetadata(initialMetadataState);
        setTextChunkId(null);
        setFileUploadError(null);
        setUploadProgress(0);
    }, [useFileInput]);


    const handleTextInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        setFileUploadError(null);
        setUploadProgress(0); // Reset progress

        if (selectedFile) {
            setIsFileUploading(true);
            try {
                // Call the API to upload the file and get metadata
                // Note: A real implementation might use a library like axios
                // which has progress tracking, or requires setting up an XMLHttpRequest.
                // The current placeholder uploadTextFile just simulates the API call.
                const response: FileUploadResponse = await uploadTextFile(selectedFile);

                setTextChunkId(response.text_chunk_id);
                // Populate metadata from the response, merging with initial state defaults
                setMetadata((prev) => ({
                    ...prev,
                    ...response.metadata,
                    // Ensure arrays are handled correctly if API returns null or undefined
                    author_ids: response.metadata.author_ids || [],
                    publisher_ids: response.metadata.publisher_ids || [],
                }));

                // File input needs to be cleared to allow selecting the same file again
                 if (e.target) {
                    e.target.value = '';
                }


            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                setFileUploadError(error.message || 'File upload failed');
                setTextChunkId(null); // Ensure ID is null on error
                setMetadata(initialMetadataState); // Clear metadata on error
            } finally {
                setIsFileUploading(false);
                setUploadProgress(100); // Assume 100% on completion/error for simple example
            }
        }
    };

    const handleMetadataChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;

        if (type === 'select-multiple') {
            const selectedOptions = Array.from(
                (e.target as HTMLSelectElement).selectedOptions
            ).map((option) => parseInt(option.value, 10));
            setMetadata((prev) => ({
                ...prev,
                [name]: selectedOptions,
            }));
        } else if (name === 'title_id') {
             setMetadata((prev) => ({
                ...prev,
                [name]: value ? parseInt(value, 10) : null,
            }));
        }
        else {
            setMetadata((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (useFileInput) {
            if (textChunkId === null) {
                alert('Please upload a file first.');
                return;
            }
            onSubmit({ type: 'file', payload: { text_chunk_id: textChunkId, metadata: metadata } });
        } else {
             if (!text.trim()) {
                alert('Please enter text.');
                return;
            }
            onSubmit({ type: 'manual', payload: { text: text, metadata: metadata } });
        }
    };

    const canSubmit = useFileInput ? (textChunkId !== null && !isFileUploading) : (text.trim() !== '' && !isFileUploading);


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={useFileInput}
                        onChange={() => setUseFileInput(!useFileInput)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Use File Upload
                    </span>
                </label>
            </div>

            {useFileInput ? (
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Text File
                    </label>
                    <input
                        type="file"
                        id="file-upload"
                        accept=".txt, .md" // Adjust accepted file types as needed
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        disabled={isFileUploading || isSubmitting}
                    />
                     {isFileUploading && <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Uploading and processing file...</p>}
                     {fileUploadError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">Error: {fileUploadError}</p>}
                     {textChunkId && !isFileUploading && <p className="mt-2 text-sm text-green-600 dark:text-green-400">File processed. Text Chunk ID: {textChunkId}. Review/Edit metadata below.</p>}
                     {file && !isFileUploading && !textChunkId && !fileUploadError && (
                         <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">File selected: {file.name}. Upload pending...</p>
                     )}
                </div>
            ) : (
                <div>
                    <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Enter Text
                    </label>
                    <textarea
                        id="text-input"
                        rows={10}
                        className="shadow-sm block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={text}
                        onChange={handleTextInputChange}
                        disabled={isFileUploading || isSubmitting}
                    ></textarea>
                </div>
            )}

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Metadata</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Title */}
                <div>
                    <label htmlFor="title-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title
                    </label>
                    <select
                        id="title-id"
                        name="title_id"
                        value={metadata.title_id || ''}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         disabled={isLoadingOptions || isFileUploading || isSubmitting}
                    >
                         <option value="">-- Select Title --</option>
                        {titlesOptions.map((title) => (
                            <option key={title.id} value={title.id}>
                                {title.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Edition */}
                <div>
                    <label htmlFor="edition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Edition
                    </label>
                    <input
                        type="text"
                        id="edition"
                        name="edition"
                        value={metadata.edition}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         disabled={isFileUploading || isSubmitting}
                    />
                </div>

                {/* Publish Date */}
                <div>
                    <label htmlFor="publish-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Publish Date
                    </label>
                    <input
                        type="date"
                        id="publish-date"
                        name="publish_date"
                        value={metadata.publish_date}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         disabled={isFileUploading || isSubmitting}
                    />
                </div>

                {/* Publication Status */}
                <div>
                     <label htmlFor="publication-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Publication Status
                    </label>
                    <select
                        id="publication-status"
                        name="publication_status"
                        value={metadata.publication_status}
                        onChange={handleMetadataChange}
                         className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          disabled={isFileUploading || isSubmitting}
                    >
                        {PublicationStatusChoices.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Identifier */}
                 <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Identifier (ISBN, DOI, etc.)
                    </label>
                    <input
                        type="text"
                        id="identifier"
                        name="identifier"
                        value={metadata.identifier}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full shadow-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         disabled={isFileUploading || isSubmitting}
                    />
                </div>
            </div>

            {/* Authors (Multi-select) */}
             <div className="col-span-2"> {/* Span across two columns on larger screens */}
                 <label htmlFor="authors-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                     Authors
                 </label>
                 <select
                     id="authors-select"
                     name="author_ids"
                     multiple
                     value={metadata.author_ids.map(String)} // Select value needs to be strings
                     onChange={handleMetadataChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-32" // Added height for multiselect
                      disabled={isLoadingOptions || isFileUploading || isSubmitting}
                 >
                     {authorsOptions.map((author) => (
                         <option key={author.id} value={author.id}>
                             {author.name}
                         </option>
                     ))}
                 </select>
             </div>

            {/* Publishers (Multi-select) */}
             <div className="col-span-2"> {/* Span across two columns on larger screens */}
                 <label htmlFor="publishers-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                     Publishers
                 </label>
                 <select
                     id="publishers-select"
                     name="publisher_ids"
                     multiple
                     value={metadata.publisher_ids.map(String)} // Select value needs to be strings
                     onChange={handleMetadataChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-32" // Added height for multiselect
                      disabled={isLoadingOptions || isFileUploading || isSubmitting}
                 >
                     {publishersOptions.map((publisher) => (
                         <option key={publisher.id} value={publisher.id}>
                             {publisher.name}
                         </option>
                     ))}
                 </select>
             </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800 ${
                        (!canSubmit || isSubmitting || isFileUploading || isLoadingOptions) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!canSubmit || isSubmitting || isFileUploading || isLoadingOptions}
                >
                    {isSubmitting ? 'Saving...' : 'Create Text Chunk'}
                </button>
            </div>
             {submitError && <div className="text-red-600 mt-4">{submitError}</div>}
        </form>
    );
};

export default TextChunkForm;