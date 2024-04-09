"use client"
import { createClient } from '@usewaypoint/client';
import * as XLSX from "xlsx";
import React, { useState } from 'react'
import { mail } from '@/tools/mailer';
import { useFormik } from "formik"
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { useEdgeStore } from '../lib/edgestore';
import { FileState, MultiFileDropzone} from './FileUploader';

const EmailClient = () => {



    const [progress, setProgress] = useState(0);
    const [uploaded, setUploaded] = useState(false)

    const [emails, setEmails] = useState(0)
    const [items, setItems] = useState<any>([])
    const [attachment, setAttachment] = useState<File>()
    const [file, setFile] = React.useState<File>();
    const [urls, setUrls] = useState<string[]>([]);

    const [fileStates, setFileStates] = useState<FileState[]>([]);
    const { edgestore } = useEdgeStore();
    function updateFileProgress(key: string, progress: FileState['progress']) {
        setFileStates((fileStates) => {
            const newFileStates = structuredClone(fileStates);
            const fileState = newFileStates.find(
                (fileState) => fileState.key === key,
            );
            if (fileState) {
                fileState.progress = progress;
            }
            return newFileStates;
        });
    }


    // editor
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: "<p className='px-2'>email message</p>",
        onUpdate: ({ editor }) => {

        },
        editorProps: {
            attributes: {
                class:
                    "rounded-md border min-h-[150px] border-input"

            },
        }
    })




    // read excel
    const readExcel = (file: Blob) => {
        const promise = new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const uploadedBytes = event.loaded;
                    const totalBytes = event.total;
                    const uploadProgress = Math.floor((uploadedBytes / totalBytes) * 100);
                    setProgress(uploadProgress); // Update progress state
                }
            };
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = (e) => {
                const bufferArray = e.target?.result;
                const wb = XLSX.read(bufferArray, {
                    type: "buffer",
                });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                console.log(data);
                resolve(data);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
        promise.then((d: any) => {
            return setItems(d);
        });
    };

    console.log(items, fileStates)

    const formik = useFormik({
        initialValues: {
            subject: "",
            message: "",
        },
        onSubmit: async (values) => {

            for (const url of urls) {
                await edgestore.publicFiles.confirmUpload({
                    url,
                });
            }


            let myValues = {
                subject: values.subject,
                message: values.message
            }



            for (const mailer of items) {


                await mail(mailer.emails, myValues.subject, myValues.message, fileStates[0]?.file.name, fileStates[0]?.file.type, urls[0])
                setEmails((prevState) => prevState + 1)


            }

            formik.resetForm()
            setItems([])


        





            


    }
    })
// Initialize state to store file content
const [fileContent, setFileContent] = useState<string | null>(null);




return (
    <div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Upload list of emails from excel file</Label>
            <Input id="picture" type="file" onChange={(e) => e.target.files && readExcel(e.target.files[0])} />
        </div>
        <form action="" onSubmit={formik.handleSubmit} className='my-6'>
            <Label> Setup your email Structure </Label>
            <Input placeholder="subject" className="form-control my-4" name='subject' onChange={formik.handleChange} onBlur={formik.handleBlur} defaultValue={formik.values.subject} />

            <EditorContent editor={editor} />
            <Input placeholder="message" className="form-control my-4" name='message' onChange={formik.handleChange} onBlur={formik.handleBlur} defaultValue={formik.values.message} />
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="attachment">Upload File Attachment (Optional)</Label>
                <MultiFileDropzone
                    className='w-full'
                    value={fileStates}
                    onChange={(files) => {
                        setFileStates(files);
                    }}
                    onFilesAdded={async (addedFiles) => {
                        setFileStates([...fileStates, ...addedFiles]);
                        await Promise.all(
                            addedFiles.map(async (addedFileState) => {
                                try {
                                    const res = await edgestore.publicFiles.upload({
                                        file: addedFileState.file,
                                        options: {
                                            temporary: true
                                        },
                                        onProgressChange: async (progress) => {
                                            updateFileProgress(addedFileState.key, progress);
                                            if (progress === 100) {
                                                setUploaded(true)
                                                // wait 1 second to set it to complete
                                                // so that the user can see the progress bar at 100%
                                                await new Promise((resolve) => setTimeout(resolve, 1000));
                                                updateFileProgress(addedFileState.key, 'COMPLETE');
                                            }
                                        },

                                    });
                                    setUrls([...urls, res.url]);


                                } catch (err) {
                                    updateFileProgress(addedFileState.key, 'ERROR');
                                }
                            }),
                        );
                    }}
                />
            </div>



            <Button type='submit' disabled={formik.isSubmitting || items.length < 1 || uploaded} className='mt-4 disabled:bg-gray-400'>
                {formik.isSubmitting ? ("Sending mails please wait ...") : (
                    items.length < 1 ? (<p className='text-white'>set an excel file</p>) : (
                        "Send Bulk mails"
                    )
                )}

            </Button>
        </form>

        <div className='my-4'>
            {items.length > 0 && (
                <>
                    <Progress value={emails} className={`w-[60/${items.length}%]`} color='green' />
                    Emails sent: {emails} / {items?.length}
                </>
            )}

        </div>
    </div>
)
}

export default EmailClient