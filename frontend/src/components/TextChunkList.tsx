import { useEffect, useState } from "react";
import { TextChunkWithMetadata } from "../types";

export function TextChunkList() {
  const [textChunks, setTextChunks] = useState<TextChunkWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);

    console.log(typeof textChunks)
  useEffect(() => {
    async function fetchTextChunks() {
      try {
        console.log("fetching data from API...")
        const response = await fetch("http://localhost:8000/api/chunks/index");
        const data = await response.json();
        console.log("typeof data:", typeof data)
        console.log(data)
        setTextChunks(data);
      } catch (error) {
        console.error("Failed to fetch text chunks", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTextChunks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4"> {/* Keep outer div for spacing if needed */}
        <h1>List of Chunks</h1>
        {/* Use ul for the list */}
        <ul className="space-y-4">
            {textChunks.map((chunk) => (
                // Use li for each list item, apply key here
                <li key={chunk.id} className="p-4 rounded-md shadow-sm">
                    {/* Keep inner structure as is */}
                    <p className="text-lg">
                        {chunk.text.length > 50 ? `${chunk.text.slice(0, 50)}...` : chunk.text}
                    </p>
                    {chunk.metadata && (
                        <div className="text-sm space-y-1">
                            {chunk.metadata.title && (
                                <div><strong>Title:</strong> {chunk.metadata.title.title}</div>
                            )}
                            {chunk.metadata.authors && chunk.metadata.authors.length > 0 && ( // Added check for authors existence
                                <div>
                                    <strong>Authors:</strong> {chunk.metadata.authors.map(a => a.name).join(", ")}
                                </div>
                            )}
                            {chunk.metadata.publish_date && (
                                <div><strong>Published:</strong> {chunk.metadata.publish_date}</div>
                            )}
                            {/* Check if publication_status exists before displaying */}
                            {chunk.metadata.publication_status && (
                                <div><strong>Status:</strong> {chunk.metadata.publication_status}</div>
                            )}
                            {chunk.metadata.identifier && (
                                <div><strong>Identifier:</strong> {chunk.metadata.identifier}</div>
                            )}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    </div>
  );
}
