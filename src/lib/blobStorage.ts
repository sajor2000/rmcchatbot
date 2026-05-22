import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const DEFAULT_CASE_CONTENT_CONTAINER = "rmc-case-content";

export function getBlobContainerClient(containerName: string) {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    return BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING).getContainerClient(containerName);
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) {
    throw new Error("Blob storage access requires AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME.");
  }

  return new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  ).getContainerClient(containerName);
}

export function caseContentContainerName(): string {
  const configuredBaseUrl = process.env.AZURE_STORAGE_PUBLIC_BASE_URL;
  if (!configuredBaseUrl) {
    return DEFAULT_CASE_CONTENT_CONTAINER;
  }

  try {
    const pathContainerName = new URL(configuredBaseUrl).pathname.split("/").filter(Boolean)[0];
    return pathContainerName || DEFAULT_CASE_CONTENT_CONTAINER;
  } catch {
    return DEFAULT_CASE_CONTENT_CONTAINER;
  }
}
