import { ObjectWithId } from './object-with-id'

export interface IndexFieldMetadataDataItem {
  id: number
  name: string
  value: string
  displayName: string
}

export interface IndexFieldMetadata extends ObjectWithId {
  created?: Date
  data?: IndexFieldMetadataDataItem[]
  document: number
  user?: number // PaperlessUser
}
