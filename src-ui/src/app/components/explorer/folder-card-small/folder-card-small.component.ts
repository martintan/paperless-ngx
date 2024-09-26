import { Component, EventEmitter, Input, Output } from '@angular/core'
import { StoragePath } from 'src/app/data/storage-path'
import { SETTINGS_KEYS } from 'src/app/data/ui-settings'
import { StoragePathService } from 'src/app/services/rest/storage-path.service'
import { SettingsService } from 'src/app/services/settings.service'
import { ComponentWithPermissions } from '../../with-permissions/with-permissions.component'

@Component({
  selector: 'app-folder-card-small',
  templateUrl: './folder-card-small.component.html',
  styleUrls: [
    './folder-card-small.component.scss',
    '../popover-preview/popover-preview.scss',
  ],
})
export class FolderCardSmallComponent extends ComponentWithPermissions {
  constructor(
    private storagePathService: StoragePathService,
    private settingsService: SettingsService
  ) {
    super()
  }

  @Input()
  selected = false

  @Output()
  toggleSelected = new EventEmitter()

  @Input()
  storagePath: StoragePath

  @Output()
  dblClickDocument = new EventEmitter()

  @Output()
  clickTag = new EventEmitter<number>()

  @Output()
  clickCorrespondent = new EventEmitter<number>()

  @Output()
  clickDocumentType = new EventEmitter<number>()

  @Output()
  clickStoragePath = new EventEmitter<number>()

  getIsThumbInverted() {
    return this.settingsService.get(SETTINGS_KEYS.DARK_MODE_THUMB_INVERTED)
  }

  getThumbUrl() {
    return ''
  }

  getDownloadUrl() {
    return ''
  }

  get previewUrl() {
    return ''
  }

  mouseEnterPreview() {}

  mouseLeavePreview() {}

  mouseLeaveCard() {}

  get notesEnabled(): boolean {
    return this.settingsService.get(SETTINGS_KEYS.NOTES_ENABLED)
  }
}
