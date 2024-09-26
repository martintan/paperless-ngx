import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IndexFieldMetadata } from 'src/app/data/document-index-field-metadata'
import { AbstractPaperlessService } from './abstract-paperless-service'

@Injectable({
  providedIn: 'root',
})
export class DocumentMetadataService extends AbstractPaperlessService<IndexFieldMetadata> {
  constructor(http: HttpClient) {
    super(http, 'documents')
  }

  getMetadatas(documentId: number): Observable<IndexFieldMetadata[]> {
    return this.http.get<IndexFieldMetadata[]>(
      this.getResourceUrl(documentId, 'index_field_metadata')
    )
  }

  updateMetadata(id: number, data: string): Observable<IndexFieldMetadata[]> {
    return this.http.post<IndexFieldMetadata[]>(
      this.getResourceUrl(id, 'index_field_metadata'),
      { metadata: data }
    )
  }
}
