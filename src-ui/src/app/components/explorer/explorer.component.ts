import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Subject, takeUntil } from 'rxjs'
import {
  filterRulesDiffer,
  isFullTextFilterRule,
} from 'src/app/utils/filter-rules'
import { FILTER_FULLTEXT_MORELIKE } from 'src/app/data/filter-rule-type'
import {
  Document,
  DOCUMENT_SORT_FIELDS,
  DOCUMENT_SORT_FIELDS_FULLTEXT,
} from 'src/app/data/document'
import { SavedView } from 'src/app/data/saved-view'
import { SETTINGS_KEYS } from 'src/app/data/ui-settings'
import {
  SortEvent,
  SortableDirective,
} from 'src/app/directives/sortable.directive'
import { ConsumerStatusService } from 'src/app/services/consumer-status.service'
import { ExplorerListViewService } from 'src/app/services/explorer-list-view.service'
import { OpenDocumentsService } from 'src/app/services/open-documents.service'
import { FileOrFolderItem } from 'src/app/services/rest/custom-storage-path.service'
import { SavedViewService } from 'src/app/services/rest/saved-view.service'
import { SettingsService } from 'src/app/services/settings.service'
import { ToastService } from 'src/app/services/toast.service'
import { FolderCreateDialogComponent } from '../common/create-dialog/folder-create-dialog/folder-create-dialog.component'
import { UploadLargeFileComponent } from '../common/create-dialog/upload-large-file/upload-large-file.component'
import { ComponentWithPermissions } from '../with-permissions/with-permissions.component'
import { FilterEditorComponent } from './filter-editor/filter-editor.component'
import { DocumentListViewService } from 'src/app/services/document-list-view.service'
import { FilterRule } from 'src/app/data/filter-rule'

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
})
export class ExplorerComponent
  extends ComponentWithPermissions
  implements OnInit, OnDestroy
{
  constructor(
    public list: ExplorerListViewService,
    public documentList: DocumentListViewService,
    public savedViewService: SavedViewService,
    public route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private modalService: NgbModal,
    private consumerStatusService: ConsumerStatusService,
    public openDocumentsService: OpenDocumentsService,
    private settingsService: SettingsService
  ) {
    super()
  }

  @ViewChild('filterEditor')
  private filterEditor: FilterEditorComponent

  @ViewChildren(SortableDirective) headers: QueryList<SortableDirective>

  displayMode = 'smallCards' // largeCards, smallCards, details

  unmodifiedFilterRules: FilterRule[] = []
  private unmodifiedSavedView: SavedView

  private unsubscribeNotifier: Subject<any> = new Subject()

  get folderPath(): string {
    return this.list.currentFolderPath
  }

  get savedViewIsModified(): boolean {
    if (!this.list.activeSavedViewId || !this.unmodifiedSavedView) return false
    else {
      return (
        this.unmodifiedSavedView.sort_field !== this.list.sortField ||
        this.unmodifiedSavedView.sort_reverse !== this.list.sortReverse ||
        filterRulesDiffer(
          this.unmodifiedSavedView.filter_rules,
          this.list.filterRules
        )
      )
    }
  }

  get isFiltered() {
    return this.list.filterRules?.length > 0
  }

  getTitle() {
    let title = this.list.activeSavedViewTitle
    if (title && this.savedViewIsModified) {
      title += '*'
    } else if (!title) {
      title = $localize`File Explorer`
    }
    return title
  }

  getSortFields() {
    return isFullTextFilterRule(this.list.filterRules)
      ? DOCUMENT_SORT_FIELDS_FULLTEXT
      : DOCUMENT_SORT_FIELDS
  }

  set listSortReverse(reverse: boolean) {
    this.list.sortReverse = reverse
  }

  get listSortReverse(): boolean {
    return this.list.sortReverse
  }

  setSortField(field: string) {
    this.list.sortField = field
  }

  onSort(event: SortEvent) {
    this.list.setSort(event.column, event.reverse)
  }

  get isBulkEditing(): boolean {
    return this.list.selected.size > 0
  }

  saveDisplayMode() {
    localStorage.setItem('document-list:displayMode', this.displayMode)
  }

  ngOnInit(): void {
    if (localStorage.getItem('document-list:displayMode') != null) {
      this.displayMode = localStorage.getItem('document-list:displayMode')
    }

    this.consumerStatusService
      .onDocumentConsumptionFinished()
      .pipe(takeUntil(this.unsubscribeNotifier))
      .subscribe(() => {
        this.list.reload()
      })

    this.route.queryParamMap
      .pipe(takeUntil(this.unsubscribeNotifier))
      .subscribe((queryParams) => {
        this.list.loadFromQueryParams(queryParams)
        this.unmodifiedFilterRules = []
      })
  }

  ngOnDestroy() {
    // unsubscribes all
    this.unsubscribeNotifier.next(this)
    this.unsubscribeNotifier.complete()
  }

  clickPathPart(index: number) {
    if (index === 0) return this.router.navigate(['explorer'])
    const pathUntilPart = this.folderPath
      .replace('DMS/', '')
      .split('/')
      .slice(0, index)
      .join('/')
    this.list.getStoragePathByPath(pathUntilPart).subscribe((storagePath) => {
      this.router.navigate(['explorer'], {
        queryParams: { spid: storagePath.id },
      })
    })
  }

  createFolder() {
    var modal = this.modalService.open(FolderCreateDialogComponent, {
      backdrop: 'static',
    })
    modal.componentInstance.dialogMode = 'create'
    modal.componentInstance.object = {
      path: this.folderPath.replace('DMS/', ''),
    }
    modal.componentInstance.succeeded
      .pipe(takeUntil(this.unsubscribeNotifier))
      .subscribe(() => this.list.reload())
  }

  uploadFile() {}

  uploadLargeFile() {
    var modal = this.modalService.open(UploadLargeFileComponent, {
      backdrop: 'static',
    })
    modal.componentInstance.dialogMode = 'create'
    modal.componentInstance.object = {}
    modal.componentInstance.succeeded
      .pipe(takeUntil(this.unsubscribeNotifier))
      .subscribe(() => this.list.reload())
  }

  openDocumentDetail(f: FileOrFolderItem) {
    if (f.type === 'folder') {
      this.router.navigate(['explorer'], {
        queryParams: { spid: f.id },
      })
    }
  }

  toggleSelected(document: Document, event: MouseEvent): void {
    if (!event.shiftKey) this.documentList.toggleSelected(document)
    else this.documentList.selectRangeTo(document)
    if (!event.shiftKey) this.list.toggleSelected(document)
    else this.list.selectRangeTo(document)
  }

  clickTag(tagID: number) {
    this.list.selectNone()
    this.filterEditor.toggleTag(tagID)
  }

  clickCorrespondent(correspondentID: number) {
    this.list.selectNone()
    this.filterEditor.toggleCorrespondent(correspondentID)
  }

  clickDocumentType(documentTypeID: number) {
    this.list.selectNone()
    this.filterEditor.toggleDocumentType(documentTypeID)
  }

  clickStoragePath(storagePathID: number) {
    this.list.selectNone()
    this.filterEditor.toggleStoragePath(storagePathID)
  }

  clickMoreLike(documentID: number) {
    this.list.quickFilter([
      { rule_type: FILTER_FULLTEXT_MORELIKE, value: documentID.toString() },
    ])
  }

  trackByDocumentId(index, item: Document) {
    return item.id
  }

  get notesEnabled(): boolean {
    return this.settingsService.get(SETTINGS_KEYS.NOTES_ENABLED)
  }
}
