import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, map, switchMap } from 'rxjs'
import { Document } from 'src/app/data/document'
import { FilterRule } from 'src/app/data/filter-rule'
import { Results } from 'src/app/data/results'
import { StoragePath } from 'src/app/data/storage-path'
import { queryParamsFromFilterRules } from 'src/app/utils/query-params'
import { AbstractPaperlessService } from './abstract-paperless-service'

interface SelectionDataItem {
  id: number
  document_count: number
}

interface SelectionData {
  selected_storage_paths: SelectionDataItem[]
  selected_correspondents: SelectionDataItem[]
  selected_tags: SelectionDataItem[]
  selected_document_types: SelectionDataItem[]
}

export type FileOrFolderItem =
  | ({ type: 'file' } & Document)
  | ({ type: 'folder' } & StoragePath)

@Injectable({
  providedIn: 'root',
})
export class CustomStoragePathService extends AbstractPaperlessService<StoragePath> {
  constructor(http: HttpClient) {
    super(http, 'storage_paths')
  }

  getByPath(path: string): Observable<StoragePath> {
    return this.list(1, 1, null, null, { path__iexact: path }).pipe(
      map((results) => results.results.pop())
    )
  }

  listTest(
    page?: number,
    pageSize?: number,
    sortField?: string,
    sortReverse?: boolean,
    filterRules?: FilterRule[],
    extraParams = {},
    parentStoragePathId?: number
  ): Observable<
    Results<FileOrFolderItem> & { parentStoragePath?: StoragePath }
  > {
    const params = Object.assign(
      extraParams,
      queryParamsFromFilterRules(filterRules)
    )

    let httpParams = new HttpParams()
    if (page) {
      httpParams = httpParams.set('page', page.toString())
    }

    if (pageSize) {
      httpParams = httpParams.set('page_size', pageSize.toString())
    }

    let ordering = ((sortField: string, sortReverse: boolean) => {
      if (sortField) {
        return (sortReverse ? '-' : '') + sortField
      } else {
        return null
      }
    })(sortField, sortReverse)

    if (ordering) {
      httpParams = httpParams.set('ordering', ordering)
    }

    for (let extraParamKey in extraParams) {
      if (extraParams[extraParamKey] != null) {
        httpParams = httpParams.set(extraParamKey, extraParams[extraParamKey])
      }
    }

    if (parentStoragePathId) {
      httpParams = httpParams.set('parent_storage_path_id', parentStoragePathId)
    }

    return this.http.get<Results<FileOrFolderItem>>(
      `${this.baseUrl}files_and_folders/`,
      { params: httpParams }
    )
  }

  listFiltered(
    page?: number,
    pageSize?: number,
    sortField?: string,
    sortReverse?: boolean,
    filterRules?: FilterRule[],
    extraParams = {},
    parentStoragePathId?: number
  ): Observable<Results<StoragePath> & { parentStoragePath?: StoragePath }> {
    const params = Object.assign(
      extraParams,
      queryParamsFromFilterRules(filterRules)
    )
    if (parentStoragePathId !== null && parentStoragePathId !== undefined) {
      return this.get(parentStoragePathId).pipe(
        switchMap((storagePath) => {
          params.path__istartswith = storagePath.path + '/'
          return this.list(page, pageSize, sortField, sortReverse, params).pipe(
            map((results) => {
              results.results = results.results.filter((s) => {
                const isNotParent = s.id !== parentStoragePathId
                const isDirectChild =
                  s.path
                    .replace(storagePath.path, '')
                    .split('/')
                    .filter((s) => !!s).length === 1
                return isNotParent && isDirectChild
              })
              // @ts-ignore
              results.parentStoragePath = storagePath
              return results
            })
          )
        })
      )
    }

    return this.list(page, pageSize, sortField, sortReverse, params).pipe(
      map((results) => {
        results.results = results.results.filter(
          (s) => s.path.split('/').length === 1
        )
        return results
      })
    )
  }

  listAllFilteredIds(filterRules?: FilterRule[]): Observable<number[]> {
    return this.listFiltered(1, 100000, null, null, filterRules, {
      fields: 'id',
    }).pipe(map((response) => response.results.map((doc) => doc.id)))
  }
}
