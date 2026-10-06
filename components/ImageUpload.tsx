"use client"

import config from '@/lib/config';

import { 
    ImageKitProvider,
    Image,
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload 
} from '@imagekit/next';
import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from "./ui/toast";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faImages } from "@fortawesome/free-regular-svg-icons";

const {
    env: {
        imagekit: { urlEndpoint, publicKey },
    },
} = config

const authenticator = async() => {
    try {
        const response = await fetch(`${config.env.apiEndpoint}/api/imagekit`);

        if(!response.ok) {
            const errorText = await response.text();

            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        const { signature, expire, token } = data;

        return { token, expire, signature, publicKey };
    } catch (error: any) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
}

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

const ImageUpload = ({ onUpload }: ImageUploadProps) => {
    const ikUploadRef = useRef<HTMLInputElement>(null);
    // const [file, setFile] = useState<{ filepath: string } | null>(null);
    // State to keep track of the current upload progress (percentage)
    const [progress, setProgress] = useState(0);
    const [uploadError, setUploadError] = useState("");
    const [uploadedImage, setUploadedImage] = useState("");
    // Create an AbortController instance to provide an option to cancel the upload if needed.
    const abortController = useRef<AbortController | null>(null);

    const handleUpload = async () => {
        setProgress(0);
        // setUploadedImage("");
        // Access the file input element using the ref
        const fileInput = ikUploadRef.current;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            toast.add({
                title: "Upload failed",
                description: "Please select a file to upload",
            });
            setUploadError("Please select a file to upload");
            return;
        }

        // Extract the first file from the file input
        const file = fileInput.files[0];

        abortController.current = new AbortController();

        // Retrieve authentication parameters for the upload.
        let authParams;
        try {
            authParams = await authenticator();
            // console.log("Authentication received:", authParams);
        } catch (authError) {
            console.error("Failed to authenticate for upload:", authError);
            return;
        }
        const { signature, expire, token, publicKey } = authParams;

        // Call the ImageKit SDK upload function with the required parameters and callbacks.
        try {
            const uploadResponse = await upload({
                // Authentication parameters
                expire,
                token,
                signature,
                publicKey,
                file,
                fileName: file.name, // Optionally set a custom file name
                // Progress callback to update upload progress state
                onProgress: (event) => {
                    const percentage = (event.loaded / event.total) * 100;
                    setProgress(percentage);
                },
                // Abort signal to allow cancellation of the upload if needed.
                abortSignal: abortController.current!.signal,
            });
            // console.log("Upload response:", uploadResponse);
            if (uploadResponse.url) {
                setUploadedImage(uploadResponse.url);
                onUpload(uploadResponse.url);
            }
        } catch (error) {
            // Handle specific error types provided by the ImageKit SDK.
            if (error instanceof ImageKitAbortError) {
                console.error("Upload aborted:", error.reason);
            } else if (error instanceof ImageKitInvalidRequestError) {
                console.error("Invalid request:", error.message);
            } else if (error instanceof ImageKitUploadNetworkError) {
                console.error("Network error:", error.message);
            } else if (error instanceof ImageKitServerError) {
                console.error("Server error:", error.message);
            } else {
                // Handle any other errors that may occur.
                console.error("Upload error:", error);
            }
        }
    }

  return (
    <ImageKitProvider  
        urlEndpoint={urlEndpoint}
    >
       {/* File input element using React ref */}
            <Input
              type="file"
              ref={ikUploadRef}
              className='bg-dark-300 text-light-200'
              onChange={() => {
                setUploadError("");
            }}
            />

            {uploadError && (
            <div className="mb-2 flex items-center gap-2 text-sm text-red">
                <FontAwesomeIcon icon={faCircleXmark} />
                <p>{uploadError}</p>
            </div>
            )}
            {/* Button to trigger the upload process */}
            <Button 
                type="button" 
                className="form-btn"
                style={{fontSize: "16px"}} 
                onClick={handleUpload}
            >
                <FontAwesomeIcon icon={faImages} className="text-xl" />
                Upload file
            </Button>
            <br />

            {uploadedImage && (
                <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold text-light-100">
                    Uploaded image
                    </p>

                    <Image
                        src={uploadedImage}
                        alt="Uploaded image"
                        width={400}
                        height={320}
                        className="rounded-lg object-contain"
                    />
                </div>
            )}

            {/* Display the current upload progress */}
            {/* Upload Progress */}
            <div className="mt-4 w-full space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-light-100">
                Upload progress
                </p>

                <p className="text-sm font-semibold text-white">
                {Math.round(progress)}%
                </p>
            </div>

            <div
                className="h-2 w-full overflow-hidden rounded-full bg-dark-600"
                role="progressbar"
                aria-label="Upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
            >
                <div
                className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
                style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                }}
                />
            </div>
                {progress === 100 && (
                    <p className="text-green-700">
                        Upload Successfully!
                        <FontAwesomeIcon icon={faCircleCheck}
                            style={{fontSize: '18px'}}
                        />
                    </p>
                )}
            </div>

    </ImageKitProvider>
  )
}

export default ImageUpload
