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

const EmailClient = () => {



    const [progress, setProgress] = useState(0);
    const [emails, setEmails] = useState(0)
    const [items, setItems] = useState([])
    const [attachment, setAttachment] = useState<>()


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

    console.log(items)

    const formik = useFormik({
        initialValues: {
            subject: "",
            message: "",
        },
        onSubmit: async (values) => {
            // console.log(values)

            let myValues = {
                subject: values.subject,
                message: values.message
            }
           
            const myattachment = { name: attachment?.name, data: fileContent }; // Use fileContent from state

            for (const mailer of items) {

                await mail(mailer.emails, myValues.subject, myValues.message, myattachment)
                setEmails((prevState) => prevState + 1)
            }

            formik.setSubmitting(false)
            formik.resetForm()
            setItems([])

        }
    })
    // Initialize state to store file content
    const [fileContent, setFileContent] = useState<string | null>(null);

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>): void {
        const file = e.target.files && e.target.files[0];
        setAttachment(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    const content = event.target.result as string; // Cast result to string
                    console.log("File Content:", content);
                    // Store the file content in state
                    setFileContent(content);
                }
            };
            reader.readAsDataURL(file); // Use readAsDataURL to read file content
        }
    }


    // const [progressEmail, setProgressEmail] = React.useState(13)

    // React.useEffect(() => {
    //     const timer = setTimeout(() => setProgressEmail(66), 500)
    //     return () => clearTimeout(timer)
    // }, [])
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
                    <Input id="attachment" type="file" onChange={(e) => handleFileUpload(e)} />
                </div>

                <Button type='submit' disabled={formik.isSubmitting} className='mt-4 disabled:bg-gray-400'>Send Bulk mails</Button>
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