import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

export function getPreviewClient(token: string) {
  return createClient({ projectId, dataset, apiVersion, useCdn: false, token })
}
