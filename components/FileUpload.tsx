"use client"

import config from '@/lib/config';

import { 
    ImageKitProvider,
    Image,
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload, 
} from '@imagekit/next';
import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from "./ui/toast";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faImages } from "@fortawesome/free-regular-svg-icons";
import { cn } from 'cn';

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

interface Props {
    type: 'image' | 'video',
    accept: string,
    placeholder: string,
    folder: string,
    variant: 'dark' | 'light',
    onUpload: (url: string) => void;
}

const FileUpload = ({
    type,
    accept,
    placeholder,
    folder,
    variant, 
    onUpload 
}: Props) => {
    const ikUploadRef = useRef<HTMLInputElement>(null);
    // const [file, setFile] = useState<{ filepath: string } | null>(null);
    // State to keep track of the current upload progress (percentage)
    const [progress, setProgress] = useState(0);
    const [uploadError, setUploadError] = useState("");
    const [uploadedFile, setUploadedFile] = useState("");
    const [isUploaded, setIsUploaded] = useState(false);
    // Create an AbortController instance to provide an option to cancel the upload if needed.
    const abortController = useRef<AbortController | null>(null);

    const styles = {
        button: variant === 'dark' ? 'bg-dark-300' : 'bg-slate-300 border-gray-100 border',
        placeholder: variant === 'dark' ? 'text-light-100' : 'text-slate-300',
        text: variant === 'dark' ? 'text-light-100' : 'text-dark-400',
    }

    const onValidate = (file: File) => {
        if(type === 'image') {
            if(file.size > 20 * 1024 * 1024) {
                toast.add({
                    title: 'File size is too large',
                    description: 'Please upload a file that is less than 20MB in size',
                });
                return false;
            }
        } else if(type === 'video') {
            if(file.size > 50 * 1024 * 1024) {
                toast.add({
                    title: 'File size is too large',
                    description: 'Please upload a file that is less than 50MB in size',
                });
                return false;
            }
        }

        return true;
    }

    const handleUpload = async () => {
        setProgress(0);
        setIsUploaded(false);
        setUploadError('');
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

        // call validation
        if(!onValidate(file)) {
            setUploadError(
                type === 'image'
                    ? 'Please upload an image smaller than 20MB'
                    : 'Please upload a video smaller than 50MB'
            );
            fileInput.value = '';
            return;
        }

        setUploadError('');

        abortController.current = new AbortController();

        // Retrieve authentication parameters for the upload.
        let authParams;
        try {
            authParams = await authenticator();
            // console.log("Authentication received:", authParams);
        } catch (authError) {
            console.error("Failed to authenticate for upload:", authError);

            setUploadError('Authentication failed. Please try again.');
            toast.add({
                title: 'Authentication failed',
                description: 'Please try again later.',
            });
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
                folder: folder,
                useUniqueFileName: true,
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
                setUploadedFile(uploadResponse.url);
                setIsUploaded(true);
                onUpload(uploadResponse.url);
            }
        } catch (error) {
            let message = 'Something went wrong while uploading your file.';

            if (error instanceof ImageKitAbortError) {
                message = 'Upload was cancelled.';
                console.error('Upload aborted:', error.reason);
            } else if (error instanceof ImageKitInvalidRequestError) {
                message = error.message;
                console.error('Invalid request:', error.message);
            } else if (error instanceof ImageKitUploadNetworkError) {
                message = 'Network error. Please check your internet connection.';
                console.error('Network error:', error.message);
            } else if (error instanceof ImageKitServerError) {
                message = 'ImageKit server error. Please try again later.';
                console.error('Server error:', error.message);
            } else {
                console.error('Upload error:', error);
            }

            setUploadError(message);
            setProgress(0);

            toast.add({
                title: 'Upload failed',
                description: message,
            });
        }
    }

  return (
    <ImageKitProvider  
        urlEndpoint={urlEndpoint}
    >
       {/* File input element using React ref */}
            <Input
              type="file"
              accept={accept}
              ref={ikUploadRef}
              className={cn('bg-dark-300 text-light-200', styles.placeholder)}
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
                className={cn('upload-btn text-base', styles.button)}
                style={{fontSize: "16px"}} 
                onClick={handleUpload}
            >
                <FontAwesomeIcon icon={faImages} className="text-xl" />
                Upload file
            </Button>
            <br />

            {uploadedFile && (
                <div className="mt-6">
                    <p className={cn("mb-2 text-sm font-semibold", styles.text)}>
                    Uploaded {type}
                    </p>

                    {type === 'image' ? (
                        <Image
                            src={uploadedFile}
                            alt="Uploaded image"
                            width={400}
                            height={320}
                            className="rounded-lg object-contain"
                        />
                    ) : type === 'video' ? (
                        <video
                            src={uploadedFile}
                            controls
                            className="max-w-full rounded-lg"
                            style={{ width: 400, maxHeight: 320 }}
                        >
                            Your browser does not support video playback.
                        </video>
                    ) : null }
                </div>
            )}

            {/* Display the current upload progress */}
            {/* Upload Progress */}
            <div className="mt-4 w-full space-y-2">
            <div className="flex items-center justify-between">
                <p className={cn("text-sm font-semibold", styles.text)}>
                Upload progress
                </p>

                <p className={cn("text-sm font-semibold", styles.text)}>
                {Math.round(progress)}%
                </p>
            </div>

            <div
                className="h-2 w-full overflow-hidden rounded-full bg-gray-400"
                role="progressbar"
                aria-label="Upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
            >
                <div
                className={cn("h-full rounded-full transition-[width] duration-200 ease-out")}
                style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    backgroundColor: variant === 'light' ? '#333C5C' : 'white',
                }}
                />
            </div>
                {isUploaded  && (
                    <p className="text-green-700">
                        {`${type.charAt(0).toUpperCase()}${type.substring(1)}`} uploaded successfully!
                        <FontAwesomeIcon icon={faCircleCheck}
                            style={{fontSize: '18px'}}
                        />
                    </p>
                )}
            </div>

    </ImageKitProvider>
  )
}

export default FileUpload
