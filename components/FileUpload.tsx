import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { FileIcon } from './icons/FileIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LinkIcon } from './icons/LinkIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { translations } from '../lib/translations';

// Dynamically load pdf.js when needed
const loadPdfParser = async () => {
    if ((window as any).pdfjsLib) {
        return (window as any).pdfjsLib;
    }
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
            const pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(pdfjsLib);
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
    return (window as any).pdfjsLib;
};


interface ImagePart {
    inlineData: {
        mimeType: string;
        data: string;
    }
}
interface FileUploadProps {
  onAnalyze: (textContent: string, imageParts: ImagePart[], profilePicture: string | null) => void;
  t: (key: keyof typeof translations) => string;
}

const MAX_FILES = 5;
const MAX_LINKS = 4;
const MAX_FILE_SIZE_MB = 2;
const MAX_PFP_SIZE_MB = 1;

export const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze, t }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [pfp, setPfp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePfpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PFP_SIZE_MB * 1024 * 1024) {
        setError(t('fileUploadPfpSizeError').replace('{size}', `${MAX_PFP_SIZE_MB}`));
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        setPfp(reader.result as string);
        setError(null);
    };
    reader.onerror = () => {
        setError(t('fileUploadPfpReadError'));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
        setError(t('fileUploadMaxFilesError').replace('{max}', `${MAX_FILES}`));
        return;
    }

    // Fix: Explicitly type 'file' as 'File' to resolve type inference issue.
    const validFiles = selectedFiles.filter((file: File) => {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(t('fileUploadFileSizeError').replace('{name}', file.name).replace('{size}', `${MAX_FILE_SIZE_MB}`));
            return false;
        }
        return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    if (validFiles.length === selectedFiles.length) {
        setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (links.length < MAX_LINKS) {
        setLinks(prev => [...prev, '']);
    }
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleAnalyzeClick = useCallback(async () => {
    const validLinks = links.filter(link => link.trim() !== '');
    if (files.length === 0 && validLinks.length === 0) {
      setError(t('fileUploadNoFilesError'));
      return;
    }
    setError(null);

    try {
        const textFiles = files.filter(file => !file.type.startsWith('image/'));
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        // Fix: Explicitly type 'file' parameter to avoid type inference issues that may cause cascading errors.
        const textPromises = textFiles.map((file: File) => {
            return new Promise<string>(async (resolve, reject) => {
                try {
                    if (file.type === 'application/pdf') {
                        const pdfjsLib = await loadPdfParser();
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                           try {
                             if (!e.target?.result) throw new Error("Could not read PDF file");
                             const pdf = await pdfjsLib.getDocument(e.target.result).promise;
                             let text = '';
                             for (let i = 1; i <= pdf.numPages; i++) {
                                const page = await pdf.getPage(i);
                                const textContent = await page.getTextContent();
                                text += textContent.items.map((s: any) => s.str).join(' ');
                                text += '\n';
                             }
                             resolve(text);
                           } catch (err) {
                             reject(t('fileUploadProcessError').replace('{name}', file.name).replace('{error}', err instanceof Error ? err.message : String(err)));
                           }
                        };
                        reader.onerror = () => reject(t('fileUploadReadError').replace('{name}', file.name));
                        reader.readAsArrayBuffer(file);
                    } else {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const fileContent = e.target?.result;
                            let text = '';
                            if (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm')) {
                                if (typeof fileContent !== 'string') throw new Error("Could not read HTML file");
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(fileContent, 'text/html');
                                text = doc.body.textContent || '';
                            } else {
                                if (typeof fileContent !== 'string') throw new Error("Could not read text file");
                                text = fileContent;
                            }
                            resolve(text);
                        };
                        reader.onerror = () => reject(t('fileUploadReadError').replace('{name}', file.name));
                        reader.readAsText(file);
                    }
                } catch (err) {
                    reject(t('fileUploadProcessError').replace('{name}', file.name).replace('{error}', err instanceof Error ? err.message : String(err)));
                }
            });
        });
        
        // Fix: Explicitly type 'file' parameter to avoid type inference issues that may cause cascading errors.
        const imagePromises = imageFiles.map((file: File) => {
            return new Promise<ImagePart>((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = () => reject(t('fileUploadReadError').replace('{name}', file.name));
                reader.onload = (e) => {
                    try {
                        const dataUrl = e.target?.result as string;
                        if (!dataUrl) throw new Error(`Could not read image file ${file.name}`);
                        const base64Data = dataUrl.split(',')[1];
                        resolve({
                            inlineData: {
                                mimeType: file.type,
                                data: base64Data,
                            },
                        });
                    } catch (err) {
                        reject(t('fileUploadProcessError').replace('{name}', file.name).replace('{error}', err instanceof Error ? err.message : String(err)));
                    }
                };
                reader.readAsDataURL(file);
            });
        });


        const fileContents = await Promise.all(textPromises);
        const imageParts = await Promise.all(imagePromises);

        let combinedContent = "";

        if (fileContents.some(content => content.trim())) {
            combinedContent += `${t('textContentHeader')}\n`;
            fileContents.forEach((text, index) => {
                if (text.trim()) {
                    combinedContent += `--- ${t('fileContentHeader').replace('{index}', String(index + 1)).replace('{name}', textFiles[index].name)} ---\n${text}\n\n`;
                }
            });
        }

        if (validLinks.length > 0) {
            if (combinedContent) {
                combinedContent += '\n';
            }
            combinedContent += `--- ${t('externalLinksHeader')} ---\n`;
            combinedContent += validLinks.join("\n");
        }
        
        if (combinedContent.trim().length === 0 && imageParts.length === 0) {
            setError(t('fileUploadEmptyError'));
            return;
        }

        onAnalyze(combinedContent, imageParts, pfp);

    } catch (err) {
        console.error("Error processing files:", err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during file processing.';
        setError(t('analysisFailed').replace('{error}', errorMessage));
    }
  }, [files, links, pfp, onAnalyze, t]);

  return (
    <div className="bg-[var(--card-background)] backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-[var(--border-color)] space-y-6">
      <div className="flex flex-col items-center space-y-3">
        <label htmlFor="pfp-upload" className="cursor-pointer group relative">
            <div className="w-36 h-36 rounded-full p-px bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-600 shadow-lg shadow-amber-500/40 animate-pulse-slow flex items-center justify-center">
              {pfp ? (
                  <img src={pfp} alt="Profile Preview" className="w-full h-full rounded-full object-cover"/>
              ) : (
                  <UserCircleIcon className="w-full h-full text-slate-500 bg-slate-800 rounded-full p-2" />
              )}
            </div>
            <div className="absolute top-0 left-0 w-36 h-36 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <EditIcon className="w-8 h-8 text-white"/>
            </div>
        </label>
        <input id="pfp-upload" type="file" className="hidden" onChange={handlePfpChange} accept="image/png, image/jpeg, image/webp" />
        <label htmlFor="pfp-upload" className="text-sm font-semibold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] hover:underline cursor-pointer">
            {pfp ? t('changeProfilePicture') : t('addProfilePictureOptional')}
        </label>
      </div>
      
      <div>
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-[var(--border-muted-color)] border-dashed rounded-lg cursor-pointer bg-slate-500/10 hover:bg-slate-500/20 transition"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloudIcon className="w-10 h-10 mb-4 text-[var(--text-muted-color)]" />
            <p className="mb-2 text-sm text-[var(--text-color)] text-center">
              <span className="font-semibold">{t('clickToUpload')}</span> {t('dragAndDrop')}
            </p>
            <p className="text-xs text-[var(--text-muted-color)]">{t('fileTypesAndLimits').replace('{maxFiles}', `${MAX_FILES}`).replace('{maxSize}', `${MAX_FILE_SIZE_MB}`)}</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,text/plain,.pdf,.html,.htm,.jpg,.jpeg,.png,.bmp" multiple />
        </label>
        
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-[var(--primary-color-translucent)] p-2 rounded-lg text-sm text-[var(--primary-color-dark)] dark:text-[var(--primary-color-light)]">
                    <div className="flex items-center truncate">
                        <FileIcon className="w-5 h-5 ml-2 shrink-0" />
                        <span className="truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(index)} className="p-1 text-red-500 hover:bg-red-500/20 rounded-full shrink-0">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--text-color)]">{t('addExternalLinks')}</h3>
        {links.map((link, index) => (
             <div key={index} className="flex items-center gap-2">
                 <div className="relative w-full">
                    <LinkIcon className="w-5 h-5 text-[var(--text-muted-color)] absolute top-1/2 right-3 -translate-y-1/2" />
                    <input 
                        type="url"
                        placeholder="https://example.com"
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                        className="w-full p-2 pr-10 border rounded-lg bg-[var(--input-background)] border-[var(--border-muted-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    />
                 </div>
                <button onClick={() => removeLink(index)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full shrink-0">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        ))}
        {links.length < MAX_LINKS && (
            <button onClick={addLink} className="flex items-center text-sm font-semibold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] hover:text-[var(--primary-color-hover)]">
                <PlusCircleIcon className="w-5 h-5 mr-1" />
                {t('addAnotherLink')}
            </button>
        )}
      </div>

      {error && <p className="text-sm text-[var(--error-color)] dark:text-[var(--error-color-light)]">{error}</p>}

      <button
        onClick={handleAnalyzeClick}
        disabled={files.length === 0 && links.filter(l => l.trim()).length === 0}
        className="w-full py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] disabled:bg-[var(--button-disabled-background)] disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
      >
        {t('analyzeNow')}
      </button>
    </div>
  );
};