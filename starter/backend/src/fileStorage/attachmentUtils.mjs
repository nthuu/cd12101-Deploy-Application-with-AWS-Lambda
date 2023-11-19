const bucketName = process.env.ATTACHMENTS_S3_BUCKET

export const getAttachmentUrl = (todoId) => {
  return `https://${bucketName}.s3.amazonaws.com/${todoId}`
}
