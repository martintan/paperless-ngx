import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { NgxFileDropEntry } from 'ngx-file-drop'
import { Subscription } from 'rxjs'
import { Document } from 'src/app/data/document'
import { DEFAULT_MATCHING_ALGORITHM } from 'src/app/data/matching-model'
import { StoragePathService } from 'src/app/services/rest/storage-path.service'
import { UserService } from 'src/app/services/rest/user.service'
import { ToastService } from 'src/app/services/toast.service'
import { UploadDocumentsService } from 'src/app/services/upload-documents.service'
import { EditDialogComponent } from '../../edit-dialog/edit-dialog.component'
import { SettingsService } from 'src/app/services/settings.service'

@Component({
  selector: 'app-upload-large-file',
  templateUrl: './upload-large-file.component.html',
  styleUrls: ['./upload-large-file.component.scss'],
})
export class UploadLargeFileComponent
  extends EditDialogComponent<Document>
  implements OnInit
{
  nameSub: Subscription

  // File upload related variables
  private fileLeaveTimeoutID: any
  fileIsOver: boolean = false
  hideFileDrop: boolean = true
  files: NgxFileDropEntry[]

  constructor(
    private route: ActivatedRoute,
    private uploadDocumentsService: UploadDocumentsService,
    private toastService: ToastService,
    service: StoragePathService,
    activeModal: NgbActiveModal,
    userService: UserService,
    settingsService: SettingsService
  ) {
    super(service, activeModal, userService, settingsService)
  }

  ngOnInit(): void {
    // const nameField = this.objectForm.get('name')
    // const parentFolderPath = this.object?.path ?? ''
    // this.nameSub = nameField.valueChanges.subscribe(() => {
    //   const fullPath = parentFolderPath + '/' + nameField.value
    //   this.objectForm.get('path').patchValue(fullPath)
    //   this.objectForm.get('slug').patchValue(fullPath)
    // })
  }

  submit(): void {
    // this.nameSub.unsubscribe()
    // this.objectForm.get('name').patchValue(this.objectForm.get('path').value)
    // this.save()

    // [martin::start]
    let storagePathId = parseInt(this.route.snapshot.queryParams['spid'])
    storagePathId = !isNaN(storagePathId) ? storagePathId : undefined
    this.toastService.showInfo($localize`Initiating large file upload...`, 3000)
    // this.uploadDocumentsService.uploadFiles(this.files, {
    //   storagePathId,
    //   isLargeFile: true,
    //   ocrSpecificPages: this.objectForm.get('ocr_pages').value,
    // })

    this.uploadDocumentsService.uploadDroppedFiles(this.files)
    // [martin::end]
  }

  getForm(): FormGroup<any> {
    return new FormGroup({
      name: new FormControl(''),
      path: new FormControl(''),
      slug: new FormControl(''),
      matching_algorithm: new FormControl(DEFAULT_MATCHING_ALGORITHM),
      match: new FormControl(''),
      is_insensitive: new FormControl(true),
      permissions_form: new FormControl(null),
      ocr_pages: new FormControl(''),
    })
  }

  public fileOver() {
    // allows transition
    setTimeout(() => {
      this.fileIsOver = true
    }, 1)
    this.hideFileDrop = false
    // stop fileLeave timeout
    clearTimeout(this.fileLeaveTimeoutID)
  }

  public fileLeave(immediate: boolean = false) {
    const ms = immediate ? 0 : 500

    this.fileLeaveTimeoutID = setTimeout(() => {
      this.fileIsOver = false
      // await transition completed
      setTimeout(() => {
        this.hideFileDrop = true
      }, 150)
    }, ms)
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.fileLeave(true)
    this.files = files
  }
}
