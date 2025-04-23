import multer from "multer"

export const uploader = (fileLimit: number = 2) => {
    const storage = multer.memoryStorage()

    const limits = { fileSize: fileLimit * 1024 * 1024} //def 2 Mb

    return multer({storage, limits})
}